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
];

export function useOrgStats(orgId: string, currentRole?: string) {
  const [stats, setStats] = useState(defaultStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Filter stats based on user's role
        const allowedStats = statsConfig.filter((config) =>
          config.roleRequired?.includes(currentRole || ""),
        );

        // Create array of promises for allowed stats
        const responses = await Promise.all(
          allowedStats.map(({ stat, period }) =>
            fetchApi<StatsResponse>(
              `/orgs/${orgId}/stats?stat=${stat}${period ? `&period=${period}` : ""}`,
            ),
          ),
        );

        // Combine responses into stats object
        const newStats = { ...defaultStats };
        allowedStats.forEach(({ key }, index) => {
          newStats[key] = responses[index].value;
        });

        setStats(newStats);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    };

    if (orgId) {
      fetchStats();
    }
  }, [orgId, currentRole]);

  return { stats, loading, error };
}
