import type { VercelResponse } from '@vercel/node';
import { prisma } from '../lib/prisma';
import { authMiddleware, type AuthRequest } from '../lib/authMiddleware';

/**
 * POST /api/auth/logout
 * Logout user (requires authentication)
 */
async function handler(req: AuthRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    // Clear refresh token from database
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    return res.status(200).json({
      message: 'Logout successful',
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    return res.status(500).json({
      error: 'Logout failed',
      message: error.message || 'Internal server error',
    });
  }
}

// Export with authentication middleware
export default authMiddleware(handler);
