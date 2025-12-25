                                                                                                                                                                            "use client";

import { GenericListing, ColumnDef } from "@/mint/generic-listing";
import { GenericEditor, Field } from "@/mint/generic-editor";
import { inviteUserSchema } from "@/lib/validations";
import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { formatValidationErrors } from "@/utils/error";
import { MockAlert } from "@/components/mock-alert";
import { User, mockUsers } from "./mockUsers";
import { timeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Download,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  UserPlus,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface InviteUserData {
  email: string;
  role: "owner" | "organizer" | "member";
}

interface CSVImportResult {                   
  email: string;
  status: "success" | "error";
  isNewUser?: boolean;
  error?: string;
}

interface CSVImportResponse {
  message: string;
  summary: {
    total: number;
    successful: number;
    newAccounts: number;
    existingUsers: number;
    failed: number;
  };
  results: CSVImportResult[];
}

const columns: ColumnDef<User>[] = [
  { header: "Name", accessorKey: "name" },
  { header: "Username", accessorKey: "nameId" },
  { header: "Email", accessorKey: "email" },
  { header: "Role", accessorKey: "role" },
  { header: "Joined", accessorKey: "joinedAt" },
  {
    header: "About",
    accessorKey: "about",
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

function makeJoinedAtReadable(users: User[]) {
  return users.map((user) => {
    return {
      ...user,
      joinedAt: timeAgo(user.joinedAt),
    };
  });
}

// CSV Template content
const CSV_TEMPLATE = `email,role,name
john@example.com,member,John Doe
jane@example.com,organizer,Jane Smith
admin@example.com,owner,Admin User`;

export default function UsersPage({
  params: { orgId },
}: {
  params: { orgId: string };
}) {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [showMockAlert, setShowMockAlert] = useState(false);
  const [importResults, setImportResults] = useState<CSVImportResponse | null>(
    null,
  );
  const [showResultsDialog, setShowResultsDialog] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(`/api/orgs/${orgId}/users`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(formatValidationErrors(errorData));
      }
      const data: User[] = makeJoinedAtReadable(await response.json());
      for (const user of data) {
        if (!user.about) {
          user.about = "No description";
        }
      }
      setUsers(data);
      setShowMockAlert(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to fetch users",
      });
      setUsers(makeJoinedAtReadable(mockUsers));
      setShowMockAlert(true);
    }
  }, [orgId, toast, setUsers, setShowMockAlert]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const inviteUser = async (data: InviteUserData) => {
    try {
      const response = await fetch(`/api/orgs/${orgId}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(formatValidationErrors(errorData));
      }

      await fetchUsers();
      setIsEditorOpen(false);
      toast({
        title: "Success",
        description: "User invited successfully",
      });
      return Promise.resolve();
    } catch (error) {
      console.error("Error inviting user:", error);
      toast({
        variant: "destructive",
        title: "Validation Error",
        description:
          error instanceof Error ? error.message : "Failed to invite user",
      });
      return Promise.reject(error);
    }
  };

  const deleteUser = async (user: User) => {
    try {
      const response = await fetch(`/api/orgs/${orgId}/users/${user.nameId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message || formatValidationErrors(errorData);
        throw new Error(errorMessage);
      }

      await fetchUsers();
      toast({
        title: "Success",
        description: "User removed successfully",
      });
      return Promise.resolve();
    } catch (error) {
      console.error("Error removing user:", error);
      return Promise.reject(error);
    }
  };

  const downloadTemplate = () => {
    // Use API route which sets proper Content-Disposition header
    window.location.href = `/api/orgs/${orgId}/users/csv/template`;
  };

  const handleCsvUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/orgs/${orgId}/users/csv`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(formatValidationErrors(errorData));
      }

      const result: CSVImportResponse = await response.json();
      setImportResults(result);
      setShowResultsDialog(true);

      await fetchUsers();

      // Show toast based on results
      const hasErrors = result.summary.failed > 0;
      toast({
        variant: hasErrors ? "destructive" : "default",
        title: hasErrors ? "Import Completed with Errors" : "Import Successful",
        description: `${result.summary.successful} users added (${result.summary.newAccounts} new accounts created)`,
      });
    } catch (error) {
      console.error("Error uploading CSV:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to upload CSV",
      });
    }
  };

  return (
    <>
      <MockAlert show={showMockAlert} />

      {/* Template Download Button */}
      <div className="px-6 pt-4">
        <Button variant="outline" size="sm" onClick={downloadTemplate}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Download CSV Template
        </Button>
      </div>

      <GenericListing
        data={users}
        columns={columns}
        title="Users"
        searchableFields={["name", "email", "nameId"]}
        onAdd={() => {
          setSelectedUser(null);
          setIsEditorOpen(true);
        }}
        onDelete={deleteUser}
        allowCsvUpload={true}
        onCsvUpload={handleCsvUpload}
        exportUrl={`/api/orgs/${orgId}/users/csv/export`}
      />

      <GenericEditor
        data={selectedUser}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={inviteUser}
        schema={inviteUserSchema}
        fields={fields}
        title="Invite User"
      />

      {/* Import Results Dialog */}
      <Dialog open={showResultsDialog} onOpenChange={setShowResultsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              CSV Import Results
            </DialogTitle>
            <DialogDescription>
              Summary of the bulk user import operation
            </DialogDescription>
          </DialogHeader>

          {importResults && (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-muted rounded-lg text-center">
                  <div className="text-2xl font-bold">
                    {importResults.summary.total}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total Processed
                  </div>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-lg text-center">
                  <div className="text-2xl font-bold text-emerald-500">
                    {importResults.summary.successful}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Successful
                  </div>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-500">
                    {importResults.summary.newAccounts}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    New Accounts
                  </div>
                </div>
                <div className="p-3 bg-red-500/10 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-500">
                    {importResults.summary.failed}
                  </div>
                  <div className="text-xs text-muted-foreground">Failed</div>
                </div>
              </div>

              {/* Detailed Results */}
              <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
                {importResults.results.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3"
                  >
                    <div className="flex items-center gap-2">
                      {result.status === "success" ? (
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm">{result.email}</span>
                      {result.isNewUser && (
                        <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded">
                          New Account
                        </span>
                      )}
                    </div>
                    {result.error && (
                      <span className="text-xs text-red-500 max-w-xs truncate">
                        {result.error}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <Button
                className="w-full"
                onClick={() => setShowResultsDialog(false)}
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
