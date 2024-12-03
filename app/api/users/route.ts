import { z } from "zod";
import { createUserSchema } from "./validation";
import * as userService from "./service";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createUserSchema.parse(body);

    const user = await userService.createUser(data);
    return Response.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 });
    }
    return Response.json({ error: "Failed to create user" }, { status: 500 });
  }
}
