import type { VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import authHandler from '../../api/auth/index';
import { generateAccessToken, generateRefreshToken } from '../../api/lib/auth';
import { createMockRequest, createMockResponse } from '../utils/http';
import { createTestUser, prismaMock, resetTestDatabase } from '../setup/testDatabase';

jest.mock('../../api/lib/prisma', () => {
  const { prismaMock } = require('../setup/testDatabase');
  return {
    __esModule: true,
    default: prismaMock,
    prisma: prismaMock,
  };
});

describe('Auth API integration', () => {
  beforeEach(() => {
    resetTestDatabase();
  });

  async function execute(
    method: string,
    action: string,
    body: Record<string, unknown> = {},
    authorization?: string
  ) {
    const req = createMockRequest({
      method,
      query: { action },
      body,
      headers: authorization ? { authorization } : {},
    });
    const res = createMockResponse();
    await authHandler(req as any, res as unknown as VercelResponse);
    return res;
  }

  it('should register user successfully', async () => {
    // Arrange
    const payload = {
      email: 'new-user@example.com',
      password: 'StrongPass1!',
      name: 'New User',
    };

    // Act
    const res = await execute('POST', 'register', payload);

    // Assert
    expect(res.statusCode).toBe(201);
    expect((res.body as any).user.email).toBe('new-user@example.com');
    expect((res.body as any).accessToken).toBeTruthy();
    expect((res.body as any).refreshToken).toBeTruthy();
  });

  it('should reject duplicate email', async () => {
    // Arrange
    await execute('POST', 'register', {
      email: 'dup@example.com',
      password: 'StrongPass1!',
    });

    // Act
    const res = await execute('POST', 'register', {
      email: 'dup@example.com',
      password: 'StrongPass1!',
    });

    // Assert
    expect(res.statusCode).toBe(409);
    expect((res.body as any).error).toBe('User already exists');
  });

  it('should reject register with invalid payload', async () => {
    // Arrange + Act
    const res = await execute('POST', 'register', {
      email: 'invalid@example.com',
      password: '123',
    });

    // Assert
    expect(res.statusCode).toBe(400);
  });

  it('should login successfully with valid credentials', async () => {
    // Arrange
    const password = 'ValidPass1!';
    const hashedPassword = await bcrypt.hash(password, 10);
    createTestUser({
      id: 7,
      email: 'login@example.com',
      password: hashedPassword,
    });

    // Act
    const res = await execute('POST', 'login', {
      email: 'login@example.com',
      password,
    });

    // Assert
    expect(res.statusCode).toBe(200);
    expect((res.body as any).accessToken).toBeDefined();
    expect((res.body as any).refreshToken).toBeDefined();
  });

  it('should reject login with wrong password', async () => {
    // Arrange
    const hashedPassword = await bcrypt.hash('CorrectPass1!', 10);
    createTestUser({
      email: 'wrong-pass@example.com',
      password: hashedPassword,
    });

    // Act
    const res = await execute('POST', 'login', {
      email: 'wrong-pass@example.com',
      password: 'incorrect',
    });

    // Assert
    expect(res.statusCode).toBe(401);
  });

  it('should reject /me without token', async () => {
    // Arrange + Act
    const res = await execute('GET', 'me');

    // Assert
    expect(res.statusCode).toBe(401);
  });

  it('should reject /me with invalid token', async () => {
    // Arrange + Act
    const res = await execute('GET', 'me', {}, 'Bearer invalid-token');

    // Assert
    expect(res.statusCode).toBe(500);
  });

  it('should return current user for valid token', async () => {
    // Arrange
    const user = createTestUser({
      id: 99,
      email: 'me@example.com',
      name: 'Profile User',
    });
    const token = generateAccessToken({ userId: user.id, email: user.email });

    // Act
    const res = await execute('GET', 'me', {}, `Bearer ${token}`);

    // Assert
    expect(res.statusCode).toBe(200);
    expect((res.body as any).user.email).toBe('me@example.com');
  });

  it('should return 500 on unexpected auth error', async () => {
    // Arrange
    const original = prismaMock.user.findUnique;
    prismaMock.user.findUnique = async () => {
      throw new Error('db-failure');
    };

    // Act
    const res = await execute('POST', 'login', {
      email: 'boom@example.com',
      password: 'ValidPass1!',
    });

    // Assert
    expect(res.statusCode).toBe(500);

    prismaMock.user.findUnique = original;
  });

  it('should reject invalid action', async () => {
    // Arrange + Act
    const res = await execute('GET', 'unknown-action');

    // Assert
    expect(res.statusCode).toBe(400);
  });

  it('should support OPTIONS preflight', async () => {
    // Arrange
    const req = createMockRequest({ method: 'OPTIONS', query: { action: 'register' } });
    const res = createMockResponse();

    // Act
    await authHandler(req as any, res as unknown as VercelResponse);

    // Assert
    expect(res.statusCode).toBe(200);
  });

  it('should reject refresh when token is missing', async () => {
    // Arrange + Act
    const res = await execute('POST', 'refresh', {});

    // Assert
    expect(res.statusCode).toBe(400);
  });

  it('should refresh token successfully', async () => {
    // Arrange
    const user = createTestUser({
      id: 55,
      email: 'refresh@example.com',
      password: await bcrypt.hash('StrongPass1!', 10),
    });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });
    await prismaMock.user.update({ where: { id: user.id }, data: { refreshToken } });

    // Act
    const res = await execute('POST', 'refresh', { refreshToken });

    // Assert
    expect(res.statusCode).toBe(200);
    expect((res.body as any).accessToken).toBeTruthy();
    expect((res.body as any).refreshToken).toBeTruthy();
  });

  it('should logout without token', async () => {
    // Arrange + Act
    const res = await execute('POST', 'logout');

    // Assert
    expect(res.statusCode).toBe(200);
  });

  it('should clear refresh token on authenticated logout', async () => {
    // Arrange
    const user = createTestUser({
      id: 66,
      email: 'logout@example.com',
      refreshToken: 'some-refresh-token',
    });
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });

    // Act
    const res = await execute('POST', 'logout', {}, `Bearer ${accessToken}`);

    // Assert
    expect(res.statusCode).toBe(200);
    const updated = await prismaMock.user.findUnique({ where: { id: user.id } });
    expect(updated?.refreshToken).toBeNull();
  });

  it('should reject profile update without token', async () => {
    // Arrange + Act
    const res = await execute('PUT', 'update-profile', { name: 'Updated Name' });

    // Assert
    expect(res.statusCode).toBe(401);
  });

  it('should reject profile update with empty name', async () => {
    // Arrange
    const user = createTestUser({ id: 77, email: 'profile@example.com' });
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });

    // Act
    const res = await execute('PUT', 'update-profile', { name: '  ' }, `Bearer ${accessToken}`);

    // Assert
    expect(res.statusCode).toBe(400);
  });

  it('should update profile name successfully', async () => {
    // Arrange
    const user = createTestUser({ id: 78, email: 'profile-success@example.com', name: 'Old Name' });
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });

    // Act
    const res = await execute(
      'PUT',
      'update-profile',
      { name: 'New Name' },
      `Bearer ${accessToken}`
    );

    // Assert
    expect(res.statusCode).toBe(200);
    expect((res.body as any).user.name).toBe('New Name');
  });

  it('should reject change password with missing fields', async () => {
    // Arrange
    const user = createTestUser({ id: 88, email: 'pwd@example.com' });
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });

    // Act
    const res = await execute(
      'PUT',
      'change-password',
      { currentPassword: 'only-current' },
      `Bearer ${accessToken}`
    );

    // Assert
    expect(res.statusCode).toBe(400);
  });

  it('should reject change password when current password is wrong', async () => {
    // Arrange
    const user = createTestUser({
      id: 89,
      email: 'pwd-wrong@example.com',
      password: await bcrypt.hash('CorrectPass1!', 10),
    });
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });

    // Act
    const res = await execute(
      'PUT',
      'change-password',
      { currentPassword: 'WrongPass1!', newPassword: 'NewStrongPass1!' },
      `Bearer ${accessToken}`
    );

    // Assert
    expect(res.statusCode).toBe(400);
  });

  it('should change password successfully', async () => {
    // Arrange
    const user = createTestUser({
      id: 90,
      email: 'pwd-success@example.com',
      password: await bcrypt.hash('OldStrongPass1!', 10),
    });
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });

    // Act
    const res = await execute(
      'PUT',
      'change-password',
      { currentPassword: 'OldStrongPass1!', newPassword: 'NewStrongPass1!' },
      `Bearer ${accessToken}`
    );

    // Assert
    expect(res.statusCode).toBe(200);
    expect((res.body as any).message).toContain('Password changed successfully');
  });
});
