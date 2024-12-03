"use client";

import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, Trash2, Users } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
// Define the Zod schema for validation
const groupSchema = z.object({
  groupName: z
    .string()
    .min(3, { message: "Group name must be at least 3 characters long" })
    .max(50, { message: "Group name must not exceed 50 characters" }),
  members: z
    .array(z.string().email({ message: "Invalid email address" }))
    .min(1, { message: "You must add at least one email address" }),
});

type GroupFormValues = z.infer<typeof groupSchema>;

export function GroupCreationPage() {
  const [members, setMembers] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      groupName: "",
      members: [],
    },
  });

  const groupName = watch("groupName");

  const handleCreateGroup = (data: GroupFormValues) => {
    console.log("Group created successfully:", data);
    setValue("groupName", "");
    setMembers([]);
    setEmailInput("");
  };

  const handleAddMembers = () => {
    const newEmails = emailInput
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email.includes("@") && email !== ""); // Ensure email contains '@' and is not empty

    if (newEmails.length === 0) {
      alert("Please enter valid email addresses."); // Optional: Provide feedback to the user
      return;
    }

    const updatedMembers = [...new Set([...members, ...newEmails])];
    setMembers(updatedMembers);
    setValue("members", updatedMembers); // Update members in the form
    setEmailInput("");
  };
  const handleRemoveMember = (email: string) => {
    const updatedMembers = members.filter((member) => member !== email);
    setMembers(updatedMembers);
    setValue("members", updatedMembers); // Update members in the form
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-gray-800 p-4 flex items-center">
        <Link href="/groups">
          <Button variant="ghost" size="icon" className="mr-4">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold">Create New Group</h1>
      </nav>

      {/* Main Content */}
      <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
        <form
          onSubmit={handleSubmit(handleCreateGroup)}
          className="bg-gray-800 rounded-lg p-6 shadow-lg"
        >
          <div className="mb-6">
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              id="groupName"
              {...register("groupName")}
              className="mt-1 bg-gray-700 border-gray-600 text-gray-300"
              placeholder="Enter group name"
            />
            {errors.groupName && (
              <p className="text-red-500 text-sm">{errors.groupName.message}</p>
            )}
          </div>

          <div className="mb-6">
            <Label htmlFor="emailIds">Add Members (Email IDs)</Label>
            <Textarea
              id="emailIds"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="mt-1 bg-gray-700 border-gray-600 text-gray-300"
              placeholder="Enter comma-separated email addresses"
            />
            <Button
              type="button"
              onClick={handleAddMembers}
              className="mt-2 bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors duration-200 cursor-pointer"
              disabled={!emailInput.trim()}
            >
              Add Members
            </Button>
          </div>

          {members.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Current Members</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((email) => (
                    <TableRow key={email}>
                      <TableCell>{email}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(email)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors duration-200 cursor-pointer"
            disabled={!groupName || members.length === 0}
          >
            <Users className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        </form>
      </div>
    </div>
  );
}
