import { POST } from '@/app/api/code/route'; // adjust the path if needed


// Mock global fetch
global.fetch = jest.fn();

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status || 200 })),
  },
}));

describe('POST /api/execute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should forward the request to Piston API and return the result', async () => {
    const mockBody = {
      language: 'python',
      version: '3.10.0',
      files: [{ name: 'main.py', content: 'print("Hello")' }],
      stdin: '',
      args: [],
      compile_timeout: 10000,
      run_timeout: 3000,
    };

    const mockPistonResponse = {
      run: { stdout: 'Hello\n', stderr: '', code: 0 },
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue(mockPistonResponse),
    });

    const mockRequest = {
      json: jest.fn().mockResolvedValue(mockBody),
    } as unknown as Request;

    const response = await POST(mockRequest);

    expect(mockRequest.json).toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledWith(
      'https://emkc.org/api/v2/piston/execute',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockBody),
      }),
    );
    expect(response.status).toBe(200);
    expect(response.data).toEqual(mockPistonResponse);
  });

  it('should return 500 on unexpected error', async () => {
    const mockRequest = {
      json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
    } as unknown as Request;

    const response = await POST(mockRequest);

    expect(response.status).toBe(500);
    expect(response.data).toEqual({ error: 'Failed to execute code' });
  });
});
