import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle, Users } from "lucide-react";

export default function OrgOnboarding() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="container mx-auto py-4">
          <h1 className="text-2xl font-bold text-primary">Pariksa</h1>
        </div>
      </header>

      <main className="flex-grow container mx-auto py-8">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Welcome to Pariksa
          </h2>
          <p className="text-lg text-muted-foreground">
            To get started, you need to be part of an organization. Choose an
            option below
          </p>
        </div>

        <div className="grid md:grid-cols-1 gap-6 max-w-2xl mx-auto space-y-4">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5" />
                Create a New Organization
              </CardTitle>
              <CardDescription>
                Start fresh with your own organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Perfect if you're setting up a new team or company. You'll be
                the admin of this organization.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Create Organization</Button>
            </CardFooter>
          </Card>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Join an Existing Organization
              </CardTitle>
              <CardDescription>Connect with your team</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                If you've been invited to an existing organization, choose this
                option to join your team.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Join Organization
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
