import "dotenv/config";

// --- Required env var validation (fail fast if misconfigured) ---
const REQUIRED_ENV = ['JWT_SECRET', 'DATABASE_URL', 'ADMIN_EMAIL', 'ADMIN_PASSWORD_HASH'] as const;
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`[Server] FATAL: Missing required environment variable: ${key}`);
    process.exit(1);
  }
}
if (!process.env.NODE_ENV) {
  console.warn('[Server] WARNING: NODE_ENV is not set. Defaulting to production behavior.');
  process.env.NODE_ENV = 'production';
}
// ---------------------------------------------------------------
import express from "express";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { authRouter } from "./auth-routes";
import { adminRouter } from "./admin-routes";
import taskRouter from "./task-routes";
import profileRouter from "./profile-routes";
import advertiserRouter from "./advertiser-routes";
import withdrawalRouter from "./withdrawal-routes";
import adminWithdrawalRouter from "./admin-withdrawal-routes";
import referralRouter from "./referral-routes";
import gamificationRouter from "./gamification-routes";
import gamificationFeaturesRouter from "./gamification-features-routes";
import pushNotificationRouter from "./push-notification-routes";
import notificationRouter from "./notification-routes";
import campaignRouter from "./campaign-routes";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import {
  loginLimiter,
  apiLimiter,
  securityHeaders,
  addSecurityHeaders,
  validateBodySize,
  corsOptions
} from "./security";
import cors from "cors";
import { csrfTokenMiddleware, csrfProtection, getCsrfTokenHandler } from "./csrf";
import { processScheduledPayments } from "../services/task.service";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Trust proxy - Required for rate limiting behind reverse proxy/load balancer
  app.set('trust proxy', 1);

  // Security middleware
  app.use(securityHeaders);
  app.use(addSecurityHeaders);
  app.use(validateBodySize);

  // Prevent API responses from being embedded in iframes
  app.use('/api', (_req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    next();
  });

  // CORS — must come before routes
  app.use(cors(corsOptions));

  // Configure body parser and cookie parser for REST API routes
  app.use(cookieParser());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ limit: "1mb", extended: true }));
  // CSRF token endpoint (must be before CSRF protection)
  app.get("/api/csrf-token", getCsrfTokenHandler);

  // CSRF token middleware (adds token to all responses)
  app.use(csrfTokenMiddleware);

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // Global API rate limiter (all /api routes)
  app.use('/api', apiLimiter);
  // Simple REST auth endpoints (with stricter rate limiting on auth)
  app.use("/api/auth", loginLimiter, authRouter);
  // Admin management endpoints (with CSRF protection)
  app.use("/api/admin", csrfProtection, adminRouter);
  // Task template system endpoints
  app.use("/api", taskRouter);
  // Profile endpoints
  app.use("/api/profile", profileRouter);
  // Advertiser endpoints
  app.use("/api", advertiserRouter);
  // Withdrawal endpoints (with CSRF protection)
  app.use("/api/withdrawals", csrfProtection, withdrawalRouter);
  // Admin withdrawal management endpoints (with CSRF protection)
  app.use("/api/admin", csrfProtection, adminWithdrawalRouter);
  // Referral system endpoints
  app.use("/api/referrals", referralRouter);
  // Gamification endpoints
  app.use("/api/gamification", gamificationRouter);
  // Gamification features endpoints (Profile Power-Up, Targeting Tiers, Data Bounties) (with CSRF protection)
  app.use("/api/gamification", csrfProtection, gamificationFeaturesRouter);
  // Push notification endpoints
  app.use("/api/push", pushNotificationRouter);
  // User notification endpoints
  app.use("/api/notifications", notificationRouter);
  // Campaign management endpoints
  app.use("/api", campaignRouter);
  // tRPC API (tRPC handles its own body parsing)
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);

// --- Scheduled Payments Cron (every 15 minutes) ---
// Processes tier-1 and tier-2 user payments that are due
const PAYMENT_CRON_INTERVAL_MS = 15 * 60 * 1000;
setInterval(async () => {
  try {
    await processScheduledPayments();
  } catch (err) {
    console.error('[Cron] Scheduled payment processing error:', err);
  }
}, PAYMENT_CRON_INTERVAL_MS);
console.log(`[Cron] Scheduled payments running every ${PAYMENT_CRON_INTERVAL_MS / 60000} minutes`);
