export interface Contest {
  id: number;
  name: string;
  nameId: string;
  description: string;
  startTime: string;
  endTime: string;
  problems: string;
  problemCount?: number;
}

export const mockContests: Contest[] = [
  {
    id: 1,
    name: "Weekly Programming Challenge #1",
    nameId: "wpc-1",
    description:
      "A weekly programming contest featuring algorithmic problems of varying difficulty levels.",
    startTime: "2024-01-15",
    endTime: "2024-01-15",
    problems: "1,2,3",
  },
  {
    id: 2,
    name: "Data Structures Deep Dive",
    nameId: "dsa-deep",
    description:
      "Test your knowledge of advanced data structures with this challenging contest.",
    startTime: "2024-01-20",
    endTime: "2024-01-20",
    problems: "4,5",
  },
  {
    id: 3,
    name: "Beginner's Coding Contest",
    nameId: "bg-contest",
    description:
      "Perfect for newcomers! Simple problems to help you get started with competitive programming.",
    startTime: "2024-01-25",
    endTime: "2024-01-25",
    problems: "6",
  },
];
