"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function PageSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-4 w-[350px]" />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 space-y-4">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-20 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-[140px]" />
              <Skeleton className="h-3 w-[100px]" />
            </div>
          </Card>
        ))}
      </div>

      {/* Table/List Section */}
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-[200px]" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
