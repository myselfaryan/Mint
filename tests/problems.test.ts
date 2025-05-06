// // tests/problems.test.ts
// import {
//   POST,
//   GET,
//   DELETE,
// } from "@/app/api/orgs/[orgId]/contests/[contestId]/problems/route";
// import * as problemService from "@/app/api/orgs/[orgId]/contests/[contestId]/problems/service";
// import { getOrgIdFromNameId, getContestIdFromNameId } from "@/app/api/service";
// import { getProblemIdFromCode } from "@/app/api/orgs/[orgId]/problems/service";

// import { NextRequest } from "next/server";

// jest.mock(
//   "@/app/api/orgs/[orgId]/contests/[contestId]/problems/service",
//   () => ({
//     addProblemToContest: jest.fn(),
//     getContestProblems: jest.fn(),
//     removeProblemFromContest: jest.fn(),
//   }),
// );

// jest.mock("@/app/api/service", () => ({
//   getOrgIdFromNameId: jest.fn(),
//   getContestIdFromNameId: jest.fn(),
// }));

// jest.mock("@/app/api/orgs/[orgId]/contests/problems/service", () => ({
//   getProblemIdFromCode: jest.fn(),
// }));

// jest.mock("next/server", () => ({
//   NextResponse: {
//     json: jest.fn((data, init) => ({ data, status: init?.status || 200 })),
//   },
// }));

// const mockOrgId = 1;
// const mockContestId = 2;
// const mockProblemId = 3;
// const mockProblemCode = "mock-problem";
// const validParams = { orgId: "test-org", contestId: "test-contest" };
// const createMockRequest = (body: any): NextRequest =>
//   ({ json: async () => body }) as unknown as NextRequest;

// describe("POST /problems", () => {
//   beforeEach(jest.clearAllMocks);

//   it("should add a problem successfully", async () => {
//     (getOrgIdFromNameId as jest.Mock).mockResolvedValue(mockOrgId);
//     (getContestIdFromNameId as jest.Mock).mockResolvedValue(mockContestId);
//     (getProblemIdFromCode as jest.Mock).mockResolvedValue(mockProblemId);
//     (problemService.addProblemToContest as jest.Mock).mockResolvedValue({
//       id: mockProblemId,
//     });

//     const req = createMockRequest({ problemCode: mockProblemCode });
//     const res = await POST(req, { params: validParams });

//     expect(res.status).toBe(201);
//     expect(res.data).toEqual({ id: mockProblemId });
//   });

//   it("should return 409 if problem already added", async () => {
//     (getOrgIdFromNameId as jest.Mock).mockResolvedValue(mockOrgId);
//     (getContestIdFromNameId as jest.Mock).mockResolvedValue(mockContestId);
//     (getProblemIdFromCode as jest.Mock).mockResolvedValue(mockProblemId);
//     (problemService.addProblemToContest as jest.Mock).mockRejectedValue(
//       new Error("Problem already added to contest"),
//     );

//     const req = createMockRequest({ problemCode: mockProblemCode });
//     const res = await POST(req, { params: validParams });
//     expect(res.status).toBe(409);
//     expect(res.data).toEqual({ error: "Problem already added to contest" });
//   });
// });

// describe("GET /problems", () => {
//   beforeEach(jest.clearAllMocks);

//   it("should return problems successfully", async () => {
//     (getOrgIdFromNameId as jest.Mock).mockResolvedValue(mockOrgId);
//     (getContestIdFromNameId as jest.Mock).mockResolvedValue(mockContestId);
//     (problemService.getContestProblems as jest.Mock).mockResolvedValue([
//       { id: mockProblemId },
//     ]);

//     const res = await GET({} as unknown as NextRequest, {
//       params: validParams,
//     });
//     expect(res.status).toBe(200);
//     expect(res.data).toEqual([{ id: mockProblemId }]);
//   });
// });

// describe("DELETE /problems", () => {
//   beforeEach(jest.clearAllMocks);

