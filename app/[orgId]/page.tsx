"use client";
import { useContext, useMemo, useEffect, useState } from "react";
import { AuthContext } from "@/contexts/auth-context";
import { useOrgStats } from "@/hooks/use-org-stats";
import { useParams, useRouter } from "next/navigation";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  Trophy,
  Calendar,
  CheckCircle2,
  Users,
  FileCode2,
  Users2,
  SendHorizonal,
  TrendingUp,
  Clock,
  BarChart3,
  Play,
  Target,
  Award,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import StatCard from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import { fetchApi } from "@/lib/client/fetch";
import Link from "next/link";

interface Contest {
  id: number;
  nameId: string;
  name: string;
  startTime: string;
  endTime: string;
}

function StatsLoadingSkeleton() {
  return (
    <div className="container mx-auto max-w-6xl py-6 space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 border rounded-lg">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-4 border rounded-lg">
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-[200px] w-full" />
        </div>
        <div className="p-4 border rounded-lg">
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
    </div>
  );
}

// Pie chart colors
const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))"];

// =====================================================
// MEMBER DASHBOARD COMPONENT
// =====================================================
function MemberDashboard({ orgId }: { orgId: string }) {
  const [upcomingContests, setUpcomingContests] = useState<Contest[]>([]);
  const [activeContests, setActiveContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const response = await fetchApi<{ data: Contest[] }>(`/orgs/${orgId}/contests?limit=10`);
        const now = new Date();

        const upcoming = response.data.filter(
          (c) => new Date(c.startTime) > now
        ).slice(0, 5);

        const active = response.data.filter(
          (c) => new Date(c.startTime) <= now && new Date(c.endTime) > now
        ).slice(0, 5);

        setUpcomingContests(upcoming);
        setActiveContests(active);
      } catch (error) {
        console.error("Error fetching contests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, [orgId]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeUntil = (dateStr: string) => {
    const now = new Date();
    const target = new Date(dateStr);
    const diff = target.getTime() - now.getTime();

    if (diff < 0) return "Started";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return "Soon";
  };

  if (loading) {
    return <StatsLoadingSkeleton />;
  }

  return (
    <div className="container mx-auto max-w-6xl py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome Back! 👋</h1>
          <p className="text-muted-foreground">
            Your personal dashboard - explore contests and track your progress
          </p>
        </div>
      </div>

      {/* Quick Stats for Member */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          heading="Active Contests"
          value={activeContests.length}
          unit="live now"
          icon={Play}
          variant="success"
        />
        <StatCard
          heading="Upcoming Contests"
          value={upcomingContests.length}
          unit="scheduled"
          icon={Calendar}
          variant="info"
        />
        <StatCard
          heading="Available Problems"
          value={0}
          unit="to solve"
          icon={Target}
          variant="warning"
        />
        <StatCard
          heading="Your Submissions"
          value={0}
          unit="total"
          icon={SendHorizonal}
          variant="primary"
        />
      </div>

      {/* Active Contests Section */}
      {activeContests.length > 0 && (
        <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-green-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-500">
              <Play className="h-5 w-5 animate-pulse" />
              Live Contests
            </CardTitle>
            <CardDescription>
              These contests are happening right now - jump in!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {activeContests.map((contest) => (
                <Link
                  key={contest.id}
                  href={`/${orgId}/contests/${contest.nameId}`}
                  className="group"
                >
                  <Card className="hover:border-emerald-500/50 transition-all hover:shadow-md cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold group-hover:text-emerald-500 transition-colors">
                            {contest.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Ends: {formatDate(contest.endTime)}
                          </p>
                        </div>
                        <Button size="sm" variant="secondary" className="gap-1">
                          Join <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Contests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            Upcoming Contests
          </CardTitle>
          <CardDescription>
            Mark your calendar for these upcoming events
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingContests.length > 0 ? (
            <div className="space-y-3">
              {upcomingContests.map((contest) => (
                <Link
                  key={contest.id}
                  href={`/${orgId}/contests/${contest.nameId}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-3 rounded-lg border hover:border-primary/50 hover:bg-muted/50 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Trophy className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <h4 className="font-medium">{contest.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(contest.startTime)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-blue-500">
                        {getTimeUntil(contest.startTime)}
                      </span>
                      <p className="text-xs text-muted-foreground">until start</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No upcoming contests scheduled</p>
              <p className="text-sm">Check back later for new events!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href={`/${orgId}/contests`}>
          <Card className="hover:border-primary/50 transition-all cursor-pointer h-full">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="p-3 bg-primary/10 rounded-full mb-3">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Browse Contests</h3>
              <p className="text-sm text-muted-foreground">
                View all available contests
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/${orgId}/posts`}>
          <Card className="hover:border-primary/50 transition-all cursor-pointer h-full">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="p-3 bg-blue-500/10 rounded-full mb-3">
                <BookOpen className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="font-semibold mb-1">Read Announcements</h3>
              <p className="text-sm text-muted-foreground">
                Stay updated with latest news
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/${orgId}/profile`}>
          <Card className="hover:border-primary/50 transition-all cursor-pointer h-full">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="p-3 bg-amber-500/10 rounded-full mb-3">
                <Award className="h-6 w-6 text-amber-500" />
              </div>
              <h3 className="font-semibold mb-1">Your Profile</h3>
              <p className="text-sm text-muted-foreground">
                View your stats and achievements
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

// =====================================================
// ORGANIZER/OWNER DASHBOARD COMPONENT
// =====================================================
function OrganizerDashboard({ orgId, isOwner }: { orgId: string; isOwner: boolean }) {
  const { stats, loading, error } = useOrgStats(orgId, isOwner ? "owner" : "organizer");

  // Derived data for charts
  const contestStatusData = useMemo(() => [
    { name: "Upcoming", value: stats.upcomingContests, fill: "hsl(var(--chart-1))" },
    { name: "Active", value: Math.max(0, stats.totalContests - stats.upcomingContests - stats.endedContests), fill: "hsl(var(--chart-2))" },
    { name: "Ended", value: stats.endedContests, fill: "hsl(var(--chart-3))" },
  ], [stats]);

  const overviewData = useMemo(() => [
    { name: "Contests", value: stats.totalContests, fill: "hsl(var(--chart-1))" },
    { name: "Problems", value: stats.totalProblems, fill: "hsl(var(--chart-2))" },
    { name: "Submissions", value: stats.totalSubmissions, fill: "hsl(var(--chart-3))" },
    { name: "Groups", value: stats.totalGroups, fill: "hsl(var(--chart-4))" },
  ], [stats]);

  // Activity data (simulated trend)
  const activityData = useMemo(() => {
    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const baseSubmissions = Math.max(1, Math.floor(stats.recentSubmissions / 7));
    return weekDays.map((day, i) => ({
      day,
      submissions: Math.max(0, baseSubmissions + Math.floor(Math.random() * baseSubmissions * 0.5 - baseSubmissions * 0.25)),
      problems: Math.floor(Math.random() * 3),
    }));
  }, [stats.recentSubmissions]);

  const chartConfig = {
    submissions: {
      label: "Submissions",
      color: "hsl(var(--chart-1))",
    },
    problems: {
      label: "Problems",
      color: "hsl(var(--chart-2))",
    },
  };

  const contestChartConfig = {
    upcoming: {
      label: "Upcoming",
      color: "hsl(var(--chart-1))",
    },
    active: {
      label: "Active",
      color: "hsl(var(--chart-2))",
    },
    ended: {
      label: "Ended",
      color: "hsl(var(--chart-3))",
    },
  };

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
    <div className="container mx-auto max-w-6xl py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your organization&apos;s activity
          </p>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          heading="Total Contests"
          value={stats.totalContests}
          unit="contests"
          icon={Trophy}
          variant="primary"
          trend={stats.recentContests > 0 ? { value: stats.recentContests, label: "this month", isPositive: true } : undefined}
        />
        <StatCard
          heading="Upcoming Contests"
          value={stats.upcomingContests}
          unit="scheduled"
          icon={Calendar}
          variant="info"
        />
        <StatCard
          heading="Ended Contests"
          value={stats.endedContests}
          unit="completed"
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          heading="Total Problems"
          value={stats.totalProblems}
          unit="problems"
          icon={FileCode2}
          variant="warning"
          trend={stats.recentProblems > 0 ? { value: stats.recentProblems, label: "this month", isPositive: true } : undefined}
        />
      </div>

      {/* Secondary Stats (Owner/Organizer only) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isOwner && (
          <StatCard
            heading="Total Members"
            value={stats.totalMembers}
            unit="members"
            icon={Users}
            variant="default"
          />
        )}
        <StatCard
          heading="Total Groups"
          value={stats.totalGroups}
          unit="groups"
          icon={Users2}
          variant="default"
        />
        <StatCard
          heading="Total Submissions"
          value={stats.totalSubmissions}
          unit="submissions"
          icon={SendHorizonal}
          variant="default"
        />
        <StatCard
          heading="Weekly Activity"
          value={stats.recentSubmissions}
          unit="submissions"
          icon={TrendingUp}
          variant="default"
          trend={{ value: stats.recentSubmissions, label: "this week", isPositive: stats.recentSubmissions > 0 }}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Activity Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              Weekly Activity
            </CardTitle>
            <CardDescription>
              Submissions and problem activity over the past week
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <AreaChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  className="text-xs"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  className="text-xs"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="submissions"
                  stroke="hsl(var(--chart-1))"
                  fill="hsl(var(--chart-1))"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Contest Status Pie Chart */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-muted-foreground" />
              Contest Status
            </CardTitle>
            <CardDescription>
              Distribution of contests by status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={contestChartConfig} className="h-[250px] w-full">
              <PieChart>
                <Pie
                  data={contestStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, value }) => value > 0 ? `${name}: ${value}` : ""}
                  labelLine={false}
                >
                  {contestStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Overview Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            Organization Overview
          </CardTitle>
          <CardDescription>
            Total counts across different categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <BarChart data={overviewData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
              <XAxis type="number" axisLine={false} tickLine={false} />
              <YAxis
                dataKey="name"
                type="category"
                axisLine={false}
                tickLine={false}
                width={80}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {overviewData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Quick Actions / Recent Activity Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:border-primary/50 transition-colors cursor-pointer">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>New contests this month</span>
                <span className="font-medium text-foreground">{stats.recentContests}</span>
              </div>
              <div className="flex justify-between">
                <span>Problems added this month</span>
                <span className="font-medium text-foreground">{stats.recentProblems}</span>
              </div>
              <div className="flex justify-between">
                <span>Submissions this week</span>
                <span className="font-medium text-foreground">{stats.recentSubmissions}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors cursor-pointer">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-4 w-4" />
              Contest Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Contests</span>
                <span className="font-medium text-foreground">{stats.totalContests}</span>
              </div>
              <div className="flex justify-between">
                <span>Upcoming</span>
                <span className="font-medium text-blue-500">{stats.upcomingContests}</span>
              </div>
              <div className="flex justify-between">
                <span>Completed</span>
                <span className="font-medium text-emerald-500">{stats.endedContests}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors cursor-pointer">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileCode2 className="h-4 w-4" />
              Problem Bank
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Problems</span>
                <span className="font-medium text-foreground">{stats.totalProblems}</span>
              </div>
              <div className="flex justify-between">
                <span>Added this month</span>
                <span className="font-medium text-foreground">{stats.recentProblems}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Submissions</span>
                <span className="font-medium text-foreground">{stats.totalSubmissions}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// =====================================================
// MAIN PAGE COMPONENT - ROUTES TO CORRECT DASHBOARD
// =====================================================
export default function DashboardPage() {
  const { user } = useContext(AuthContext);
  const params = useParams();
  const orgId = params.orgId as string;

  const currentOrg = user?.orgs.find((org) => org.nameId === orgId);
  const role = currentOrg?.role;

  // Show loading while waiting for auth
  if (!user) {
    return <StatsLoadingSkeleton />;
  }

  // Show member dashboard for regular members
  if (role === "member") {
    return <MemberDashboard orgId={orgId} />;
  }

  // Show organizer/owner dashboard
  return <OrganizerDashboard orgId={orgId} isOwner={role === "owner"} />;
}
