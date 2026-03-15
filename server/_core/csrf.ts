import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// In-memory store for CSRF tokens (in production, use Redis or database)
const csrfTokens = new Map<string, { token: string; createdAt: number }>();

// Token expiration time (1 hour)
const TOKEN_EXPIRATION = 60 * 60 * 1000;

// Memory cap: max number of simultaneous CSRF sessions (prevents DoS)
const MAX_CSRF_ENTRIES = 10_000;

/**
 * Get or create a per-browser CSRF session ID using a persistent cookie.
 * Falls back to IP only as last resort (never shared across users on same IP).
 */
function getCsrfSessionId(req: Request, res: Response): string {
  const COOKIE = 'csrf_sid';
  let sid: string = req.cookies?.[COOKIE];
  if (!sid) {
    sid = crypto.randomBytes(16).toString('hex');
    // Set as non-httpOnly so the frontend can read it, SameSite=Strict
    res.cookie(COOKIE, sid, {
      httpOnly: false,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: TOKEN_EXPIRATION,
    });
  }
  return sid;
}

/**
 * Generate a CSRF token for a session
 */
export function generateCsrfToken(sessionId: string): string {
  // Enforce memory cap: remove oldest entry if over limit
  if (csrfTokens.size >= MAX_CSRF_ENTRIES) {
    const firstKey = csrfTokens.keys().next().value;
    if (firstKey) csrfTokens.delete(firstKey);
  }

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
 * Middleware to generate CSRF token and attach to response.
 * Reuses existing token for the session to avoid invalidating it.
 */
export function csrfTokenMiddleware(req: Request, res: Response, next: NextFunction) {
  const sessionId = getCsrfSessionId(req, res);
  // Reuse existing valid token rather than generating a new one every request
  const existing = csrfTokens.get(sessionId);
  const now = Date.now();
  const token = (existing && (now - existing.createdAt < TOKEN_EXPIRATION))
    ? existing.token
    : generateCsrfToken(sessionId);
  res.locals.csrfToken = token;
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

  const sessionId = getCsrfSessionId(req, res);
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
  const sessionId = getCsrfSessionId(req, res);
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
  for (const [sessionId, data] of Array.from(csrfTokens.entries())) {
    if (now - data.createdAt > TOKEN_EXPIRATION) {
      csrfTokens.delete(sessionId);
    }
  }
}, TOKEN_EXPIRATION);

