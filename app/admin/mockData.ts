export interface Organization {
  id: number;
  nameId: string;
  name: string;
  about: string | null;
  createdAt: string;
  contestsCount: number;
  ownerUsers: number;
  organizerUsers: number;
  memberUsers: number;
  problemsCount: number;
  submissionsCount: number;
}

export interface PlatformStats {
  totalOrgs: number;
  totalContests: number;
  totalUsers: number;
  totalProblems: number;
  totalSubmissions: number;
}

export interface AdminData {
  platformStats: PlatformStats;
  organizations: Organization[];
}

export const mockData: AdminData = {
  "platformStats": {
    "totalOrgs": 21,
    "totalContests": 2,
    "totalUsers": 40,
    "totalProblems": 1,
    "totalSubmissions": 3
  },
  "organizations": [
    {
      "id": 1,
      "nameId": "openai_org",
      "name": "OpenAI Organization",
      "about": "An organization focused on artificial intelligence research.",
      "createdAt": "2024-12-04T20:43:39.366Z",
      "contestsCount": 0,
      "ownerUsers": 1,
      "organizerUsers": 0,
      "memberUsers": 0,
      "problemsCount": 0,
      "submissionsCount": 0
    },
    // ... rest of the organizations data
  ]
}
