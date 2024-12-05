import { CalendarIcon, ClockIcon, ListIcon } from "lucide-react";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Default data as fallback
const defaultContestData = {
  name: "Default Contest",
  nameId: "default-contest",
  description: "This is a default contest description.",
  startTime: "2023-07-01T09:00:00Z",
  endTime: "2023-07-01T17:00:00Z",
  problems: [
    { id: "default-1", title: "Default Problem 1" },
    { id: "default-2", title: "Default Problem 2" },
  ],
};

async function getContestData(nameId: string) {
  try {
    const res = await fetch(`api/contests/${nameId}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error("Failed to fetch contest data");
    return res.json();
  } catch (error) {
    console.error("Error fetching contest data:", error);
    return defaultContestData;
  }
}

export default async function ContestDetailsPage({
  params,
}: {
  params: { contestId: string };
}) {
  const contestData = await getContestData(params.contestId);

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

  const getContestStatus = () => {
    const now = new Date();
    const startTime = new Date(contestData.startTime);
    const endTime = new Date(contestData.endTime);
    if (now < startTime) {
      // TODO: add in how many hours/days left
      return {
        text: "Upcoming",
        color: "text-yello-500",
        dotColor: "bg-yellow-500",
        animate: false,
      };
    } else if (now >= startTime && now <= endTime) {
      return {
        text: "Live",
        color: "text-green-500",
        dotColor: "bg-green-500",
        animate: true,
      };
    } else {
      return {
        text: "Contest is over",
        color: "text-primary-muted",
        dotColor: "bg-gray-400",
        animate: false,
      };
    }
  };

  const status = getContestStatus();

  return (
    <div className="container px-8 py-2 w-3xl h-screen">
      <Card className="bg-background">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">
                {contestData.name}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Contest Code: {contestData.nameId}
              </CardDescription>
            </div>
            <div
              className={`font-semibold ${status.color} flex items-center gap-2`}
            >
              <div className="relative flex">
                <div className={`w-3 h-3 rounded-full ${status.dotColor}`} />
                {status.animate && (
                  <div className="absolute top-0 left-0 w-2 h-2">
                    <div
                      className={`w-3 h-3 rounded-full ${status.dotColor} animate-ping`}
                    />
                  </div>
                )}
              </div>
              {status.text}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-foreground">{contestData.description}</p>

          <div className="flex flex-col space-y-2">
            <div className="flex items-center text-muted-foreground">
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>Start: {formatDate(contestData.startTime)}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <ClockIcon className="mr-2 h-4 w-4" />
              <span>End: {formatDate(contestData.endTime)}</span>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              {/* <ListIcon className="mr-2 h-5 w-5" /> */}
              Problems
            </h3>
            <ul className="space-y-2 px-2">
              {contestData.problems.map((problem) => (
                <li key={problem.id}>
                  <Link href={`/problems/${problem.id}`}>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-primary hover:text-primary/80"
                    >
                      {problem.title}
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
