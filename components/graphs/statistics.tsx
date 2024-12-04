"use client";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ChartComponents"; 
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui";

interface GraphCardProps {
  data: {
    date: string;
    resting: number;
  }[];
  restingHR: number;
  variability: number;
}

export const GraphCard = ({ data, restingHR, variability }: GraphCardProps) => {
  return (
    <Card className="flex flex-col lg:max-w-md">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2 [&>div]:flex-1">
        <div>
          <CardDescription>Contest Rating</CardDescription>
          <CardTitle className="flex items-baseline gap-1 text-4xl tabular-nums">
            {restingHR}
            <span className="text-sm font-normal tracking-normal text-muted-foreground">
              rating
            </span>
          </CardTitle>
        </div>
        <div>
          <CardDescription>Variability</CardDescription>
          <CardTitle className="flex items-baseline gap-1 text-4xl tabular-nums">
            {variability}
            <span className="text-sm font-normal tracking-normal text-muted-foreground">
              
            </span>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 items-center">
        <ChartContainer
          config={{
            resting: {
              label: "Resting",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="w-full"
        >
          <LineChart
            accessibilityLayer
            margin={{
              left: 14,
              right: 14,
              top: 10,
            }}
            data={data}
          >
            <CartesianGrid
              strokeDasharray="4 4"
              vertical={false}
              stroke="hsl(var(--muted-foreground))"
              strokeOpacity={0.5}
            />
            <YAxis hide domain={["dataMin - 10", "dataMax + 10"]} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("en-US", {
                  weekday: "short",
                })
              }
            />
            <Line
              dataKey="resting"
              type="natural"
              fill="var(--color-resting)"
              stroke="var(--color-resting)"
              strokeWidth={2}
              dot={false}
              activeDot={{
                fill: "var(--color-resting)",
                stroke: "var(--color-resting)",
                r: 4,
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  }
                />
              }
              cursor={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
