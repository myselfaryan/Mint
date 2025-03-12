import { db } from "@/db/drizzle";
import {
  users,
  orgs,
  memberships,
  contests,
  problems,
  contestProblems,
  groups,
  groupMemberships,
  sessionTable,
} from "@/db/schema";
import { hashPassword } from "./password";

// Seeding configuration
const seedConfig = {
  users: {
    admins: 2,
    organizers: 3,
    members: 5,
    password: "password123", // Default password for all users
  },
  organizations: {
    count: 3,
    problemsPerOrg: 2,
    contestsPerOrg: 2,
    groupsPerOrg: 2,
    membersPerGroup: 3,
  },
  contests: {
    problemsPerContest: 2,
    // Contest time windows in milliseconds
    timeWindows: {
      registration: {
        start: -86400000, // 1 day ago
        end: 86400000, // 1 day from now
      },
      contest: {
        start: 3600000, // 1 hour from now
        end: 7200000, // 2 hours from now
      },
    },
  },
};

export async function seedDatabase(config = seedConfig) {
  try {
    // Create users
    const users = await createUsers(config.users);
    const orgs = await createOrganizations(config.organizations, users);

    console.log("Database seeded successfully!");
    return true;
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

async function createUsers(userConfig: typeof seedConfig.users) {
  const createdUsers = {
    admins: [] as any[],
    organizers: [] as any[],
    members: [] as any[],
  };

  const hashedPassword = await hashPassword(userConfig.password);

  // Create admin users
  for (let i = 0; i < userConfig.admins; i++) {
    const [admin] = await db
      .insert(users)
      .values({
        nameId: `admin-${i + 1}`,
        name: `Admin User ${i + 1}`,
        email: `admin${i + 1}@example.com`,
        hashedPassword,
        isSuperuser: true,
      })
      .returning();
    createdUsers.admins.push(admin);
  }

  // Create organizer users
  for (let i = 0; i < userConfig.organizers; i++) {
    const [organizer] = await db
      .insert(users)
      .values({
        nameId: `organizer-${i + 1}`,
        name: `Organizer User ${i + 1}`,
        email: `organizer${i + 1}@example.com`,
        hashedPassword,
      })
      .returning();
    createdUsers.organizers.push(organizer);
  }

  // Create member users
  for (let i = 0; i < userConfig.members; i++) {
    const [member] = await db
      .insert(users)
      .values({
        nameId: `member-${i + 1}`,
        name: `Member User ${i + 1}`,
        email: `member${i + 1}@example.com`,
        hashedPassword,
      })
      .returning();
    createdUsers.members.push(member);
  }

  return createdUsers;
}

async function createOrganizations(
  orgConfig: typeof seedConfig.organizations,
  users: ReturnType<typeof createUsers> extends Promise<infer T> ? T : never,
) {
  const createdOrgs = [];

  for (let i = 0; i < orgConfig.count; i++) {
    // Create organization
    const [org] = await db
      .insert(orgs)
      .values({
        nameId: `org-${i + 1}`,
        name: `Organization ${i + 1}`,
        about: `This is test organization ${i + 1}`,
      })
      .returning();
    createdOrgs.push(org);

    // Create memberships
    await createOrgMemberships(org.id, users);

    // Create problems
    const problems = await createProblems(org.id, orgConfig.problemsPerOrg);

    // Create contests
    await createContests(org.id, problems, seedConfig.contests);

    // Create groups
    await createGroups(
      org.id,
      users,
      orgConfig.groupsPerOrg,
      orgConfig.membersPerGroup,
    );
  }

  return createdOrgs;
}

async function createOrgMemberships(orgId: number, users: any) {
  const memberships = [
    // Assign first admin as owner
    {
      userId: users.admins[0].id,
      orgId,
      role: "owner" as const,
    },
    // Assign organizers
    ...users.organizers.map((user) => ({
      userId: user.id,
      orgId,
      role: "organizer" as const,
    })),
    // Assign members
    ...users.members.map((user) => ({
      userId: user.id,
      orgId,
      role: "member" as const,
    })),
  ];

  await db.insert(memberships).values(memberships);
}

async function createProblems(orgId: number, count: number) {
  const createdProblems = [];

  for (let i = 0; i < count; i++) {
    const [problem] = await db
      .insert(problems)
      .values({
        code: `problem-${orgId}-${i + 1}`,
        title: `Problem ${i + 1}`,
        description: `This is test problem ${i + 1} for organization ${orgId}`,
        allowedLanguages: ["python", "javascript"],
        orgId,
      })
      .returning();
    createdProblems.push(problem);
  }

  return createdProblems;
}

async function createContests(
  orgId: number,
  problems: any[],
  contestConfig: typeof seedConfig.contests,
) {
  const now = new Date();

  for (let i = 0; i < contestConfig.problemsPerContest; i++) {
    const [contest] = await db
      .insert(contests)
      .values({
        nameId: `contest-${orgId}-${i + 1}`,
        name: `Contest ${i + 1}`,
        description: `This is test contest ${i + 1} for organization ${orgId}`,
        rules: "Standard contest rules apply",
        registrationStartTime: new Date(
          now.getTime() + contestConfig.timeWindows.registration.start,
        ),
        registrationEndTime: new Date(
          now.getTime() + contestConfig.timeWindows.registration.end,
        ),
        startTime: new Date(
          now.getTime() + contestConfig.timeWindows.contest.start,
        ),
        endTime: new Date(
          now.getTime() + contestConfig.timeWindows.contest.end,
        ),
        organizerId: orgId,
        organizerKind: "org",
      })
      .returning();

    // Add problems to contest
    const contestProblemsData = problems
      .slice(0, contestConfig.problemsPerContest)
      .map((problem, index) => ({
        contestId: contest.id,
        problemId: problem.id,
        order: index,
      }));

    await db.insert(contestProblems).values(contestProblemsData);
  }
}

async function createGroups(
  orgId: number,
  users: any,
  groupCount: number,
  membersPerGroup: number,
) {
  for (let i = 0; i < groupCount; i++) {
    const [group] = await db
      .insert(groups)
      .values({
        nameId: `group-${orgId}-${i + 1}`,
        name: `Group ${i + 1}`,
        about: `This is test group ${i + 1} for organization ${orgId}`,
        orgId,
      })
      .returning();

    // Add random members to group
    const memberUsers = users.members.slice(0, membersPerGroup).map((user) => ({
      groupId: group.id,
      userId: user.id,
    }));

    await db.insert(groupMemberships).values(memberUsers);
  }
}

export async function clearDatabase() {
  try {
    // First delete tables that reference other tables (child tables)
    await db.delete(groupMemberships);
    await db.delete(groups);
    await db.delete(contestProblems);
    await db.delete(contests);
    await db.delete(problems);
    await db.delete(memberships);
    // Delete sessions before users since sessions reference users
    await db.delete(sessionTable);
    await db.delete(orgs);
    await db.delete(users);

    console.log("Database cleared successfully!");
    return true;
  } catch (error) {
    console.error("Error clearing database:", error);
    throw error;
  }
}

export async function isDatabaseEmpty() {
  const userCount = await db.select({ count: db.fn.count() }).from(users);
  return userCount[0].count === 0;
}
