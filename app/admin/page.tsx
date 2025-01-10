"use client";

import { GenericListing, ColumnDef } from "@/mint/generic-listing";
import { Organization } from "./mockData";
import StatCard from "@/components/stat-card";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/client/fetch";

import { notFound } from "next/navigation";
import { PageSkeleton } from "@/components/ui/page-skeleton";

interface AdminData {
  platformStats: {
    totalOrgs: number;
    totalContests: number;
    totalUsers: number;
    totalProblems: number;
    totalSubmissions: number;
  };
  organizations: Organization[];
}

const columns: ColumnDef<Organization>[] = [
  { header: "Name", accessorKey: "name", sortable: true },
  { header: "Name ID", accessorKey: "nameId", sortable: true },
  { header: "About", accessorKey: "about" },
  { header: "Created At", accessorKey: "createdAt", sortable: true },
  { header: "Contests", accessorKey: "contestsCount", sortable: true },
  { header: "Owners", accessorKey: "ownerUsers", sortable: true },
  { header: "Organizers", accessorKey: "organizerUsers", sortable: true },
  { header: "Members", accessorKey: "memberUsers", sortable: true },
  { header: "Problems", accessorKey: "problemsCount", sortable: true },
  { header: "Submissions", accessorKey: "submissionsCount", sortable: true },
];

export default function AdminPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchApi<AdminData>("superuser");
        setData(response);
      } catch (err) {
        if (err instanceof Error && err.message.includes("401")) {
          setError("unauthorized");
        } else {
          setError("Failed to load admin data");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (error || !data) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-6 text-center text-3xl font-bold tracking-tight">
        Platform Admin
      </h1>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mx-8">
        <StatCard
          heading="Total Organizations"
          value={data.platformStats.totalOrgs}
          unit="orgs"
        />
        <StatCard
          heading="Total Users"
          value={data.platformStats.totalUsers}
          unit="users"
        />
        <StatCard
          heading="Total Contests"
          value={data.platformStats.totalContests}
          unit="contests"
        />
        <StatCard
          heading="Total Problems"
          value={data.platformStats.totalProblems}
          unit="problems"
        />
        <StatCard
          heading="Total Submissions"
          value={data.platformStats.totalSubmissions}
          unit="submissions"
        />
      </div>

      <GenericListing<Organization>
        data={data.organizations}
        columns={columns}
        title="Organizations"
        searchableFields={["name", "nameId", "about"]}
        allowDownload={false}
      />
    </div>
  );
}
