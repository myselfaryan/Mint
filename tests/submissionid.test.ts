// tests/submissions.test.ts
import { POST, GET } from "@/app/api/orgs/[orgId]/submissions/route";
import { getOrgIdFromNameId } from "@/app/api/service";
import * as submissionService from "@/app/api/orgs/[orgId]/submissions/service";
import { NextRequest } from "next/server";

jest.mock("@/app/api/service", () => ({
  getOrgIdFromNameId: jest.fn(),
}));

jest.mock("@/app/api/orgs/[orgId]/submissions/service", () => ({
  getOrgSubmissions: jest.fn(),
  createSubmission: jest.fn(),
  getSubmission: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status || 200 })),
  },
}));

const mockOrgId = 1;
const mockSubmissionId = 101;
const validParams = { orgId: "test-org" };

const mockSubmission = {
  id: 101,
  userNameId: "user123",
  contestNameId: "abc-contest",
  problemId: 10,
  content: 'print("Hello")',
  language: "python",
};

const createMockRequest = (body: any): NextRequest =>
  ({
    json: async () => body,
  }) as unknown as NextRequest;

describe("GET /submissions", () => {
  beforeEach(jest.clearAllMocks);

  it("should return submissions successfully", async () => {
    (getOrgIdFromNameId as jest.Mock).mockResolvedValue(mockOrgId);
    (submissionService.getOrgSubmissions as jest.Mock).mockResolvedValue([
      mockSubmission,
    ]);

    const res = await GET({} as unknown as NextRequest, {
      params: validParams,
    });
    expect(res.status).toBe(200);
    expect(res.data).toEqual([mockSubmission]);
  });

  it("should return 404 if org not found", async () => {
    (getOrgIdFromNameId as jest.Mock).mockRejectedValue(
      new Error("Organization not found"),
    );

    const res = await GET({} as unknown as NextRequest, {
      params: validParams,
    });
    expect(res.status).toBe(404);
    expect(res.data).toEqual({ message: "Organization not found" });
  });
});

describe("POST /submissions", () => {
  beforeEach(jest.clearAllMocks);

  it("should create a submission successfully", async () => {
    (getOrgIdFromNameId as jest.Mock).mockResolvedValue(mockOrgId);
    (submissionService.createSubmission as jest.Mock).mockResolvedValue(
      mockSubmission,
    );

    const req = createMockRequest({
      userNameId: "user123",
      contestNameId: "abc-contest",
      problemId: 10,
      content: 'print("Hello")',
      language: "python",
    });

    const res = await POST(req, { params: validParams });
    expect(res.status).toBe(201);
    expect(res.data).toEqual(mockSubmission);
  });

  it("should return 400 for known error thrown by service", async () => {
    (getOrgIdFromNameId as jest.Mock).mockResolvedValue(mockOrgId);
    (submissionService.createSubmission as jest.Mock).mockRejectedValue(
      new Error("Invalid contest"),
    );

    const req = createMockRequest({
      userNameId: "user123",
      contestNameId: "abc-contest",
      problemId: 10,
      content: 'print("Hello")',
      language: "python",
    });

    const res = await POST(req, { params: validParams });
    expect(res.status).toBe(400);
    expect(res.data).toEqual({ message: "Invalid contest" });
  });

  it("should return 400 for invalid submission schema", async () => {
    const req = createMockRequest({});
    const res = await POST(req, { params: validParams });

    expect(res.status).toBe(400);
    expect(res.data.errors).toBeDefined();
  });
});

describe("GET /submissions/[submissionId]", () => {
  beforeEach(jest.clearAllMocks);

  it("should return a single submission successfully", async () => {
    const params = { orgId: "1", submissionId: "101" };
    (submissionService.getSubmission as jest.Mock).mockResolvedValue(
      mockSubmission,
    );

    const res = await import(
      "@/app/api/orgs/[orgId]/submissions/[submissionId]/route"
    ).then((m) => m.GET({} as unknown as NextRequest, { params }));
    expect(res.status).toBe(200);
    expect(res.data).toEqual(mockSubmission);
  });

  it("should return 404 if submission not found", async () => {
    const params = { orgId: "1", submissionId: "999" };
    (submissionService.getSubmission as jest.Mock).mockResolvedValue(null);

    const res = await import(
      "@/app/api/orgs/[orgId]/submissions/[submissionId]/route"
    ).then((m) => m.GET({} as unknown as NextRequest, { params }));
    expect(res.status).toBe(404);
    expect(res.data).toEqual({ message: "Submission not found" });
  });

  it("should return 400 for invalid input", async () => {
    const params = { orgId: "not-a-number", submissionId: "also-bad" };
    const res = await import(
      "@/app/api/orgs/[orgId]/submissions/[submissionId]/route"
    ).then((m) => m.GET({} as unknown as NextRequest, { params }));
    expect(res.status).toBe(400);
    expect(res.data.errors).toBeDefined();
  });
});
