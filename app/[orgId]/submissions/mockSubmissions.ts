export interface Submission {
  id: number;
  userNameId: string;
  contestNameId: string;
  contestProblemNameId: string;
  language: string;
  status:
    | "accepted"
    | "wrong_answer"
    | "time_limit_exceeded"
    | "runtime_error"
    | "compilation_error";
  submittedAt: string;
  executionTime: number; // in milliseconds
  memoryUsage: number; // in kilobytes
}

export const mockSubmissions: Submission[] = [
  {
    id: 1,
    userNameId: "john.smith",
    contestNameId: "wpc-1",
    contestProblemNameId: "2SUM1",
    language: "python",
    status: "accepted",
    submittedAt: "2024-01-15",
    executionTime: 45,
    memoryUsage: 1024,
  },
  {
    id: 2,
    userNameId: "alice.j",
    contestNameId: "wpc-1",
    contestProblemNameId: "2SUM1",
    language: "javascript",
    status: "time_limit_exceeded",
    submittedAt: "2024-01-15",
    executionTime: 2100,
    memoryUsage: 2048,
  },
  {
    id: 3,
    userNameId: "bob.wilson",
    contestNameId: "dsa-deep",
    contestProblemNameId: "REVST",
    language: "cpp",
    status: "compilation_error",
    submittedAt: "2024-01-20",
    executionTime: 0,
    memoryUsage: 0,
  },
  {
    id: 4,
    userNameId: "emma.d",
    contestNameId: "dsa-deep",
    contestProblemNameId: "BSRCH",
    language: "java",
    status: "wrong_answer",
    submittedAt: "2024-01-20",
    executionTime: 15,
    memoryUsage: 512,
  },
  {
    id: 5,
    userNameId: "michael.b",
    contestNameId: "bg-contest",
    contestProblemNameId: "BSRCH",
    language: "typescript",
    status: "accepted",
    submittedAt: "2024-01-25",
    executionTime: 12,
    memoryUsage: 768,
  },
];
