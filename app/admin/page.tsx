"use client";

import { GenericListing, ColumnDef } from "@/mint/generic-listing";
import { Organization } from "./mockData";
import StatCard from "@/components/stat-card";
import { useEffect, useState, useMemo } from "react";
import { fetchApi } from "@/lib/client/fetch";
import { notFound } from "next/navigation";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts";
import {
  Building2,
  Users,
  Trophy,
  FileCode2,
  SendHorizonal,
  TrendingUp,
  Activity,
  BarChart3,
  PieChartIcon,
  Shield,
} from "lucide-react";

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

  // Chart data derived from organizations
  const orgChartData = useMemo(() => {
    if (!data) return [];
    return data.organizations.slice(0, 10).map((org) => ({
      name: org.name.length > 15 ? org.name.slice(0, 15) + "..." : org.name,
      contests: org.contestsCount ?? 0,
      problems: org.problemsCount ?? 0,
      submissions: org.submissionsCount ?? 0,
    }));
  }, [data]);

  // User distribution by role across all orgs
  const userDistributionData = useMemo(() => {
    if (!data) return [];
    const totals = data.organizations.reduce(
      (acc, org) => ({
        owners: acc.owners + (org.ownerUsers ?? 0),
        organizers: acc.organizers + (org.organizerUsers ?? 0),
        members: acc.members + (org.memberUsers ?? 0),
      }),
      { owners: 0, organizers: 0, members: 0 },
    );
    return [
      { name: "Owners", value: totals.owners, fill: "hsl(var(--chart-1))" },
      {
        name: "Organizers",
        value: totals.organizers,
        fill: "hsl(var(--chart-2))",
      },
      { name: "Members", value: totals.members, fill: "hsl(var(--chart-3))" },
    ];
  }, [data]);

  // Platform distribution data
  const platformDistributionData = useMemo(() => {
    if (!data) return [];
    return [
      {
        name: "Organizations",
        value: data.platformStats.totalOrgs,
        fill: "hsl(var(--chart-1))",
      },
      {
        name: "Contests",
        value: data.platformStats.totalContests,
        fill: "hsl(var(--chart-2))",
      },
      {
        name: "Problems",
        value: data.platformStats.totalProblems,
        fill: "hsl(var(--chart-3))",
      },
      {
        name: "Users",
        value: data.platformStats.totalUsers,
        fill: "hsl(var(--chart-4))",
      },
    ];
  }, [data]);

  // Activity trend (simulated)
  const activityTrendData = useMemo(() => {
    if (!data) return [];
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const baseSubmissions = Math.max(
      1,
      Math.floor(data.platformStats.totalSubmissions / 30),
    );
    return days.map((day) => ({
      day,
      submissions: Math.floor(baseSubmissions * (0.7 + Math.random() * 0.6)),
      users: Math.floor(data.platformStats.totalUsers * 0.1 * Math.random()),
    }));
  }, [data]);

  const chartConfig = {
    submissions: { label: "Submissions", color: "hsl(var(--chart-1))" },
    users: { label: "Active Users", color: "hsl(var(--chart-2))" },
    contests: { label: "Contests", color: "hsl(var(--chart-1))" },
    problems: { label: "Problems", color: "hsl(var(--chart-2))" },
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (error || !data) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Platform Admin</h1>
          <p className="text-muted-foreground">
            System-wide overview and management
          </p>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <StatCard
          heading="Total Organizations"
          value={data.platformStats.totalOrgs}
          unit="orgs"
          icon={Building2}
          variant="primary"
        />
        <StatCard
          heading="Total Users"
          value={data.platformStats.totalUsers}
          unit="users"
          icon={Users}
          variant="info"
        />
        <StatCard
          heading="Total Contests"
          value={data.platformStats.totalContests}
          unit="contests"
          icon={Trophy}
          variant="success"
        />
        <StatCard
          heading="Total Problems"
          value={data.platformStats.totalProblems}
          unit="problems"
          icon={FileCode2}
          variant="warning"
        />
        <StatCard
          heading="Total Submissions"
          value={data.platformStats.totalSubmissions}
          unit="submissions"
          icon={SendHorizonal}
          variant="default"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Activity Trend Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-muted-foreground" />
              Platform Activity
            </CardTitle>
            <CardDescription>
              Weekly submission and user activity trend
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <AreaChart data={activityTrendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="submissions"
                  stroke="hsl(var(--chart-1))"
                  fill="hsl(var(--chart-1))"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="hsl(var(--chart-2))"
                  fill="hsl(var(--chart-2))"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* User Distribution Pie Chart */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-muted-foreground" />
              User Roles Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of users by role across all organizations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <PieChart>
                <Pie
                  data={userDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, value }) =>
                    value > 0 ? `${name}: ${value}` : ""
                  }
                  labelLine={false}
                >
                  {userDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Organization Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            Top Organizations Comparison
          </CardTitle>
          <CardDescription>
            Contests, problems, and submissions by organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={orgChartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-muted"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                angle={-15}
                textAnchor="end"
                height={60}
              />
              <YAxis axisLine={false} tickLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="contests"
                fill="hsl(var(--chart-1))"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="problems"
                fill="hsl(var(--chart-2))"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="submissions"
                fill="hsl(var(--chart-3))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Platform Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Organizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.platformStats.totalOrgs}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active on the platform
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Avg Contests/Org
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.platformStats.totalOrgs > 0
                ? (
                    data.platformStats.totalContests /
                    data.platformStats.totalOrgs
                  ).toFixed(1)
                : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Contests per organization
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileCode2 className="h-4 w-4" />
              Avg Problems/Org
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.platformStats.totalOrgs > 0
                ? (
                    data.platformStats.totalProblems /
                    data.platformStats.totalOrgs
                  ).toFixed(1)
                : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Problems per organization
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Engagement Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.platformStats.totalUsers > 0
                ? (
                    ((data.platformStats.totalSubmissions /
                      data.platformStats.totalUsers) *
                      100) /
                    10
                  ).toFixed(1)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on submissions/user
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Organizations Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Organizations</CardTitle>
          <CardDescription>
            Detailed view of all organizations on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GenericListing<Organization>
            data={data.organizations}
            columns={columns}
            title=""
            searchableFields={["name", "nameId", "about"]}
            allowDownload={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
