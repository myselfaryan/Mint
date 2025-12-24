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
    admins: 5,
    organizers: 5,
    members: 5,
    password: "password123", // Default password for all users
  },
  organizations: {
    count: 5,
    problemsPerOrg: 5,
    contestsPerOrg: 5,
    groupsPerOrg: 5,
    membersPerGroup: 5,
  },
  contests: {
    count: 5,
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
  {
    title: "Reverse a String",
    description: `# Reverse a String

## Problem Statement
Write a program that takes a string as input and outputs the reversed string.

## Input Format
A single line containing a string.

## Output Format
The reversed string.

## Example
### Input
\`\`\`
hello
\`\`\`

### Output
\`\`\`
olleh
\`\`\``,
    testCases: [
      { input: "hello", output: "olleh", kind: "example" },
      { input: "world", output: "dlrow", kind: "example" },
      { input: "a", output: "a", kind: "test" },
      { input: "racecar", output: "racecar", kind: "test" },
    ],
  },
  {
    title: "Count Vowels",
    description: `# Count Vowels

## Problem Statement
Count the number of vowels (a, e, i, o, u) in a given string.

## Input Format
A single line containing a lowercase string.

## Output Format
A single integer representing the count of vowels.

## Example
### Input
\`\`\`
hello world
\`\`\`

### Output
\`\`\`
3
\`\`\``,
    testCases: [
      { input: "hello world", output: "3", kind: "example" },
      { input: "programming", output: "3", kind: "example" },
      { input: "aeiou", output: "5", kind: "test" },
      { input: "xyz", output: "0", kind: "test" },
    ],
  },
  {
    title: "Factorial",
    description: `# Factorial

## Problem Statement
Calculate the factorial of a given non-negative integer n.

## Input Format
A single integer n (0 ≤ n ≤ 12).

## Output Format
The factorial of n.

## Example
### Input
\`\`\`
5
\`\`\`

### Output
\`\`\`
120
\`\`\``,
    testCases: [
      { input: "5", output: "120", kind: "example" },
      { input: "0", output: "1", kind: "example" },
      { input: "10", output: "3628800", kind: "test" },
      { input: "1", output: "1", kind: "test" },
    ],
  },
  {
    title: "Palindrome Check",
    description: `# Palindrome Check

## Problem Statement
Determine if a given string is a palindrome.

## Input Format
A single line containing a lowercase string.

## Output Format
"Yes" if the string is a palindrome, "No" otherwise.

## Example
### Input
\`\`\`
racecar
\`\`\`

### Output
\`\`\`
Yes
\`\`\``,
    testCases: [
      { input: "racecar", output: "Yes", kind: "example" },
      { input: "hello", output: "No", kind: "example" },
      { input: "a", output: "Yes", kind: "test" },
      { input: "level", output: "Yes", kind: "test" },
    ],
  },
  {
    title: "GCD of Two Numbers",
    description: `# GCD of Two Numbers

## Problem Statement
Find the Greatest Common Divisor (GCD) of two positive integers.

## Input Format
Two space-separated positive integers a and b.

## Output Format
The GCD of a and b.

## Example
### Input
\`\`\`
12 18
\`\`\`

### Output
\`\`\`
6
\`\`\``,
    testCases: [
      { input: "12 18", output: "6", kind: "example" },
      { input: "100 25", output: "25", kind: "example" },
      { input: "7 13", output: "1", kind: "test" },
      { input: "48 36", output: "12", kind: "test" },
    ],
  },
  {
    title: "Array Sum",
    description: `# Array Sum

## Problem Statement
Calculate the sum of all elements in an array.

## Input Format
First line: integer n (size of array)
Second line: n space-separated integers

## Output Format
The sum of all elements.

## Example
### Input
\`\`\`
5
1 2 3 4 5
\`\`\`

### Output
\`\`\`
15
\`\`\``,
    testCases: [
      { input: "5\n1 2 3 4 5", output: "15", kind: "example" },
      { input: "3\n10 20 30", output: "60", kind: "example" },
      { input: "1\n100", output: "100", kind: "test" },
      { input: "4\n-1 -2 3 4", output: "4", kind: "test" },
    ],
  },
  {
    title: "Find Maximum in Array",
    description: `# Find Maximum in Array

## Problem Statement
Find the maximum element in an array of integers.

## Input Format
First line: integer n (size of array)
Second line: n space-separated integers

## Output Format
The maximum element.

## Example
### Input
\`\`\`
5
3 7 2 9 1
\`\`\`

### Output
\`\`\`
9
\`\`\``,
    testCases: [
      { input: "5\n3 7 2 9 1", output: "9", kind: "example" },
      { input: "3\n-5 -2 -8", output: "-2", kind: "example" },
      { input: "1\n42", output: "42", kind: "test" },
      { input: "4\n0 0 0 0", output: "0", kind: "test" },
    ],
  },
  {
    title: "Count Digits",
    description: `# Count Digits

## Problem Statement
Count the number of digits in a positive integer.

## Input Format
A single positive integer n.

## Output Format
The count of digits in n.

## Example
### Input
\`\`\`
12345
\`\`\`

### Output
\`\`\`
5
\`\`\``,
    testCases: [
      { input: "12345", output: "5", kind: "example" },
      { input: "999", output: "3", kind: "example" },
      { input: "1", output: "1", kind: "test" },
      { input: "1000000", output: "7", kind: "test" },
    ],
  },
  {
    title: "Power of Two",
    description: `# Power of Two

## Problem Statement
Determine if a number is a power of two.

## Input Format
A single positive integer n.

## Output Format
"Yes" if n is a power of two, "No" otherwise.

## Example
### Input
\`\`\`
8
\`\`\`

### Output
\`\`\`
Yes
\`\`\``,
    testCases: [
      { input: "8", output: "Yes", kind: "example" },
      { input: "12", output: "No", kind: "example" },
      { input: "1", output: "Yes", kind: "test" },
      { input: "1024", output: "Yes", kind: "test" },
    ],
  },
  {
    title: "Even or Odd",
    description: `# Even or Odd

## Problem Statement
Determine if a number is even or odd.

## Input Format
A single integer n.

## Output Format
"Even" if n is even, "Odd" otherwise.

## Example
### Input
\`\`\`
4
\`\`\`

### Output
\`\`\`
Even
\`\`\``,
    testCases: [
      { input: "4", output: "Even", kind: "example" },
      { input: "7", output: "Odd", kind: "example" },
      { input: "0", output: "Even", kind: "test" },
      { input: "-3", output: "Odd", kind: "test" },
    ],
  },
  {
    title: "Armstrong Number",
    description: `# Armstrong Number

## Problem Statement
Check if a number is an Armstrong number (sum of cubes of digits equals the number).

## Input Format
A single positive integer n.

## Output Format
"Yes" if n is an Armstrong number, "No" otherwise.

## Example
### Input
\`\`\`
153
\`\`\`

### Output
\`\`\`
Yes
\`\`\``,
    testCases: [
      { input: "153", output: "Yes", kind: "example" },
      { input: "123", output: "No", kind: "example" },
      { input: "370", output: "Yes", kind: "test" },
      { input: "371", output: "Yes", kind: "test" },
    ],
  },
  {
    title: "Binary to Decimal",
    description: `# Binary to Decimal

## Problem Statement
Convert a binary number to its decimal equivalent.

## Input Format
A binary string (containing only 0s and 1s).

## Output Format
The decimal equivalent.

## Example
### Input
\`\`\`
1010
\`\`\`

### Output
\`\`\`
10
\`\`\``,
    testCases: [
      { input: "1010", output: "10", kind: "example" },
      { input: "1111", output: "15", kind: "example" },
      { input: "1", output: "1", kind: "test" },
      { input: "10000", output: "16", kind: "test" },
    ],
  },
  {
    title: "Sum of Digits",
    description: `# Sum of Digits

## Problem Statement
Calculate the sum of all digits in a number.

## Input Format
A single positive integer n.

## Output Format
The sum of digits.

## Example
### Input
\`\`\`
12345
\`\`\`

### Output
\`\`\`
15
\`\`\``,
    testCases: [
      { input: "12345", output: "15", kind: "example" },
      { input: "999", output: "27", kind: "example" },
      { input: "100", output: "1", kind: "test" },
      { input: "7", output: "7", kind: "test" },
    ],
  },
  {
    title: "LCM of Two Numbers",
    description: `# LCM of Two Numbers

## Problem Statement
Find the Least Common Multiple (LCM) of two positive integers.

## Input Format
Two space-separated positive integers a and b.

## Output Format
The LCM of a and b.

## Example
### Input
\`\`\`
4 6
\`\`\`

### Output
\`\`\`
12
\`\`\``,
    testCases: [
      { input: "4 6", output: "12", kind: "example" },
      { input: "3 5", output: "15", kind: "example" },
      { input: "7 7", output: "7", kind: "test" },
      { input: "12 18", output: "36", kind: "test" },
    ],
  },
  {
    title: "Perfect Square",
    description: `# Perfect Square

## Problem Statement
Determine if a number is a perfect square.

## Input Format
A single positive integer n.

## Output Format
"Yes" if n is a perfect square, "No" otherwise.

## Example
### Input
\`\`\`
16
\`\`\`

### Output
\`\`\`
Yes
\`\`\``,
    testCases: [
      { input: "16", output: "Yes", kind: "example" },
      { input: "15", output: "No", kind: "example" },
      { input: "1", output: "Yes", kind: "test" },
      { input: "100", output: "Yes", kind: "test" },
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
  {
    name: "Speed Coding Sprint",
    description:
      "Race against the clock! Solve as many problems as you can in just 2 hours.",
    rules:
      "Time-based scoring. Faster solutions earn bonus points. No penalty for wrong submissions.",
  },
  {
    name: "Code Golf Tournament",
    description:
      "Write the shortest possible code that solves each problem correctly.",
    rules:
      "Solutions are ranked by character count. All languages allowed but must produce correct output.",
  },
  {
    name: "Debugging Championship",
    description:
      "Put your debugging skills to the test by fixing broken code snippets.",
    rules:
      "Each problem contains buggy code. Fix all bugs while making minimal changes.",
  },
  {
    name: "Beginner's Code Quest",
    description:
      "A friendly competition designed for newcomers to competitive programming.",
    rules:
      "Simple problems with detailed hints. Focus on learning over competition.",
  },
  {
    name: "Advanced Algorithm Arena",
    description:
      "Challenge yourself with complex algorithms including graph theory and dynamic programming.",
    rules:
      "Expert-level problems. Partial scoring available for partially correct solutions.",
  },
  {
    name: "Team Programming Battle",
    description:
      "Collaborate with your team to solve challenging problems together.",
    rules:
      "Teams of 3 share one computer. Communication and teamwork are key.",
  },
  {
    name: "Weekly Code Challenge",
    description:
      "Our regular weekly contest to keep your skills sharp.",
    rules:
      "New problems every week. Leaderboard tracks cumulative scores.",
  },
  {
    name: "Mock Interview Prep",
    description:
      "Practice coding interview questions in a timed contest environment.",
    rules:
      "Problems similar to real technical interviews. Time limit simulates interview conditions.",
  },
  {
    name: "Code Optimization Contest",
    description:
      "Submit the fastest and most efficient solutions possible.",
    rules:
      "Solutions ranked by execution time and memory usage. Correctness is required.",
  },
  {
    name: "Math and Logic Challenge",
    description:
      "Problems that combine mathematical reasoning with programming skills.",
    rules:
      "Strong mathematical background recommended. Calculators not allowed.",
  },
  {
    name: "System Design Sprint",
    description:
      "Design and implement small systems under time pressure.",
    rules:
      "Focus on clean architecture and best practices. Code review included.",
  },
  {
    name: "AI Coding Challenge",
    description:
      "Implement AI and machine learning algorithms from scratch.",
    rules:
      "No external ML libraries allowed. Implement algorithms using basic libraries only.",
  },
  {
    name: "Database Query Competition",
    description:
      "Write efficient SQL queries to solve data manipulation problems.",
    rules:
      "SQL-focused problems. Query efficiency and correctness both scored.",
  },
  {
    name: "Frontend Challenge Cup",
    description:
      "Build user interfaces that match given specifications.",
    rules:
      "HTML, CSS, and JavaScript allowed. Pixel-perfect matching required.",
  },
  {
    name: "API Design Tournament",
    description:
      "Design RESTful APIs that meet given requirements.",
    rules:
      "Focus on RESTful principles, error handling, and documentation.",
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
