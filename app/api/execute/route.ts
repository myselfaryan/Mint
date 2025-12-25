/**
 * Real-Time Code Execution API
 * POST /api/execute - Execute code with real-time status updates
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  executeCode,
  LANGUAGE_CONFIGS,
  SupportedLanguage,
} from "@/lib/code-execution";

// Request validation schema
const executeRequestSchema = z.object({
  code: z.string().min(1, "Code is required").max(100000, "Code too long"),
  language: z.enum(["python", "cpp", "java", "javascript", "node"]),
  stdin: z.string().default(""),
  timeLimit: z.number().min(1).max(30).default(5),
  memoryLimit: z.number().min(1024).max(512000).default(128000),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = executeRequestSchema.parse(body);

    const result = await executeCode(
      data.code,
      data.language as SupportedLanguage,
      data.stdin,
      {
        timeLimit: data.timeLimit * 1000, // Convert seconds to ms
        memoryLimit: data.memoryLimit,
      },
    );

    return NextResponse.json({
      success: result.success,
      output: result.stdout,
      stderr: result.stderr,
      status: result.status,
      executionTime: result.executionTime,
      memoryUsed: result.memoryUsed,
      compileOutput: result.compileOutput,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 },
      );
    }

    console.error("Execution error:", error);
    return NextResponse.json(
      { error: "Execution failed", message: (error as Error).message },
      { status: 500 },
    );
  }
}

// GET endpoint to fetch supported languages
export async function GET() {
  const languages = Object.entries(LANGUAGE_CONFIGS).map(([key, config]) => ({
    id: key,
    name: config.name,
    version: config.version,
    extension: config.extension,
  }));

  return NextResponse.json({ languages });
}
