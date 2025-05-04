"use client";

import { CalendarIcon, UserIcon, TagIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

// Default data as fallback
const defaultPostData: Post = {
  id: 0,
  title: "Loading...",
  content: "Loading post content...",
  tags: "",
  slug: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  author: {
    id: 0,
    name: "Loading...",
    nameId: "loading",
  },
};

export default function PostDetailsPage() {
  const params = useParams();
  const orgId = params.orgId as string;
  const postId = params.id as string;

  const [postData, setPostData] = useState<Post>(defaultPostData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setIsLoading(true);
        const url = `/api/orgs/${orgId}/posts/${postId}`;
        console.log(`Fetching post data from: ${url}`);

        const res = await fetch(url);

        if (!res.ok) {
          console.error(
            `Failed to fetch post data: ${res.status} ${res.statusText}`,
          );
          throw new Error(`Failed to fetch post data: ${res.status}`);
        }

        const data = await res.json();
        console.log("Successfully fetched post data:", data);
        setPostData(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching post data:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred",
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (orgId && postId) {
      fetchPostData();
    }
  }, [orgId, postId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  };

  if (isLoading) {
    return <div className="container px-8 py-2">Loading post details...</div>;
  }

  if (error) {
    return (
      <div className="container px-8 py-2 text-red-500">Error: {error}</div>
    );
  }

  return (
    <div className="container px-8 py-2 w-3xl h-screen">
      <Card className="bg-background">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">
                {postData.title}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Posted by {postData.author.name}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none">
            {postData.content.split("\n").map((paragraph, index) => (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="flex flex-col space-y-2">
            <div className="flex items-center text-muted-foreground">
              <UserIcon className="mr-2 h-4 w-4" />
              <Link href={`/${orgId}/users/${postData.author.nameId}`}>
                <Button variant="link" className="p-0 h-auto">
                  {postData.author.name}
                </Button>
              </Link>
            </div>
            {postData.tags && (
              <div className="flex items-center text-muted-foreground">
                <TagIcon className="mr-2 h-4 w-4" />
                <span>
                  {postData.tags.split(",").map((tag, index) => (
                    <span key={index} className="mr-2">
                      #{tag.trim()}
                    </span>
                  ))}
                </span>
              </div>
            )}
            <div className="flex items-center text-muted-foreground">
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>Posted on {formatDate(postData.createdAt)}</span>
            </div>
            {postData.updatedAt !== postData.createdAt && (
              <div className="flex items-center text-muted-foreground">
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span>Updated on {formatDate(postData.updatedAt)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
