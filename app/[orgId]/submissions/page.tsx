"use client";

import { GenericListing, ColumnDef } from "@/mint/generic-listing";
import { Submission, mockSubmissions } from "./mockSubmissions";
import { useEffect, useState } from "react";

const columns: ColumnDef<Submission>[] = [
  { header: "User", accessorKey: "userNameId", sortable: true },
  { header: "Contest", accessorKey: "contestNameId", sortable: true },
  { header: "Problem", accessorKey: "contestProblemNameId", sortable: true },
  { header: "Language", accessorKey: "language" },
  { header: "Status", accessorKey: "status" },
  { header: "Submitted At", accessorKey: "submittedAt", sortable: true },
  { header: "Time (ms)", accessorKey: "executionTime", sortable: true },
  { header: "Memory (KB)", accessorKey: "memoryUsage", sortable: true },
];

export default function SubmissionsPage({
  params,
}: {
  params: { orgId: string };
}) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  // const [selectedSubmission, setSelectedSubmission] =
  //   useState<Submission | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch(`/api/orgs/${params.orgId}/submissions`);
        if (!response.ok) throw new Error("Failed to fetch submissions");
        const data = await response.json();
        setSubmissions(data);
      } catch (error) {
        console.error("Error fetching submissions:", error);
        setSubmissions(mockSubmissions);
      }
    };
    fetchSubmissions();
  }, [params.orgId]);

  return (
    <>
      <GenericListing
        data={submissions}
        columns={columns}
        title="Submissions"
        searchableFields={[
          "userNameId",
          "contestNameId",
          "contestProblemNameId",
        ]}
        allowDownload={true}
      />
    </>
  );
}
