import { z } from "zod";
import { db } from "@/db/drizzle";
import { contests, problems, contestProblems } from "@/db/schema";
import { createContestSchema, updateContestSchema } from "@/lib/validations";
import { and, count, eq, asc } from "drizzle-orm";
import { getProblemIdFromCode } from "../problems/service";
import { CACHE_TTL } from "@/db/redis";
import { withDataCache } from "@/lib/cache/utils";

export async function createContest(
  orgId: number,
  data: z.infer<typeof createContestSchema>,
) {
  return await db.transaction(async (tx) => {
    // Check if a contest with the same nameId exists for this org
    const existingContest = await tx.query.contests.findFirst({
      where: and(
        eq(contests.organizerId, orgId),
        eq(contests.nameId, data.nameId),
      ),
    });

    if (existingContest) {
      throw new Error("Contest with this nameId already exists");
    }

    // Extract problems from data if present
    const problemsList = data.problems
      ? data.problems
          .split(",")
          .map((p) => p.trim())
          .filter((p) => p)
      : [];

    // Remove problems from data before inserting into contests table
    const { problems, ...contestData } = data;

    const [contest] = await tx
      .insert(contests)
      .values({
        ...contestData,
        organizerId: orgId,
        organizerKind: "org",
      })
      .returning();

    // If there are problems, add them to the contest
    if (problemsList.length > 0) {
      // Get problem IDs from problem codes
      const problemEntries = await Promise.all(
        problemsList.map(async (problemCode, index) => {
          try {
            const problemId = await getProblemIdFromCode(orgId, problemCode);
            return {
              contestId: contest.id,
              problemId,
              order: index,
            };
          } catch (error) {
            console.error(`Problem not found: ${problemCode}`);
            return null;
          }
        }),
      );

      // Filter out any null entries (problems that weren't found)
      const validProblemEntries = problemEntries.filter(
        (entry) => entry !== null,
      );

      if (validProblemEntries.length > 0) {
        await tx.insert(contestProblems).values(validProblemEntries);
        console.log(validProblemEntries);
      }
    }

    return {
      ...contest,
      problems: problemsList.join(","),
    };
  });
}

export async function getOrgContests(
  orgId: number,
  limit: number,
  offset: number,
) {
  const contestsData = await db.query.contests.findMany({
    where: eq(contests.organizerId, orgId),
    limit,
    offset,
  });

  // Fetch problems for each contest
  const contestsWithProblems = await Promise.all(
    contestsData.map(async (contest) => {
      const problemsData = await db.query.contestProblems.findMany({
        where: eq(contestProblems.contestId, contest.id),
        orderBy: (contestProblems, { asc }) => [asc(contestProblems.order)],
      });

      // For each problem ID, get the problem code
      const problemCodes = await Promise.all(
        problemsData.map(async (p) => {
          try {
            const problem = await db.query.problems.findFirst({
              where: eq(problems.id, p.problemId),
              columns: { code: true },
            });
            return problem?.code || "";
          } catch (error) {
            return "";
          }
        }),
      );

      const problemsList = problemCodes.filter((code) => code).join(",");

      return {
        ...contest,
        problems: problemsList,
      };
    }),
  );

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(contests)
    .where(eq(contests.organizerId, orgId));

  return {
    data: contestsWithProblems,
    total,
    limit,
    offset,
  };
}

export async function getContestByNameId(orgId: number, nameId: string) {
  return withDataCache(
    `contest:${orgId}:${nameId}`,
    async () => {
      const contest = await db.query.contests.findFirst({
        where: and(
          eq(contests.organizerId, orgId),
          eq(contests.nameId, nameId),
          eq(contests.organizerKind, "org"),
        ),
      });

      if (!contest) {
        throw new Error("Contest not found");
      }

      // Fetch problems for the contest
      const problemsData = await db.query.contestProblems.findMany({
        where: eq(contestProblems.contestId, contest.id),
        orderBy: (contestProblems, { asc }) => [asc(contestProblems.order)],
      });

      // For each problem ID, get the problem code
      const problemCodes = await Promise.all(
        problemsData.map(async (p) => {
          try {
            const problem = await db.query.problems.findFirst({
              where: eq(problems.id, p.problemId),
              columns: { code: true },
            });
            return problem?.code || "";
          } catch (error) {
            return "";
          }
        }),
      );

      const problemsList = problemCodes.filter((code) => code).join(",");

      return {
        ...contest,
        problems: problemsList,
      };
    },
    CACHE_TTL.MEDIUM,
    3 + 2,
  );
}

export async function updateContest(
  orgId: number,
  nameId: string,
  data: z.infer<typeof updateContestSchema>,
) {
  return await db.transaction(async (tx) => {
    // Check if contest exists and belongs to the org
    const contest = await tx.query.contests.findFirst({
      where: and(eq(contests.organizerId, orgId), eq(contests.nameId, nameId)),
    });

    if (!contest) {
      throw new Error("Contest not found");
    }

    // Extract problems from data if present
    const problemsList = data.problems
      ? data.problems
          .split(",")
          .map((p) => p.trim())
          .filter((p) => p)
      : null;

    // Remove problems from data before updating contests table
    const { problems, ...contestData } = data;

    const [updatedContest] = await tx
      .update(contests)
      .set(contestData)
      .where(eq(contests.id, contest.id))
      .returning();

    // If problems field was provided, update the contest problems
    if (problemsList !== null) {
      // Delete existing problem associations
      await tx
        .delete(contestProblems)
        .where(eq(contestProblems.contestId, contest.id));

      // If there are problems to add
      if (problemsList.length > 0) {
        // Get problem IDs from problem codes
        const problemEntries = await Promise.all(
          problemsList.map(async (problemCode, index) => {
            try {
              const problemId = await getProblemIdFromCode(orgId, problemCode);
              return {
                contestId: contest.id,
                problemId,
                order: index,
              };
            } catch (error) {
              console.error(`Problem not found: ${problemCode}`);
              return null;
            }
          }),
        );

        // Filter out any null entries (problems that weren't found)
        const validProblemEntries = problemEntries.filter(
          (entry) => entry !== null,
        );

        if (validProblemEntries.length > 0) {
          await tx.insert(contestProblems).values(validProblemEntries);
        }
      }
    }

    // Fetch updated problems for the contest
    const problemsData = await tx.query.contestProblems.findMany({
      where: eq(contestProblems.contestId, contest.id),
      orderBy: (contestProblems, { asc }) => [asc(contestProblems.order)],
    });

    // For each problem ID, get the problem code
    const problemCodes = await Promise.all(
      problemsData.map(async (p) => {
        try {
          const problem = await db.query.problems.findFirst({
            where: eq(problems.id, p.problemId),
            columns: { code: true },
          });
          return problem?.code || "";
        } catch (error) {
          return "";
        }
      }),
    );

    const updatedProblemsList = problemCodes.filter((code) => code).join(",");

    return {
      ...updatedContest,
      problems: updatedProblemsList,
    };
  });
}

export async function deleteContest(orgId: number, nameId: string) {
  return await db.transaction(async (tx) => {
    // Check if contest exists and belongs to the org
    const contest = await tx.query.contests.findFirst({
      where: and(eq(contests.organizerId, orgId), eq(contests.nameId, nameId)),
    });

    if (!contest) {
      throw new Error("Contest not found");
    }

    await tx.delete(contests).where(eq(contests.id, contest.id));

    return contest;
  });
}
