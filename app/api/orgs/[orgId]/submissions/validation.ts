import { z } from "zod";
import { extendZodWithOpenApi } from "@anatine/zod-openapi";

// Extend Zod with OpenAPI functionality
extendZodWithOpenApi(z);

export const createSubmissionSchema = z
  .object({
    userNameId: z.string().min(1).openapi({
      example: "raj-yadav",
      description: "User's unique name ID",
    }),
    problemId: z.number().int().positive().openapi({
      example: 1,
      description: "Problem's ID",
    }),
    content: z.string().min(1).openapi({
      example:
        "def solve(nums, target):\n    for i in range(len(nums)):\n        for j in range(i+1, len(nums)):\n            if nums[i] + nums[j] == target:\n                return [i,j]\n    return []",
      description: "Solution code content",
    }),
    language: z.string().min(1).openapi({
      example: "python",
      description: "Programming language used",
    }),
    contestNameId: z.string().min(1).openapi({
      example: "iiits-coding-championship-2024",
      description: "Contest's unique name ID",
    }),
  })
  .openapi({
    title: "CreateSubmission",
    description: "Schema for creating a new submission",
  });

export const getSubmissionsQuerySchema = z
  .object({
    contestId: z.string().optional().openapi({
      example: "iiits-coding-championship-2024",
      description: "Filter submissions by contest ID",
    }),
    userId: z.string().optional().openapi({
      example: "raj-yadav",
      description: "Filter submissions by user ID",
    }),
    status: z.string().optional().openapi({
      example: "accepted",
      description: "Filter submissions by status",
    }),
    page: z.string().optional().openapi({
      example: "1",
      description: "Page number for pagination",
    }),
    limit: z.string().optional().openapi({
      example: "10",
      description: "Number of items per page",
    }),
  })
  .openapi({
    title: "GetSubmissionsQuery",
    description: "Query parameters for fetching submissions",
  });
