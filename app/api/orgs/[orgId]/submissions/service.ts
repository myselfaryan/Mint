import { db } from "@/db/drizzle";
import {
  problemSubmissions,
  contestProblems,
  contests,
  problems,
  users,
  testCases,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { createSubmissionSchema } from "./validation";

const PISTON_API = "https://emkc.org/api/v2/piston";

// Language mapping for code execution
const languageVersions = {
  javascript: "18.15.0",
  node: "18.15.0",
  python: "3.10.0",
  cpp: "10.2.0",
};

// Helper function to execute code
async function executeCode(code: string, language: string, input: string) {
  try {
    const fileName =
      language === "javascript" || language === "node"
        ? "index.js"
        : language === "python"
          ? "main.py"
          : language === "cpp"
            ? "main.cpp"
            : "code";

    const response = await fetch(`${PISTON_API}/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language,
        version:
          languageVersions[language as keyof typeof languageVersions] ||
          "latest",
        files: [
          {
            name: fileName,
            content: code,
          },
        ],
        stdin: input + "\n", // Add newline to input
        args: [],
        compile_timeout: 10000,
        run_timeout: 5000,
      }),
    });

    const result = await response.json();

    if (result.run?.output) {
      return { success: true, output: result.run.output.trim() };
    } else if (result.compile?.output) {
      return { success: false, output: result.compile.output };
    } else if (result.message) {
      return { success: false, output: result.message };
    } else if (result.error) {
      return { success: false, output: `Execution Error: ${result.error}` };
    }

    return { success: false, output: "Unknown error" };
  } catch (error) {
    return {
      success: false,
      output: `Runtime Error: ${(error as Error).message}`,
    };
  }
}

export async function createSubmission(
  orgId: number,
  data: z.infer<typeof createSubmissionSchema>,
) {
  console.log(data);
  return await db.transaction(async (tx) => {
    // First, get the numeric contestId from the contestNameId
    const contestResult = await tx
      .select({ id: contests.id })
      .from(contests)
      .where(
        and(
          eq(contests.nameId, data.contestNameId),
          eq(contests.organizerId, orgId),
          eq(contests.organizerKind, "org"),
        ),
      )
      .limit(1);

    if (contestResult.length === 0) {
      throw new Error("Contest not found");
    }

    const contestId = contestResult[0].id;

    // Find the contest problem entry that links the problem to the contest
    const contestProblemResult = await tx
      .select({ id: contestProblems.id })
      .from(contestProblems)
      .where(
        and(
          eq(contestProblems.contestId, contestId),
          eq(contestProblems.problemId, data.problemId),
        ),
      )
      .limit(1);

    if (contestProblemResult.length === 0) {
      throw new Error("Problem not found in this contest");
    }

    const contestProblemId = contestProblemResult[0].id;

    // Verify contest is ongoing
    const now = new Date();
    const contestTimeResult = await tx
      .select({
        startTime: contests.startTime,
        endTime: contests.endTime,
      })
      .from(contests)
      .where(eq(contests.id, contestId))
      .limit(1);

    if (contestTimeResult.length === 0) {
      throw new Error("Contest not found");
    }

    const { startTime, endTime } = contestTimeResult[0];
    if (now < startTime || now > endTime) {
      throw new Error("Contest is not active");
    }

    // Create the submission with pending status
    const [submission] = await tx
      .insert(problemSubmissions)
      .values({
        userId: data.userId,
        contestProblemId: contestProblemId,
        content: data.content,
        language: data.language,
        status: "pending",
        submittedAt: now,
      })
      .returning();

    // Get test cases for the problem
    const testCasesResult = await tx
      .select()
      .from(testCases)
      .where(eq(testCases.problemId, data.problemId));

    if (testCasesResult.length === 0) {
      // Update submission status to error if no test cases found
      await tx
        .update(problemSubmissions)
        .set({ status: "error" })
        .where(eq(problemSubmissions.id, submission.id));

      throw new Error("No test cases found for this problem");
    }

    // Execute code against test cases
    let allPassed = true;
    let executionTime = 0;
    let memoryUsage = 0;

    for (const testCase of testCasesResult) {
      const result = await executeCode(
        data.content,
        data.language,
        testCase.input,
      );

      // Compare output (trimming whitespace)
      const expectedOutput = testCase.output.trim();
      const actualOutput = result.output.trim();

      if (!result.success || expectedOutput !== actualOutput) {
        allPassed = false;
        break;
      }
    }

    // Update submission status based on test results
    const finalStatus = allPassed ? "accepted" : "rejected";

    const [updatedSubmission] = await tx
      .update(problemSubmissions)
      .set({
        status: finalStatus,
        executionTime,
        memoryUsage,
      })
      .where(eq(problemSubmissions.id, submission.id))
      .returning();

    return updatedSubmission;
  });
}

export async function getSubmission(orgId: number, submissionId: number) {
  const submissions = await db
    .select({
      submission: problemSubmissions,
      user: {
        id: users.id,
        name: users.name,
        nameId: users.nameId,
      },
      contest: {
        id: contests.id,
        name: contests.name,
        nameId: contests.nameId,
      },
      problem: {
        id: problems.id,
        title: problems.title,
      },
    })
    .from(problemSubmissions)
    .innerJoin(
      contestProblems,
      eq(contestProblems.id, problemSubmissions.contestProblemId),
    )
    .innerJoin(
      contests,
      and(
        eq(contests.id, contestProblems.contestId),
        eq(contests.organizerId, orgId),
        eq(contests.organizerKind, "org"),
      ),
    )
    .innerJoin(problems, eq(problems.id, contestProblems.problemId))
    .innerJoin(users, eq(users.id, problemSubmissions.userId))
    .where(eq(problemSubmissions.id, submissionId))
    .limit(1);

  return submissions[0] || null;
}

/*
export async function getSubmissions(
  orgId: number,
  filters?: {
    userId?: number;
    contestProblemId?: number;
    status?: string;
  },
) {
  let whereClause = and(
    eq(contests.organizerId, orgId),
    eq(contests.organizerKind, "org"),
  );

  if (filters?.userId) {
    whereClause = and(
      whereClause,
      eq(problemSubmissions.userId, filters.userId),
    );
  }
  if (filters?.contestProblemId) {
    whereClause = and(
      whereClause,
      eq(problemSubmissions.contestProblemId, filters.contestProblemId),
    );
  }
  if (filters?.status) {
    whereClause = and(
      whereClause,
      eq(problemSubmissions.status, filters.status),
    );
  }

  return await db
    .select({
      submission: problemSubmissions,
      user: {
        id: users.id,
        name: users.name,
        nameId: users.nameId,
      },
      contest: {
        id: contests.id,
        name: contests.name,
        nameId: contests.nameId,
      },
      problem: {
        id: problems.id,
        title: problems.title,
      },
    })
    .from(problemSubmissions)
    .innerJoin(
      contestProblems,
      eq(contestProblems.id, problemSubmissions.contestProblemId),
    )
    .innerJoin(contests, eq(contests.id, contestProblems.contestId))
    .innerJoin(problems, eq(problems.id, contestProblems.problemId))
    .innerJoin(users, eq(users.id, problemSubmissions.userId))
    .where(whereClause)
    .orderBy(problemSubmissions.submittedAt)
    .limit(50);
}
*/

export async function getOrgSubmissions(orgId: number) {
  return await db
    .select({
      id: problemSubmissions.id,
      submittedAt: problemSubmissions.submittedAt,
      language: problemSubmissions.language,
      status: problemSubmissions.status,
      executionTime: problemSubmissions.executionTime,
      memoryUsage: problemSubmissions.memoryUsage,
      user: {
        id: users.id,
        nameId: users.nameId,
        name: users.name,
      },
      problem: {
        id: problems.id,
        title: problems.title,
      },
      contest: {
        id: contests.id,
        nameId: contests.nameId,
        name: contests.name,
      },
    })
    .from(problemSubmissions)
    .innerJoin(users, eq(users.id, problemSubmissions.userId))
    .innerJoin(
      contestProblems,
      eq(contestProblems.id, problemSubmissions.contestProblemId),
    )
    .innerJoin(problems, eq(problems.id, contestProblems.problemId))
    .innerJoin(
      contests,
      and(
        eq(contests.id, contestProblems.contestId),
        eq(contests.organizerId, orgId),
        eq(contests.organizerKind, "org"),
      ),
    )
    .orderBy(problemSubmissions.submittedAt);
}
