import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { NameIdSchema, updatePostSchema } from "@/lib/validations";
import { getOrgIdFromNameId } from "@/app/api/service";
import { deletePost, getPostBySlug, updatePost } from "../service";
import { getCurrentSession } from "@/lib/server/session";
// import { auth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: { orgId: string; slug: string } },
) {
  try {
    const orgId = await getOrgIdFromNameId(NameIdSchema.parse(params.orgId));
    const post = await getPostBySlug(orgId, params.slug);
    return NextResponse.json(post);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    if (error instanceof Error) {
      if (error.message === "Organization not found") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message === "Post not found") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
    }
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { orgId: string; slug: string } },
) {
  try {
    const { user } = await getCurrentSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgId = await getOrgIdFromNameId(NameIdSchema.parse(params.orgId));
    const data = updatePostSchema.parse(await request.json());

    const post = await updatePost(orgId, params.slug, data);
    return NextResponse.json(post);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    if (error instanceof Error) {
      if (error.message === "Organization not found") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message === "Post not found") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { orgId: string; slug: string } },
) {
  try {
    const { user } = await getCurrentSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgId = await getOrgIdFromNameId(NameIdSchema.parse(params.orgId));
    const post = await deletePost(orgId, params.slug);
    return NextResponse.json(post);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    if (error instanceof Error) {
      if (error.message === "Organization not found") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message === "Post not found") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 },
    );
  }
}
