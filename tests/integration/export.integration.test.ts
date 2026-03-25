import type { VercelResponse } from '@vercel/node';
import exportHandler from '../../api/jobs/export';
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

describe('Jobs export API integration', () => {
  beforeEach(() => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/job_tracker_test';
    resetTestDatabase();
  });

  it('should reject export request without token', async () => {
    // Arrange
    const req = createMockRequest({ method: 'GET' });
    const res = createMockResponse();

    // Act
    await exportHandler(req as any, res as unknown as VercelResponse);

    // Assert
    expect(res.statusCode).toBe(401);
  });

  it('should export jobs as xlsx buffer for valid token', async () => {
    // Arrange
    const user = createTestUser({ id: 31, email: 'export@example.com' });
    createTestJob({
      userId: user.id,
      company: 'Export Co',
      position: 'Data Engineer',
      status: 'Applied',
      excitement: 4,
    });

    const token = generateAccessToken({ userId: user.id, email: user.email });
    const req = createMockRequest({
      method: 'GET',
      headers: { authorization: `Bearer ${token}` },
      query: { archived: 'false' },
    });
    const res = createMockResponse();

    // Act
    await exportHandler(req as any, res as unknown as VercelResponse);

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.headers['Content-Type']).toBe(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    expect(res.headers['Content-Disposition']).toContain('attachment; filename=');
    expect(res.body).toBeDefined();
  });

  it('should reject non-GET methods', async () => {
    // Arrange
    const token = generateAccessToken({ userId: 31, email: 'export@example.com' });
    const req = createMockRequest({
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
    });
    const res = createMockResponse();

    // Act
    await exportHandler(req as any, res as unknown as VercelResponse);

    // Assert
    expect(res.statusCode).toBe(405);
  });
});
