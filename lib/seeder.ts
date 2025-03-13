import { db } from "@/db/drizzle";
import { sql } from "drizzle-orm";
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
  SelectUser,
  SelectProblem,
  testCases,
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
    problemsPerOrg: 5,
    contestsPerOrg: 3,
    groupsPerOrg: 2,
    membersPerGroup: 3,
  },
  contests: {
    count: 3,
    problemsPerContest: 3,
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

// First, let's define realistic problem templates
const problemTemplates = [
  {
    title: "Sum of Two Numbers",
    description: `# Sum of Two Numbers

## Problem Statement
Write a program that takes two integers as input and outputs their sum.

## Input Format
The input consists of a single line containing two space-separated integers, a and b.

## Output Format
Output a single integer, the sum of a and b.

## Constraints
- -1000 ≤ a, b ≤ 1000

## Example
### Input
\`\`\`
3 5
\`\`\`

### Output
\`\`\`
8
\`\`\``,
    testCases: [
      { input: "3 5", output: "8", kind: "example" },
      { input: "10 20", output: "30", kind: "example" },
      { input: "-5 8", output: "3", kind: "example" },
      { input: "0 0", output: "0", kind: "test" },
      { input: "-10 -20", output: "-30", kind: "test" },
      { input: "999 1", output: "1000", kind: "test" },
    ],
  },
  {
    title: "Product of Three Numbers",
    description: `# Product of Three Numbers

## Problem Statement
Write a program that takes three integers as input and outputs their product.

## Input Format
The input consists of a single line containing three space-separated integers: a, b, and c.

## Output Format
Output a single integer, the product of a, b, and c.

## Constraints
- -100 ≤ a, b, c ≤ 100

## Example
### Input
\`\`\`
2 3 4
\`\`\`

### Output
\`\`\`
24
\`\`\``,
    testCases: [
      { input: "2 3 4", output: "24", kind: "example" },
      { input: "1 5 10", output: "50", kind: "example" },
      { input: "-2 3 -4", output: "24", kind: "example" },
      { input: "0 5 10", output: "0", kind: "test" },
      { input: "-1 -1 -1", output: "-1", kind: "test" },
      { input: "10 10 10", output: "1000", kind: "test" },
    ],
  },
  {
    title: "Maximum of Three Numbers",
    description: `# Maximum of Three Numbers

## Problem Statement
Write a program that takes three integers as input and outputs the maximum value among them.

## Input Format
The input consists of a single line containing three space-separated integers: a, b, and c.

## Output Format
Output a single integer, the maximum value among a, b, and c.

## Constraints
- -1000 ≤ a, b, c ≤ 1000

## Example
### Input
\`\`\`
5 2 8
\`\`\`

### Output
\`\`\`
8
\`\`\``,
    testCases: [
      { input: "5 2 8", output: "8", kind: "example" },
      { input: "10 10 5", output: "10", kind: "example" },
      { input: "-5 -2 -10", output: "-2", kind: "example" },
      { input: "0 0 0", output: "0", kind: "test" },
      { input: "999 998 997", output: "999", kind: "test" },
      { input: "-50 -20 -30", output: "-20", kind: "test" },
    ],
  },
  {
    title: "Fibonacci Number",
    description: `# Fibonacci Number

## Problem Statement
Write a program that calculates the nth Fibonacci number. The Fibonacci sequence starts with 0 and 1, and each subsequent number is the sum of the two preceding ones.

## Input Format
The input consists of a single integer n.

## Output Format
Output the nth Fibonacci number.

## Constraints
- 0 ≤ n ≤ 30

## Example
### Input
\`\`\`
5
\`\`\`

### Output
\`\`\`
5
\`\`\`

### Explanation
The Fibonacci sequence starts: 0, 1, 1, 2, 3, 5, 8, ...
So the 5th Fibonacci number is 5.`,
    testCases: [
      { input: "5", output: "5", kind: "example" },
      { input: "0", output: "0", kind: "example" },
      { input: "10", output: "55", kind: "example" },
      { input: "1", output: "1", kind: "test" },
      { input: "20", output: "6765", kind: "test" },
      { input: "15", output: "610", kind: "test" },
    ],
  },
  {
    title: "Prime Number Check",
    description: `# Prime Number Check

## Problem Statement
Write a program that determines whether a given number is prime or not.

## Input Format
The input consists of a single integer n.

## Output Format
Output "Yes" if n is prime, and "No" otherwise.

## Constraints
- 1 ≤ n ≤ 10^6

## Example
### Input
\`\`\`
7
\`\`\`

### Output
\`\`\`
Yes
\`\`\`

### Note
A prime number is a natural number greater than 1 that is not divisible by any positive integer other than 1 and itself.`,
    testCases: [
      { input: "7", output: "Yes", kind: "example" },
      { input: "4", output: "No", kind: "example" },
      { input: "1", output: "No", kind: "example" },
      { input: "2", output: "Yes", kind: "test" },
      { input: "997", output: "Yes", kind: "test" },
      { input: "100", output: "No", kind: "test" },
    ],
  },
];

// Contest templates with realistic names and descriptions
const contestTemplates = [
  {
    name: "Algorithmic Programming Challenge",
    description:
      "A competitive programming contest focusing on algorithmic problem-solving skills.",
    rules:
      "Standard ACM-ICPC rules apply. Each incorrect submission adds a 20-minute penalty.",
  },
  {
    name: "Annual Coding Competition",
    description:
      "Our yearly coding competition open to all students and professionals.",
    rules:
      "Participants can use any programming language supported by the platform. Internet access is allowed for documentation only.",
  },
  {
    name: "University Programming Olympiad",
    description:
      "A prestigious competition for university students to showcase their programming talents.",
    rules:
      "Teams of up to 3 members can participate. The team with the most solved problems wins.",
  },
  {
    name: "Data Structures and Algorithms Contest",
    description:
      "Test your knowledge of fundamental data structures and algorithms in this challenging contest.",
    rules:
      "Individual participation only. Submissions are evaluated based on correctness and efficiency.",
  },
  {
    name: "Hackathon Challenge",
    description:
      "A 24-hour coding marathon to solve real-world problems through innovative solutions.",
    rules:
      "Participants must submit their code and a brief presentation of their solution.",
  },
];

export async function seedDatabase(config = seedConfig) {
  try {
    // Check if database is already populated
    /*
    const isEmpty = await isDatabaseEmpty();
    if (!isEmpty) {
      console.log("Database already contains data. Skipping seed operation.");
      return false;
    }
    */

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
    admins: [] as SelectUser[],
    organizers: [] as SelectUser[],
    members: [] as SelectUser[],
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
  users: {
    admins: SelectUser[];
    organizers: SelectUser[];
    members: SelectUser[];
  },
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

async function createOrgMemberships(
  orgId: number,
  users: {
    admins: SelectUser[];
    organizers: SelectUser[];
    members: SelectUser[];
  },
) {
  const membershipValues = [
    // Assign first admin as owner
    {
      userId: users.admins[0].id,
      orgId,
      role: "owner" as const,
    },
    // Assign organizers
    ...users.organizers.map((user: SelectUser) => ({
      userId: user.id,
      orgId,
      role: "organizer" as const,
    })),
    // Assign members
    ...users.members.map((user: SelectUser) => ({
      userId: user.id,
      orgId,
      role: "member" as const,
    })),
  ];

  await db.insert(memberships).values(membershipValues);
}

async function createProblems(orgId: number, count: number) {
  const createdProblems: Array<SelectProblem> = [];

  // Use problem templates to create more realistic problems
  for (let i = 0; i < count; i++) {
    // Select a template (cycling through them if count > templates.length)
    const template = problemTemplates[i % problemTemplates.length];

    const [problem] = await db
      .insert(problems)
      .values({
        code: `problem-${orgId}-${i + 1}`,
        title: template.title,
        description: template.description,
        allowedLanguages: ["python", "javascript", "cpp"],
        orgId,
      })
      .returning();
    createdProblems.push(problem);

    // Create test cases for this problem
    await createTestCases(problem.id, template.testCases);
  }

  return createdProblems;
}

async function createTestCases(
  problemId: number,
  testCaseData: Array<{ input: string; output: string; kind: string }>,
) {
  const testCaseValues = testCaseData.map((tc) => ({
    problemId,
    input: tc.input,
    output: tc.output,
    kind: tc.kind,
  }));

  await db.insert(testCases).values(testCaseValues);
}

async function createContests(
  orgId: number,
  problemsList: Array<SelectProblem>,
  contestConfig: typeof seedConfig.contests,
) {
  const now = new Date();

  // Create multiple contests with different time schedules
  for (let i = 0; i < contestConfig.count; i++) {
    // Select a template (cycling through them if count > templates.length)
    const template = contestTemplates[i % contestTemplates.length];

    // Create different time schedules for each contest
    const registrationStart = new Date(now);
    registrationStart.setDate(registrationStart.getDate() - 7 + i); // Stagger registration starts

    const registrationEnd = new Date(registrationStart);
    registrationEnd.setDate(registrationEnd.getDate() + 5); // 5-day registration period

    const contestStart = new Date(registrationEnd);
    contestStart.setHours(contestStart.getHours() + 2); // 2 hours after registration ends

    const contestEnd = new Date(contestStart);
    contestEnd.setHours(contestEnd.getHours() + 3); // 3-hour contest

    const [contest] = await db
      .insert(contests)
      .values({
        nameId: `contest-${orgId}-${i + 1}`,
        name: template.name,
        description: template.description,
        rules: template.rules,
        registrationStartTime: registrationStart,
        registrationEndTime: registrationEnd,
        startTime: contestStart,
        endTime: contestEnd,
        organizerId: orgId,
        organizerKind: "org",
        allowList: [], // Add missing required fields
        disallowList: [], // Add missing required fields
      })
      .returning();

    // Add problems to contest - select a subset of problems for each contest
    const startIdx =
      i % Math.max(1, problemsList.length - contestConfig.problemsPerContest);
    const contestProblemsData = problemsList
      .slice(startIdx, startIdx + contestConfig.problemsPerContest)
      .map((problem: SelectProblem, index: number) => ({
        contestId: contest.id,
        problemId: problem.id,
        order: index,
      }));

    await db.insert(contestProblems).values(contestProblemsData);
  }
}

async function createGroups(
  orgId: number,
  users: {
    admins: SelectUser[];
    organizers: SelectUser[];
    members: SelectUser[];
  },
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
    const memberUsers = users.members
      .slice(0, membersPerGroup)
      .map((user: SelectUser) => ({
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
  const userCount = await db.select({ count: sql`count(*)` }).from(users);
  return parseInt(userCount[0].count as string) === 0;
}
