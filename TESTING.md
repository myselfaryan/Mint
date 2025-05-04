# Testing in Next.js API Routes

This project uses Jest to test Next.js API routes. Tests are configured to run in a node environment to properly test server-side code.

## Setup

The testing setup includes:

- Jest for the test runner
- Next.js App Router API route testing
- Mocking utilities for API route testing

## Running Tests

Run the tests using any of these commands:

```bash
# Run all tests
npx jest

# Run tests in watch mode for development
npx jest --watch

# Run tests with coverage report
npx jest --coverage

# Run a specific test file
npx jest __tests__/api/health.test.ts
```

## Test File Structure

Test files are located in the `__tests__` directory, mirroring the structure of the `/app` directory for API routes.

Example:
- API route: `/app/api/health/route.ts`
- Test file: `/__tests__/api/health.test.ts`

## Mocking Dependencies

The most common pattern for testing Next.js API routes is to mock the dependencies. Here's how to do it in your tests:

```typescript
// Mock modules BEFORE importing the component
jest.mock('@/db/drizzle', () => ({
  db: {
    query: {
      users: {
        findFirst: jest.fn()
      }
    }
  }
}));

// Now import the handler from the route file
import { GET } from '@/app/api/your-route/route';

// Import the mocked modules to control them in tests
const { db } = require('@/db/drizzle');
```

## Using Test Utilities

We've created some test utilities to make testing API routes easier:

```typescript
import { createMockRequest, parseJsonResponse } from '../utils/api-test-utils';

// Create a mock request
const req = createMockRequest('https://localhost:3000/api/health', {
  method: 'GET',
  params: { id: '123' },
});

// Execute the handler
const response = await GET(req);

// Parse the response
const data = await parseJsonResponse(response);
expect(data.status).toBe('healthy');
```

## Example Tests

### Testing a GET API Route

```typescript
/**
 * @jest-environment node
 */
// Mock modules before importing the component
jest.mock('@/db/drizzle', () => ({
  db: {
    execute: jest.fn().mockResolvedValue({})
  }
}));

// Import after mocks are defined
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/health/route';

describe('Health API Endpoint', () => {
  it('should return a healthy status', async () => {
    // Create a mock request
    const req = new NextRequest(new Request('https://localhost:3000/api/health'));
    
    // Execute the handler
    const response = await GET(req);
    
    // Check the response
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.status).toBe('healthy');
  });
});
```

### Testing a POST API Route

```typescript
/**
 * @jest-environment node
 */
// Mock modules before importing the component
jest.mock('@/db/drizzle', () => ({
  db: {
    query: {
      users: {
        findFirst: jest.fn()
      }
    }
  }
}));

jest.mock('@/lib/password', () => ({
  verifyPassword: jest.fn()
}));

// Import after mocks are defined
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/auth/login/route';

// Import mocked modules
const { db } = require('@/db/drizzle');
const { verifyPassword } = require('@/lib/password');

describe('Login API Endpoint', () => {
  it('should successfully login a user', async () => {
    // Mock a user being found
    db.query.users.findFirst.mockResolvedValue({ 
      id: 'user-123', 
      email: 'test@example.com' 
    });
    
    // Mock password verification
    verifyPassword.mockResolvedValue(true);
    
    // Create login request
    const req = new NextRequest('https://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    // Execute the handler
    const response = await POST(req);
    
    // Check the response
    expect(response.status).toBe(200);
  });
});
```

## Best Practices

1. **Use Node Environment**: Always use the node environment for API route tests:
   ```typescript
   /**
    * @jest-environment node
    */
   ```

2. **Mock Dependencies**: Mock all external dependencies like databases, third-party APIs, etc.

3. **Test Error Cases**: Test not just the happy path, but also error cases like invalid requests, not found resources, etc.

4. **Clear Mocks Between Tests**: Use `beforeEach(() => { jest.clearAllMocks(); })` to reset mocks between tests.

5. **Organize Tests**: Follow the structure of your application when organizing test files.

## Environment Variables in Tests

Environment variables needed for tests are defined in the Jest setup file. If you need to add more environment variables for testing, add them to `jest.setup.js`.