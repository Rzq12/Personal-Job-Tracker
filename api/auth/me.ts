import type { VercelResponse } from '@vercel/node';
import { prisma } from '../lib/prisma';
import { authMiddleware, type AuthRequest } from '../lib/authMiddleware';

/**
 * GET /api/auth/me
 * Get current user info (requires authentication)
 */
async function handler(req: AuthRequest, res: VercelResponse) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // req.user is populated by authMiddleware
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User does not exist',
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    return res.status(500).json({
      error: 'Failed to fetch user',
      message: error.message || 'Internal server error',
    });
  }
}

// Export with authentication middleware
export default authMiddleware(handler);
