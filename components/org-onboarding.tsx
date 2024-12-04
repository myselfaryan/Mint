"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlusCircle, Users } from "lucide-react";
import { GenericEditor, Field } from "@/mint/generic-editor";
import { useState } from "react";
import { z } from "zod";
import router from "next/router";
import { useToast } from "./ui/use-toast";

export interface Org {
  id: number;
  name: string;
  nameId: string;
  role: string;
}

const fields: Field[] = [
  {
    name: "name",
    label: "Organization Name",
    type: "text",
  },
  {
    name: "nameId",
    label: "Organization ID(Slug)",
    type: "text",
  },
];

export default function OrgOnboarding() {
  const [org, setOrg] = useState<Org | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const { toast } = useToast();

  const saveOrg = async (data: Org) => {
    console.log("Saving org:", data);
    setOrg(data);
    setIsEditorOpen(false);
    try {
      const response = await fetch("/api/orgs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const orgData = await response.json();
      if (response.ok) {
        setOrg(orgData);
        router.push(`/org/${orgData.nameId}`);
      } else {
        toast({
          title: "Error creating organization",
          description: `${orgData.error}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error creating organization",
        description: `${error}`,
        variant: "destructive",
      });
    }

    // redirect to /org.nameId

    // handle error and show error message in toast
  };

  const orgSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(4, {
      message: "Organization name must be at least 4 characters long",
    }),
    nameId: z
      .string()
      .min(4, { message: "Organization ID must be at least 4 characters long" })
      .regex(/^[a-z0-9-]+$/, {
        message:
          "Organization ID must only contain letters, numbers and dashes",
      }),
    role: z.enum(["owner", "admin", "member"], {
      required_error: "Role is required",
    }),
  });

  return (
    <>
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
                <Button
                  className="w-full"
                  onClick={() => setIsEditorOpen(true)}
                >
                  Create Organization
                </Button>
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
                  If you've been invited to an existing organization, choose
                  this option to join your team.
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowJoinDialog(true)}
                >
                  Join Organization
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>

      <GenericEditor
        data={org}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={saveOrg}
        schema={orgSchema}
        fields={fields}
        title="Organization"
      />

      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Organization</DialogTitle>
            <DialogDescription>
              Only org owners and admins can add you to organization, please
              contact the admin.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
