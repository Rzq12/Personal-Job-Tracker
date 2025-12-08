import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  extractToken,
} from '../lib/auth';

/**
 * Unified Auth Handler - All auth endpoints in one function
 * Routes: /api/auth?action=register|login|me|refresh|logout
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const action = req.query.action as string;

  try {
    switch (action) {
      case 'register':
        return await handleRegister(req, res);
      case 'login':
        return await handleLogin(req, res);
      case 'me':
        return await handleMe(req, res);
      case 'refresh':
        return await handleRefresh(req, res);
      case 'logout':
        return await handleLogout(req, res);
      case 'update-profile':
        return await handleUpdateProfile(req, res);
      case 'change-password':
        return await handleChangePassword(req, res);
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error: any) {
    console.error('Auth error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * POST /api/auth?action=register
 */
async function handleRegister(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Email and password are required',
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Password must be at least 6 characters',
    });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    return res.status(409).json({
      error: 'User already exists',
      message: 'Email is already registered',
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name || null,
    },
  });

  const tokenPayload = {
    userId: user.id,
    email: user.email,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  return res.status(201).json({
    message: 'Registration successful',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    accessToken,
    refreshToken,
  });
}

/**
 * POST /api/auth?action=login
 */
async function handleLogin(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Email and password are required',
    });
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    return res.status(401).json({
      error: 'Authentication failed',
      message: 'Invalid email or password',
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({
      error: 'Authentication failed',
      message: 'Invalid email or password',
    });
  }

  const tokenPayload = {
    userId: user.id,
    email: user.email,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  return res.status(200).json({
    message: 'Login successful',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    accessToken,
    refreshToken,
  });
}

/**
 * GET /api/auth?action=me
 */
async function handleMe(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = extractToken(req.headers.authorization);

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const payload = verifyAccessToken(token);

  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.status(200).json({ user });
}

/**
 * POST /api/auth?action=refresh
 */
async function handleRefresh(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token required' });
  }

  const payload = verifyRefreshToken(refreshToken);

  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user || user.refreshToken !== refreshToken) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }

  const tokenPayload = {
    userId: user.id,
    email: user.email,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const newRefreshToken = generateRefreshToken(tokenPayload);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: newRefreshToken },
  });

  return res.status(200).json({
    accessToken,
    refreshToken: newRefreshToken,
  });
}

/**
 * POST /api/auth?action=logout
 */
async function handleLogout(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = extractToken(req.headers.authorization);

  if (!token) {
    return res.status(200).json({ message: 'Logged out' });
  }

  const payload = verifyAccessToken(token);

  if (payload) {
    await prisma.user.update({
      where: { id: payload.userId },
      data: { refreshToken: null },
    });
  }

  return res.status(200).json({ message: 'Logged out successfully' });
}

/**
 * PUT /api/auth?action=update-profile
 */
async function handleUpdateProfile(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = extractToken(req.headers.authorization);

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const { name } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const user = await prisma.user.update({
    where: { id: payload.userId },
    data: { name: name.trim() },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  return res.status(200).json({ user, message: 'Profile updated successfully' });
}

/**
 * PUT /api/auth?action=change-password
 */
async function handleChangePassword(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = extractToken(req.headers.authorization);

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const isValid = await bcrypt.compare(currentPassword, user.password);

  if (!isValid) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: payload.userId },
    data: { password: hashedPassword },
  });

  return res.status(200).json({ message: 'Password changed successfully' });
}
