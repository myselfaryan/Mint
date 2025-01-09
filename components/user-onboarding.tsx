"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Flame, Share2, Trophy, Users, BookOpen, GraduationCap, School } from "lucide-react";
import { useSearchParams } from "next/navigation";

interface OnboardingTask {
  id: number;
  title: string;
  description: string;
  buttonText: string;
  buttonIcon: React.ReactNode;
  buttonAction: () => void;
  completed: boolean;
}

export function UserOnboarding() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "user";

  const tasksByRole: Record<string, OnboardingTask[]> = {
    user: [
      {
        id: 1,
        title: "Join your first contest",
        description: "Start your journey by participating in a practice contest. This will help you understand the platform better.",
        buttonText: "View Contests",
        buttonIcon: <Trophy className="h-4 w-4 mr-2" />,
        buttonAction: () => {
          // Add navigation to contests page
        },
        completed: false,
      },
      {
        id: 2,
        title: "Complete your student profile",
        description: "Add your academic details and interests to get personalized contest recommendations.",
        buttonText: "Edit Profile",
        buttonIcon: <GraduationCap className="h-4 w-4 mr-2" />,
        buttonAction: () => {
          // Add navigation to profile page
        },
        completed: true,
      },
      {
        id: 3,
        title: "Join your class group",
        description: "Connect with your classmates and access class-specific contests and materials.",
        buttonText: "View Groups",
        buttonIcon: <Users className="h-4 w-4 mr-2" />,
        buttonAction: () => {
          // Add navigation to groups page
        },
        completed: false,
      },
    ],
    admin: [
      {
        id: 1,
        title: "Create your first contest",
        description: "Start by creating a practice contest for your students. You can set questions, time limits, and scoring rules.",
        buttonText: "Create Contest",
        buttonIcon: <Trophy className="h-4 w-4 mr-2" />,
        buttonAction: () => {
          // Add navigation to contest creation page
        },
        completed: false,
      },
      {
        id: 2,
        title: "Create a student group",
        description: "Organize your students into groups for better management and targeted assignments.",
        buttonText: "Create Group",
        buttonIcon: <Users className="h-4 w-4 mr-2" />,
        buttonAction: () => {
          // Add navigation to group creation page
        },
        completed: true,
      },
      {
        id: 3,
        title: "Add learning materials",
        description: "Upload study materials and resources for your students.",
        buttonText: "Add Materials",
        buttonIcon: <BookOpen className="h-4 w-4 mr-2" />,
        buttonAction: () => {
          // Add navigation to materials page
        },
        completed: false,
      },
    ],
    owner: [
      {
        id: 1,
        title: "Add faculty members",
        description: "Invite teachers and staff members to join your organization.",
        buttonText: "Add Faculty",
        buttonIcon: <GraduationCap className="h-4 w-4 mr-2" />,
        buttonAction: () => {
          // Add navigation to faculty management page
        },
        completed: false,
      },
      {
        id: 2,
        title: "Configure organization settings",
        description: "Set up your organization's profile, branding, and contest rules.",
        buttonText: "Organization Settings",
        buttonIcon: <School className="h-4 w-4 mr-2" />,
        buttonAction: () => {
          // Add navigation to org settings page
        },
        completed: true,
      },
      {
        id: 3,
        title: "Join the community",
        description: "Connect with other educational institutions using our platform.",
        buttonText: "Join Community",
        buttonIcon: <Flame className="h-4 w-4 mr-2" />,
        buttonAction: () => {
          window.open("https://discord.gg/your-server", "_blank");
        },
        completed: false,
      },
    ],
  };

  const tasks = tasksByRole[role] || tasksByRole.user;
  const titles = {
    user: "Welcome Student!",
    admin: "Welcome Teacher!",
    owner: "Welcome Organization Admin!",
  };
  const descriptions = {
    user: "Get started with your learning journey by completing these quick tasks.",
    admin: "Set up your teaching environment with these simple steps.",
    owner: "Configure your organization and start managing your institution.",
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">{titles[role as keyof typeof titles]}</CardTitle>
          <p className="text-muted-foreground">
            {descriptions[role as keyof typeof descriptions]}
          </p>
        </CardHeader>
        <CardContent className="space-y-6 relative">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start space-x-4"
            >
              <div className={`mt-0 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                task.completed ? 'bg-green-500/20' : 'bg-muted'
              }`}>
                {task.completed ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground" />
                )}
              </div>
              <div className="flex-1 space-y-1 bg-muted/50 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium">{task.title}</h4>
                  {task.completed && (
                    <span className="inline-flex items-center text-sm text-green-500">
                      <Check className="h-4 w-4 mr-1" />
                      Completed
                    </span>
                  )}
                  {!task.completed && (
                    <span className="text-sm text-muted-foreground">
                      Not completed
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {task.description}
                </p>
                <Button
                  variant="default"
                  className="mt-2"
                  onClick={task.buttonAction}
                >
                  {task.buttonIcon}
                  {task.buttonText}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
