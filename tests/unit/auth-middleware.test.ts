import type { VercelResponse } from '@vercel/node';
import { authMiddleware } from '../../api/lib/authMiddleware';
import { generateAccessToken } from '../../api/lib/auth';
import { createMockRequest, createMockResponse } from '../utils/http';

describe('authMiddleware', () => {
  it('should reject request when token is missing', async () => {
    // Arrange
    const handler = jest.fn(async () => undefined);
    const wrapped = authMiddleware(handler);
    const req = createMockRequest({ method: 'GET', headers: {} });
    const res = createMockResponse();

    // Act
    await wrapped(req as any, res as unknown as VercelResponse);

    // Assert
    expect(res.statusCode).toBe(401);
    expect(handler).not.toHaveBeenCalled();
  });

  it('should reject request when token is invalid', async () => {
    // Arrange
    const handler = jest.fn(async () => undefined);
    const wrapped = authMiddleware(handler);
    const req = createMockRequest({
      method: 'GET',
      headers: { authorization: 'Bearer bad.token' },
    });
    const res = createMockResponse();

    // Act
    await wrapped(req as any, res as unknown as VercelResponse);

    // Assert
    expect(res.statusCode).toBe(401);
    expect(handler).not.toHaveBeenCalled();
  });

  it('should attach user and call next handler for valid token', async () => {
    // Arrange
    const token = generateAccessToken({ userId: 1, email: 'valid@example.com' });
    const handler = jest.fn(async (req) => {
      expect(req.user?.userId).toBe(1);
      expect(req.user?.email).toBe('valid@example.com');
    });
    const wrapped = authMiddleware(handler);
    const req = createMockRequest({
      method: 'GET',
      headers: { authorization: `Bearer ${token}` },
    });
    const res = createMockResponse();

    // Act
    await wrapped(req as any, res as unknown as VercelResponse);

    // Assert
    expect(handler).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(200);
  });
});
