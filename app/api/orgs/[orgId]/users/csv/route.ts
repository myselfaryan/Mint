import { NextRequest, NextResponse } from "next/server";
import { NameIdSchema } from "@/app/api/types";
import { getOrgIdFromNameId } from "@/app/api/service";
import { parseCSV } from "@/lib/csv";
import * as userService from "../service";
import { sendEmail } from "@/lib/email";

/**
 * @swagger
 * /api/orgs/{orgId}/users/csv:
 *   post:
 *     summary: Bulk invite users from CSV
 *     description: Upload a CSV file containing user emails and roles to invite multiple users at once
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
 *                 description: CSV file with columns - email,role
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
 *                       membership:
 *                         type: object
 *                       error:
 *                         type: string
 *       400:
 *         description: Invalid request or CSV format
 *       500:
 *         description: Server error
 */

export async function POST(
  request: NextRequest,
  { params }: { params: { orgId: string } },
) {
  try {
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

    // Process users
    const results = await Promise.allSettled(
      users.map(async (user) => {
        try {
          const membership = await userService.inviteUser(orgId, {
            email: user.email,
            role: user.role,
          });

          // Send invitation email
          await sendEmail({
            to: user.email,
            subject: "Organization Invitation",
            html: `
              <h1>You've been invited!</h1>
              <p>You've been invited to join an organization with the role: ${user.role}</p>
              <p>Click here to accept the invitation and set up your account.</p>
            `,
          });

          return {
            email: user.email,
            status: "success",
            membership,
          };
        } catch (error) {
          console.error("Error processing user:", {
            email: user.email,
            error,
            stack: error instanceof Error ? error.stack : undefined,
          });

          // Handle specific error types
          let errorMessage = "Unknown error";
          if (error instanceof Error) {
            if (error.message === "User not found") {
              errorMessage = `User ${user.email} needs to register first before being invited`;
            } else {
              errorMessage = error.message;
            }
          }

          return {
            email: user.email,
            status: "error",
            error: errorMessage,
          };
        }
      }),
    );

    // Prepare response with more details
    const successful = results.filter(
      (r) => r.status === "fulfilled" && r.value.status === "success",
    ).length;
    const failed = results.filter(
      (r) => r.status === "rejected" || r.value.status === "error",
    ).length;
    const notFound = results.filter(
      (r) =>
        r.status === "fulfilled" &&
        r.value.status === "error" &&
        r.value.error.includes("needs to register first"),
    ).length;

    return NextResponse.json({
      message: `Processed ${users.length} users (${successful} successful, ${failed} failed, ${notFound} need to register)`,
      results: results.map((r) =>
        r.status === "fulfilled"
          ? r.value
          : { status: "error", error: r.reason },
      ),
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
