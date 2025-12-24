"use client";

import { LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  heading: string;
  value: number;
  unit: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  className?: string;
  variant?: "default" | "primary" | "success" | "warning" | "info";
}

const variantStyles = {
  default: "bg-card",
  primary:
    "bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20",
  success:
    "bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20",
  warning:
    "bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20",
  info: "bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20",
};

const iconStyles = {
  default: "text-muted-foreground bg-muted",
  primary: "text-violet-500 bg-violet-500/10",
  success: "text-emerald-500 bg-emerald-500/10",
  warning: "text-amber-500 bg-amber-500/10",
  info: "text-blue-500 bg-blue-500/10",
};

export default function StatCard({
  heading,
  value,
  unit,
  icon: Icon,
  trend,
  className,
  variant = "default",
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden",
        variantStyles[variant],
        className,
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {heading}
        </CardTitle>
        {Icon && (
          <div className={cn("p-2 rounded-lg", iconStyles[variant])}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold tabular-nums tracking-tight">
            {value.toLocaleString()}
          </span>
          <span className="text-sm font-normal text-muted-foreground">
            {unit}
          </span>
        </div>
        {trend && (
          <div className="mt-2 flex items-center gap-1">
            <span
              className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-emerald-500" : "text-red-500",
              )}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}
            </span>
            <span className="text-xs text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
