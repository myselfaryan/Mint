"use client";

import { GenericListing, ColumnDef } from "@/mint/generic-listing";
import { GenericEditor, Field } from "@/mint/generic-editor";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { formatValidationErrors } from "@/utils/error";
import { MockAlert } from "@/components/mock-alert";
import { z } from "zod";

interface Post {
  id: number;
  title: string;
  content: string;
  tags: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    name: string;
    nameId: string;
  };
}

// Form data type for creating/updating posts
interface PostFormData {
  title: string;
  content: string;
  tags?: string;
}

const columns: ColumnDef<Post>[] = [
  { header: "Title", accessorKey: "title" },
  { header: "Author", accessorKey: "author" },
  { header: "Tags", accessorKey: "tags" },
  { header: "Created At", accessorKey: "createdAt" },
  { header: "Updated At", accessorKey: "updatedAt" },
];

// Schema for creating/updating posts
const postFormSchema = z.object({
  title: z.string().min(2).max(200),
  content: z.string().min(1),
  tags: z.string().optional(),
});

// Schema for the complete post object
const postSchema = z.object({
  id: z.number(),
  title: z.string().min(2).max(200),
  content: z.string().min(1),
  tags: z.string(),
  slug: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  author: z.object({
    id: z.number(),
    name: z.string(),
    nameId: z.string(),
  }),
});

const fields: Field[] = [
  { name: "title", label: "Title", type: "text" },
  { name: "content", label: "Content", type: "textarea" },
  {
    name: "tags",
    label: "Tags",
    type: "text",
    placeholder: "Comma-separated tags (e.g., programming,algorithms,beginner)",
  },
];

export default function PostsPage() {
  const params = useParams();
  const orgId = params.orgId as string;
  const { toast } = useToast();

  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [showMockAlert, setShowMockAlert] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`/api/orgs/${orgId}/posts`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(formatValidationErrors(errorData));
        }
        const data = await response.json();
        setPosts(data.data);
        setShowMockAlert(false);
      } catch (error) {
        console.error("Error fetching posts:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to fetch posts",
        });
        setShowMockAlert(true);
      }
    };
    fetchPosts();
  }, [orgId, toast]);

  const deletePost = async (post: Post) => {
    try {
      const response = await fetch(`/api/orgs/${orgId}/posts/${post.slug}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(formatValidationErrors(errorData));
      }

      setPosts((prevPosts) => prevPosts.filter((p) => p.id !== post.id));
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
      return Promise.resolve();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete post",
      });
      return Promise.reject(error);
    }
  };

  const savePost = async (formData: PostFormData) => {
    try {
      const url = selectedPost
        ? `/api/orgs/${orgId}/posts/${selectedPost.slug}`
        : `/api/orgs/${orgId}/posts`;

      const response = await fetch(url, {
        method: selectedPost ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(formatValidationErrors(errorData));
      }

      const savedPost = await response.json();

      if (selectedPost) {
        setPosts(posts.map((p) => (p.id === savedPost.id ? savedPost : p)));
        toast({
          title: "Success",
          description: "Post updated successfully",
        });
      } else {
        setPosts([...posts, savedPost]);
        toast({
          title: "Success",
          description: "Post created successfully",
        });
      }

      setIsEditorOpen(false);
    } catch (error) {
      console.error("Error saving post:", error);
      toast({
        variant: "destructive",
        title: "Validation Error",
        description:
          error instanceof Error ? error.message : "Failed to save post",
      });
      throw error;
    }
  };

  return (
    <>
      <MockAlert show={showMockAlert} />
      <GenericListing
        data={posts}
        columns={columns}
        title="Posts"
        searchableFields={["title", "content", "tags"]}
        onAdd={() => {
          setSelectedPost(null);
          setIsEditorOpen(true);
        }}
        onEdit={(post) => {
          setSelectedPost(post);
          setIsEditorOpen(true);
        }}
        onDelete={deletePost}
        rowClickAttr="slug"
      />

      <GenericEditor<PostFormData>
        data={selectedPost}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={savePost}
        schema={postFormSchema}
        fields={fields}
        title="Post"
      />
    </>
  );
}
