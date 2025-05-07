// tests/users.test.ts
import { GET, POST } from "@/app/api/orgs/[orgId]/users/route";
import * as userService from "@/app/api/orgs/[orgId]/users/service";
import { getOrgIdFromNameId } from "@/app/api/service";
import { NextRequest } from "next/server";

jest.mock("@/app/api/service", () => ({
  getOrgIdFromNameId: jest.fn(),
}));

jest.mock("@/app/api/orgs/[orgId]/users/service", () => ({
  getOrgUsers: jest.fn(),
  inviteUser: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status || 200 })),
  },
}));

const mockOrgId = 1;
const validParams = { orgId: "test-org" };
const mockUser = { id: 1, email: "test@example.com" };
const createMockRequest = (body: any): NextRequest =>
  ({ json: async () => body }) as unknown as NextRequest;

describe("GET /users", () => {
  beforeEach(jest.clearAllMocks);

  it("should return users successfully", async () => {
    (getOrgIdFromNameId as jest.Mock).mockResolvedValue(mockOrgId);
    (userService.getOrgUsers as jest.Mock).mockResolvedValue([mockUser]);

    const res = await GET({} as unknown as NextRequest, {
      params: validParams,
    });
    expect(res.status).toBe(200);
    expect(res.data).toEqual([mockUser]);
  });

  it("should return 500 if fetching fails", async () => {
    (getOrgIdFromNameId as jest.Mock).mockResolvedValue(mockOrgId);
    (userService.getOrgUsers as jest.Mock).mockRejectedValue(
      new Error("DB error"),
    );

    const res = await GET({} as unknown as NextRequest, {
      params: validParams,
    });
    expect(res.status).toBe(500);
    expect(res.data).toEqual({ message: "Failed to fetch users" });
  });
});

describe("POST /users", () => {
  beforeEach(jest.clearAllMocks);

  it("should invite user successfully", async () => {
    const req = createMockRequest({
      email: "user@example.com",
      role: "member",
    });
    (getOrgIdFromNameId as jest.Mock).mockResolvedValue(mockOrgId);
    (userService.inviteUser as jest.Mock).mockResolvedValue({
      id: 123,
      orgId: mockOrgId,
      userId: 456,
    });

    const res = await POST(req, { params: validParams });
    expect(res.status).toBe(201);
    expect(res.data.orgId).toBe(mockOrgId);
  });

  it("should return 400 for invalid request body", async () => {
    const req = createMockRequest({});
    const res = await POST(req, { params: validParams });

    expect(res.status).toBe(400);
    expect(res.data.errors).toBeDefined();
  });

  it("should return 400 for service errors", async () => {
    const req = createMockRequest({
      email: "user@example.com",
      role: "member",
    });
    (getOrgIdFromNameId as jest.Mock).mockResolvedValue(mockOrgId);
    (userService.inviteUser as jest.Mock).mockRejectedValue(
      new Error("User already exists"),
    );

    const res = await POST(req, { params: validParams });
    expect(res.status).toBe(400);
    expect(res.data).toEqual({ message: "User already exists" });
  });
});
