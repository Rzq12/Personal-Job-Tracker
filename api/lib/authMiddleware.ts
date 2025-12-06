import type { VercelRequest, VercelResponse } from '@vercel/node';
import { extractToken, verifyAccessToken, type TokenPayload } from './auth';

// Extend VercelRequest to include user
export interface AuthRequest extends VercelRequest {
  user?: TokenPayload;
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user info to request
 */
export function authMiddleware(
  handler: (req: AuthRequest, res: VercelResponse) => Promise<void | VercelResponse>
) {
  return async (req: AuthRequest, res: VercelResponse) => {
    try {
      // Extract token from Authorization header
      const token = extractToken(req.headers.authorization);

      if (!token) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'No token provided',
        });
      }

      // Verify token
      const payload = verifyAccessToken(token);

      // Attach user info to request
      req.user = payload;

      // Continue to the actual handler
      return handler(req, res);
    } catch (error: any) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: error.message || 'Invalid token',
      });
    }
  };
}

/**
 * Optional authentication middleware
 * Does not fail if token is missing, but attaches user if present
 */
export function optionalAuthMiddleware(
  handler: (req: AuthRequest, res: VercelResponse) => Promise<void | VercelResponse>
) {
  return async (req: AuthRequest, res: VercelResponse) => {
    try {
      const token = extractToken(req.headers.authorization);

      if (token) {
        const payload = verifyAccessToken(token);
        req.user = payload;
      }
    } catch (error) {
      // Ignore errors for optional auth
    }

    return handler(req, res);
  };
}
