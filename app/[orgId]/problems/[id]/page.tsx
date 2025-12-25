import { CodeEditorV2 } from "@/components/code-editor-v2";
import { notFound } from "next/navigation";
import { headers } from "next/headers";

async function getProblem(orgId: string, problemId: string) {
  // Get the host from headers for server-side fetch
  const headersList = headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

  console.log(
    `Fetching problem from: ${baseUrl}/api/orgs/${orgId}/problems/${problemId}`,
  );

  try {
    const response = await fetch(
      `${baseUrl}/api/orgs/${orgId}/problems/${problemId}`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch problem");
    }

    // Return the problem with orgNameId for submission context
    const problem = await response.json();
    return {
      ...problem,
      orgId: problem.orgId,
      orgNameId: orgId, // String version for API calls
    };
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
      <CodeEditorV2 problem={problem} />
    </>
  );
}
