"use client";

import { GenericListing, ColumnDef } from "@/mint/generic-listing";
import { GenericEditor, Field } from "@/mint/generic-editor";
import { Group, mockGroups } from "./mockData";
import { useEffect, useState } from "react";
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
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  useEffect(() => {
    setGroups(injectUsersCount(mockGroups));
  }, []);

  const deleteGroup = async (group: Group) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Update the state after successful API call
      setGroups((prevGroups) => prevGroups.filter((g) => g.id !== group.id));
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };

  const saveGroup = async (group: Group) => {
    if (selectedGroup) {
      // Update existing group
      setGroups(
        injectUsersCount(groups.map((g) => (g.id === group.id ? group : g))),
      );
    } else {
      // Add new group
      setGroups(
        injectUsersCount([
          ...groups,
          { ...group, id: Date.now(), createdAt: new Date().toISOString() },
        ]),
      );
    }
    setIsEditorOpen(false);
  };

  return (
    <>
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
