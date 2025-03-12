import { relations } from "drizzle-orm";
import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  primaryKey,
  varchar,
  index,
  uniqueIndex,
  boolean,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email").notNull().unique(),

  nameId: text("name_id").notNull().unique(),
  name: text("name").notNull(),

  hashedPassword: text("hashed_password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isSuperuser: boolean("is_superuser").default(false).notNull(),
  about: text("about"),
  avatar: text("avatar"),
});

export const orgs = pgTable("orgs", {
  id: serial("id").primaryKey(),

  nameId: text("name_id").notNull().unique(),
  name: text("name").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  about: text("about"),
  avatar: text("avatar"),
});

export const memberships = pgTable(
  "memberships",
  {
    orgId: integer("org_id")
      .notNull()
      .references(() => orgs.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    role: text("role", { enum: ["owner", "organizer", "member"] }).notNull(),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.orgId, table.userId] }),

      orgIdIdx: index("org_id_idx").on(table.orgId),
      userIdIdx: index("user_id_idx").on(table.userId),
    };
  },
);

export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),

  nameId: text("name_id").notNull().unique(),
  name: text("name").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  about: text("about"),
  avatar: text("avatar"),

  orgId: integer("org_id")
    .notNull()
    .references(() => orgs.id, { onDelete: "cascade" }),
});

export const groupMemberships = pgTable(
  "group_memberships",
  {
    groupId: integer("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.groupId, table.userId] }),
      groupIdIdx: index("group_id_idx").on(table.groupId),
      groupUserIdIdx: index("group_user_id_idx").on(table.userId),
    };
  },
);

export const contests = pgTable(
  "contests",
  {
    id: serial("id").primaryKey(),

    nameId: text("name_id").notNull(),
    name: text("name").notNull(),

    organizerId: integer("organizer_id").notNull(),
    // TODO: remove organizerKind
    organizerKind: varchar("organizerKind", {
      length: 10,
      enum: ["user", "org"],
    })
      .notNull()
      .default("org"),

    description: text("description").notNull(), // Use Markdown for description
    rules: text("rules").notNull(),

    // remove
    registrationStartTime: timestamp("registration_start_time").notNull(),
    registrationEndTime: timestamp("registration_end_time").notNull(),

    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time").notNull(),

    // remove
    allowList: text("allow_list").array().notNull(),
    disallowList: text("disallow_list").array().notNull(),
  },
  (table) => {
    return {
      organizerIdx: index("organizer_idx").on(table.organizerId),
      startTimeIdx: index("start_time_idx").on(table.startTime),
      endTimeIdx: index("end_time_idx").on(table.endTime),
    };
  },
);

export const contestParticipants = pgTable(
  "contest_participants",
  {
    contestId: integer("contest_id")
      .notNull()
      .references(() => contests.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    registeredAt: timestamp("registered_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.contestId, table.userId] }),
      contestParticipantContestIdx: index("contest_participant_contest_idx").on(
        table.contestId,
      ),
      contestParticipantUserIdx: index("contest_participant_user_idx").on(
        table.userId,
      ),
    };
  },
);

export const problems = pgTable("problems", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  allowedLanguages: text("allowed_languages").array().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  orgId: integer("org_id")
    .references(() => orgs.id, { onDelete: "cascade" })
    .notNull(),
});

export const testCases = pgTable(
  "test_cases",
  {
    id: serial("id").primaryKey(),

    input: text("input").notNull(),
    output: text("output").notNull(),
    kind: text("kind", { enum: ["example", "test"] }).default("test"),

    problemId: integer("problem_id")
      .references(() => problems.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => {
    return {
      problemIdIdx: index("problem_id_idx").on(table.problemId),
    };
  },
);

export const problemsRelations = relations(problems, ({ many }) => ({
  testCases: many(testCases),
}));

export const testCasesRelations = relations(testCases, ({ one }) => ({
  problem: one(problems, {
    fields: [testCases.problemId],
    references: [problems.id],
  }),
}));

export const contestProblems = pgTable(
  "contest_problems",
  {
    id: serial("id").primaryKey(),

    contestId: integer("contest_id")
      .notNull()
      .references(() => contests.id, { onDelete: "cascade" }),
    problemId: integer("problem_id")
      .notNull()
      .references(() => problems.id),

    order: integer("order").notNull(),
  },
  (table) => {
    return {
      uniqueConstraint: uniqueIndex("contest_problem_unique_constraint").on(
        table.contestId,
        table.problemId,
      ),
      contestIdx: index("contest_idx").on(table.contestId),
      orderIdx: index("order_idx").on(table.contestId, table.order),
    };
  },
);

export const problemSubmissions = pgTable(
  "problem_submissions",
  {
    id: serial("id").primaryKey(),

    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    contestProblemId: integer("contest_problem_id")
      .notNull()
      .references(() => contestProblems.id, { onDelete: "cascade" }),

    content: text("content").notNull(),
    language: text("language").notNull(),
    submittedAt: timestamp("submitted_at").defaultNow().notNull(),

    status: text("status").notNull(), // e.g., 'pending', 'accepted', 'rejected'
    executionTime: integer("execution_time"),
    memoryUsage: integer("memory_usage"),
  },
  (table) => {
    return {
      userIdx: index("user_idx").on(table.userId),
      contestProblemIdx: index("contest_problem_idx").on(
        table.contestProblemId,
      ),
      submittedAtIdx: index("submitted_at_idx").on(table.submittedAt),
    };
  },
);

export const sessionTable = pgTable("session", {
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export type SelectUser = typeof users.$inferSelect;
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type SelectOrg = typeof orgs.$inferSelect;
export type InsertOrg = typeof orgs.$inferInsert;

export type SelectMembership = typeof memberships.$inferSelect;
export type InsertMembership = typeof memberships.$inferInsert;

export type SelectContest = typeof contests.$inferSelect;
export type InsertContest = typeof contests.$inferInsert;

export type SelectContestParticipant = typeof contestParticipants.$inferSelect;
export type InsertContestParticipant = typeof contestParticipants.$inferInsert;

export type SelectTestCase = typeof testCases.$inferSelect;
export type InsertTestCase = typeof testCases.$inferInsert;

export type SelectProblem = typeof problems.$inferSelect;
export type InsertProblem = typeof problems.$inferInsert;

export type SelectContestProblem = typeof contestProblems.$inferSelect;
export type InsertContestProblem = typeof contestProblems.$inferInsert;

export type SelectProblemSubmission = typeof problemSubmissions.$inferSelect;
export type InsertProblemSubmission = typeof problemSubmissions.$inferInsert;

export type Session = typeof sessionTable.$inferSelect;