//   it("should remove a problem successfully", async () => {
//     const deleteParams = { ...validParams, problemId: mockProblemCode };
//     (getOrgIdFromNameId as jest.Mock).mockResolvedValue(mockOrgId);
//     (getContestIdFromNameId as jest.Mock).mockResolvedValue(mockContestId);
//     (problemService.removeProblemFromContest as jest.Mock).mockResolvedValue(
//       undefined,
//     );

//     const req = createMockRequest({});
//     const res = await DELETE(req, { params: deleteParams });
//     expect(res.status).toBe(204);
//   });
// });




import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import * as problemService from "@/app/api/orgs/[orgId]/contests/[contestId]/problems/service";
import { getOrgIdFromNameId, getContestIdFromNameId } from "@/app/api/service";
import { addProblemSchema, NameIdSchema } from "@/lib/validations";
import { getProblemIdFromCode } from "@/app/api/orgs/[orgId]/problems/service";
import { POST, GET, DELETE } from "@/app/api/orgs/[orgId]/contests/[contestId]/problems/route";

// Mock the imported modules
jest.mock("next/server", () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data, options) => ({ data, options })),
  },
}));

jest.mock("zod", () => {
  const actual = jest.requireActual("zod");
  return {
    ...actual,
    ZodError: class MockZodError extends Error {
      errors: any[];
      constructor(errors: any[]) {
        super("Validation Error");
        this.errors = errors;
        this.name = "ZodError";
      }
    },
  };
});

jest.mock("@/app/api/orgs/[orgId]/contests/[contestId]/problems/service", () => ({
  addProblemToContest: jest.fn(),
  getContestProblems: jest.fn(),
  removeProblemFromContest: jest.fn(),
}));

jest.mock("@/app/api/service", () => ({
  getOrgIdFromNameId: jest.fn(),
  getContestIdFromNameId: jest.fn(),
}));

jest.mock("@/lib/validations", () => ({
  addProblemSchema: {
    parse: jest.fn(),
  },
  NameIdSchema: {
    parse: jest.fn((value) => value),
  },
}));

jest.mock("@/app/api/orgs/[orgId]/problems/service", () => ({
  getProblemIdFromCode: jest.fn(),
}));

