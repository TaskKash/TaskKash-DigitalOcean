import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// In-memory store for CSRF tokens (in production, use Redis or database)
const csrfTokens = new Map<string, { token: string; createdAt: number }>();

// Token expiration time (1 hour)
const TOKEN_EXPIRATION = 60 * 60 * 1000;

/**
 * Generate a CSRF token for a session
 */
export function generateCsrfToken(sessionId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  csrfTokens.set(sessionId, {
    token,
    createdAt: Date.now()
  });
  return token;
}

/**
 * Verify a CSRF token
 */
export function verifyCsrfToken(sessionId: string, token: string): boolean {
  const stored = csrfTokens.get(sessionId);
  
  if (!stored) {
    return false;
  }
  
  // Check if token has expired
  if (Date.now() - stored.createdAt > TOKEN_EXPIRATION) {
    csrfTokens.delete(sessionId);
    return false;
  }
  
  return stored.token === token;
}

/**
 * Middleware to generate CSRF token and attach to response
 */
export function csrfTokenMiddleware(req: Request, res: Response, next: NextFunction) {
  // Get or create session ID (use authenticated user ID or generate temp ID)
  const sessionId = (req as any).user?.id?.toString() || req.ip || 'anonymous';
  
  // Generate token
  const token = generateCsrfToken(sessionId);
  
  // Attach to response locals for use in templates
  res.locals.csrfToken = token;
  
  // Also send as header for SPA consumption
  res.setHeader('X-CSRF-Token', token);
  
  next();
}

/**
 * Middleware to verify CSRF token on state-changing requests
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Skip CSRF check for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // Get session ID
  const sessionId = (req as any).user?.id?.toString() || req.ip || 'anonymous';
  
  // Get token from header or body
  const token = req.headers['x-csrf-token'] as string || req.body._csrf;
  
  if (!token) {
    return res.status(403).json({
      success: false,
      error: 'CSRF token missing'
    });
  }
  
  if (!verifyCsrfToken(sessionId, token)) {
    return res.status(403).json({
      success: false,
      error: 'Invalid CSRF token'
    });
  }
  
  next();
}

/**
 * Endpoint to get CSRF token
 */
export function getCsrfTokenHandler(req: Request, res: Response) {
  const sessionId = (req as any).user?.id?.toString() || req.ip || 'anonymous';
  const token = generateCsrfToken(sessionId);
  
  res.json({
    success: true,
    csrfToken: token
  });
}

/**
 * Clean up expired tokens periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, data] of csrfTokens.entries()) {
    if (now - data.createdAt > TOKEN_EXPIRATION) {
      csrfTokens.delete(sessionId);
    }
  }
}, TOKEN_EXPIRATION);
