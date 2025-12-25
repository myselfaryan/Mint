/**
 * Submission Processor
 * Handles executing code against test cases with real-time updates
 */

import { db } from "@/db/drizzle";
import { problemSubmissions, testCases } from "@/db/schema";
import { eq } from "drizzle-orm";
import { executeCode, validateOutput } from "./executor";
import { publishUpdate, completeJob, cacheSubmissionResult } from "./queue";
import {
  ExecutionJob,
  SupportedLanguage,
  TestCaseResult,
  SubmissionStatus,
} from "./types";

/**
 * Process a single submission job
 */
export async function processSubmission(job: ExecutionJob): Promise<void> {
  const startTime = Date.now();
  let passedCount = 0;
  const testCaseResults: TestCaseResult[] = [];
  let finalStatus: SubmissionStatus = "accepted";
  let totalExecutionTime = 0;
  let totalMemoryUsed = 0;

  try {
    // Update status to processing
    await updateSubmissionStatus(job.submissionId, "processing");
    await publishUpdate(job.submissionId, {
      type: "submission_status_update",
      submissionId: job.submissionId,
      data: {
        status: "processing",
        timestamp: Date.now(),
      },
    });

    // Process each test case
    for (let i = 0; i < job.testCases.length; i++) {
      const testCase = job.testCases[i];
      const isHidden = testCase.kind === "test";

      // Publish test case started
      await publishUpdate(job.submissionId, {
        type: "test_case_started",
        submissionId: job.submissionId,
        data: {
          testCaseResult: {
            testCaseId: testCase.id,
            testCaseIndex: i,
            status: "running",
            stdout: null,
            stderr: null,
            expectedOutput: isHidden ? "[hidden]" : testCase.output,
            executionTime: null,
            memoryUsed: null,
            isHidden,
          },
          timestamp: Date.now(),
        },
      });

      // Execute the code
      const result = await executeCode(job.code, job.language, testCase.input, {
        timeLimit: 5000, // 5 seconds in milliseconds
        memoryLimit: 256000,
      });

      // Track metrics
      if (result.executionTime) {
        totalExecutionTime += result.executionTime;
      }
      if (result.memoryUsed) {
        totalMemoryUsed = Math.max(totalMemoryUsed, result.memoryUsed);
      }

      // Determine test case status
      let testStatus: SubmissionStatus;

      if (result.status === "compilation_error") {
        testStatus = "compilation_error";
        finalStatus = "compilation_error";
      } else if (result.status === "time_limit_exceeded") {
        testStatus = "time_limit_exceeded";
        if (finalStatus === "accepted") finalStatus = "time_limit_exceeded";
      } else if (result.status === "memory_limit_exceeded") {
        testStatus = "memory_limit_exceeded";
        if (finalStatus === "accepted") finalStatus = "memory_limit_exceeded";
      } else if (result.status === "runtime_error") {
        testStatus = "runtime_error";
        if (finalStatus === "accepted") finalStatus = "runtime_error";
      } else if (!result.success) {
        testStatus = "internal_error";
        if (finalStatus === "accepted") finalStatus = "internal_error";
      } else if (!validateOutput(result.stdout, testCase.output)) {
        testStatus = "wrong_answer";
        if (finalStatus === "accepted") finalStatus = "wrong_answer";
      } else {
        testStatus = "accepted";
        passedCount++;
      }

      const testCaseResult: TestCaseResult = {
        testCaseId: testCase.id,
        testCaseIndex: i,
        status: testStatus,
        stdout: isHidden ? null : result.stdout,
        stderr: result.stderr || null,
        expectedOutput: isHidden ? "[hidden]" : testCase.output,
        executionTime: result.executionTime,
        memoryUsed: result.memoryUsed,
        isHidden,
      };

      testCaseResults.push(testCaseResult);

      // Publish test case completed
      await publishUpdate(job.submissionId, {
        type: "test_case_completed",
        submissionId: job.submissionId,
        data: {
          testCaseResult,
          passedTestCases: passedCount,
          totalTestCases: job.testCases.length,
          timestamp: Date.now(),
        },
      });

      // Stop on compilation error (no point continuing)
      if (testStatus === "compilation_error") {
        break;
      }
    }

    // Update final submission status
    const averageTime =
      testCaseResults.length > 0
        ? Math.round(totalExecutionTime / testCaseResults.length)
        : 0;

    await updateSubmissionStatus(
      job.submissionId,
      finalStatus,
      averageTime,
      totalMemoryUsed,
    );

    // Cache the results
    await cacheSubmissionResult(job.submissionId, {
      status: finalStatus,
      testCaseResults,
      totalTime: totalExecutionTime,
      totalMemory: totalMemoryUsed,
      passedCount,
      totalCount: job.testCases.length,
    });

    // Publish completion
    await publishUpdate(job.submissionId, {
      type: "submission_completed",
      submissionId: job.submissionId,
      data: {
        status: finalStatus,
        passedTestCases: passedCount,
        totalTestCases: job.testCases.length,
        executionTime: averageTime,
        memoryUsed: totalMemoryUsed,
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    console.error("Submission processing error:", error);

    await updateSubmissionStatus(job.submissionId, "internal_error");

    await publishUpdate(job.submissionId, {
      type: "error",
      submissionId: job.submissionId,
      data: {
        status: "internal_error",
        error: (error as Error).message,
        timestamp: Date.now(),
      },
    });
  } finally {
    // Clean up the job
    await completeJob(job.id);
  }
}

/**
 * Update submission status in the database
 */
async function updateSubmissionStatus(
  submissionId: number,
  status: SubmissionStatus,
  executionTime?: number,
  memoryUsage?: number,
): Promise<void> {
  // Map our detailed status to the simpler DB status
  const dbStatus = mapToDbStatus(status);

  await db
    .update(problemSubmissions)
    .set({
      status: dbStatus,
      executionTime: executionTime ?? null,
      memoryUsage: memoryUsage ? Math.round(memoryUsage / 1024) : null, // Convert to KB
    })
    .where(eq(problemSubmissions.id, submissionId));
}

/**
 * Map detailed status to DB-compatible status
 */
function mapToDbStatus(status: SubmissionStatus): string {
  switch (status) {
    case "queued":
    case "processing":
    case "compiling":
    case "running":
      return "pending";
    case "accepted":
      return "accepted";
    case "wrong_answer":
    case "time_limit_exceeded":
    case "memory_limit_exceeded":
    case "runtime_error":
    case "compilation_error":
      return "rejected";
    case "internal_error":
      return "error";
    default:
      return "pending";
  }
}

/**
 * Create a job from a submission
 */
export async function createExecutionJob(
  submissionId: number,
  code: string,
  language: SupportedLanguage,
  problemId: number,
  userId: number,
): Promise<ExecutionJob> {
  // Get test cases for the problem
  const problemTestCases = await db
    .select({
      id: testCases.id,
      input: testCases.input,
      output: testCases.output,
      kind: testCases.kind,
    })
    .from(testCases)
    .where(eq(testCases.problemId, problemId));

  if (problemTestCases.length === 0) {
    throw new Error("No test cases found for this problem");
  }

  return {
    id: `job_${submissionId}_${Date.now()}`,
    submissionId,
    code,
    language,
    problemId,
    testCases: problemTestCases.map((tc) => ({
      id: tc.id,
      input: tc.input,
      output: tc.output,
      kind: tc.kind || "test",
    })),
    userId,
    createdAt: Date.now(),
  };
}
