"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, ArrowLeft } from "lucide-react";

interface Problem {
    id: string;
    title: string;
}

interface ContestData {
    name: string;
    nameId: string;
    problems: string; // comma-separated problem IDs
}

export default function ProblemsListPage() {
    const params = useParams();
    const router = useRouter();
    const orgId = params.orgId as string;
    const contestId = params.id as string;

    const [contestData, setContestData] = useState<ContestData | null>(null);
    const [problems, setProblems] = useState<Problem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchContestData = async () => {
            try {
                setIsLoading(true);
                const res = await fetch(`/api/orgs/${orgId}/contests/${contestId}`);

                if (!res.ok) {
                    throw new Error(`Failed to fetch contest data: ${res.status}`);
                }

                const data = await res.json();
                setContestData(data);

                // Parse problems from comma-separated string
                const problemIds = data.problems.split(",").map((id: string) => id.trim());
                setProblems(problemIds.map((id: string) => ({
                    id,
                    title: `Problem ${id}`,
                })));

                setError(null);
            } catch (err) {
                console.error("Error fetching contest data:", err);
                setError(err instanceof Error ? err.message : "An unknown error occurred");
            } finally {
                setIsLoading(false);
            }
        };

        if (orgId && contestId) {
            fetchContestData();
        }
    }, [orgId, contestId]);

    if (isLoading) {
        return (
            <div className="container px-8 py-4">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 w-48 bg-muted rounded" />
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 bg-muted rounded" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container px-8 py-4">
                <div className="text-red-500">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="container px-8 py-4 max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/${orgId}/contests/${contestId}`)}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Contest
                </Button>
                <h1 className="text-2xl font-bold">
                    {contestData?.name || "Contest"} - Problems
                </h1>
            </div>

            <div className="space-y-3">
                {problems.length > 0 ? (
                    problems.map((problem, index) => (
                        <Link
                            key={problem.id}
                            href={`/${orgId}/contests/${contestId}/problems/${problem.id}`}
                        >
                            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                                <CardHeader className="py-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <span className="text-muted-foreground">#{index + 1}</span>
                                                {problem.title}
                                            </CardTitle>
                                            <CardDescription>
                                                Click to view and solve
                                            </CardDescription>
                                        </div>
                                        <ChevronRight className="text-muted-foreground" />
                                    </div>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))
                ) : (
                    <div className="text-muted-foreground text-center py-8">
                        No problems found in this contest.
                    </div>
                )}
            </div>
        </div>
    );
}
