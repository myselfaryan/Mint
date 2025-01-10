"use client";

import { mockProblems, Problem } from "./mockProblems";
import { useToast } from "@/hooks/use-toast";
import { GenericListing, ColumnDef } from "@/mint/generic-listing";
import { useEffect, useState, useCallback } from "react";
import { formatValidationErrors } from "@/utils/error";
import { useRouter } from "next/navigation";
import { MockAlert } from "@/components/mock-alert";

const columns: ColumnDef<Problem>[] = [
  { header: "Problem Code", accessorKey: "nameId", sortable: true },
  { header: "Title", accessorKey: "title", sortable: true },
  { header: "Allowed Languages", accessorKey: "allowedLanguages" },
  { header: "Created At", accessorKey: "createdAt", sortable: true },
];

export default function ProblemsPage({
  params,
}: {
  params: { orgId: string };
}) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [showMockAlert, setShowMockAlert] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const fetchProblems = useCallback(async () => {
    try {
      const response = await fetch(`/api/orgs/${params.orgId}/problems`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(formatValidationErrors(errorData));
      }
      const data = await response.json();
      setProblems(data);
      setShowMockAlert(false);
    } catch (error) {
      console.error("Error fetching problems:", error);
      setProblems(mockProblems);
      setShowMockAlert(true);
    }
  }, [params.orgId]);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  const handleDelete = async (problem: Problem) => {
    try {
      const response = await fetch(
        `/api/orgs/${params.orgId}/problems/${problem.nameId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(formatValidationErrors(errorData));
      }

      await fetchProblems();
      toast({
        title: "Success",
        description: "Problem deleted successfully",
      });
      return Promise.resolve();
    } catch (error) {
      console.error("Error deleting problem:", error);
      return Promise.reject(error);
    }
  };

  return (
    <>
      <MockAlert show={showMockAlert} />
      <GenericListing
        data={problems}
        columns={columns}
        title="Problems"
        searchableFields={["nameId", "title"]}
        onAdd={() => router.push(`/${params.orgId}/problems/new`)}
        onEdit={(problem: Problem) =>
          router.push(`/${params.orgId}/problems/${problem.nameId}/edit`)
        }
        onDelete={handleDelete}
      />
    </>
  );
}
