import { updateUserSchema } from "@/lib/validations";
import { IdSchema } from "../../types";
import * as userService from "../service";
import { NextRequest } from "next/server";
import { z } from "zod";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } },
) {
  try {
    const userId = IdSchema.parse(params.userId);
    const body = await request.json();
    const data = updateUserSchema.parse(body);

    const user = await userService.updateUser(userId, data);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 });
    }
    return Response.json({ error: "Failed to update user" }, { status: 500 });
  }
}
