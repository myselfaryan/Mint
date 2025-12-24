import { NextRequest, NextResponse } from "next/server";
import { NameIdSchema } from "@/app/api/types";
import { getOrgIdFromNameId } from "@/app/api/service";
import { parseCSV } from "@/lib/csv";
import * as userService from "../service";
import { sendEmail } from "@/lib/email";
import { getCurrentSession } from "@/lib/server/session";

/**
 * @swagger
 * /api/orgs/{orgId}/users/csv:
 *   post:
 *     summary: Bulk import users from CSV
 *     description: Upload a CSV file containing user emails and roles. Creates new accounts for users who don't exist and adds all users to the organization.
 *     tags:
 *       - Organizations
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization name ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: CSV file with columns - email,role (optional - name)
 *     responses:
 *       200:
 *         description: Users processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 summary:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     successful:
 *                       type: number
 *                     newAccounts:
 *                       type: number
 *                     existingUsers:
 *                       type: number
 *                     failed:
 *                       type: number
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       email:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [success, error]
 *                       isNewUser:
 *                         type: boolean
 *                       error:
 *                         type: string
 *       400:
 *         description: Invalid request or CSV format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires owner or organizer role
 *       500:
 *         description: Server error
 */

export async function POST(
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

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 },
      );
    }

    // Verify file type
    if (!file.name.endsWith(".csv")) {
      return NextResponse.json(
        { message: "Only CSV files are allowed" },
        { status: 400 },
      );
    }

    // Read and parse CSV
    const content = await file.text();
    const users = parseCSV(content);

    if (users.length === 0) {
      return NextResponse.json(
        { message: "CSV file is empty or contains no valid rows" },
        { status: 400 },
      );
    }

    // Process users - create accounts if needed and add to org
    const results = await Promise.allSettled(
      users.map(async (user) => {
        try {
          const result = await userService.inviteOrCreateUser(orgId, {
            email: user.email,
            role: user.role,
          });

          // Send appropriate email based on whether user is new or existing
          if (result.isNewUser) {
            // Send welcome email for new users
            await sendEmail({
              to: user.email,
              subject: "Your Account Has Been Created",
              html: `
                <h1>Welcome!</h1>
                <p>An account has been created for you and you've been added to an organization as a ${user.role}.</p>
                <p><strong>Important:</strong> Please reset your password to access your account.</p>
                <p>Visit the platform and use the "Forgot Password" option to set your password.</p>
              `,
            });
          } else {
            // Send invitation email for existing users
            await sendEmail({
              to: user.email,
              subject: "Organization Invitation",
              html: `
                <h1>You've been added!</h1>
                <p>You've been added to an organization with the role: ${user.role}</p>
                <p>Log in to access the organization.</p>
              `,
            });
          }

          return {
            email: user.email,
            status: "success" as const,
            isNewUser: result.isNewUser,
          };
        } catch (error) {
          console.error("Error processing user:", {
            email: user.email,
            error,
            stack: error instanceof Error ? error.stack : undefined,
          });

          return {
            email: user.email,
            status: "error" as const,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      }),
    );

    // Calculate summary statistics
    const processedResults = results.map((r) =>
      r.status === "fulfilled"
        ? r.value
        : { status: "error" as const, error: r.reason, email: "" },
    );

    const successful = processedResults.filter(
      (r) => r.status === "success",
    ).length;
    const newAccounts = processedResults.filter(
      (r) => r.status === "success" && "isNewUser" in r && r.isNewUser,
    ).length;
    const existingUsers = successful - newAccounts;
    const failed = processedResults.filter((r) => r.status === "error").length;

    return NextResponse.json({
      message: `Processed ${users.length} users`,
      summary: {
        total: users.length,
        successful,
        newAccounts,
        existingUsers,
        failed,
      },
      results: processedResults,
    });
  } catch (error) {
    console.error("Error processing CSV:", {
      error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to process CSV",
      },
      { status: 500 },
    );
  }
}
