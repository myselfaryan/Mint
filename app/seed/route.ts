import { db } from "@/db/drizzle";
import {
  users,
  userEmails,
  orgs,
  memberships,
  contests,
  contestParticipants,
  programmingProblems,
  contestProblems,
  programmingTestCases,
  programmingSubmissions,
} from "@/db/schema";
import { sql } from "drizzle-orm";
import { saltAndHashPassword } from "@/lib/password";

async function isDatabaseSeeded() {
  try {
    const [userCount, orgCount, contestCount] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(users),
      db.select({ count: sql<number>`count(*)` }).from(orgs),
      db.select({ count: sql<number>`count(*)` }).from(contests),
    ]);

    return (
      userCount[0]?.count > 0 &&
      orgCount[0]?.count > 0 &&
      contestCount[0]?.count > 0
    );
  } catch (error) {
    console.error("Error checking if database is seeded:", error);
    return false; // Assume not seeded if there's an error
  }
}

async function insertSeedData() {
  try {
    // Check if the database is already seeded
    const isSeeded = await isDatabaseSeeded();
    if (isSeeded) {
      console.log("Database is already seeded. Skipping seed data insertion.");
      return;
    }

    const passwords = await Promise.all([
      saltAndHashPassword("john-doe1"),
      saltAndHashPassword("jane-smith1"),
      saltAndHashPassword("mike-johnson1"),
      saltAndHashPassword("emily-brown"),
    ]);

    console.log(passwords);

    db.transaction(async (tx) => {
      // Insert users
      await tx
        .insert(users)
        .values([
          {
            nameId: "john-doe",
            name: "John Doe",
            hashedPassword: passwords[0],
            about: "Software engineer with 5 years of experience",
            avatar: "avatar1.jpg",
          },
          {
            nameId: "jane-smith",
            name: "Jane Smith",
            hashedPassword: passwords[1],
            about: "Product manager passionate about user experience",
            avatar: "avatar2.jpg",
          },
          {
            nameId: "mike-johnson",
            name: "Mike Johnson",
            hashedPassword: passwords[2],
            about: "Data scientist specializing in machine learning",
            avatar: "avatar3.jpg",
          },
          {
            nameId: "emily-brown",
            name: "Emily Brown",
            hashedPassword: passwords[3],
            about: "UX designer with a keen eye for detail",
            avatar: "avatar4.jpg",
          },
        ])
        .onConflictDoNothing();

      const insertedUsers = await tx.select().from(users);
      console.log("insertedUsers", insertedUsers);
      // .returning({ id: users.id });

      console.log(insertedUsers);

      // Insert user emails (multiple emails for some users)
      await tx.insert(userEmails).values([
        { email: "john.doe@example.com", userId: insertedUsers[0].id },
        { email: "john.personal@example.com", userId: insertedUsers[0].id },
        { email: "jane.smith@example.com", userId: insertedUsers[1].id },
        { email: "jane.smith@work.com", userId: insertedUsers[1].id },
        { email: "mike.johnson@example.com", userId: insertedUsers[2].id },
        { email: "emily.brown@example.com", userId: insertedUsers[3].id },
        { email: "emily.design@example.com", userId: insertedUsers[3].id },
      ]);

      // Insert organizations
      const insertedOrgs = await tx
        .insert(orgs)
        .values([
          {
            nameId: "tech-innovators",
            name: "Tech Innovators",
            about: "Cutting-edge technology solutions for businesses",
            avatar: "tech_innovators.jpg",
          },
          {
            nameId: "green-earth",
            name: "Green Earth",
            about: "Environmental conservation and sustainability initiatives",
            avatar: "green_earth.jpg",
          },
          {
            nameId: "health-first",
            name: "Health First",
            about: "Promoting wellness and healthy living",
            avatar: "health_first.jpg",
          },
        ])
        .returning({ id: orgs.id });

      console.log(insertedOrgs);
      console.log(
        await tx.select().from(users),
        await tx.select().from(userEmails),
        await tx.select().from(orgs),
      );

      // Insert memberships
      await tx.insert(memberships).values([
        {
          orgId: insertedOrgs[0].id,
          userId: insertedUsers[0].id,
          role: "owner",
        },
        {
          orgId: insertedOrgs[0].id,
          userId: insertedUsers[1].id,
          role: "organizer",
        },
        {
          orgId: insertedOrgs[0].id,
          userId: insertedUsers[2].id,
          role: "member",
        },
        {
          orgId: insertedOrgs[1].id,
          userId: insertedUsers[1].id,
          role: "owner",
        },
        {
          orgId: insertedOrgs[1].id,
          userId: insertedUsers[3].id,
          role: "organizer",
        },
        {
          orgId: insertedOrgs[2].id,
          userId: insertedUsers[2].id,
          role: "owner",
        },
        {
          orgId: insertedOrgs[2].id,
          userId: insertedUsers[0].id,
          role: "member",
        },
        {
          orgId: insertedOrgs[2].id,
          userId: insertedUsers[3].id,
          role: "member",
        },
      ]);

      // Insert contests with empty allowList and disallowList
      const insertedContests = await tx
        .insert(contests)
        .values([
          {
            nameId: "summer-code-challenge",
            name: "Summer Code Challenge",
            organizerId: insertedOrgs[0].id,
            organizerKind: "org",
            description: "A summer coding challenge for all skill levels",
            rules:
              "1. All submissions must be original. 2. Time limit: 2 hours. 3. Only standard libraries allowed.",
            registrationStartTime: new Date("2024-06-01T00:00:00Z"),
            registrationEndTime: new Date("2024-06-30T23:59:59Z"),
            startTime: new Date("2024-07-15T09:00:00Z"),
            endTime: new Date("2024-07-15T11:00:00Z"),
            allowList: [],
            disallowList: [],
          },
          {
            nameId: "algorithm-masters",
            name: "Algorithm Masters",
            organizerId: insertedUsers[2].id,
            organizerKind: "user",
            description: "Test your algorithmic skills",
            rules: "1. Use only standard libraries. 2. Time limit: 3 hours.",
            registrationStartTime: new Date("2024-08-01T00:00:00Z"),
            registrationEndTime: new Date("2024-08-31T23:59:59Z"),
            startTime: new Date("2024-09-10T10:00:00Z"),
            endTime: new Date("2024-09-10T13:00:00Z"),
            allowList: [],
            disallowList: [],
          },
        ])
        .returning();
      console.log(insertedContests);

      // Insert contest participants
      await tx.insert(contestParticipants).values([
        { contestId: insertedContests[0].id, userId: insertedUsers[1].id },
        { contestId: insertedContests[0].id, userId: insertedUsers[3].id },
        { contestId: insertedContests[1].id, userId: insertedUsers[0].id },
        { contestId: insertedContests[1].id, userId: insertedUsers[1].id },
        { contestId: insertedContests[1].id, userId: insertedUsers[3].id },
      ]);

      // Insert programming problems with updated allowed languages
      const insertedProblems = await tx
        .insert(programmingProblems)
        .values([
          {
            description: "Write a function to find the nth Fibonacci number",
            allowedLanguages: ["javascript", "python", "c", "c++"],
          },
          {
            description: "Implement a function to reverse a string",
            allowedLanguages: ["javascript", "python", "c", "c++"],
          },
        ])
        .returning();
      console.log(insertedProblems);

      // Insert contest problems
      const insertedContestProblems = await tx
        .insert(contestProblems)
        .values([
          {
            contestId: insertedContests[0].id,
            problemId: insertedProblems[0].id,
            problemKind: "programming",
            order: 1,
          },
          {
            contestId: insertedContests[1].id,
            problemId: insertedProblems[1].id,
            problemKind: "programming",
            order: 1,
          },
        ])
        .returning();
      console.log(insertedContestProblems);

      // Insert programming test cases
      await tx.insert(programmingTestCases).values([
        {
          input: "5",
          output: "5",
          kind: "example",
          contestProblemId: insertedContestProblems[0].id,
        },
        {
          input: "10",
          output: "55",
          kind: "test",
          contestProblemId: insertedContestProblems[0].id,
        },
        {
          input: "hello",
          output: "olleh",
          kind: "example",
          contestProblemId: insertedContestProblems[1].id,
        },
        {
          input: "algorithm",
          output: "mhtirogla",
          kind: "test",
          contestProblemId: insertedContestProblems[1].id,
        },
      ]);

      // Insert programming submissions with standard library solutions
      await tx.insert(programmingSubmissions).values([
        {
          userId: insertedUsers[1].id,
          contestProblemId: insertedContestProblems[0].id,
          content: `
def fibonacci(n):
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

# Example usage
n = int(input())
print(fibonacci(n))
        `,
          language: "python",
          status: "accepted",
          executionTime: 100,
          memoryUsage: 5000,
        },
        {
          userId: insertedUsers[0].id,
          contestProblemId: insertedContestProblems[1].id,
          content: `
function reverseString(str) {
    return str.split('').reverse().join('');
}

// Example usage
const input = readline();
console.log(reverseString(input));
        `,
          language: "javascript",
          status: "accepted",
          executionTime: 50,
          memoryUsage: 3000,
        },
      ]);
    });

    console.log("Seed data inserted successfully");
  } catch (error) {
    console.error("Error inserting seed data:", error);
  }
}

// Call the function to insert the seed data
export async function GET() {
  try {
    await insertSeedData();
    return Response.json({ message: "Database seeded successfully" });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
