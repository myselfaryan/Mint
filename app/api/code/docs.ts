import { documentRoute } from "@/lib/swagger/route-docs";
import { z } from "zod";

// Note: No predefined schemas for code execution in validations.ts since it's a third-party API
documentRoute({
  method: "post",
  path: "/code",
  summary: "Execute code",
  description: "Executes code using the Piston API",
  tags: ["Code Execution"],
  request: {
    body: z.object({
      language: z.string().describe("Programming language to execute"),
      version: z.string().describe("Version of the language runtime"),
      files: z
        .array(
          z.object({
            name: z.string().optional(),
            content: z.string(),
          }),
        )
        .describe("Source code files to execute"),
      stdin: z
        .string()
        .optional()
        .describe("Standard input to provide to the program"),
      args: z.array(z.string()).optional().describe("Command line arguments"),
      compile_timeout: z
        .number()
        .optional()
        .describe("Compilation timeout in seconds"),
      run_timeout: z
        .number()
        .optional()
        .describe("Execution timeout in seconds"),
    }),
  },
  responses: {
    200: {
      description: "Code executed successfully",
      schema: z.object({
        language: z.string(),
        version: z.string(),
        run: z.object({
          stdout: z.string(),
          stderr: z.string(),
          output: z.string(),
          code: z.number(),
          signal: z.string().nullable(),
        }),
        compile: z
          .object({
            stdout: z.string(),
            stderr: z.string(),
            output: z.string(),
            code: z.number(),
            signal: z.string().nullable(),
          })
          .optional(),
      }),
    },
    500: {
      description: "Failed to execute code",
      schema: z.object({
        error: z.literal("Failed to execute code"),
      }),
    },
  },
});
