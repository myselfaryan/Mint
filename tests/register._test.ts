import { jest } from '@jest/globals';

// Mock Next.js modules
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => {
      return {
        data,
        status: options?.status || 200,
        headers: new Map(),
      };
    }),
  },
}));

// Mocked user used inside db mock must be defined before mocks
const mockUser = {
  id: 'user-123',
  email: 'newuser@example.com',
  name: 'New User',
  nameId: 'newuser',
  hashedPassword: 'hashed_password',
  createdAt: new Date(),
  updatedAt: new Date(),
};
const findFirstMock = jest.fn();
const insertReturningMock = jest.fn(() => Promise.resolve([mockUser]));
const insertValuesMock = jest.fn(() => ({ returning: insertReturningMock }));
const insertMock = jest.fn(() => ({ values: insertValuesMock }));

jest.mock('@/db/drizzle', () => ({
  db: {
    query: {
      users: {
        findFirst: findFirstMock,
      },
    },
    insert: insertMock,
  },
}));
expect(findFirstMock).toHaveBeenCalled();
expect(insertMock).toHaveBeenCalled();


jest.mock('@/lib/password', () => ({
  hashPassword: jest.fn(),
}));

jest.mock('@/lib/username', () => ({
  generateUsername: jest.fn(),
}));

jest.mock('@/lib/server/session', () => ({
  generateSessionToken: jest.fn(),
  createSession: jest.fn(),
}));

jest.mock('@/lib/server/cookies', () => ({
  setSessionTokenCookie: jest.fn(),
}));

import { NextRequest } from 'next/server';
import { db } from '@/db/drizzle';
import { hashPassword } from '@/lib/password';
import { generateUsername } from '@/lib/username';
import { generateSessionToken, createSession } from '@/lib/server/session';
import { setSessionTokenCookie } from '@/lib/server/cookies';
import { POST } from '@/app/api/auth/register/route';

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register a new user successfully', async () => {
    const requestData = {
      email: 'newuser@example.com',
      password: 'Password123!',
      name: 'New User',
    };

    const mockSession = {
      id: 'session-123',
      userId: 'user-123',
      token: 'token-123',
      expiresAt: new Date(Date.now() + 86400000),
    };

    (db.query.users.findFirst as jest.Mock).mockResolvedValue(null);
    (hashPassword as jest.Mock).mockResolvedValue('hashed_password');
    (generateUsername as jest.Mock).mockResolvedValue('newuser');
    mockReturning.mockResolvedValue([mockUser]);
    (generateSessionToken as jest.Mock).mockReturnValue('token-123');
    (createSession as jest.Mock).mockResolvedValue(mockSession);
    (setSessionTokenCookie as jest.Mock).mockResolvedValue(undefined);

    const request = {
      json: jest.fn().mockResolvedValue(requestData),
    } as unknown as NextRequest;

    const response = await POST(request);

    expect(db.query.users.findFirst).toHaveBeenCalled();
    expect(hashPassword).toHaveBeenCalledWith('Password123!');
    expect(generateUsername).toHaveBeenCalledWith('newuser@example.com');
    expect(db.insert).toHaveBeenCalled();
    expect(generateSessionToken).toHaveBeenCalled();
    expect(createSession).toHaveBeenCalled();
    expect(setSessionTokenCookie).toHaveBeenCalled();

    expect(response.data).toEqual({
      _id: 'user-123',
      email: 'newuser@example.com',
      name: 'New User',
      nameId: 'newuser',
    });
    expect(response.status).toBe(200);
  });

  it('should return 400 if email already exists', async () => {
    const requestData = {
      email: 'existing@example.com',
      password: 'Password123!',
      name: 'Existing User',
    };

    const mockExistingUser = { ...mockUser, email: 'existing@example.com' };

    (db.query.users.findFirst as jest.Mock).mockResolvedValue(mockExistingUser);

    const request = {
      json: jest.fn().mockResolvedValue(requestData),
    } as unknown as NextRequest;

    const response = await POST(request);

    expect(db.query.users.findFirst).toHaveBeenCalled();
    expect(hashPassword).not.toHaveBeenCalled();
    expect(generateUsername).not.toHaveBeenCalled();
    expect(db.insert).not.toHaveBeenCalled();
    expect(response.data).toEqual({ error: 'Email already exists' });
    expect(response.status).toBe(400);
  });

  it('should return 400 on validation error', async () => {
    const request = {
      json: jest.fn().mockResolvedValue({
        email: 'invalid-email',
        password: '123',
        name: '',
      }),
    } as unknown as NextRequest;

    const response = await POST(request);

    expect(response.data).toEqual({ error: 'Invalid request' });
    expect(response.status).toBe(400);
  });

  it('should handle database errors', async () => {
    const requestData = {
      email: 'newuser@example.com',
      password: 'Password123!',
      name: 'New User',
    };

    (db.query.users.findFirst as jest.Mock).mockResolvedValue(null);
    (hashPassword as jest.Mock).mockResolvedValue('hashed_password');
    (generateUsername as jest.Mock).mockResolvedValue('newuser');
    mockReturning.mockRejectedValue(new Error('Database error'));

    const request = {
      json: jest.fn().mockResolvedValue(requestData),
    } as unknown as NextRequest;

    const response = await POST(request);

    expect(response.data).toEqual({ error: 'Invalid request' });
    expect(response.status).toBe(400);
  });

  it('should handle request parsing errors', async () => {
    const request = {
      json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
    } as unknown as NextRequest;

    const response = await POST(request);

    expect(response.data).toEqual({ error: 'Invalid request' });
    expect(response.status).toBe(400);
  });
});
