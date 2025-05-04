// tests/me.test.ts
import { GET } from '@/app/api/me/route';
import { getCurrentSession } from '@/lib/server/session';
import { getUserWithOrgs } from '@/app/api/me/service';
import { NextResponse } from 'next/server';

// Mock implementation of NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status || 200 })),
  },
}));

// Mocks
jest.mock('@/lib/server/session', () => ({
  getCurrentSession: jest.fn(),
}));

jest.mock('@/app/api/me/service', () => ({
  getUserWithOrgs: jest.fn(),
}));

// Sample data
const mockSession = { userId: 'user-123' };
const mockUser = {
  id: 'user-123',
  email: 'user@example.com',
  organizations: [{ id: 'org-1', name: 'Test Org' }],
};

describe('GET /api/me', () => {
  // Suppress console.error during tests
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return user data if session is valid', async () => {
    (getCurrentSession as jest.Mock).mockResolvedValue({ session: mockSession });
    (getUserWithOrgs as jest.Mock).mockResolvedValue(mockUser);

    const res = await GET();

    expect(getCurrentSession).toHaveBeenCalled();
    expect(getUserWithOrgs).toHaveBeenCalledWith('user-123');
    expect(res.status).toBe(200);
    expect(res.data).toEqual(mockUser);
  });

  it('should return 401 if session is invalid', async () => {
    (getCurrentSession as jest.Mock).mockResolvedValue({ session: null });

    const res = await GET();

    expect(res.status).toBe(401);
    expect(res.data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 404 if user not found', async () => {
    (getCurrentSession as jest.Mock).mockResolvedValue({ session: mockSession });
    (getUserWithOrgs as jest.Mock).mockResolvedValue(null);

    const res = await GET();

    expect(res.status).toBe(404);
    expect(res.data).toEqual({ error: 'User not found' });
  });

  it('should return 500 on internal error', async () => {
    (getCurrentSession as jest.Mock).mockRejectedValue(new Error('Something went wrong'));

    const res = await GET();

    expect(res.status).toBe(500);
    expect(res.data).toEqual({ error: 'Internal server error' });
  });
});
