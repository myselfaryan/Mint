"use client";
import { useContext } from "react";
import { AuthContext } from "@/contexts/auth-context";
import { useOrgStats } from "@/hooks/use-org-stats";
import { useParams } from "next/navigation";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import StatCard from "@/components/stat-card";

function StatsLoadingSkeleton() {
  return (
    <div className="container mx-auto max-w-5xl py-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 border rounded-lg">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GraphicsPage() {
  const { user } = useContext(AuthContext);
  const params = useParams();
  const orgId = params.orgId as string;

  const currentOrg = user?.orgs.find((org) => org.nameId === orgId);
  const { stats, loading, error } = useOrgStats(orgId, currentOrg?.role);

  if (loading) return <StatsLoadingSkeleton />;
  if (error)
    return (
      <Alert variant="destructive" className="max-w-lg mx-auto my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );

  return (
    <div className="container mx-auto max-w-5xl py-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          heading="Total Contests"
          value={stats.totalContests}
          unit="contests"
        />
        <StatCard
          heading="Upcoming Contests"
          value={stats.upcomingContests}
          unit="contests"
        />
        <StatCard
          heading="Ended Contests"
          value={stats.endedContests}
          unit="contests"
        />
        {currentOrg?.role === "owner" && (
          <StatCard
            heading="Total Members"
            value={stats.totalMembers}
            unit="members"
          />
        )}
      </div>
    </div>
  );
}
