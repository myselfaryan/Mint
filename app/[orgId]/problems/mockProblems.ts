export interface Problem {
  id: number;
  nameId: string; // 5 character alphanumeric code
  title: string;
  allowedLanguages: string[];
  createdAt: string;
  orgId: number;
}

export const mockProblems: Problem[] = [
  {
    id: 1,
    nameId: "2SUM1",
    title:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    allowedLanguages: ["python", "javascript", "java"],
    createdAt: "2024-01-01",
    orgId: 1,
  },
  {
    id: 2,
    nameId: "REVST",
    title:
      "Write a function that reverses a string. The input string is given as an array of characters.",
    allowedLanguages: ["python", "cpp", "javascript"],
    createdAt: "2024-01-02",
    orgId: 1,
  },
  {
    id: 3,
    nameId: "BSRCH",
    title:
      "Implement a binary search algorithm to find a target value in a sorted array.",
    allowedLanguages: ["python", "typescript", "java", "cpp"],
    createdAt: "2024-01-03",
    orgId: 1,
  },
];
