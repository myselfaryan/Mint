/**
 * Submission Status API
 * GET /api/submit/[id] - Get detailed submission status and results
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import {
  problemSubmissions,
  contestProblems,
  contests,
  users,
  problems,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCachedSubmissionResult } from "@/lib/code-execution";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const submissionId = parseInt(params.id, 10);

    if (isNaN(submissionId)) {
      return NextResponse.json(
        { error: "Invalid submission ID" },
        { status: 400 },
      );
    }

    // Try to get cached results first
    const cachedResult = await getCachedSubmissionResult(submissionId);

    // Get submission from database
    const submissions = await db
      .select({
        id: problemSubmissions.id,
        status: problemSubmissions.status,
        content: problemSubmissions.content,
        language: problemSubmissions.language,
        submittedAt: problemSubmissions.submittedAt,
        executionTime: problemSubmissions.executionTime,
        memoryUsage: problemSubmissions.memoryUsage,
        user: {
          id: users.id,
          name: users.name,
          nameId: users.nameId,
        },
        problem: {
          id: problems.id,
          title: problems.title,
          code: problems.code,
        },
        contest: {
          id: contests.id,
          name: contests.name,
          nameId: contests.nameId,
        },
      })
      .from(problemSubmissions)
      .innerJoin(users, eq(users.id, problemSubmissions.userId))
      .innerJoin(
        contestProblems,
        eq(contestProblems.id, problemSubmissions.contestProblemId),
      )
      .innerJoin(problems, eq(problems.id, contestProblems.problemId))
      .innerJoin(contests, eq(contests.id, contestProblems.contestId))
      .where(eq(problemSubmissions.id, submissionId))
      .limit(1);

    if (submissions.length === 0) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 },
      );
    }

    const submission = submissions[0];

    return NextResponse.json({
      id: submission.id,
      status: cachedResult?.status || submission.status,
      language: submission.language,
      submittedAt: submission.submittedAt,
      executionTime: cachedResult?.totalTime || submission.executionTime,
      memoryUsage: cachedResult?.totalMemory || submission.memoryUsage,
      user: submission.user,
      problem: submission.problem,
      contest: submission.contest,
      // Include detailed results if available
      results: cachedResult
        ? {
            passedCount: cachedResult.passedCount,
            totalCount: cachedResult.totalCount,
            testCases: cachedResult.testCaseResults.map((tc) => ({
              index: tc.testCaseIndex,
              status: tc.status,
              executionTime: tc.executionTime,
              memoryUsed: tc.memoryUsed,
              // Only show output for non-hidden test cases
              stdout: tc.isHidden ? null : tc.stdout,
              expectedOutput: tc.isHidden ? null : tc.expectedOutput,
            })),
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching submission:", error);
    return NextResponse.json(
      { error: "Failed to fetch submission" },
      { status: 500 },
    );
  }
}
