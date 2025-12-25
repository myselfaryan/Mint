/**
 * Code Execution Engine
 * Uses FREE Piston API by default - no paid services required!
 * 
 * Piston API: https://github.com/engineer-man/piston
 * - Completely free and open source
 * - Supports 50+ programming languages
 * - No API key required
 */

import {
    SupportedLanguage,
    LANGUAGE_CONFIGS,
    ExecutionResult,
    SubmissionStatus,
} from './types';

// Piston API - FREE, no setup required
const PISTON_API_URL = process.env.PISTON_API_URL || 'https://emkc.org/api/v2/piston';

/**
 * Execute code using Piston API (FREE)
 * Piston is an open-source code execution engine that supports 50+ languages
 */
export async function executeCode(
    code: string,
    language: SupportedLanguage,
    stdin: string,
    options: {
        timeLimit?: number;
        memoryLimit?: number;
    } = {}
): Promise<ExecutionResult> {
    const { timeLimit = 5000, memoryLimit = 128000 } = options;
    const config = LANGUAGE_CONFIGS[language];

    try {
        const requestBody = {
            language: config.pistonAlias,
            version: config.pistonVersion,
            files: [
                {
                    name: `main.${config.extension}`,
                    content: code,
                },
            ],
            stdin: stdin,
            args: [],
            compile_timeout: 10000,
            run_timeout: timeLimit,
        };



        const response = await fetch(`${PISTON_API_URL}/execute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const error = await response.text();
            return {
                success: false,
                stdout: '',
                stderr: `Piston API error: ${error}`,
                executionTime: null,
                memoryUsed: null,
                status: 'internal_error',
            };
        }

        const result = await response.json();


        // Handle compilation errors
        if (result.compile && result.compile.code !== 0) {
            return {
                success: false,
                stdout: '',
                stderr: result.compile.stderr || result.compile.output || 'Compilation failed',
                executionTime: null,
                memoryUsed: null,
                status: 'compilation_error',
                compileOutput: result.compile.output,
            };
        }

        // Handle runtime results
        if (result.run) {
            const isSuccess = result.run.code === 0;
            let status: SubmissionStatus = isSuccess ? 'accepted' : 'runtime_error';

            // Check for TLE
            if (result.run.signal === 'SIGKILL' || result.run.signal === 'SIGXCPU') {
                status = 'time_limit_exceeded';
            }

            return {
                success: isSuccess,
                stdout: (result.run.stdout || result.run.output || '').trim(),
                stderr: result.run.stderr || '',
                executionTime: null, // Piston doesn't provide execution time
                memoryUsed: null,
                status,
            };
        }

        return {
            success: false,
            stdout: '',
            stderr: result.message || 'Unknown error',
            executionTime: null,
            memoryUsed: null,
            status: 'internal_error',
        };
    } catch (error) {
        console.error('Piston execution error:', error);
        return {
            success: false,
            stdout: '',
            stderr: `Execution error: ${(error as Error).message}`,
            executionTime: null,
            memoryUsed: null,
            status: 'internal_error',
        };
    }
}

/**
 * Validate code output against expected output
 */
export function validateOutput(actual: string, expected: string): boolean {
    // Normalize line endings and trim whitespace
    const normalizeOutput = (str: string): string => {
        return str
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .trim()
            .split('\n')
            .map(line => line.trimEnd())
            .join('\n');
    };

    return normalizeOutput(actual) === normalizeOutput(expected);
}

/**
 * Get the execution backend info
 */
export function getExecutorInfo(): {
    backend: string;
    url: string;
    cost: string;
} {
    return {
        backend: 'piston',
        url: PISTON_API_URL,
        cost: 'FREE',
    };
}
