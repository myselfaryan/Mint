import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/client/fetch";

type Period = "day" | "week" | "month" | "year";

interface StatsResponse {
  value: number;
}

interface StatConfig {
  key: keyof typeof defaultStats;
  stat: string;
  period?: Period;
  roleRequired?: string[];
}

const defaultStats = {
  totalContests: 0,
  upcomingContests: 0,
  endedContests: 0,
  totalMembers: 0,
  totalProblems: 0,
  totalGroups: 0,
  totalSubmissions: 0,
  recentSubmissions: 0,
  recentContests: 0,
  recentProblems: 0,
};

const statsConfig: StatConfig[] = [
  {
    key: "totalContests",
    stat: "total-contests",
    roleRequired: ["owner", "organizer", "member"],
  },
  {
    key: "upcomingContests",
    stat: "upcoming-contests",
    roleRequired: ["owner", "organizer", "member"],
  },
  {
    key: "endedContests",
    stat: "ended-contests",
    roleRequired: ["owner", "organizer", "member"],
  },
  {
    key: "totalMembers",
    stat: "total-members",
    roleRequired: ["owner"],
  },
  {
    key: "totalProblems",
    stat: "total-problems",
    roleRequired: ["owner", "organizer", "member"],
  },
  {
    key: "totalGroups",
    stat: "total-groups",
    roleRequired: ["owner", "organizer", "member"],
  },
  {
    key: "totalSubmissions",
    stat: "total-submissions",
    roleRequired: ["owner", "organizer", "member"],
  },
  {
    key: "recentSubmissions",
    stat: "recent-submissions",
    period: "week",
    roleRequired: ["owner", "organizer", "member"],
  },
  {
    key: "recentContests",
    stat: "recent-contests",
    period: "month",
    roleRequired: ["owner", "organizer", "member"],
  },
  {
    key: "recentProblems",
    stat: "recent-problems",
    period: "month",
    roleRequired: ["owner", "organizer", "member"],
  },
];

// Helper to fetch a single stat with error handling
async function fetchStat(
  orgId: string,
  stat: string,
  period?: Period
): Promise<number> {
  try {
    const response = await fetchApi<StatsResponse>(
      `/orgs/${orgId}/stats?stat=${stat}${period ? `&period=${period}` : ""}`
    );
    return response.value ?? 0;
  } catch (error) {
    console.error(`Failed to fetch stat ${stat}:`, error);
    return 0; // Return 0 on error instead of failing completely
  }
}

export function useOrgStats(orgId: string, currentRole?: string) {
  const [stats, setStats] = useState(defaultStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Filter stats based on user's role
        const allowedStats = statsConfig.filter((config) =>
          config.roleRequired?.includes(currentRole || "")
        );

        if (allowedStats.length === 0) {
          setLoading(false);
          return;
        }

        // Fetch each stat individually with error handling
        const results = await Promise.all(
          allowedStats.map(({ stat, period }) =>
            fetchStat(orgId, stat, period)
          )
        );

        // Combine responses into stats object
        const newStats = { ...defaultStats };
        allowedStats.forEach(({ key }, index) => {
          newStats[key] = results[index];
        });

        setStats(newStats);
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    };

    if (orgId && currentRole) {
      fetchStats();
    } else if (orgId && !currentRole) {
      // Wait a bit for role to be loaded
      const timer = setTimeout(() => {
        if (!currentRole) {
          setLoading(false);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [orgId, currentRole]);

  return { stats, loading, error };
}
