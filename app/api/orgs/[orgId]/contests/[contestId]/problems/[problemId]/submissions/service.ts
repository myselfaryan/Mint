import { db } from "@/db/drizzle";
import { problemSubmissions } from "@/db/schema";

export async function createSubmission(data: {
  userId: number;
  contestProblemId: number;
  content: string;
  language: string;
}) {
  return await db.transaction(async (tx) => {
    const [submission] = await tx
      .insert(problemSubmissions)
      .values({
        ...data,
        status: "pending",
      })
      .returning();

    // Here you might want to trigger a job to evaluate the submission
    // await evaluateSubmission(submission.id);

    return submission;
  });
}
