//app/api/[orgId]/stats/route.ts
import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/server/session";
import * as statsService from "./service";

export async function GET(
  request: Request,
  { params }: { params: { orgId: string } },
) {
  try {
    const { session } = await getCurrentSession();

    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgNameId = params.orgId;

    // First check if the org exists
    const orgId = await statsService.getOrgIdFromNameId(orgNameId);
    if (!orgId) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 },
      );
    }

    // Get user's role in this organization
    const role = await statsService.getUserRole(session.userId, orgId);
    if (!role) {
      return NextResponse.json(
        { error: "Not a member of this organization" },
        { status: 403 },
      );
    }

    const searchParams = new URL(request.url).searchParams;
    const stat = searchParams.get("stat");
    const period = searchParams.get("period") as statsService.Period | null;
    const memberRole = searchParams.get("role");

    // Define which stats are available for each role
    const ownerStats = new Set([
      "total-members",
      "members-by-role",
      "total-contests",
      "recent-contests",
      "ended-contests",
      "upcoming-contests",
      "total-problems",
      "recent-problems",
      "total-groups",
      "recent-groups",
      "total-submissions",
      "recent-submissions",
    ]);

    const organizerStats = new Set([
      "total-contests",
      "recent-contests",
      "ended-contests",
      "upcoming-contests",
      "total-problems",
      "recent-problems",
      "total-groups",
      "recent-groups",
      "total-submissions",
      "recent-submissions",
    ]);

    const memberStats = new Set([
      "total-contests",
      "recent-contests",
      "ended-contests",
      "upcoming-contests",
      "total-problems",
      "recent-problems",
      "total-groups",
      "recent-groups",
      "total-submissions",
      "recent-submissions",
    ]);

    // Check if user has access to requested stat
    const accessibleStats =
      role === "owner"
        ? ownerStats
        : role === "organizer"
          ? organizerStats
          : memberStats;

    if (!stat || !accessibleStats.has(stat)) {
      return NextResponse.json(
        { error: "Access denied to this statistic" },
        { status: 403 },
      );
    }

    // Return the requested statistic
    switch (stat) {
      // Member Stats (owners only)
      case "total-members":
        return NextResponse.json({
          value: await statsService.getOrgMembersCount(orgId),
        });

      case "members-by-role":
        if (!memberRole) {
          return NextResponse.json(
            { error: "Role parameter is required" },
            { status: 400 },
          );
        }
        return NextResponse.json({
          value: await statsService.getOrgMembersByRole(orgId, memberRole),
        });

      // Contest Stats (all roles)
      case "total-contests":
        return NextResponse.json({
          value: await statsService.getOrgContestsCount(orgId),
        });

      case "recent-contests":
        if (!period) {
          return NextResponse.json(
            { error: "Period parameter is required" },
            { status: 400 },
          );
        }
        return NextResponse.json({
          value: await statsService.getOrgRecentContests(orgId, period),
        });

      case "ended-contests":
        return NextResponse.json({
          value: await statsService.getOrgEndedContests(orgId),
        });

      case "upcoming-contests":
        return NextResponse.json({
          value: await statsService.getOrgUpcomingContests(orgId),
        });

      // Problem Stats (all roles)
      case "total-problems":
        return NextResponse.json({
          value: await statsService.getOrgProblemsCount(orgId),
        });

      case "recent-problems":
        if (!period) {
          return NextResponse.json(
            { error: "Period parameter is required" },
            { status: 400 },
          );
        }
        return NextResponse.json({
          value: await statsService.getOrgRecentProblems(orgId, period),
        });

      // Group Stats (all roles)
      case "total-groups":
        return NextResponse.json({
          value: await statsService.getOrgGroupsCount(orgId),
        });

      case "recent-groups":
        if (!period) {
          return NextResponse.json(
            { error: "Period parameter is required" },
            { status: 400 },
          );
        }
        return NextResponse.json({
          value: await statsService.getOrgRecentGroups(orgId, period),
        });

      case "total-submissions":
        return NextResponse.json({
          value: await statsService.getOrgSubmissionsCount(orgId),
        });

      case "recent-submissions":
        if (!period) {
          return NextResponse.json(
            { error: "Period parameter is required" },
            { status: 400 },
          );
        }
        return NextResponse.json({
          value: await statsService.getOrgRecentSubmissions(orgId, period),
        });

      default:
        return NextResponse.json(
          { error: "Invalid stat requested" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
