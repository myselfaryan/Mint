export interface TestCase {
  input: string;
  output: string;
  kind: "example" | "test";
}

export interface Problem {
  id: number;
  code: string; // 5 character alphanumeric code
  title: string;
  description?: string;
  allowedLanguages: string[];
  createdAt: string;
  orgId: number | string;
  orgNameId?: string; // String version of orgId for API calls
  contestNameId?: string; // For submission context
  testCases?: TestCase[];
}

export const mockProblems: Problem[] = [
  {
    id: 1,
    code: "2SUM1",
    title:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    description: `
      You may assume that each input would have exactly one solution, and you may not use the same element twice.
      You can return the answer in any order.
    `,
    allowedLanguages: ["python", "javascript", "java"],
    createdAt: "2024-01-01",
    orgId: 1,
    testCases: [
      {
        input: `[2,7,11,15], 9`,
        output: `[0,1]`,
        kind: "example",
      },
      {
        input: `[3,2,4], 6`,
        output: `[1,2]`,
        kind: "example",
      },
      {
        input: `[3,3], 6`,
        output: `[0,1]`,
        kind: "example",
      },
    ],
  },
  {
    id: 2,
    code: "REVST",
    title:
      "Write a function that reverses a string. The input string is given as an array of characters.",
    allowedLanguages: ["python", "cpp", "javascript"],
    createdAt: "2024-01-02",
    orgId: 1,
  },
  {
    id: 3,
    code: "BSRCH",
    title:
      "Implement a binary search algorithm to find a target value in a sorted array.",
    allowedLanguages: ["python", "typescript", "java", "cpp"],
    createdAt: "2024-01-03",
    orgId: 1,
  },
];
