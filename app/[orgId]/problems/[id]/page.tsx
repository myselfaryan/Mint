import { CodeEditor } from "@/components/code-editor";
import { notFound } from "next/navigation";
// import { getProblemIdFromCode } from "@/app/api/orgs/[orgId]/problems/service";

async function getProblem(orgId: string, problemId: string) {
  console.log(`ENV: ${process.env.NEXT_PUBLIC_APP_URL}`, orgId, problemId);

  try {
    // const problemIdNumber = await getProblemIdFromCode(orgId, problemId);


    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/orgs/${orgId}/problems/${problemId}`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch problem");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching problem:", error);
    return null;
  }
}

export default async function Page({
  params,
}: {
  params: { orgId: string; id: string };
}) {
  const problem = await getProblem(params.orgId, params.id);

  if (!problem) {
    notFound();
  }

  return (
    <>
      <CodeEditor problem={problem} />
    </>
  );
}
