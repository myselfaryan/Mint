export interface Group {
  id?: number;
  nameId: string;
  name: string;
  createdAt: string;
  about?: string;
  avatar?: string;
  users: string; // user emails seperated by newline
  usersCount?: number;
}

export const mockGroups: Group[] = [
  {
    id: 1,
    nameId: "engineering-team",
    name: "Engineering Team",
    createdAt: "2024-15-01",
    about: "Core engineering team responsible for product development",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=ET",
    users:
      "john.doe@example.com\nalice.smith@example.com\nbob.wilson@example.com",
  },
  {
    id: 2,
    nameId: "design-team",
    name: "Design Team",
    createdAt: "2024-16-01",
    about: "Product design and UX team",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=DT",
    users: "sarah.designer@example.com\nmike.ux@example.com",
  },
  {
    id: 3,
    nameId: "marketing",
    name: "Marketing Team",
    createdAt: "2024-17-01",
    about: "Marketing and growth team",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=MT",
    users:
      "emma.marketing@example.com\njames.growth@example.com\nlisa.social@example.com",
  },
  {
    id: 4,
    nameId: "product-team",
    name: "Product Team",
    createdAt: "2024-18-01",
    about: "Product management and strategy",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=PT",
    users: "david.pm@example.com\nanna.product@example.com",
  },
];
