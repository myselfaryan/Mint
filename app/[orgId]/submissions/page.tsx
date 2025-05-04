"use client";

import { GenericListing, ColumnDef } from "@/mint/generic-listing";
import { Submission, mockSubmissions } from "./mockSubmissions";
import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { formatValidationErrors } from "@/utils/error";
import { MockAlert } from "@/components/mock-alert";
import { timeAgo } from "@/lib/utils";

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
  const [showMockAlert, setShowMockAlert] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    try {
      const response = await fetch(`/api/orgs/${params.orgId}/submissions`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(formatValidationErrors(errorData));
      }
      const data = await response.json();
      console.log("submission", data);

      const submissions = data.map((submission: any) => ({
        id: submission.id,
        userNameId: submission.user.nameId,
        contestNameId: submission.contest.nameId,
        contestProblemNameId: submission.problem.id,
        language: submission.language,
        status: submission.status,
        submittedAt: timeAgo(submission.submittedAt),
        executionTime: submission.executionTime,
        memoryUsage: submission.memoryUsage,
      }));

      setSubmissions(submissions);
      setShowMockAlert(false);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      setSubmissions(mockSubmissions);
      setShowMockAlert(true);
    }
  }, [params.orgId]);

  useEffect(() => {
    fetchSubmissions();
  }, [params.orgId, fetchSubmissions]);

  return (
    <>
      <MockAlert show={showMockAlert} />
      <GenericListing
        data={submissions}
        columns={columns}
        title="Submissions"
        searchableFields={[
          "userNameId",
          "contestNameId",
          "contestProblemNameId",
          "language",
          "status",
        ]}
        allowDownload={true}
      />
    </>
  );
}
