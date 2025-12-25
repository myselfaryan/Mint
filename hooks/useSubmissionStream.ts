/**
 * React Hook for Real-Time Submission Updates
 * Uses Server-Sent Events (SSE) for live status streaming
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    SubmissionStatus,
    TestCaseResult,
    WSMessage,
} from '@/lib/code-execution/types';

export interface SubmissionState {
    submissionId: number | null;
    status: SubmissionStatus;
    isConnected: boolean;
    testCaseResults: TestCaseResult[];
    passedCount: number;
    totalCount: number;
    executionTime: number | null;
    memoryUsed: number | null;
    error: string | null;
    currentTestCase: number | null;
}

const initialState: SubmissionState = {
    submissionId: null,
    status: 'queued',
    isConnected: false,
    testCaseResults: [],
    passedCount: 0,
    totalCount: 0,
    executionTime: null,
    memoryUsed: null,
    error: null,
    currentTestCase: null,
};

export function useSubmissionStream() {
    const [state, setState] = useState<SubmissionState>(initialState);
    const eventSourceRef = useRef<EventSource | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Clean up function
    const disconnect = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        setState(prev => ({ ...prev, isConnected: false }));
    }, []);

    // Connect to SSE stream
    const connect = useCallback((submissionId: number) => {
        disconnect();

        setState({
            ...initialState,
            submissionId,
            isConnected: true,
        });

        const eventSource = new EventSource(
            `/api/submissions/${submissionId}/stream`
        );
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
            console.log('SSE connection opened for submission', submissionId);
            setState(prev => ({ ...prev, isConnected: true }));
        };

        eventSource.onmessage = (event) => {
            try {
                const message: WSMessage = JSON.parse(event.data);
                handleMessage(message);
            } catch (error) {
                console.error('Failed to parse SSE message:', error);
            }
        };

        eventSource.onerror = (error) => {
            console.error('SSE error:', error);
            setState(prev => ({ ...prev, isConnected: false }));

            // Auto-reconnect after 2 seconds (unless completed)
            reconnectTimeoutRef.current = setTimeout(() => {
                setState(prev => {
                    if (
                        prev.status !== 'accepted' &&
                        prev.status !== 'wrong_answer' &&
                        prev.status !== 'compilation_error' &&
                        prev.status !== 'runtime_error' &&
                        prev.status !== 'internal_error'
                    ) {
                        connect(submissionId);
                    }
                    return prev;
                });
            }, 2000);
        };

        return () => disconnect();
    }, [disconnect]);

    // Handle incoming messages
    const handleMessage = useCallback((message: WSMessage) => {
        switch (message.type) {
            case 'submission_created':
                setState(prev => ({
                    ...prev,
                    status: message.data.status || 'queued',
                    totalCount: message.data.totalTestCases || 0,
                }));
                break;

            case 'submission_status_update':
                setState(prev => ({
                    ...prev,
                    status: message.data.status || prev.status,
                }));
                break;

            case 'test_case_started':
                if (message.data.testCaseResult) {
                    setState(prev => ({
                        ...prev,
                        currentTestCase: message.data.testCaseResult!.testCaseIndex,
                        status: 'running',
                    }));
                }
                break;

            case 'test_case_completed':
                if (message.data.testCaseResult) {
                    setState(prev => {
                        const newResults = [...prev.testCaseResults];
                        const index = message.data.testCaseResult!.testCaseIndex;
                        newResults[index] = message.data.testCaseResult!;

                        return {
                            ...prev,
                            testCaseResults: newResults,
                            passedCount: message.data.passedTestCases || prev.passedCount,
                            totalCount: message.data.totalTestCases || prev.totalCount,
                            currentTestCase: null,
                        };
                    });
                }
                break;

            case 'submission_completed':
                setState(prev => ({
                    ...prev,
                    status: message.data.status || prev.status,
                    passedCount: message.data.passedTestCases || prev.passedCount,
                    totalCount: message.data.totalTestCases || prev.totalCount,
                    executionTime: message.data.executionTime || null,
                    memoryUsed: message.data.memoryUsed || null,
                    currentTestCase: null,
                }));
                // Disconnect after completion
                disconnect();
                break;

            case 'error':
                setState(prev => ({
                    ...prev,
                    status: 'internal_error',
                    error: message.data.error || 'An error occurred',
                    currentTestCase: null,
                }));
                disconnect();
                break;
        }
    }, [disconnect]);

    // Cleanup on unmount
    useEffect(() => {
        return () => disconnect();
    }, [disconnect]);

    // Reset state
    const reset = useCallback(() => {
        disconnect();
        setState(initialState);
    }, [disconnect]);

    return {
        ...state,
        connect,
        disconnect,
        reset,
    };
}

// Helper hook for submitting code
export function useCodeSubmission() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const stream = useSubmissionStream();

    const submit = useCallback(async (
        code: string,
        language: string,
        problemId: number,
        options?: {
            contestId?: number;
            contestNameId?: string;
            orgId?: string;
        }
    ) => {
        setIsSubmitting(true);
        setSubmitError(null);
        stream.reset();

        try {
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code,
                    language,
                    problemId,
                    ...options,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || error.message || 'Submission failed');
            }

            const result = await response.json();

            // Connect to SSE stream for real-time updates
            stream.connect(result.submissionId);

            return result;
        } catch (error) {
            const message = (error as Error).message;
            setSubmitError(message);
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    }, [stream]);

    return {
        submit,
        isSubmitting,
        submitError,
        stream,
    };
}
