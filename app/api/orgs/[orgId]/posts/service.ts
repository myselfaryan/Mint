import { z } from "zod";
import { db } from "@/db/drizzle";
import { posts, postTags, users } from "@/db/schema";
import { createPostSchema, updatePostSchema } from "@/lib/validations";
import { and, eq, desc, count, ilike, asc } from "drizzle-orm";
import { CACHE_TTL } from "@/db/redis";
import { withDataCache } from "@/lib/cache/utils";

export async function createPost(
  orgId: number,
  authorId: number,
  data: z.infer<typeof createPostSchema>,
) {
  return await db.transaction(async (tx) => {
    // Extract tags from data if present
    const tagsList = data.tags
      ? data.tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t)
      : [];

    // Remove tags from data before inserting into posts table
    const { tags, ...postData } = data;

    // Create a unique slug
    const slug = await generateUniqueSlug(orgId, data.title);

    // Insert the post
    const [post] = await tx
      .insert(posts)
      .values({
        ...postData,
        slug,
        orgId,
        authorId,
      })
      .returning();

    // If there are tags, add them to the post
    if (tagsList.length > 0) {
      const tagEntries = tagsList.map((tag) => ({
        postId: post.id,
        tag,
      }));

      await tx.insert(postTags).values(tagEntries);
    }

    return {
      ...post,
      tags: tagsList.join(","),
    };
  });
}

// Helper function to generate a unique slug from a title
async function generateUniqueSlug(orgId: number, title: string) {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  let slug = baseSlug;
  let counter = 0;

  // Check if the slug exists
  let existing = await db.query.posts.findFirst({
    where: and(eq(posts.orgId, orgId), eq(posts.slug, slug)),
  });

  // If it exists, append a number until we find a unique slug
  while (existing) {
    counter++;
    slug = `${baseSlug}-${counter}`;
    existing = await db.query.posts.findFirst({
      where: and(eq(posts.orgId, orgId), eq(posts.slug, slug)),
    });
  }

  return slug;
}

export async function getOrgPosts(
  orgId: number,
  limit: number,
  offset: number,
  search?: string,
) {
  const query = and(eq(posts.orgId, orgId));

  // If search is provided, add a filter for title or content
  const searchQuery = search
    ? and(query, ilike(posts.title, `%${search}%`))
    : query;

  // Get posts
  const postsData = await db
    .select({
      post: posts,
      author: {
        id: users.id,
        name: users.name,
        nameId: users.nameId,
      },
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(searchQuery)
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);

  // Fetch tags for each post
  const postsWithTags = await Promise.all(
    postsData.map(async ({ post, author }) => {
      const tagsData = await db
        .select({ tag: postTags.tag })
        .from(postTags)
        .where(eq(postTags.postId, post.id))
        .orderBy(asc(postTags.tag));

      const tags = tagsData.map((t) => t.tag).join(",");

      return {
        ...post,
        author,
        tags,
      };
    }),
  );

  // Get total count
  const [{ value: total }] = await db
    .select({ value: count() })
    .from(posts)
    .where(searchQuery);

  return {
    data: postsWithTags,
    total,
    limit,
    offset,
  };
}

export async function getPostBySlug(orgId: number, slug: string) {
  return withDataCache(
    `post:${orgId}:${slug}`,
    async () => {
      // Get the post with author
      const result = await db
        .select({
          post: posts,
          author: {
            id: users.id,
            name: users.name,
            nameId: users.nameId,
          },
        })
        .from(posts)
        .innerJoin(users, eq(posts.authorId, users.id))
        .where(and(eq(posts.orgId, orgId), eq(posts.slug, slug)))
        .limit(1);

      if (result.length === 0) {
        throw new Error("Post not found");
      }

      const { post, author } = result[0];

      // Get tags for the post
      const tagsData = await db
        .select({ tag: postTags.tag })
        .from(postTags)
        .where(eq(postTags.postId, post.id))
        .orderBy(asc(postTags.tag));

      const tags = tagsData.map((t) => t.tag).join(",");

      return {
        ...post,
        author,
        tags,
      };
    },
    CACHE_TTL.MEDIUM,
  );
}

export async function updatePost(
  orgId: number,
  slug: string,
  data: z.infer<typeof updatePostSchema>,
) {
  return await db.transaction(async (tx) => {
    // Check if post exists and belongs to the org
    const post = await tx.query.posts.findFirst({
      where: and(eq(posts.orgId, orgId), eq(posts.slug, slug)),
    });

    if (!post) {
      throw new Error("Post not found");
    }

    // Extract tags from data if present
    const tagsList = data.tags
      ? data.tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t)
      : null;

    // Remove tags from data before updating posts table
    const { tags, ...postData } = data;

    // If title is being updated, generate a new slug
    let newSlug = slug;
    if (data.title && data.title !== post.title) {
      newSlug = await generateUniqueSlug(orgId, data.title);
    }

    // Update the post
    const [updatedPost] = await tx
      .update(posts)
      .set({
        ...postData,
        slug: newSlug,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, post.id))
      .returning();

    // If tags field was provided, update the post tags
    if (tagsList !== null) {
      // Delete existing tag associations
      await tx.delete(postTags).where(eq(postTags.postId, post.id));

      // If there are tags to add
      if (tagsList.length > 0) {
        const tagEntries = tagsList.map((tag) => ({
          postId: post.id,
          tag,
        }));

        await tx.insert(postTags).values(tagEntries);
      }
    }

    // Get the author info
    const author = await tx.query.users.findFirst({
      where: eq(users.id, post.authorId),
      columns: {
        id: true,
        name: true,
        nameId: true,
      },
    });

    // Get updated tags for the post
    const tagsData = await tx
      .select({ tag: postTags.tag })
      .from(postTags)
      .where(eq(postTags.postId, post.id))
      .orderBy(asc(postTags.tag));

    const updatedTags = tagsData.map((t) => t.tag).join(",");

    return {
      ...updatedPost,
      author,
      tags: updatedTags,
    };
  });
}

export async function deletePost(orgId: number, slug: string) {
  return await db.transaction(async (tx) => {
    // Check if post exists and belongs to the org
    const post = await tx.query.posts.findFirst({
      where: and(eq(posts.orgId, orgId), eq(posts.slug, slug)),
    });

    if (!post) {
      throw new Error("Post not found");
    }

    // Delete the post (this will cascade delete the tags due to foreign key constraints)
    await tx.delete(posts).where(eq(posts.id, post.id));

    return post;
  });
}