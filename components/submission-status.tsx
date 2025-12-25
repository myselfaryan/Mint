"use client";

/**
 * Real-Time Submission Status Component
 * Shows live test case execution progress with animations
 */

import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle,
    XCircle,
    Clock,
    Loader2,
    AlertTriangle,
    Zap,
    MemoryStick,
    Code2,
} from "lucide-react";
import { SubmissionStatus, TestCaseResult } from "@/lib/code-execution/types";
import { cn } from "@/lib/utils";

interface SubmissionStatusDisplayProps {
    status: SubmissionStatus;
    testCaseResults: TestCaseResult[];
    passedCount: number;
    totalCount: number;
    executionTime: number | null;
    memoryUsed: number | null;
    currentTestCase: number | null;
    error: string | null;
    isConnected: boolean;
}

const statusConfig: Record<
    SubmissionStatus,
    { label: string; color: string; icon: React.ReactNode; bgColor: string }
> = {
    queued: {
        label: "Queued",
        color: "text-amber-500",
        bgColor: "bg-amber-500/10",
        icon: <Clock className="w-4 h-4" />,
    },
    processing: {
        label: "Processing",
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
        icon: <Loader2 className="w-4 h-4 animate-spin" />,
    },
    compiling: {
        label: "Compiling",
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
        icon: <Code2 className="w-4 h-4" />,
    },
    running: {
        label: "Running Tests",
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
        icon: <Loader2 className="w-4 h-4 animate-spin" />,
    },
    accepted: {
        label: "Accepted",
        color: "text-green-500",
        bgColor: "bg-green-500/10",
        icon: <CheckCircle className="w-4 h-4" />,
    },
    wrong_answer: {
        label: "Wrong Answer",
        color: "text-red-500",
        bgColor: "bg-red-500/10",
        icon: <XCircle className="w-4 h-4" />,
    },
    time_limit_exceeded: {
        label: "Time Limit Exceeded",
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
        icon: <Clock className="w-4 h-4" />,
    },
    memory_limit_exceeded: {
        label: "Memory Limit Exceeded",
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
        icon: <MemoryStick className="w-4 h-4" />,
    },
    runtime_error: {
        label: "Runtime Error",
        color: "text-red-500",
        bgColor: "bg-red-500/10",
        icon: <AlertTriangle className="w-4 h-4" />,
    },
    compilation_error: {
        label: "Compilation Error",
        color: "text-red-500",
        bgColor: "bg-red-500/10",
        icon: <Code2 className="w-4 h-4" />,
    },
    internal_error: {
        label: "Internal Error",
        color: "text-gray-500",
        bgColor: "bg-gray-500/10",
        icon: <AlertTriangle className="w-4 h-4" />,
    },
};

export function SubmissionStatusDisplay({
    status,
    testCaseResults,
    passedCount,
    totalCount,
    executionTime,
    memoryUsed,
    currentTestCase,
    error,
    isConnected,
}: SubmissionStatusDisplayProps) {
    const config = statusConfig[status];
    const isComplete =
        status === "accepted" ||
        status === "wrong_answer" ||
        status === "time_limit_exceeded" ||
        status === "memory_limit_exceeded" ||
        status === "runtime_error" ||
        status === "compilation_error" ||
        status === "internal_error";

    return (
        <div className="space-y-4">
            {/* Main Status */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                    "rounded-lg p-4 border",
                    config.bgColor,
                    "border-border"
                )}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className={cn("flex items-center", config.color)}>
                            {config.icon}
                        </span>
                        <span className={cn("font-semibold text-lg", config.color)}>
                            {config.label}
                        </span>
                        {!isComplete && isConnected && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                Live
                            </span>
                        )}
                    </div>

                    {totalCount > 0 && (
                        <div className="text-right">
                            <span className="text-2xl font-bold text-foreground">
                                {passedCount}
                                <span className="text-muted-foreground text-lg">/{totalCount}</span>
                            </span>
                            <p className="text-xs text-muted-foreground">Test Cases Passed</p>
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                {totalCount > 0 && (
                    <div className="mt-4">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                                className={cn(
                                    "h-full rounded-full",
                                    status === "accepted" ? "bg-green-500" : "bg-primary"
                                )}
                                initial={{ width: 0 }}
                                animate={{
                                    width: `${(testCaseResults.length / totalCount) * 100}%`,
                                }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </div>
                )}

                {/* Metrics */}
                {isComplete && (executionTime || memoryUsed) && (
                    <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                        {executionTime && (
                            <div className="flex items-center gap-1">
                                <Zap className="w-4 h-4" />
                                <span>{executionTime}ms</span>
                            </div>
                        )}
                        {memoryUsed && (
                            <div className="flex items-center gap-1">
                                <MemoryStick className="w-4 h-4" />
                                <span>{Math.round(memoryUsed / 1024)}KB</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mt-4 text-sm text-red-500 bg-red-500/10 rounded p-2">
                        {error}
                    </div>
                )}
            </motion.div>

            {/* Test Case Grid */}
            {totalCount > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground">Test Cases</h4>
                    <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                        <AnimatePresence mode="popLayout">
                            {Array.from({ length: totalCount }).map((_, index) => {
                                const result = testCaseResults[index];
                                const isRunning = currentTestCase === index;
                                const isPending = !result && !isRunning;

                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: index * 0.02 }}
                                        className={cn(
                                            "w-8 h-8 rounded-md flex items-center justify-center text-xs font-medium transition-all",
                                            isPending && "bg-muted text-muted-foreground",
                                            isRunning && "bg-blue-500/20 text-blue-500 ring-2 ring-blue-500",
                                            result?.status === "accepted" && "bg-green-500/20 text-green-500",
                                            result?.status === "wrong_answer" && "bg-red-500/20 text-red-500",
                                            result?.status === "time_limit_exceeded" && "bg-orange-500/20 text-orange-500",
                                            result?.status === "memory_limit_exceeded" && "bg-orange-500/20 text-orange-500",
                                            result?.status === "runtime_error" && "bg-red-500/20 text-red-500",
                                            result?.status === "compilation_error" && "bg-red-500/20 text-red-500"
                                        )}
                                    >
                                        {isRunning ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : result ? (
                                            result.status === "accepted" ? (
                                                <CheckCircle className="w-4 h-4" />
                                            ) : (
                                                <XCircle className="w-4 h-4" />
                                            )
                                        ) : (
                                            index + 1
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {/* Detailed Results (for non-hidden test cases) */}
            {isComplete && testCaseResults.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground">Details</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {testCaseResults
                            .filter((tc) => !tc.isHidden)
                            .map((result, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-muted/50 rounded-lg p-3 text-sm"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium">
                                            Test Case {result.testCaseIndex + 1}
                                        </span>
                                        <span
                                            className={cn(
                                                "text-xs px-2 py-0.5 rounded-full",
                                                result.status === "accepted"
                                                    ? "bg-green-500/20 text-green-500"
                                                    : "bg-red-500/20 text-red-500"
                                            )}
                                        >
                                            {statusConfig[result.status]?.label || result.status}
                                        </span>
                                    </div>
                                    {result.stdout && (
                                        <div className="space-y-1">
                                            <p className="text-xs text-muted-foreground">Output:</p>
                                            <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
                                                {result.stdout}
                                            </pre>
                                        </div>
                                    )}
                                    {result.expectedOutput && result.status !== "accepted" && (
                                        <div className="space-y-1 mt-2">
                                            <p className="text-xs text-muted-foreground">Expected:</p>
                                            <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
                                                {result.expectedOutput}
                                            </pre>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}
