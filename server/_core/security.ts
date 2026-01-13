/**
 * Security Middleware
 * Implements rate limiting, CORS, and other security measures
 */

import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';

/**
 * Rate limiter for login endpoints
 * Prevents brute-force attacks
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs (increased for development)
  message: 'Too many login attempts from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

/**
 * Rate limiter for general API endpoints
 */
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per minute
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for data bounty responses
 * Prevents spam submissions
 */
export const bountyLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit to 10 bounty responses per minute
  message: 'Too many bounty submissions, please slow down',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Helmet security headers
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Note: unsafe-eval needed for Vite in dev
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

/**
 * CORS configuration
 */
export const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3005'],
  credentials: true,
  optionsSuccessStatus: 200,
};

/**
 * Custom middleware to add security headers
 */
export const addSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
};

/**
 * Sanitize user input to prevent XSS
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim();
};

/**
 * Validate request body size
 */
export const validateBodySize = (req: Request, res: Response, next: NextFunction) => {
  const contentLength = req.headers['content-length'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (contentLength && parseInt(contentLength) > maxSize) {
    return res.status(413).json({
      success: false,
      error: 'Request body too large'
    });
  }
  
  next();
};

export default {
  loginLimiter,
  apiLimiter,
  bountyLimiter,
  securityHeaders,
  corsOptions,
  addSecurityHeaders,
  sanitizeInput,
  validateBodySize,
};
