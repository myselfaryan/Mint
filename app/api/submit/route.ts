/**
 * Real-Time Submission API
 * POST /api/submit - Submit code for evaluation with real-time updates
 * GET /api/submit/:id - Get submission status and results
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/drizzle";
import {
  problemSubmissions,
  contestProblems,
  contests,
  users,
  problems,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import {
  enqueueJob,
  checkRateLimit,
  createExecutionJob,
  SupportedLanguage,
} from "@/lib/code-execution";

// Request validation schema
const submitRequestSchema = z.object({
  code: z.string().min(1, "Code is required").max(100000, "Code too long"),
  language: z.enum(["python", "cpp", "java", "javascript", "node"]),
  problemId: z.number().int().positive(),
  contestId: z.number().int().positive().optional(),
  contestNameId: z.string().optional(),
  orgId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Get user from session/auth
    const userResponse = await fetch(`${request.nextUrl.origin}/api/me`, {
      headers: request.headers,
    });

    if (!userResponse.ok) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const userData = await userResponse.json();
    const userId = userData.id;

    // Check rate limit
    const rateLimit = await checkRateLimit(userId, 10, 60);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
            ),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(rateLimit.resetAt),
          },
        },
      );
    }

    const body = await request.json();
    const data = submitRequestSchema.parse(body);

    // Verify problem exists
    const problemResult = await db
      .select({ id: problems.id, orgId: problems.orgId })
      .from(problems)
      .where(eq(problems.id, data.problemId))
      .limit(1);

    if (problemResult.length === 0) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    // Get contest problem ID if in contest context
    let contestProblemId: number | null = null;

    if (data.contestId || data.contestNameId) {
      let contestId = data.contestId;

      if (!contestId && data.contestNameId && data.orgId) {
        // Look up contest by nameId
        const contestResult = await db
          .select({ id: contests.id })
          .from(contests)
          .where(eq(contests.nameId, data.contestNameId))
          .limit(1);

        if (contestResult.length > 0) {
          contestId = contestResult[0].id;
        }
      }

      if (contestId) {
        const cpResult = await db
          .select({ id: contestProblems.id })
          .from(contestProblems)
          .where(
            and(
              eq(contestProblems.contestId, contestId),
              eq(contestProblems.problemId, data.problemId),
            ),
          )
          .limit(1);

        if (cpResult.length > 0) {
          contestProblemId = cpResult[0].id;
        }
      }
    }

    // If no contest context, try to find default contest for this problem
    if (!contestProblemId) {
      const defaultCp = await db
        .select({ id: contestProblems.id })
        .from(contestProblems)
        .where(eq(contestProblems.problemId, data.problemId))
        .limit(1);

      if (defaultCp.length > 0) {
        contestProblemId = defaultCp[0].id;
      } else {
        return NextResponse.json(
          { error: "Problem must be associated with a contest" },
          { status: 400 },
        );
      }
    }

    // Create submission record
    const [submission] = await db
      .insert(problemSubmissions)
      .values({
        userId,
        contestProblemId,
        content: data.code,
        language: data.language,
        status: "pending",
        submittedAt: new Date(),
      })
      .returning();

    // Create and enqueue job
    const job = await createExecutionJob(
      submission.id,
      data.code,
      data.language as SupportedLanguage,
      data.problemId,
      userId,
    );

    await enqueueJob(job);

    return NextResponse.json(
      {
        submissionId: submission.id,
        status: "queued",
        message: "Submission queued for processing",
        testCaseCount: job.testCases.length,
      },
      {
        status: 202,
        headers: {
          "X-Submission-Id": String(submission.id),
          "X-RateLimit-Remaining": String(rateLimit.remaining),
        },
      },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 },
      );
    }

    console.error("Submission error:", error);
    return NextResponse.json(
      { error: "Submission failed", message: (error as Error).message },
      { status: 500 },
    );
  }
}
