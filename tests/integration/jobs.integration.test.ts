import type { VercelResponse } from '@vercel/node';
import jobsHandler from '../../api/jobs/index';
import jobByIdHandler from '../../api/jobs/[id]';
import { generateAccessToken } from '../../api/lib/auth';
import { createMockRequest, createMockResponse } from '../utils/http';
import {
  createTestJob,
  createTestUser,
  getStateSnapshot,
  prismaMock,
  resetTestDatabase,
} from '../setup/testDatabase';

jest.mock('../../api/lib/prisma', () => ({
  __esModule: true,
  default: prismaMock,
  prisma: prismaMock,
}));

describe('Jobs API integration', () => {
  beforeEach(() => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/job_tracker_test';
    resetTestDatabase();
  });

  function getAuthHeader(userId = 1, email = 'jobs@example.com') {
    const token = generateAccessToken({ userId, email });
    return { authorization: `Bearer ${token}` };
  }

  it('should reject GET /api/jobs without token', async () => {
    // Arrange
    const req = createMockRequest({ method: 'GET' });
    const res = createMockResponse();

    // Act
    await jobsHandler(req as any, res as unknown as VercelResponse);

    // Assert
    expect(res.statusCode).toBe(401);
  });

  it('should reject GET /api/jobs with invalid token', async () => {
    // Arrange
    const req = createMockRequest({
      method: 'GET',
      headers: { authorization: 'Bearer invalid.token.value' },
    });
    const res = createMockResponse();

    // Act
    await jobsHandler(req as any, res as unknown as VercelResponse);

    // Assert
    expect(res.statusCode).toBe(401);
  });

  it('should return paginated jobs for authenticated user', async () => {
    // Arrange
    const user = createTestUser({ id: 11, email: 'jobs@example.com' });
    createTestJob({ userId: user.id, company: 'Company A', position: 'Backend' });
    createTestJob({ userId: user.id, company: 'Company B', position: 'Platform' });

    const req = createMockRequest({
      method: 'GET',
      query: { page: '1', size: '10', sort: '-dateSaved' },
      headers: getAuthHeader(user.id, user.email),
    });
    const res = createMockResponse();

    // Act
    await jobsHandler(req as any, res as unknown as VercelResponse);

    // Assert
    expect(res.statusCode).toBe(200);
    expect(Array.isArray((res.body as any).data)).toBe(true);
    expect((res.body as any).meta.total).toBe(2);
  });

  it('should create job successfully', async () => {
    // Arrange
    const user = createTestUser({ id: 12, email: 'create@example.com' });
    const req = createMockRequest({
      method: 'POST',
      headers: getAuthHeader(user.id, user.email),
      body: {
        position: 'QA Engineer',
        company: 'Company C',
        status: 'Applying',
      },
    });
    const res = createMockResponse();

    // Act
    await jobsHandler(req as any, res as unknown as VercelResponse);

    // Assert
    expect(res.statusCode).toBe(201);
    expect((res.body as any).data.position).toBe('QA Engineer');
    expect(getStateSnapshot().jobs).toHaveLength(1);
  });

  it('should reject create job when required fields are missing', async () => {
    // Arrange
    const user = createTestUser({ id: 13, email: 'invalid-create@example.com' });
    const req = createMockRequest({
      method: 'POST',
      headers: getAuthHeader(user.id, user.email),
      body: { position: '' },
    });
    const res = createMockResponse();

    // Act
    await jobsHandler(req as any, res as unknown as VercelResponse);

    // Assert
    expect(res.statusCode).toBe(400);
  });

  it('should reject create job with empty body', async () => {
    // Arrange
    const user = createTestUser({ id: 130, email: 'empty-body@example.com' });
    const req = createMockRequest({
      method: 'POST',
      headers: getAuthHeader(user.id, user.email),
      body: {},
    });
    const res = createMockResponse();

    // Act
    await jobsHandler(req as any, res as unknown as VercelResponse);

    // Assert
    expect(res.statusCode).toBe(400);
  });

  it('should return 400 for invalid job id', async () => {
    // Arrange
    const req = createMockRequest({
      method: 'GET',
      query: { id: 'abc' },
      headers: getAuthHeader(),
    });
    const res = createMockResponse();

    // Act
    await jobByIdHandler(req as any, res as unknown as VercelResponse);

    // Assert
    expect(res.statusCode).toBe(400);
  });

  it('should return 404 for non-existing job', async () => {
    // Arrange
    const user = createTestUser({ id: 14, email: 'notfound@example.com' });
    const req = createMockRequest({
      method: 'GET',
      query: { id: '999' },
      headers: getAuthHeader(user.id, user.email),
    });
    const res = createMockResponse();

    // Act
    await jobByIdHandler(req as any, res as unknown as VercelResponse);

    // Assert
    expect(res.statusCode).toBe(404);
  });

  it('should return 404 when authenticated user has no permission to access job', async () => {
    // Arrange
    const owner = createTestUser({ id: 140, email: 'owner@example.com' });
    const otherUser = createTestUser({ id: 141, email: 'other@example.com' });
    const ownerJob = createTestJob({ userId: owner.id, company: 'Private Co' });

    const req = createMockRequest({
      method: 'GET',
      query: { id: String(ownerJob.id) },
      headers: getAuthHeader(otherUser.id, otherUser.email),
    });
    const res = createMockResponse();

    // Act
    await jobByIdHandler(req as any, res as unknown as VercelResponse);

    // Assert
    expect(res.statusCode).toBe(404);
  });

  it('should update job status', async () => {
    // Arrange
    const user = createTestUser({ id: 15, email: 'update@example.com' });
    const job = createTestJob({ userId: user.id, status: 'Applied' });
    const req = createMockRequest({
      method: 'PUT',
      query: { id: String(job.id) },
      headers: getAuthHeader(user.id, user.email),
      body: { status: 'Interviewing' },
    });
    const res = createMockResponse();

    // Act
    await jobByIdHandler(req as any, res as unknown as VercelResponse);

    // Assert
    expect(res.statusCode).toBe(200);
    expect((res.body as any).data.status).toBe('Interviewing');
  });

  it('should reject invalid job status in update', async () => {
    // Arrange
    const user = createTestUser({ id: 16, email: 'invalid-status@example.com' });
    const job = createTestJob({ userId: user.id });
    const req = createMockRequest({
      method: 'PUT',
      query: { id: String(job.id) },
      headers: getAuthHeader(user.id, user.email),
      body: { status: 'NOT_A_REAL_STATUS' },
    });
    const res = createMockResponse();

    // Act
    await jobByIdHandler(req as any, res as unknown as VercelResponse);

    // Assert
    expect(res.statusCode).toBe(400);
  });

  it('should reject update with invalid excitement value', async () => {
    // Arrange
    const user = createTestUser({ id: 160, email: 'invalid-excitement@example.com' });
    const job = createTestJob({ userId: user.id });
    const req = createMockRequest({
      method: 'PUT',
      query: { id: String(job.id) },
      headers: getAuthHeader(user.id, user.email),
      body: { excitement: 10 },
    });
    const res = createMockResponse();

    // Act
    await jobByIdHandler(req as any, res as unknown as VercelResponse);

    // Assert
    expect(res.statusCode).toBe(400);
  });

  it('should reject update with invalid link format', async () => {
    // Arrange
    const user = createTestUser({ id: 161, email: 'invalid-link@example.com' });
    const job = createTestJob({ userId: user.id });
    const req = createMockRequest({
      method: 'PUT',
      query: { id: String(job.id) },
      headers: getAuthHeader(user.id, user.email),
      body: { link: 'not-a-url' },
    });
    const res = createMockResponse();

    // Act
    await jobByIdHandler(req as any, res as unknown as VercelResponse);

    // Assert
    expect(res.statusCode).toBe(400);
  });

  it('should return 404 when updating non-existing job', async () => {
    // Arrange
    const user = createTestUser({ id: 162, email: 'update-missing@example.com' });
    const req = createMockRequest({
      method: 'PUT',
      query: { id: '9999' },
      headers: getAuthHeader(user.id, user.email),
      body: { status: 'Applied' },
    });
    const res = createMockResponse();

    // Act
    await jobByIdHandler(req as any, res as unknown as VercelResponse);

    // Assert
    expect(res.statusCode).toBe(404);
  });

  it('should return 404 when updating job without permission', async () => {
    // Arrange
    const owner = createTestUser({ id: 163, email: 'owner-update@example.com' });
    const otherUser = createTestUser({ id: 164, email: 'other-update@example.com' });
    const ownerJob = createTestJob({ userId: owner.id, status: 'Applied' });

    const req = createMockRequest({
      method: 'PUT',
      query: { id: String(ownerJob.id) },
      headers: getAuthHeader(otherUser.id, otherUser.email),
      body: { status: 'Interviewing' },
    });
    const res = createMockResponse();

    // Act
    await jobByIdHandler(req as any, res as unknown as VercelResponse);

    // Assert
    expect(res.statusCode).toBe(404);
  });

  it('should delete existing job', async () => {
    // Arrange
    const user = createTestUser({ id: 17, email: 'delete@example.com' });
    const job = createTestJob({ userId: user.id, company: 'To Delete' });
    const req = createMockRequest({
      method: 'DELETE',
      query: { id: String(job.id) },
      headers: getAuthHeader(user.id, user.email),
    });
    const res = createMockResponse();

    // Act
    await jobByIdHandler(req as any, res as unknown as VercelResponse);

    // Assert
    expect(res.statusCode).toBe(200);
    expect(getStateSnapshot().jobs).toHaveLength(0);
  });

  it('should return 404 when deleting non-existing job', async () => {
    // Arrange
    const user = createTestUser({ id: 170, email: 'delete-missing@example.com' });
    const req = createMockRequest({
      method: 'DELETE',
      query: { id: '9999' },
      headers: getAuthHeader(user.id, user.email),
    });
    const res = createMockResponse();

    // Act
    await jobByIdHandler(req as any, res as unknown as VercelResponse);

    // Assert
    expect(res.statusCode).toBe(404);
  });

  it('should return 404 when deleting job without permission', async () => {
    // Arrange
    const owner = createTestUser({ id: 171, email: 'owner-delete@example.com' });
    const otherUser = createTestUser({ id: 172, email: 'other-delete@example.com' });
    const ownerJob = createTestJob({ userId: owner.id, company: 'Protected Co' });

    const req = createMockRequest({
      method: 'DELETE',
      query: { id: String(ownerJob.id) },
      headers: getAuthHeader(otherUser.id, otherUser.email),
    });
    const res = createMockResponse();

    // Act
    await jobByIdHandler(req as any, res as unknown as VercelResponse);

    // Assert
    expect(res.statusCode).toBe(404);
  });

  it('should return 500 when database throws', async () => {
    // Arrange
    const user = createTestUser({ id: 18, email: 'error@example.com' });
    const original = prismaMock.job.findMany;
    prismaMock.job.findMany = async () => {
      throw new Error('forced-db-error');
    };

    const req = createMockRequest({
      method: 'GET',
      headers: getAuthHeader(user.id, user.email),
    });
    const res = createMockResponse();

    // Act
    await jobsHandler(req as any, res as unknown as VercelResponse);

    // Assert
    expect(res.statusCode).toBe(500);

    prismaMock.job.findMany = original;
  });
});
