// This file is responsible for loading all API documentation
import { extendZodWithOpenApi } from "@anatine/zod-openapi";
import { z } from "zod";

// Extend Zod with OpenAPI functionality
extendZodWithOpenApi(z);

// Core API routes
import "@/app/api/users/docs";
import "@/app/api/users/[userId]/docs";
import "@/app/api/health/docs";
import "@/app/api/code/docs";
import "@/app/api/me/docs";
import "@/app/api/seed/docs";

// Auth routes
import "@/app/api/auth/docs";

// Organization routes
import "@/app/api/orgs/[orgId]/docs";
import "@/app/api/orgs/[orgId]/contests/docs";
import "@/app/api/orgs/[orgId]/contests/[contestId]/problems/docs";
import "@/app/api/orgs/[orgId]/contests/[contestId]/participants/docs";
import "@/app/api/orgs/[orgId]/problems/docs";
import "@/app/api/orgs/[orgId]/groups/docs";
import "@/app/api/orgs/[orgId]/submissions/docs";

// Add more route documentation imports as needed