describe("Contest Problems API Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST endpoint - Add Problem to Contest", () => {
    const mockParams = {
      orgId: "org-abc",
      contestId: "contest-123",
    };

    const mockRequestBody = {
      problemCode: "PROB-123",
      order: 1,
    };

    const mockOrgId = 1;
    const mockContestId = 2;
    const mockProblemId = 3;
    const mockAddedProblem = {
      id: 100,
      contestId: mockContestId,
      problemId: mockProblemId,
      order: 1,
    };

    beforeEach(() => {
      // Default mock implementations
      const mockRequest = {
        json: jest.fn().mockResolvedValue(mockRequestBody),
      };
      Object.defineProperty(NextRequest, "prototype", { value: mockRequest });

      getOrgIdFromNameId.mockResolvedValue(mockOrgId);
      getContestIdFromNameId.mockResolvedValue(mockContestId);
      getProblemIdFromCode.mockResolvedValue(mockProblemId);
      addProblemSchema.parse.mockReturnValue(mockRequestBody);
      problemService.addProblemToContest.mockResolvedValue(mockAddedProblem);
    });

    it("should successfully add a problem to a contest", async () => {
      // Call the function
      const result = await POST(new NextRequest(), { params: mockParams });

      // Assertions
      expect(NameIdSchema.parse).toHaveBeenCalledWith(mockParams.orgId);
      expect(NameIdSchema.parse).toHaveBeenCalledWith(mockParams.contestId);
      expect(getOrgIdFromNameId).toHaveBeenCalledWith(mockParams.orgId);
      expect(getContestIdFromNameId).toHaveBeenCalledWith(mockOrgId, mockParams.contestId);
      expect(addProblemSchema.parse).toHaveBeenCalledWith(mockRequestBody);
      expect(getProblemIdFromCode).toHaveBeenCalledWith(mockOrgId, mockRequestBody.problemCode);
      expect(problemService.addProblemToContest).toHaveBeenCalledWith(
        mockContestId,
        mockProblemId,
        mockRequestBody.order
      );
      expect(NextResponse.json).toHaveBeenCalledWith(mockAddedProblem, { status: 201 });
      expect(result).toEqual({
        data: mockAddedProblem,
        options: { status: 201 },
      });
    });

    it("should handle case when order is not provided", async () => {
      // Setup
      const bodyWithoutOrder = { problemCode: "PROB-123" };
      NextRequest.prototype.json.mockResolvedValueOnce(bodyWithoutOrder);
      addProblemSchema.parse.mockReturnValueOnce(bodyWithoutOrder);

      // Call the function
      await POST(new NextRequest(), { params: mockParams });

      // Assertions
      expect(problemService.addProblemToContest).toHaveBeenCalledWith(
        mockContestId,
        mockProblemId,
        0 // Default order value
      );
    });

    it("should return 400 for validation errors", async () => {
      // Setup validation error
      const validationErrors = [{ path: ["problemCode"], message: "Required" }];
      const zodError = new z.ZodError(validationErrors);
      addProblemSchema.parse.mockImplementation(() => {
        throw zodError;
      });

      // Call the function
      const result = await POST(new NextRequest(), { params: mockParams });

      // Assertions
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: validationErrors },
        { status: 400 }
      );
      expect(result).toEqual({
        data: { error: validationErrors },
        options: { status: 400 },
      });
    });

    it("should return 404 when organization is not found", async () => {
      // Setup
      const notFoundError = new Error("Organization not found");
      getOrgIdFromNameId.mockRejectedValue(notFoundError);

      // Call the function
      const result = await POST(new NextRequest(), { params: mockParams });

      // Assertions
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "Organization not found" },
        { status: 404 }
      );
      expect(result).toEqual({
        data: { error: "Organization not found" },
        options: { status: 404 },
      });
    });

    it("should return 404 when contest is not found", async () => {
      // Setup
      const notFoundError = new Error("Contest not found");
      getContestIdFromNameId.mockRejectedValue(notFoundError);

      // Call the function
      const result = await POST(new NextRequest(), { params: mockParams });

      // Assertions
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "Contest not found" },
        { status: 404 }
      );
      expect(result).toEqual({
        data: { error: "Contest not found" },
        options: { status: 404 },
      });
    });

    it("should return 404 when problem is not found", async () => {
      // Setup
      const notFoundError = new Error("Problem not found");
      getProblemIdFromCode.mockRejectedValue(notFoundError);

      // Call the function
      const result = await POST(new NextRequest(), { params: mockParams });

      // Assertions
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "Problem not found" },
        { status: 404 }
      );
      expect(result).toEqual({
        data: { error: "Problem not found" },
        options: { status: 404 },
      });
    });

    it("should return 409 when problem is already added to contest", async () => {
      // Setup
      const conflictError = new Error("Problem already added to contest");
      problemService.addProblemToContest.mockRejectedValue(conflictError);

      // Call the function
      const result = await POST(new NextRequest(), { params: mockParams });

      // Assertions
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "Problem already added to contest" },
        { status: 409 }
      );
      expect(result).toEqual({
        data: { error: "Problem already added to contest" },
        options: { status: 409 },
      });
    });

    it("should return 500 for unexpected errors", async () => {
      // Setup
      const unexpectedError = new Error("Unexpected database error");
      problemService.addProblemToContest.mockRejectedValue(unexpectedError);

      // Call the function
      const result = await POST(new NextRequest(), { params: mockParams });

      // Assertions
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "Failed to add problem to contest" },
        { status: 500 }
      );
      expect(result).toEqual({
        data: { error: "Failed to add problem to contest" },
        options: { status: 500 },
      });
    });
  });

  describe("GET endpoint - Fetch Contest Problems", () => {
    const mockParams = {
      orgId: "org-abc",
      contestId: "contest-123",
    };

    const mockOrgId = 1;
    const mockContestId = 2;
    const mockProblems = [
      {
        id: 100,
        contestId: 2,
        problemId: 3,
        order: 1,
        problem: { id: 3, code: "PROB-A", title: "Problem A" },
      },
      {
        id: 101,
        contestId: 2,
        problemId: 4,
        order: 2,
        problem: { id: 4, code: "PROB-B", title: "Problem B" },
      },
    ];

    beforeEach(() => {
      getOrgIdFromNameId.mockResolvedValue(mockOrgId);
      getContestIdFromNameId.mockResolvedValue(mockContestId);
      problemService.getContestProblems.mockResolvedValue(mockProblems);
    });

    it("should successfully fetch problems for a contest", async () => {
      // Call the function
      const result = await GET(new NextRequest(), { params: mockParams });

      // Assertions
      expect(NameIdSchema.parse).toHaveBeenCalledWith(mockParams.orgId);
      expect(NameIdSchema.parse).toHaveBeenCalledWith(mockParams.contestId);
      expect(getOrgIdFromNameId).toHaveBeenCalledWith(mockParams.orgId);
      expect(getContestIdFromNameId).toHaveBeenCalledWith(mockOrgId, mockParams.contestId);
      expect(problemService.getContestProblems).toHaveBeenCalledWith(mockContestId);
      expect(NextResponse.json).toHaveBeenCalledWith(mockProblems);
      expect(result).toEqual({
        data: mockProblems,
        options: undefined,
      });
    });

    it("should return 400 for validation errors", async () => {
      // Setup validation error
      const validationErrors = [{ path: ["orgId"], message: "Invalid format" }];
      const zodError = new z.ZodError(validationErrors);
      NameIdSchema.parse.mockImplementationOnce(() => {
        throw zodError;
      });

      // Call the function
      const result = await GET(new NextRequest(), { params: mockParams });

      // Assertions
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: validationErrors },
        { status: 400 }
      );
      expect(result).toEqual({
        data: { error: validationErrors },
        options: { status: 400 },
      });
    });

    it("should return 404 when organization is not found", async () => {
      // Setup
      const notFoundError = new Error("Organization not found");
      getOrgIdFromNameId.mockRejectedValue(notFoundError);

      // Call the function
      const result = await GET(new NextRequest(), { params: mockParams });

      // Assertions
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "Organization not found" },
        { status: 404 }
      );
      expect(result).toEqual({
        data: { error: "Organization not found" },
        options: { status: 404 },
      });
    });

    it("should return 404 when contest is not found", async () => {
      // Setup
      const notFoundError = new Error("Contest not found");
      getContestIdFromNameId.mockRejectedValue(notFoundError);

      // Call the function
      const result = await GET(new NextRequest(), { params: mockParams });

      // Assertions
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "Contest not found" },
        { status: 404 }
      );
      expect(result).toEqual({
        data: { error: "Contest not found" },
        options: { status: 404 },
      });
    });

    it("should return 500 for unexpected errors", async () => {
      // Setup
      const unexpectedError = new Error("Unexpected database error");
      problemService.getContestProblems.mockRejectedValue(unexpectedError);

      // Call the function
      const result = await GET(new NextRequest(), { params: mockParams });

      // Assertions
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "Failed to fetch contest problems" },
        { status: 500 }
      );
      expect(result).toEqual({
        data: { error: "Failed to fetch contest problems" },
        options: { status: 500 },
      });
    });
  });

  describe("DELETE endpoint - Remove Problem from Contest", () => {
    const mockParams = {
      orgId: "org-abc",
      contestId: "contest-123",
      problemId: "PROB-A",
    };

    const mockOrgId = 1;
    const mockContestId = 2;

    beforeEach(() => {
      getOrgIdFromNameId.mockResolvedValue(mockOrgId);
      getContestIdFromNameId.mockResolvedValue(mockContestId);
      problemService.removeProblemFromContest.mockResolvedValue(undefined);

      // Mock the Response constructor
      global.Response = jest.fn().mockImplementation((body, init) => ({
        body,
        init,
        status: init?.status,
      }));
    });

    it("should successfully remove a problem from a contest", async () => {
      // Call the function
      const result = await DELETE(new NextRequest(), { params: mockParams });

      // Assertions
      expect(NameIdSchema.parse).toHaveBeenCalledWith(mockParams.orgId);
      expect(NameIdSchema.parse).toHaveBeenCalledWith(mockParams.contestId);
      expect(NameIdSchema.parse).toHaveBeenCalledWith(mockParams.problemId);
      expect(getOrgIdFromNameId).toHaveBeenCalledWith(mockParams.orgId);
      expect(getContestIdFromNameId).toHaveBeenCalledWith(mockOrgId, mockParams.contestId);
      expect(problemService.removeProblemFromContest).toHaveBeenCalledWith(
        mockOrgId,
        mockContestId,
        mockParams.problemId
      );
      expect(Response).toHaveBeenCalledWith(null, { status: 204 });
      expect(result).toEqual({
        body: null,
        init: { status: 204 },
        status: 204,
      });
    });

    it("should return 400 for validation errors", async () => {
      // Setup validation error
      const validationErrors = [{ path: ["problemId"], message: "Invalid format" }];
      const zodError = new z.ZodError(validationErrors);
      NameIdSchema.parse.mockImplementationOnce(() => {
        return mockParams.orgId;
      }).mockImplementationOnce(() => {
        return mockParams.contestId;
      }).mockImplementationOnce(() => {
        throw zodError;
      });

      // Call the function
      const result = await DELETE(new NextRequest(), { params: mockParams });

      // Assertions
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: validationErrors },
        { status: 400 }
      );
      expect(result).toEqual({
        data: { error: validationErrors },
        options: { status: 400 },
      });
    });

    it("should return 404 when organization is not found", async () => {
      // Setup
      const notFoundError = new Error("Organization not found");
      getOrgIdFromNameId.mockRejectedValue(notFoundError);

      // Call the function
      const result = await DELETE(new NextRequest(), { params: mockParams });

      // Assertions
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "Organization not found" },
        { status: 404 }
      );
      expect(result).toEqual({
        data: { error: "Organization not found" },
        options: { status: 404 },
      });
    });

    it("should return 404 when contest is not found", async () => {
      // Setup
      const notFoundError = new Error("Contest not found");
      getContestIdFromNameId.mockRejectedValue(notFoundError);

      // Call the function
      const result = await DELETE(new NextRequest(), { params: mockParams });

      // Assertions
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "Contest not found" },
        { status: 404 }
      );
      expect(result).toEqual({
        data: { error: "Contest not found" },
        options: { status: 404 },
      });
    });

    it("should return 404 when problem is not found", async () => {
      // Setup
      const notFoundError = new Error("Problem not found");
      problemService.removeProblemFromContest.mockRejectedValue(notFoundError);

      // Call the function
      const result = await DELETE(new NextRequest(), { params: mockParams });

      // Assertions
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "Problem not found" },
        { status: 404 }
      );
      expect(result).toEqual({
        data: { error: "Problem not found" },
        options: { status: 404 },
      });
    });

    it("should return 500 for unexpected errors", async () => {
      // Setup
      const unexpectedError = new Error("Unexpected database error");
      problemService.removeProblemFromContest.mockRejectedValue(unexpectedError);

      // Call the function
      const result = await DELETE(new NextRequest(), { params: mockParams });

      // Assertions
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "Failed to remove problem from contest" },
        { status: 500 }
      );
      expect(result).toEqual({
        data: { error: "Failed to remove problem from contest" },
        options: { status: 500 },
      });
    });
  });
});