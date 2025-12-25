/**
 * Code Execution Engine Types
 * Uses FREE Piston API for code execution
 */

// Supported programming languages
export type SupportedLanguage =
  | "python"
  | "cpp"
  | "java"
  | "javascript"
  | "node";

// Language configuration for code execution
export interface LanguageConfig {
  name: string;
  version: string;
  extension: string;
  pistonAlias: string;
  pistonVersion: string;
  monacoLanguage: string;
  defaultCode: string;
}

// Language configurations - all supported by FREE Piston API
export const LANGUAGE_CONFIGS: Record<SupportedLanguage, LanguageConfig> = {
  python: {
    name: "Python",
    version: "3.10",
    extension: "py",
    pistonAlias: "python",
    pistonVersion: "3.10.0",
    monacoLanguage: "python",
    defaultCode: `def solve():
    # Read input
    n = int(input())
    
    # Your code here
    print(n)

solve()`,
  },
  cpp: {
    name: "C++",
    version: "GCC 10.2",
    extension: "cpp",
    pistonAlias: "cpp",
    pistonVersion: "10.2.0",
    monacoLanguage: "cpp",
    defaultCode: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    // Your code here
    
    return 0;
}`,
  },
  java: {
    name: "Java",
    version: "OpenJDK 15",
    extension: "java",
    pistonAlias: "java",
    pistonVersion: "15.0.2",
    monacoLanguage: "java",
    defaultCode: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        // Your code here
        
        sc.close();
    }
}`,
  },
  javascript: {
    name: "JavaScript",
    version: "Node.js 18",
    extension: "js",
    pistonAlias: "javascript",
    pistonVersion: "18.15.0",
    monacoLanguage: "javascript",
    defaultCode: `const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const lines = [];
rl.on('line', (line) => {
    lines.push(line);
});

rl.on('close', () => {
    // Your code here
    console.log(lines[0]);
});`,
  },
  node: {
    name: "Node.js",
    version: "18.15.0",
    extension: "js",
    pistonAlias: "javascript",
    pistonVersion: "18.15.0",
    monacoLanguage: "javascript",
    defaultCode: `const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const lines = [];
rl.on('line', (line) => {
    lines.push(line);
});

rl.on('close', () => {
    // Your code here
    console.log(lines[0]);
});`,
  },
};

// Submission status
export type SubmissionStatus =
  | "queued"
  | "processing"
  | "compiling"
  | "running"
  | "accepted"
  | "wrong_answer"
  | "time_limit_exceeded"
  | "memory_limit_exceeded"
  | "runtime_error"
  | "compilation_error"
  | "internal_error";

// Test case result
export interface TestCaseResult {
  testCaseId: number;
  testCaseIndex: number;
  status: SubmissionStatus;
  stdout: string | null;
  stderr: string | null;
  expectedOutput: string;
  executionTime: number | null;
  memoryUsed: number | null;
  isHidden: boolean;
}

// Submission request
export interface SubmissionRequest {
  code: string;
  language: SupportedLanguage;
  problemId: number;
  contestId?: number;
  userId: number;
}

// Execution result from Piston
export interface ExecutionResult {
  success: boolean;
  stdout: string;
  stderr: string;
  executionTime: number | null;
  memoryUsed: number | null;
  status: SubmissionStatus;
  compileOutput?: string;
}

// WebSocket message types
export type WSMessageType =
  | "submission_created"
  | "submission_status_update"
  | "test_case_started"
  | "test_case_completed"
  | "submission_completed"
  | "error";

// WebSocket message payload
export interface WSMessage {
  type: WSMessageType;
  submissionId: number;
  data: {
    status?: SubmissionStatus;
    testCaseResult?: TestCaseResult;
    totalTestCases?: number;
    passedTestCases?: number;
    executionTime?: number;
    memoryUsed?: number;
    error?: string;
    timestamp: number;
  };
}

// Queue job data
export interface ExecutionJob {
  id: string;
  submissionId: number;
  code: string;
  language: SupportedLanguage;
  problemId: number;
  testCases: {
    id: number;
    input: string;
    output: string;
    kind: string;
  }[];
  userId: number;
  createdAt: number;
}
