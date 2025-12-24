import { NextRequest, NextResponse } from "next/server";
import { NameIdSchema } from "@/app/api/types";
import { getOrgIdFromNameId } from "@/app/api/service";
import * as userService from "../../service";
import { getCurrentSession } from "@/lib/server/session";

/**
 * @swagger
 * /api/orgs/{orgId}/users/csv/export:
 *   get:
 *     summary: Export organization users as CSV
 *     description: Returns a CSV file containing all users in the organization
 *     tags:
 *       - Organizations
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization name ID
 *     responses:
 *       200:
 *         description: CSV file with users
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       401:
 *         description: Unauthorized
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { orgId: string } },
) {
  try {
    // Check authentication
    const { session } = await getCurrentSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgId = await getOrgIdFromNameId(NameIdSchema.parse(params.orgId));
    const users = await userService.getOrgUsers(orgId);

    // Build CSV content
    const headers = ["Name", "Username", "Email", "Role", "Joined At", "About"];
    const rows = users.map((user) => {
      return [
        escapeCSV(user.name || ""),
        escapeCSV(user.nameId || ""),
        escapeCSV(user.email || ""),
        escapeCSV(user.role || ""),
        escapeCSV(user.joinedAt ? new Date(user.joinedAt).toISOString() : ""),
        escapeCSV(user.about || ""),
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="users_export_${params.orgId}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting users:", error);
    return NextResponse.json(
      { error: "Failed to export users" },
      { status: 500 },
    );
  }
}

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
