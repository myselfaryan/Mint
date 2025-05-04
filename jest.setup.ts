// jest.setup.js
import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";
import { fetch, Headers, Request, Response } from "cross-fetch";

// Define the global objects needed for Next.js
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;
global.fetch = fetch;
global.Headers = Headers;
global.Request = Request;
global.Response = Response;
