import { NextResponse } from "next/server";

const PISTON_API = "https://emkc.org/api/v2/piston";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = await fetch(`${PISTON_API}/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language: body.language,
        version: body.version,
        files: body.files,
        stdin: body.stdin,
        args: body.args,
        compile_timeout: body.compile_timeout,
        run_timeout: body.run_timeout,
      }),
    });

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to execute code" },
      { status: 500 },
    );
  }
}
