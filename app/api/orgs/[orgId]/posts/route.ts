import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createPost, getOrgPosts, getPostBySlug, updatePost, deletePost } from "./service";
import { createPostSchema, updatePostSchema, NameIdSchema } from "@/lib/validations";
import { getOrgIdFromNameId } from "@/app/api/service";
import { auth } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { orgId: string } },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgId = await getOrgIdFromNameId(NameIdSchema.parse(params.orgId));
    const data = createPostSchema.parse(await request.json());

    const post = await createPost(orgId, session.user.id, data);
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    if (error instanceof Error) {
      if (error.message === "Organization not found") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 },
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { orgId: string } },
) {
  try {
    const orgId = await getOrgIdFromNameId(NameIdSchema.parse(params.orgId));
    const { searchParams } = req.nextUrl;
    const limit = Math.min(Number(searchParams.get("limit") || 10), 100);
    const offset = Math.max(Number(searchParams.get("offset") || 0), 0);
    const search = searchParams.get("search") || undefined;

    const result = await getOrgPosts(orgId, limit, offset, search);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    if (error instanceof Error && error.message === "Organization not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 },
    );
  }
}