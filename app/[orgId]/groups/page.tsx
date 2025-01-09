"use client";

import { GenericListing, ColumnDef } from "@/mint/generic-listing";
import { GenericEditor, Field } from "@/mint/generic-editor";
import { Group, mockGroups } from "./mockData";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { formatValidationErrors } from "@/utils/error";
import { MockAlert } from "@/components/mock-alert";
import { z } from "zod";

const columns: ColumnDef<Group>[] = [
  { header: "Name", accessorKey: "name" as const },
  { header: "Name ID", accessorKey: "nameId" as const },
  { header: "About", accessorKey: "about" as const },
  { header: "Created At", accessorKey: "createdAt" as const },
  { header: "Users", accessorKey: "usersCount" as const },
];

const groupSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2).max(100),
  nameId: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/),
  about: z.string().optional(),
  users: z
    .string()
    .min(1)
    .refine((value) => value.split(/\r?\n/).length > 0, {
      message: "Must contain at least one email.",
    })
    .refine(
      (value) =>
        value.split(/\r?\n/).every((line) => line.trim().match(/^\S+@\S+$/)),
      {
        message: "Each line must be a valid email address.",
      },
    ),
});

const injectUsersCount = (groups: Group[]) => {
  return groups.map((group) => ({
    ...group,
    usersCount: group.users.split(/\r?\n/).length,
  }));
};

const fields: Field[] = [
  { name: "name", label: "Name", type: "text" },
  {
    name: "nameId",
    label: "Group ID",
    type: "text",
    placeholder: "Unique code/identifier for group",
  },
  { name: "about", label: "About", type: "textarea" },
  { name: "users", label: "Users (one email per line)", type: "textarea" },
];

export default function GroupsPage() {
  const params = useParams();
  const orgId = params.orgId as string;
  const { toast } = useToast();

  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [showMockAlert, setShowMockAlert] = useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch(`/api/orgs/${orgId}/groups`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(formatValidationErrors(errorData));
        }
        const data = await response.json();
        setGroups(injectUsersCount(data));
        setShowMockAlert(false);
      } catch (error) {
        console.error("Error fetching groups:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to fetch groups",
        });
        // Fallback to mock data in case of error
        setGroups(injectUsersCount(mockGroups));
        setShowMockAlert(true);
      }
    };
    fetchGroups();
  }, [orgId, toast]);

  const deleteGroup = async (group: Group) => {
    try {
      const response = await fetch(
        `/api/orgs/${orgId}/groups/${group.nameId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(formatValidationErrors(errorData));
      }

      setGroups((prevGroups) => prevGroups.filter((g) => g.id !== group.id));
      toast({
        title: "Success",
        description: "Group deleted successfully",
      });
      return Promise.resolve();
    } catch (error) {
      console.error("Error deleting group:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete group",
      });
      return Promise.reject(error);
    }
  };

  const saveGroup = async (group: Group) => {
    try {
      const url = selectedGroup
        ? `/api/orgs/${orgId}/groups/${group.nameId}`
        : `/api/orgs/${orgId}/groups`;

      const response = await fetch(url, {
        method: selectedGroup ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(group),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(formatValidationErrors(errorData));
      }

      const savedGroup = await response.json();

      if (selectedGroup) {
        setGroups(groups.map((g) => (g.id === savedGroup.id ? savedGroup : g)));
        toast({
          title: "Success",
          description: "Group updated successfully",
        });
      } else {
        setGroups([...groups, savedGroup]);
        toast({
          title: "Success",
          description: "Group created successfully",
        });
      }

      setIsEditorOpen(false);
    } catch (error) {
      console.error("Error saving group:", error);
      toast({
        variant: "destructive",
        title: "Validation Error",
        description:
          error instanceof Error ? error.message : "Failed to save group",
      });
      throw error;
    }
  };

  return (
    <>
      <MockAlert show={showMockAlert} />
      <GenericListing
        data={groups}
        columns={columns}
        title="Groups"
        searchableFields={["name", "nameId"]}
        onAdd={() => {
          setSelectedGroup(null);
          setIsEditorOpen(true);
        }}
        onEdit={(group) => {
          setSelectedGroup(group);
          setIsEditorOpen(true);
        }}
        onDelete={deleteGroup}
      />

      <GenericEditor
        data={selectedGroup}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={saveGroup}
        schema={groupSchema}
        fields={fields}
        title="Group"
      />
    </>
  );
}
