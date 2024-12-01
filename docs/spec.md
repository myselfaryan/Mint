# pariksa.app

## Table of Contents

- [pariksa.app](#pariksaapp)
  - [Table of Contents](#table-of-contents)
  - [Landing Page](#landing-page)
  - [Abstract Entities](#abstract-entities)
    - [User](#user)
    - [Organization](#organization)
    - [Groups](#groups)
    - [Problems](#problems)
    - [Contest](#contest)
    - [Submissions](#submissions)
  - [UI Pages](#ui-pages)
  - [Schema Design](#schema-design)
  - [API Design](#api-design)

## Landing Page

- Use Aceternity UI to list all our features

> [!NOTE]
> For simplicity we will reference our app as being hosted at `pariksa.app`

## Abstract Entities

The new schemas and entity design are compatible with the
[previous schemas](https://github.com/codegasms/pariksa/blob/main/db/schema.ts)
by @virinci, with minor changes sprinkled here and there, aimed at simplification!


### User

- A user can belong to multiple organizations
- A user can create, or participate in contests, only via an organization.

> [!WARNING]
> For simplification, a user cannot create a contest!

### Organization

- Every member of an org, when logged in will see `pariksa.app/uniqueOrgName`
- When a user tries to visit an org's page, they will see Unauthorized,
  if they are not part of the org
- "org" is the fundamental entity unit of organizing users
- One user can be part of multiple organizations (similar to GitHub, slack, linear)
- Entities linked with an organization
  - contests
  - users (with owner, admin, and member roles)
- Permission control within and outside organizations
  - All members of an org, can see all its contests
  - owners and admins can create contests
  - owner + admin(who created a contest) can edit a contest

### Groups

- Groups are a subset of members of an organization.
- These are useful for grouping the members per batches or courses
- A group contains just the information of members in this group.
  Just like a mailing list.
- In the db, a group just contains
  - Group Name
  - Group alias (a short unique slug,
  lowercase username style: alphanumeric, underscore and hyphen allowed)
  - List of user IDs associated with the group
- Contests can be aimed at specific groups.

### Problems

- Problems are fundamental units, and they can be re-used across contests
- All problems are tied to an organization, and only organization
  owners and admins can view all problems
- Organization members can see problems,
  only when they appear in a contest where the problem appears
- Attributes
  - problem description (markdown)
  - an array of test cases (shown/hidden)

### Contest

- Attributes
  - org
  - target groups (array of group IDs, special case: allow all org members):
  members who are allowed to participate in this contest
  - start and end time
  - details of organizers (editors of the contest)
  - array of problems this contest has (with ordering information)

> [!WARNING]
> Let's let go of the idea of registering for contests,
> as we are making contests for schools where by default everyone is registered

### Submissions

- Attributes:
  - contest ID
  - problem ID
  - user ID
  - code
  - submission time
  - penalty
  - execution results
- When the user POSTs submission,
  execution will be put to queue if other validations pass
- The object will be asynchronously updated later with execution results

## UI Pages


## Schema Design

## API Design
