"use client";
import Charts from "@/components/statstable";

interface ChartData {
  submissions: {
    total: number;
    weeklyData: Array<{
      date: string;
      steps: number;
    }>;
    weeklyTotal: number;
  };
  upcomingContest: {
    count: number;
    variability: number;
    weeklyData: Array<{
      date: string;
      resting: number;
    }>;
  };
  contestDetails: {
    currentYear: {
      year: string;
      contestsPerDay: number;
    };
    previousYear: {
      year: string;
      contestsPerDay: number;
    };
  };
}

export default function GraphicsPage() {
  const chartData: ChartData = {
    submissions: {
      total: 12584,
      weeklyData: [
        { date: "2024-01-01", steps: 2000 },
        { date: "2024-01-02", steps: 2100 },
        { date: "2024-01-03", steps: 2200 },
        { date: "2024-01-04", steps: 2300 },
        { date: "2024-01-05", steps: 2400 },
        { date: "2024-01-06", steps: 2500 },
        { date: "2024-01-07", steps: 2600 },
        // ... more data
      ],
      weeklyTotal: 5305,
    },
    upcomingContest: {
      count: 62,
      variability: 35,
      weeklyData: [
        { date: "2024-01-01", resting: 62 },
        { date: "2024-01-02", resting: 63 },
        { date: "2024-01-03", resting: 64 },
        { date: "2024-01-04", resting: 65 },
        { date: "2024-01-05", resting: 66 },
        { date: "2024-01-06", resting: 67 },
        { date: "2024-01-07", resting: 68 },

        // ... more data
      ],
    },
    contestDetails: {
      currentYear: {
        year: "2024",
        contestsPerDay: 12453,
      },
      previousYear: {
        year: "2023",
        contestsPerDay: 10103,
      },
    },
  };

  return (
    <div>
      <Charts data={chartData} />
    </div>
  );
}
