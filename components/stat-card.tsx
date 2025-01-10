"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface StatCardProps {
  heading: string;
  value: number;
  unit: string;
}

export default function StatCard({ heading, value, unit }: StatCardProps) {
  return (
    <Card className="max-w-xs" x-chunk="charts-01-chunk-3">
      <CardHeader className="p-4 pb-0">
        <CardTitle>{heading}</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-0">
        <div className="flex items-baseline gap-1 text-3xl font-bold tabular-nums leading-none">
          {value}
          <span className="text-sm font-normal text-muted-foreground">
            {unit}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
