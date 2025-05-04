// tests/participants.test.ts
import {
  POST,
  GET,
  DELETE,
} from "@/app/api/orgs/[orgId]/contests/[contestId]/participants/route";
import * as participantService from "@/app/api/orgs/[orgId]/contests/[contestId]/participants/service";
import { getOrgIdFromNameId, getContestIdFromNameId } from "@/app/api/service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

jest.mock(
  "@/app/api/orgs/[orgId]/contests/[contestId]/participants/service",
  () => ({
    registerParticipant: jest.fn(),
    getContestParticipants: jest.fn(),
    removeParticipant: jest.fn(),
  }),
);

jest.mock("@/app/api/service", () => ({
  getOrgIdFromNameId: jest.fn(),
  getContestIdFromNameId: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status || 200 })),
  },
}));

const mockOrgId = 1;
const mockContestId = 2;
const mockEmail = "test@example.com";
const validParams = { orgId: "test-org", contestId: "test-contest" };

const createMockRequest = (body: any): NextRequest =>
  ({
    json: async () => body,
  }) as unknown as NextRequest;

describe("POST /participants", () => {
  beforeEach(jest.clearAllMocks);

  it("should register a participant successfully", async () => {
    (getOrgIdFromNameId as jest.Mock).mockResolvedValue(mockOrgId);
    (getContestIdFromNameId as jest.Mock).mockResolvedValue(mockContestId);
    (participantService.registerParticipant as jest.Mock).mockResolvedValue({
      email: mockEmail,
    });

    const req = createMockRequest({ email: mockEmail });
    const res = await POST(req, { params: validParams });
    expect(res.status).toBe(201);
    expect(res.data).toEqual({ email: mockEmail });
  });

  it("should return 400 on Zod validation error", async () => {
    const req = createMockRequest({ email: "invalid" });
    const res = await POST(req, {
      params: { orgId: "invalid org!", contestId: "bad/id" },
    });
    expect(res.status).toBe(400);
    expect(res.data).toHaveProperty("error");
  });

  it("should return 403 for disallowed errors", async () => {
    (getOrgIdFromNameId as jest.Mock).mockResolvedValue(mockOrgId);
    (getContestIdFromNameId as jest.Mock).mockResolvedValue(mockContestId);
    (participantService.registerParticipant as jest.Mock).mockRejectedValue(
      new Error("User already registered"),
    );

    const req = createMockRequest({ email: mockEmail });
    const res = await POST(req, { params: validParams });
    expect(res.status).toBe(403);
    expect(res.data).toEqual({ error: "User already registered" });
  });
});

describe("GET /participants", () => {
  beforeEach(jest.clearAllMocks);

  it("should return participants successfully", async () => {
    (getOrgIdFromNameId as jest.Mock).mockResolvedValue(mockOrgId);
    (getContestIdFromNameId as jest.Mock).mockResolvedValue(mockContestId);
    (participantService.getContestParticipants as jest.Mock).mockResolvedValue([
      { email: mockEmail },
    ]);

    const res = await GET({} as unknown as NextRequest, {
      params: validParams,
    });
    expect(res.status).toBe(200);
    expect(res.data).toEqual([{ email: mockEmail }]);
  });

  it("should return 404 for not found errors", async () => {
    (getOrgIdFromNameId as jest.Mock).mockRejectedValue(
      new Error("Organization not found"),
    );
    const res = await GET({} as unknown as NextRequest, {
      params: validParams,
    });
    expect(res.status).toBe(404);
    expect(res.data).toEqual({ error: "Organization not found" });
  });
});

describe("DELETE /participants", () => {
  beforeEach(jest.clearAllMocks);

  it("should remove participant successfully", async () => {
    (getOrgIdFromNameId as jest.Mock).mockResolvedValue(mockOrgId);
    (getContestIdFromNameId as jest.Mock).mockResolvedValue(mockContestId);
    (participantService.removeParticipant as jest.Mock).mockResolvedValue(
      undefined,
    );

    const req = createMockRequest({ email: mockEmail });
    const res = await DELETE(req, { params: validParams });
    expect(res.status).toBe(204);
  });

  it("should return 404 if user not registered", async () => {
    (getOrgIdFromNameId as jest.Mock).mockResolvedValue(mockOrgId);
    (getContestIdFromNameId as jest.Mock).mockResolvedValue(mockContestId);
    (participantService.removeParticipant as jest.Mock).mockRejectedValue(
      new Error("User not registered"),
    );

    const req = createMockRequest({ email: mockEmail });
    const res = await DELETE(req, { params: validParams });
    expect(res.status).toBe(404);
    expect(res.data).toEqual({ error: "User not registered" });
  });
});
