"use client";

import { GenericListing, ColumnDef } from "@/mint/generic-listing";
import { GenericEditor, Field } from "@/mint/generic-editor";
import { inviteUserSchema } from "@/lib/validations";
import { useEffect, useState } from "react";

import { User, mockUsers } from "./mockUsers";

interface InviteUserData {
  email: string;
  role: "owner" | "organizer" | "member";
}

const columns: ColumnDef<User>[] = [
  { header: "Name", accessorKey: "name" },
  { header: "Username", accessorKey: "nameId" },
  { header: "Role", accessorKey: "role" },
  { header: "Joined", accessorKey: "joinedAt" },
  {
    header: "About",
    accessorKey: "about",
    // cell: ({ getValue }) => getValue() || "No description"
  },
];

const fields: Field[] = [
  { name: "email", label: "Email", type: "text" },
  {
    name: "role",
    label: "Role",
    type: "select",
    options: [
      { value: "member", label: "Member" },
      { value: "organizer", label: "Organizer" },
      { value: "owner", label: "Owner" },
    ],
  },
];

export default function UsersPage({
  params: { orgId },
}: {
  params: { orgId: string };
}) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  console.log(`orgId: ${orgId}`);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`/api/orgs/${orgId}/users`);
      if (!response.ok) {
        setUsers(mockUsers);
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers(mockUsers);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [orgId]);

  const inviteUser = async (data: InviteUserData) => {
    try {
      const response = await fetch(`/api/orgs/${orgId}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to invite user");
      }

      await fetchUsers();
      setIsEditorOpen(false);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };

  const updateRole = async (user: User) => {
    try {
      const response = await fetch(`/api/orgs/${orgId}/users/${user.nameId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: user.role }),
      });

      if (!response.ok) {
        // TODO: remove
        setUsers(
          mockUsers.map((u) => {
            return {
              ...u,
              role: user.role,
            };
          }),
        );

        const error = await response.json();
        throw new Error(error.message || "Failed to update role");
      }

      await fetchUsers();
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };

  const removeUser = async (user: User) => {
    try {
      const response = await fetch(`/api/orgs/${orgId}/users/${user.nameId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        // TODO: remove
        setUsers(users.filter((u) => u.id !== user.id));
        const error = await response.json();
        throw new Error(error.message || "Failed to remove user");
      }

      setUsers(users.filter((u) => u.id !== user.id));
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };

  return (
    <>
      <GenericListing
        data={users}
        columns={columns}
        title="Organization Users"
        searchableFields={["name", "nameId", "role", "about"]}
        onAdd={() => {
          setSelectedUser(null);
          setIsEditorOpen(true);
        }}
        onEdit={(user) => {
          setSelectedUser(user);
          setIsEditorOpen(true);
        }}
        onDelete={removeUser}
      />

      <GenericEditor
        data={selectedUser}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={selectedUser ? updateRole : inviteUser}
        schema={inviteUserSchema}
        fields={fields}
        title={selectedUser ? "Role" : "User to Organization"}
      />
    </>
  );
}
