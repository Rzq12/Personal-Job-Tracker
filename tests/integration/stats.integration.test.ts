import type { VercelResponse } from '@vercel/node';
import statsHandler from '../../api/stats';
import { generateAccessToken } from '../../api/lib/auth';
import { createMockRequest, createMockResponse } from '../utils/http';
import {
  createTestJob,
  createTestUser,
  prismaMock,
  resetTestDatabase,
} from '../setup/testDatabase';

jest.mock('../../api/lib/prisma', () => ({
  __esModule: true,
  default: prismaMock,
  prisma: prismaMock,
}));

describe('Stats API integration', () => {
  beforeEach(() => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/job_tracker_test';
    resetTestDatabase();
  });

  it('should reject request without token', async () => {
    // Arrange
    const req = createMockRequest({ method: 'GET' });
    const res = createMockResponse();

    // Act
    await statsHandler(req as any, res as unknown as VercelResponse);

    // Assert
    expect(res.statusCode).toBe(401);
  });

  it('should return aggregated stats for authenticated user', async () => {
    // Arrange
    const user = createTestUser({ id: 21, email: 'stats@example.com' });
    createTestJob({ userId: user.id, status: 'Bookmarked', archived: false });
    createTestJob({ userId: user.id, status: 'Applied', archived: false });
    createTestJob({ userId: user.id, status: 'Accepted', archived: true });

    const token = generateAccessToken({ userId: user.id, email: user.email });
    const req = createMockRequest({
      method: 'GET',
      headers: { authorization: `Bearer ${token}` },
    });
    const res = createMockResponse();

    // Act
    await statsHandler(req as any, res as unknown as VercelResponse);

    // Assert
    expect(res.statusCode).toBe(200);
    expect((res.body as any).data.totalActive).toBe(2);
    expect((res.body as any).data.totalArchived).toBe(1);
    expect(Array.isArray((res.body as any).data.byMonth)).toBe(true);
  });

  it('should reject unsupported methods', async () => {
    // Arrange
    const token = generateAccessToken({ userId: 1, email: 'stats@example.com' });
    const req = createMockRequest({
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
    });
    const res = createMockResponse();

    // Act
    await statsHandler(req as any, res as unknown as VercelResponse);

    // Assert
    expect(res.statusCode).toBe(405);
  });
});
