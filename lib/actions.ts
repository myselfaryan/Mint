import {
  userEmails,
  SelectUser,
  users,
  SelectContest,
  SelectOrg,
  SelectMembership,
  memberships,
  orgs
} from '@/db/schema';
import { db } from '@/db/drizzle';
import { and, eq } from 'drizzle-orm';
import { verifyPassword } from './password';

export type Membership = Pick<SelectMembership, 'role' | 'joinedAt'> &
  SelectUser & { orgNameId: string };

export async function getUserByEmailAndPassword(
  email: string,
  password: string
): Promise<SelectUser | null> {
  const user = await db
    .select()
    .from(users)
    .innerJoin(userEmails, eq(users.id, userEmails.userId))
    .where(and(eq(userEmails.email, email)))
    .limit(1)
    .then((rows) => rows[0]?.users ?? null);

  return (await verifyPassword(password, user.hashedPassword)) ? user : null;
}

/*
 * Get all the organizations.
 */
export async function getOrgs(): Promise<SelectOrg[]> {}

/*
 * Return all the organization members along with the membership information.
 */
export async function getOrgMembers(): Promise<Membership[]> {
  const members = await db
    .select()
    .from(users)
    .innerJoin(memberships, eq(users.id, memberships.userId))
    .innerJoin(orgs, eq(memberships.orgId, orgs.id))
    .then((rows) =>
      rows.map((row) => {
        const { id, nameId, name, hashedPassword, createdAt, about, avatar } =
          row.users;
        const { nameId: orgNameId, name: orgName } = row.orgs;
        const { role, joinedAt } = row.memberships;
        return {
          id,
          nameId,
          name,
          hashedPassword,
          createdAt,
          about,
          avatar,
          orgNameId,
          orgName,
          role,
          joinedAt
        };
      })
    );

  return members;
}

export async function getUserContests(
  username: string
): Promise<SelectContest[]> {}

/*
export async function getUserByUsername(username: string): Promise<User> { }

export async function createSubmission(
  submission: Submission
): Promise<boolean> {
  return false;
}

export async function createUser(user: User): Promise<boolean> {
  return false;
}

export async function createContest(contest: Contest): Promise<boolean> {
  return false;
}

export async function registerContest(
  contest: Contest,
  username: string
): Promise<boolean> {
  return false;
}
*/
