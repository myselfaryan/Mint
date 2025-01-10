"use client";

import { PageSkeleton } from "@/components/ui/page-skeleton";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/theme-context";

export default function SkeletonDebugPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-4">
        <div className="flex justify-end mb-4 gap-2">
          <Button
            variant="outline"
            onClick={() => setTheme("light")}
            className={theme === "light" ? "border-primary" : ""}
          >
            Light
          </Button>
          <Button
            variant="outline"
            onClick={() => setTheme("dark")}
            className={theme === "dark" ? "border-primary" : ""}
          >
            Dark
          </Button>
          <Button
            variant="outline"
            onClick={() => setTheme("system")}
            className={theme === "system" ? "border-primary" : ""}
          >
            System
          </Button>
        </div>
      </div>
      <PageSkeleton />
    </div>
  );
}
