import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/orgs/{orgId}/users/csv/template:
 *   get:
 *     summary: Download CSV template for bulk user import
 *     description: Returns a CSV template file with example data for importing users
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
 *         description: CSV template file
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */
export async function GET(request: NextRequest) {
  const csvTemplate = `email,role,name
john@example.com,member,John Doe
jane@example.com,organizer,Jane Smith
admin@example.com,owner,Admin User`;

  return new NextResponse(csvTemplate, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="user_import_template.csv"',
    },
  });
}
