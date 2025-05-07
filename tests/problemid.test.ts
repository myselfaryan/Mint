// tests/problem-detail.test.ts
import {
  GET,
  PATCH,
  DELETE,
} from "@/app/api/orgs/[orgId]/problems/[problemId]/route";
import * as problemService from "@/app/api/orgs/[orgId]/problems/[problemId]/service";
import { getOrgIdFromNameId } from "@/app/api/service";
import { NextRequest } from "next/server";

jest.mock("@/app/api/orgs/[orgId]/problems/[problemId]/service", () => ({
  getProblem: jest.fn(),
  updateProblem: jest.fn(),
  deleteProblem: jest.fn(),
}));

jest.mock("@/app/api/service", () => ({
  getOrgIdFromNameId: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status || 200 })),
  },
}));

const mockOrgId = 1;
const mockProblemCode = "mock-prob";
const validParams = { orgId: "org-name", problemId: mockProblemCode };
const mockProblem = { code: mockProblemCode, title: "Test Problem" };
const createMockRequest = (body: any): NextRequest =>
  ({ json: async () => body }) as unknown as NextRequest;

describe("GET /problems/:problemId", () => {
  beforeEach(jest.clearAllMocks);

  it("should return problem details", async () => {
    (getOrgIdFromNameId as jest.Mock).mockResolvedValue(mockOrgId);
    (problemService.getProblem as jest.Mock).mockResolvedValue(mockProblem);

    const res = await GET({} as NextRequest, { params: validParams });
    expect(res.status).toBe(200);
    expect(res.data).toEqual(mockProblem);
  });

  it("should return 404 if not found", async () => {
    (getOrgIdFromNameId as jest.Mock).mockResolvedValue(mockOrgId);
    (problemService.getProblem as jest.Mock).mockRejectedValue(
      new Error("Problem not found"),
    );

    const res = await GET({} as NextRequest, { params: validParams });
    expect(res.status).toBe(404);
    expect(res.data).toEqual({ error: "Problem not found" });
  });
});

describe("PATCH /problems/:problemId", () => {
  beforeEach(jest.clearAllMocks);

  it("should update problem successfully", async () => {
    const updateData = { title: "Updated Title" };
    (getOrgIdFromNameId as jest.Mock).mockResolvedValue(mockOrgId);
    (problemService.updateProblem as jest.Mock).mockResolvedValue({
      ...mockProblem,
      ...updateData,
    });

    const req = createMockRequest(updateData);
    const res = await PATCH(req, { params: validParams });
    expect(res.status).toBe(200);
    expect(res.data).toEqual({ ...mockProblem, ...updateData });
  });

  it("should return 404 if problem not found during update", async () => {
    (getOrgIdFromNameId as jest.Mock).mockResolvedValue(mockOrgId);
    (problemService.updateProblem as jest.Mock).mockRejectedValue(
      new Error("Problem not found"),
    );

    const req = createMockRequest({ title: "Try Update" });
    const res = await PATCH(req, { params: validParams });
    expect(res.status).toBe(404);
    expect(res.data).toEqual({ error: "Problem not found" });
  });
});

describe("DELETE /problems/:problemId", () => {
  beforeEach(jest.clearAllMocks);

  it("should delete problem successfully", async () => {
    (getOrgIdFromNameId as jest.Mock).mockResolvedValue(mockOrgId);
    (problemService.deleteProblem as jest.Mock).mockResolvedValue(undefined);

    const res = await DELETE({} as NextRequest, { params: validParams });
    expect(res.status).toBe(204);
  });

  it("should return 404 if problem not found", async () => {
    (getOrgIdFromNameId as jest.Mock).mockResolvedValue(mockOrgId);
    (problemService.deleteProblem as jest.Mock).mockRejectedValue(
      new Error("Problem not found"),
    );

    const res = await DELETE({} as NextRequest, { params: validParams });
    expect(res.status).toBe(404);
    expect(res.data).toEqual({ error: "Problem not found" });
  });

  it("should return 409 if problem is used in contests", async () => {
    (getOrgIdFromNameId as jest.Mock).mockResolvedValue(mockOrgId);
    (problemService.deleteProblem as jest.Mock).mockRejectedValue(
      new Error("Problem is used in contests"),
    );

    const res = await DELETE({} as NextRequest, { params: validParams });
    expect(res.status).toBe(409);
    expect(res.data).toEqual({ error: "Problem is used in contests" });
  });
});
