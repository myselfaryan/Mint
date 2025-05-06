// tests/problems.test.ts
import {
  POST,
  GET,
  DELETE,
} from "@/app/api/orgs/[orgId]/contests/[contestId]/problems/route";
import * as problemService from "@/app/api/orgs/[orgId]/contests/[contestId]/problems/service";
import { getOrgIdFromNameId, getContestIdFromNameId } from "@/app/api/service";
import { getProblemIdFromCode } from "@/app/api/orgs/[orgId]/problems/service";

import { NextRequest } from "next/server";

jest.mock(
  "@/app/api/orgs/[orgId]/contests/[contestId]/problems/service",
  () => ({
    addProblemToContest: jest.fn(),
    getContestProblems: jest.fn(),
    removeProblemFromContest: jest.fn(),
  }),
);

jest.mock("@/app/api/service", () => ({
  getOrgIdFromNameId: jest.fn(),
  getContestIdFromNameId: jest.fn(),
}));

jest.mock("@/app/api/orgs/[orgId]/contests/problems/service", () => ({
  getProblemIdFromCode: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status || 200 })),
  },
}));

const mockOrgId = 1;
const mockContestId = 2;
const mockProblemId = 3;
const mockProblemCode = "mock-problem";
const validParams = { orgId: "test-org", contestId: "test-contest" };
const createMockRequest = (body: any): NextRequest =>
  ({ json: async () => body }) as unknown as NextRequest;

describe("POST /problems", () => {
  beforeEach(jest.clearAllMocks);

  it("should add a problem successfully", async () => {
    (getOrgIdFromNameId as jest.Mock).mockResolvedValue(mockOrgId);
    (getContestIdFromNameId as jest.Mock).mockResolvedValue(mockContestId);
    (getProblemIdFromCode as jest.Mock).mockResolvedValue(mockProblemId);
    (problemService.addProblemToContest as jest.Mock).mockResolvedValue({
      id: mockProblemId,
    });

    const req = createMockRequest({ problemCode: mockProblemCode });
    const res = await POST(req, { params: validParams });

    expect(res.status).toBe(201);
    expect(res.data).toEqual({ id: mockProblemId });
  });

  it("should return 409 if problem already added", async () => {
    (getOrgIdFromNameId as jest.Mock).mockResolvedValue(mockOrgId);
    (getContestIdFromNameId as jest.Mock).mockResolvedValue(mockContestId);
    (getProblemIdFromCode as jest.Mock).mockResolvedValue(mockProblemId);
    (problemService.addProblemToContest as jest.Mock).mockRejectedValue(
      new Error("Problem already added to contest"),
    );

    const req = createMockRequest({ problemCode: mockProblemCode });
    const res = await POST(req, { params: validParams });
    expect(res.status).toBe(409);
    expect(res.data).toEqual({ error: "Problem already added to contest" });
  });
});

describe("GET /problems", () => {
  beforeEach(jest.clearAllMocks);

  it("should return problems successfully", async () => {
    (getOrgIdFromNameId as jest.Mock).mockResolvedValue(mockOrgId);
    (getContestIdFromNameId as jest.Mock).mockResolvedValue(mockContestId);
    (problemService.getContestProblems as jest.Mock).mockResolvedValue([
      { id: mockProblemId },
    ]);

    const res = await GET({} as unknown as NextRequest, {
      params: validParams,
    });
    expect(res.status).toBe(200);
    expect(res.data).toEqual([{ id: mockProblemId }]);
  });
});

describe("DELETE /problems", () => {
  beforeEach(jest.clearAllMocks);

  it("should remove a problem successfully", async () => {
    const deleteParams = { ...validParams, problemId: mockProblemCode };
    (getOrgIdFromNameId as jest.Mock).mockResolvedValue(mockOrgId);
    (getContestIdFromNameId as jest.Mock).mockResolvedValue(mockContestId);
    (problemService.removeProblemFromContest as jest.Mock).mockResolvedValue(
      undefined,
    );

    const req = createMockRequest({});
    const res = await DELETE(req, { params: deleteParams });
    expect(res.status).toBe(204);
  });
});
