// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "manus_session";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/db.ts
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

// drizzle/schema.ts
import { int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  password: varchar("password", { length: 255 }),
  // bcrypt hashed password for email/password auth
  phone: varchar("phone", { length: 20 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // TASKKASH-specific fields
  balance: int("balance", { unsigned: true }).default(0).notNull(),
  // in smallest currency unit
  completedTasks: int("completedTasks", { unsigned: true }).default(0).notNull(),
  totalEarnings: int("totalEarnings", { unsigned: true }).default(0).notNull(),
  // in smallest currency unit
  tier: mysqlEnum("tier", ["bronze", "silver", "gold", "platinum"]).default("bronze").notNull(),
  profileStrength: int("profileStrength", { unsigned: true }).default(30).notNull(),
  // percentage 0-100
  countryId: int("countryId"),
  // foreign key to countries table
  avatar: varchar("avatar", { length: 500 }),
  isVerified: int("isVerified", { unsigned: true }).default(0).notNull(),
  // 0 = not verified, 1 = verified
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var countries = mysqlTable("countries", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 2 }).notNull().unique(),
  // ISO 3166-1 alpha-2 (e.g., EG, SA, AE)
  nameAr: varchar("nameAr", { length: 100 }).notNull(),
  nameEn: varchar("nameEn", { length: 100 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  // ISO 4217 (e.g., EGP, SAR, AED)
  currencySymbol: varchar("currencySymbol", { length: 10 }).notNull(),
  isActive: int("isActive", { unsigned: true }).default(1).notNull(),
  // 1 = active, 0 = inactive
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var advertisers = mysqlTable("advertisers", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  // URL-friendly identifier (e.g., vodafone-egypt)
  nameAr: varchar("nameAr", { length: 200 }).notNull(),
  nameEn: varchar("nameEn", { length: 200 }).notNull(),
  descriptionAr: text("descriptionAr"),
  descriptionEn: text("descriptionEn"),
  logo: varchar("logo", { length: 500 }),
  coverImage: varchar("coverImage", { length: 500 }),
  category: varchar("category", { length: 100 }),
  // e.g., telecommunications, ecommerce, transport
  verified: int("verified", { unsigned: true }).default(0).notNull(),
  followers: int("followers", { unsigned: true }).default(0).notNull(),
  totalCampaigns: int("totalCampaigns", { unsigned: true }).default(0).notNull(),
  activeUsers: int("activeUsers", { unsigned: true }).default(0).notNull(),
  paymentRate: int("paymentRate", { unsigned: true }).default(100).notNull(),
  // percentage (0-100)
  rating: int("rating", { unsigned: true }).default(0).notNull(),
  // rating * 10 (e.g., 48 = 4.8)
  reviewCount: int("reviewCount", { unsigned: true }).default(0).notNull(),
  countryId: int("countryId").notNull(),
  isActive: int("isActive", { unsigned: true }).default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  advertiserId: int("advertiserId").notNull(),
  titleAr: varchar("titleAr", { length: 300 }).notNull(),
  titleEn: varchar("titleEn", { length: 300 }).notNull(),
  descriptionAr: text("descriptionAr"),
  descriptionEn: text("descriptionEn"),
  type: mysqlEnum("type", ["survey", "app", "visit", "review", "social", "other"]).notNull(),
  reward: int("reward", { unsigned: true }).notNull(),
  // in smallest currency unit (e.g., cents/piasters)
  duration: int("duration", { unsigned: true }).notNull(),
  // in minutes
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]).default("easy").notNull(),
  requiredProfileStrength: int("requiredProfileStrength", { unsigned: true }).default(0).notNull(),
  maxCompletions: int("maxCompletions", { unsigned: true }),
  currentCompletions: int("currentCompletions", { unsigned: true }).default(0).notNull(),
  image: varchar("image", { length: 500 }),
  rating: int("rating", { unsigned: true }).default(0).notNull(),
  // rating * 10
  status: mysqlEnum("status", ["available", "completed", "upcoming"]).default("available").notNull(),
  launchDate: timestamp("launchDate"),
  expiryDate: timestamp("expiryDate"),
  countryId: int("countryId").notNull(),
  targetTiers: text("targetTiers"),
  // JSON array of target tiers: ["tier1", "tier2", "tier3"]
  requiredTiers: json("requiredTiers"),
  // JSON object for tier requirements
  requiresMinimumTier: varchar("requiresMinimumTier", { length: 10 }),
  targetAgeMin: int("targetAgeMin"),
  targetAgeMax: int("targetAgeMax"),
  targetGender: varchar("targetGender", { length: 10 }),
  targetLocations: text("targetLocations"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var userTasks = mysqlTable("userTasks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  taskId: int("taskId").notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "rejected"]).default("pending").notNull(),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["earning", "withdrawal", "bonus", "refund"]).notNull(),
  amount: int("amount").notNull(),
  // in smallest currency unit (can be negative for withdrawals)
  currency: varchar("currency", { length: 3 }).notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed", "cancelled"]).default("pending").notNull(),
  taskId: int("taskId"),
  // null for non-task transactions
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/db.ts
var _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const connection = await mysql.createConnection(process.env.DATABASE_URL);
      _db = drizzle(connection);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByEmail(email) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}

// server/_core/cookies.ts
var COOKIE_NAME2 = "manus_session";
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  const isSecure = isSecureRequest(req);
  return {
    httpOnly: true,
    path: "/",
    // Use "lax" for localhost/http, "none" for https
    sameSite: isSecure ? "none" : "lax",
    secure: isSecure
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl || "(not configured)");
    if (!ENV.oAuthServerUrl) {
      console.warn(
        "[OAuth] WARNING: OAuth is not configured. OAuth login will be unavailable. To enable, set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId)) {
        console.warn("[Auth] Session payload missing openId");
        return null;
      }
      return {
        openId,
        appId: appId || "taskkash-app",
        name: name || "User"
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/auth-routes.ts
import { Router } from "express";
import bcrypt from "bcryptjs";
var authRouter = Router();
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required"
      });
    }
    console.log("[Auth] Looking up user:", email);
    const user = await getUserByEmail(email);
    console.log("[Auth] User found:", user ? "YES" : "NO");
    if (user) {
      console.log("[Auth] User has password:", user.password ? "YES" : "NO");
    }
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }
    console.log("[Auth] Comparing passwords...");
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log("[Auth] Password valid:", isValidPassword);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }
    const token = await sdk.signSession({
      openId: user.openId,
      appId: "taskkash-app",
      name: user.name || user.email || "User"
    });
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: req.secure || req.headers["x-forwarded-proto"] === "https",
      sameSite: req.secure || req.headers["x-forwarded-proto"] === "https" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1e3,
      // 30 days
      path: "/"
    });
    const { password: _, ...userWithoutPassword } = user;
    return res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("[Auth] Login error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});
authRouter.post("/logout", (req, res) => {
  try {
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: req.secure || req.headers["x-forwarded-proto"] === "https",
      sameSite: req.secure || req.headers["x-forwarded-proto"] === "https" ? "none" : "lax",
      path: "/"
    });
    return res.json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    console.error("[Auth] Logout error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});
authRouter.get("/me", async (req, res) => {
  try {
    console.log("[Auth /me] Cookies:", req.headers.cookie);
    const cookies = req.headers.cookie?.split(";").reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      acc[key] = value;
      return acc;
    }, {}) || {};
    const sessionToken = cookies[COOKIE_NAME];
    console.log("[Auth /me] Session token:", sessionToken ? "exists" : "missing");
    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        error: "Not authenticated"
      });
    }
    const session = await sdk.verifySession(sessionToken);
    console.log("[Auth /me] Session:", session);
    if (!session || !session.openId) {
      return res.status(401).json({
        success: false,
        error: "Invalid session"
      });
    }
    const user = await getUserByOpenId(session.openId);
    console.log("[Auth /me] User from DB:", user ? user.name : "null");
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found"
      });
    }
    const { password: _, ...userWithoutPassword } = user;
    return res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("[Auth] Get user error:", error);
    return res.status(401).json({
      success: false,
      error: "Not authenticated"
    });
  }
});
authRouter.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    console.log("[Auth] Registration attempt:", { name, email, phone });
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: "Name, email, and password are required"
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters"
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const openId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log("[Auth] Creating user with openId:", openId);
    const mysql3 = await import("mysql2/promise");
    const connection = await mysql3.createConnection(process.env.DATABASE_URL);
    try {
      const [existing] = await connection.execute(
        "SELECT id FROM users WHERE email = ?",
        [email]
      );
      if (Array.isArray(existing) && existing.length > 0) {
        await connection.end();
        return res.status(400).json({
          success: false,
          error: "Email already exists"
        });
      }
      const [result] = await connection.execute(
        `INSERT INTO users (openId, name, email, password, phone, role, balance, tier, isVerified, profileStrength, completedTasks, totalEarnings, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          openId,
          name,
          email,
          hashedPassword,
          phone || null,
          "user",
          0,
          "tier1",
          0,
          0,
          0,
          0
        ]
      );
      console.log("[Auth] User created successfully:", result);
      const token = await sdk.signSession({
        openId,
        appId: "taskkash-app",
        name
      });
      res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: req.secure || req.headers["x-forwarded-proto"] === "https",
        sameSite: req.secure || req.headers["x-forwarded-proto"] === "https" ? "none" : "lax",
        maxAge: 30 * 24 * 60 * 60 * 1e3,
        // 30 days
        path: "/"
      });
      await connection.end();
      return res.json({
        success: true,
        message: "Registration successful",
        user: {
          openId,
          name,
          email,
          phone,
          role: "user",
          balance: 0,
          tier: "tier1"
        }
      });
    } catch (dbError) {
      await connection.end();
      throw dbError;
    }
  } catch (error) {
    console.error("[Auth] Register error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});
authRouter.post("/advertiser/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required"
      });
    }
    const mysql3 = await import("mysql2/promise");
    const connection = await mysql3.createConnection(process.env.DATABASE_URL);
    const [advertisers2] = await connection.execute(
      "SELECT * FROM advertisers WHERE email = ? AND isActive = 1",
      [email]
    );
    await connection.end();
    if (!Array.isArray(advertisers2) || advertisers2.length === 0) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }
    const advertiser = advertisers2[0];
    const isValidPassword = await bcrypt.compare(password, advertiser.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }
    const token = await sdk.createSessionToken(`advertiser_${advertiser.id}`, {
      name: advertiser.nameEn || advertiser.email
    });
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: req.secure || req.headers["x-forwarded-proto"] === "https",
      sameSite: req.secure || req.headers["x-forwarded-proto"] === "https" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1e3,
      // 30 days
      path: "/"
    });
    const { password: _, ...advertiserWithoutPassword } = advertiser;
    return res.json({
      success: true,
      advertiser: advertiserWithoutPassword
    });
  } catch (error) {
    console.error("[Auth] Advertiser login error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});
authRouter.get("/advertiser/me", async (req, res) => {
  try {
    console.log("[Advertiser /me] Cookies:", req.headers.cookie);
    console.log("[Advertiser /me] COOKIE_NAME:", COOKIE_NAME);
    const token = req.cookies[COOKIE_NAME];
    console.log("[Advertiser /me] Token:", token ? "exists" : "missing");
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Not authenticated"
      });
    }
    const payload = await sdk.verifySession(token);
    if (!payload || !payload.openId) {
      return res.status(401).json({
        success: false,
        error: "Invalid session"
      });
    }
    if (!payload.openId.startsWith("advertiser_")) {
      return res.status(403).json({
        success: false,
        error: "Not an advertiser account"
      });
    }
    const advertiserId = payload.openId.replace("advertiser_", "");
    const mysql3 = await import("mysql2/promise");
    const connection = await mysql3.createConnection(process.env.DATABASE_URL);
    const [advertisers2] = await connection.execute(
      "SELECT * FROM advertisers WHERE id = ? AND isActive = 1",
      [advertiserId]
    );
    await connection.end();
    if (!Array.isArray(advertisers2) || advertisers2.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Advertiser not found"
      });
    }
    const advertiser = advertisers2[0];
    const { password: _, ...advertiserWithoutPassword } = advertiser;
    return res.json({
      success: true,
      advertiser: advertiserWithoutPassword
    });
  } catch (error) {
    console.error("[Auth] Get advertiser error:", error);
    return res.status(401).json({
      success: false,
      error: "Not authenticated"
    });
  }
});
authRouter.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required"
      });
    }
    const ADMIN_EMAIL = "admin@taskkash.com";
    const ADMIN_PASSWORD = "password123";
    if (email !== ADMIN_EMAIL) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }
    const isValidPassword = password === ADMIN_PASSWORD;
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }
    const token = await sdk.createSessionToken("admin_001", {
      name: "Admin User"
    });
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: req.secure || req.headers["x-forwarded-proto"] === "https",
      sameSite: req.secure || req.headers["x-forwarded-proto"] === "https" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1e3,
      // 30 days
      path: "/"
    });
    return res.json({
      success: true,
      admin: {
        id: 1,
        openId: "admin_001",
        email: ADMIN_EMAIL,
        name: "Admin User",
        role: "admin"
      }
    });
  } catch (error) {
    console.error("[Auth] Admin login error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});
authRouter.get("/admin/me", async (req, res) => {
  try {
    console.log("[Admin /me] Cookies:", req.headers.cookie);
    const token = req.cookies[COOKIE_NAME];
    console.log("[Admin /me] Token:", token ? "exists" : "missing");
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Not authenticated"
      });
    }
    const payload = await sdk.verifySession(token);
    if (!payload || !payload.openId) {
      return res.status(401).json({
        success: false,
        error: "Invalid session"
      });
    }
    if (!payload.openId.startsWith("admin_")) {
      return res.status(403).json({
        success: false,
        error: "Not an admin account"
      });
    }
    return res.json({
      success: true,
      admin: {
        id: 1,
        openId: payload.openId,
        email: "admin@taskkash.com",
        name: payload.name || "Admin User",
        role: "admin"
      }
    });
  } catch (error) {
    console.error("[Auth] Get admin error:", error);
    return res.status(401).json({
      success: false,
      error: "Not authenticated"
    });
  }
});

// server/_core/admin-routes.ts
import { Router as Router2 } from "express";
import bcrypt2 from "bcryptjs";
var adminRouter = Router2();
var verifyAdmin = async (req, res, next) => {
  try {
    const token = req.cookies[COOKIE_NAME];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Not authenticated"
      });
    }
    const payload = await sdk.verifySession(token);
    if (!payload || !payload.openId || !payload.openId.startsWith("admin_")) {
      return res.status(403).json({
        success: false,
        error: "Admin access required"
      });
    }
    req.admin = payload;
    next();
  } catch (error) {
    console.error("[Admin] Verification error:", error);
    return res.status(401).json({
      success: false,
      error: "Invalid session"
    });
  }
};
adminRouter.post("/users", verifyAdmin, async (req, res) => {
  try {
    const { name, email, password, phone, role, balance, tier, isVerified } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: "Name, email, and password are required"
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters"
      });
    }
    const hashedPassword = await bcrypt2.hash(password, 10);
    const openId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const mysql3 = await import("mysql2/promise");
    const connection = await mysql3.createConnection(process.env.DATABASE_URL);
    const [existing] = await connection.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (Array.isArray(existing) && existing.length > 0) {
      await connection.end();
      return res.status(400).json({
        success: false,
        error: "Email already exists"
      });
    }
    const [result] = await connection.execute(
      `INSERT INTO users (openId, name, email, password, phone, role, balance, tier, isVerified, profileStrength, completedTasks, totalEarnings, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        openId,
        name,
        email,
        hashedPassword,
        phone || null,
        role || "user",
        balance || 0,
        tier || "tier1",
        isVerified ? 1 : 0,
        0,
        0,
        0
      ]
    );
    const [users2] = await connection.execute(
      "SELECT id, openId, name, email, phone, role, balance, tier, isVerified FROM users WHERE id = ?",
      [result.insertId]
    );
    await connection.end();
    return res.json({
      success: true,
      user: users2[0],
      message: "User created successfully"
    });
  } catch (error) {
    console.error("[Admin] Create user error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to create user"
    });
  }
});
adminRouter.get("/users", verifyAdmin, async (req, res) => {
  try {
    const mysql3 = await import("mysql2/promise");
    const connection = await mysql3.createConnection(process.env.DATABASE_URL);
    const [users2] = await connection.execute(
      "SELECT id, openId, name, email, phone, role, balance, completedTasks, totalEarnings, tier, profileStrength, countryId, isVerified, createdAt, updatedAt, lastSignedIn FROM users ORDER BY createdAt DESC"
    );
    await connection.end();
    return res.json({
      success: true,
      users: users2
    });
  } catch (error) {
    console.error("[Admin] Get users error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch users"
    });
  }
});
adminRouter.get("/users/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const mysql3 = await import("mysql2/promise");
    const connection = await mysql3.createConnection(process.env.DATABASE_URL);
    const [users2] = await connection.execute(
      "SELECT id, openId, name, email, phone, role, balance, completedTasks, totalEarnings, tier, profileStrength, countryId, isVerified, createdAt, updatedAt, lastSignedIn FROM users WHERE id = ?",
      [id]
    );
    await connection.end();
    if (!Array.isArray(users2) || users2.length === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }
    return res.json({
      success: true,
      user: users2[0]
    });
  } catch (error) {
    console.error("[Admin] Get user error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch user"
    });
  }
});
adminRouter.put("/users/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, balance, tier, isVerified, profileStrength } = req.body;
    const mysql3 = await import("mysql2/promise");
    const connection = await mysql3.createConnection(process.env.DATABASE_URL);
    const updates = [];
    const values = [];
    if (name !== void 0) {
      updates.push("name = ?");
      values.push(name);
    }
    if (email !== void 0) {
      updates.push("email = ?");
      values.push(email);
    }
    if (phone !== void 0) {
      updates.push("phone = ?");
      values.push(phone);
    }
    if (role !== void 0) {
      updates.push("role = ?");
      values.push(role);
    }
    if (balance !== void 0) {
      updates.push("balance = ?");
      values.push(balance);
    }
    if (tier !== void 0) {
      updates.push("tier = ?");
      values.push(tier);
    }
    if (isVerified !== void 0) {
      updates.push("isVerified = ?");
      values.push(isVerified ? 1 : 0);
    }
    if (profileStrength !== void 0) {
      updates.push("profileStrength = ?");
      values.push(profileStrength);
    }
    updates.push("updatedAt = NOW()");
    values.push(id);
    await connection.execute(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
      values
    );
    const [users2] = await connection.execute(
      "SELECT id, openId, name, email, phone, role, balance, completedTasks, totalEarnings, tier, profileStrength, countryId, isVerified, createdAt, updatedAt FROM users WHERE id = ?",
      [id]
    );
    await connection.end();
    return res.json({
      success: true,
      user: users2[0],
      message: "User updated successfully"
    });
  } catch (error) {
    console.error("[Admin] Update user error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to update user"
    });
  }
});
adminRouter.post("/users/:id/reset-password", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters"
      });
    }
    const hashedPassword = await bcrypt2.hash(newPassword, 10);
    const mysql3 = await import("mysql2/promise");
    const connection = await mysql3.createConnection(process.env.DATABASE_URL);
    await connection.execute(
      "UPDATE users SET password = ?, updatedAt = NOW() WHERE id = ?",
      [hashedPassword, id]
    );
    await connection.end();
    return res.json({
      success: true,
      message: "Password reset successfully"
    });
  } catch (error) {
    console.error("[Admin] Reset password error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to reset password"
    });
  }
});
adminRouter.delete("/users/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const mysql3 = await import("mysql2/promise");
    const connection = await mysql3.createConnection(process.env.DATABASE_URL);
    await connection.execute("DELETE FROM users WHERE id = ?", [id]);
    await connection.end();
    return res.json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error("[Admin] Delete user error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to delete user"
    });
  }
});
adminRouter.post("/advertisers", verifyAdmin, async (req, res) => {
  try {
    const { email, password, nameEn, nameAr, slug, isActive } = req.body;
    if (!email || !password || !nameEn) {
      return res.status(400).json({
        success: false,
        error: "Email, password, and English name are required"
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters"
      });
    }
    const hashedPassword = await bcrypt2.hash(password, 10);
    const finalSlug = slug || nameEn.toLowerCase().replace(/\s+/g, "-");
    const mysql3 = await import("mysql2/promise");
    const connection = await mysql3.createConnection(process.env.DATABASE_URL);
    const [existing] = await connection.execute(
      "SELECT id FROM advertisers WHERE email = ? OR slug = ?",
      [email, finalSlug]
    );
    if (Array.isArray(existing) && existing.length > 0) {
      await connection.end();
      return res.status(400).json({
        success: false,
        error: "Email or slug already exists"
      });
    }
    const [result] = await connection.execute(
      `INSERT INTO advertisers (email, password, nameEn, nameAr, slug, isActive, countryId, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        email,
        hashedPassword,
        nameEn,
        nameAr || null,
        finalSlug,
        isActive !== void 0 ? isActive ? 1 : 0 : 1,
        1
        // Default countryId
      ]
    );
    const [advertisers2] = await connection.execute(
      "SELECT id, email, nameEn, nameAr, slug, isActive FROM advertisers WHERE id = ?",
      [result.insertId]
    );
    await connection.end();
    return res.json({
      success: true,
      advertiser: advertisers2[0],
      message: "Advertiser created successfully"
    });
  } catch (error) {
    console.error("[Admin] Create advertiser error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to create advertiser"
    });
  }
});
adminRouter.get("/advertisers", verifyAdmin, async (req, res) => {
  try {
    const mysql3 = await import("mysql2/promise");
    const connection = await mysql3.createConnection(process.env.DATABASE_URL);
    const [advertisers2] = await connection.execute(
      "SELECT id, email, nameEn, nameAr, slug, isActive, createdAt, updatedAt FROM advertisers ORDER BY createdAt DESC"
    );
    await connection.end();
    return res.json({
      success: true,
      advertisers: advertisers2
    });
  } catch (error) {
    console.error("[Admin] Get advertisers error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch advertisers"
    });
  }
});
adminRouter.get("/advertisers/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const mysql3 = await import("mysql2/promise");
    const connection = await mysql3.createConnection(process.env.DATABASE_URL);
    const [advertisers2] = await connection.execute(
      "SELECT id, email, nameEn, nameAr, slug, isActive, createdAt, updatedAt FROM advertisers WHERE id = ?",
      [id]
    );
    await connection.end();
    if (!Array.isArray(advertisers2) || advertisers2.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Advertiser not found"
      });
    }
    return res.json({
      success: true,
      advertiser: advertisers2[0]
    });
  } catch (error) {
    console.error("[Admin] Get advertiser error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch advertiser"
    });
  }
});
adminRouter.put("/advertisers/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, nameEn, nameAr, slug, isActive } = req.body;
    const mysql3 = await import("mysql2/promise");
    const connection = await mysql3.createConnection(process.env.DATABASE_URL);
    const updates = [];
    const values = [];
    if (email !== void 0) {
      updates.push("email = ?");
      values.push(email);
    }
    if (nameEn !== void 0) {
      updates.push("nameEn = ?");
      values.push(nameEn);
    }
    if (nameAr !== void 0) {
      updates.push("nameAr = ?");
      values.push(nameAr);
    }
    if (slug !== void 0) {
      updates.push("slug = ?");
      values.push(slug);
    }
    if (isActive !== void 0) {
      updates.push("isActive = ?");
      values.push(isActive ? 1 : 0);
    }
    updates.push("updatedAt = NOW()");
    values.push(id);
    await connection.execute(
      `UPDATE advertisers SET ${updates.join(", ")} WHERE id = ?`,
      values
    );
    const [advertisers2] = await connection.execute(
      "SELECT id, email, nameEn, nameAr, slug, isActive, createdAt, updatedAt FROM advertisers WHERE id = ?",
      [id]
    );
    await connection.end();
    return res.json({
      success: true,
      advertiser: advertisers2[0],
      message: "Advertiser updated successfully"
    });
  } catch (error) {
    console.error("[Admin] Update advertiser error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to update advertiser"
    });
  }
});
adminRouter.post("/advertisers/:id/reset-password", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters"
      });
    }
    const hashedPassword = await bcrypt2.hash(newPassword, 10);
    const mysql3 = await import("mysql2/promise");
    const connection = await mysql3.createConnection(process.env.DATABASE_URL);
    await connection.execute(
      "UPDATE advertisers SET password = ?, updatedAt = NOW() WHERE id = ?",
      [hashedPassword, id]
    );
    await connection.end();
    return res.json({
      success: true,
      message: "Password reset successfully"
    });
  } catch (error) {
    console.error("[Admin] Reset advertiser password error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to reset password"
    });
  }
});
adminRouter.delete("/advertisers/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const mysql3 = await import("mysql2/promise");
    const connection = await mysql3.createConnection(process.env.DATABASE_URL);
    await connection.execute("DELETE FROM advertisers WHERE id = ?", [id]);
    await connection.end();
    return res.json({
      success: true,
      message: "Advertiser deleted successfully"
    });
  } catch (error) {
    console.error("[Admin] Delete advertiser error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to delete advertiser"
    });
  }
});
adminRouter.get("/stats", verifyAdmin, async (req, res) => {
  try {
    const mysql3 = await import("mysql2/promise");
    const connection = await mysql3.createConnection(process.env.DATABASE_URL);
    const [userCount] = await connection.execute("SELECT COUNT(*) as count FROM users");
    const [advertiserCount] = await connection.execute("SELECT COUNT(*) as count FROM advertisers WHERE isActive = 1");
    const [verifiedUsers] = await connection.execute("SELECT COUNT(*) as count FROM users WHERE isVerified = 1");
    await connection.end();
    return res.json({
      success: true,
      stats: {
        totalUsers: userCount[0].count,
        totalAdvertisers: advertiserCount[0].count,
        verifiedUsers: verifiedUsers[0].count
      }
    });
  } catch (error) {
    console.error("[Admin] Get stats error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch statistics"
    });
  }
});

// server/_core/task-routes.ts
import { Router as Router3 } from "express";
import Database from "better-sqlite3";
import path from "path";

// server/_core/mysql-db.ts
import mysql2 from "mysql2/promise";
var getDatabaseConfig = () => {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    const match = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (match) {
      return {
        host: match[3],
        user: match[1],
        password: match[2],
        database: match[5],
        port: parseInt(match[4])
      };
    }
  }
  return {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "taskkash_user",
    password: process.env.DB_PASSWORD || "TaskKash2025Secure",
    database: process.env.DB_NAME || "taskkash",
    port: parseInt(process.env.DB_PORT || "3306")
  };
};
var pool = mysql2.createPool({
  ...getDatabaseConfig(),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
async function query(sql5, params) {
  const [results] = await pool.execute(sql5, params);
  return results;
}
async function getConnection() {
  return await pool.getConnection();
}

// server/_core/task-routes.ts
var router = Router3();
var dbPath = path.join(process.cwd(), "server", "db.sqlite");
function getDb2() {
  const db = new Database(dbPath);
  db.exec("PRAGMA foreign_keys = ON");
  return db;
}
async function isAdvertiser(req, res, next) {
  try {
    const { default: sdk2 } = await import("@manus/sdk");
    const session = await sdk2.getSession(req);
    if (!session || !session.openId || !session.openId.startsWith("advertiser_")) {
      return res.status(403).json({ error: "Advertiser access required" });
    }
    const advertiserId = parseInt(session.openId.replace("advertiser_", ""));
    req.advertiserId = advertiserId;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Advertiser access required" });
  }
}
async function isUser(req, res, next) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user || !user.id) {
      return res.status(401).json({ error: "User login required" });
    }
    req.userId = user.id;
    req.user = user;
    next();
  } catch (error) {
    console.error("[isUser] Authentication error:", error);
    return res.status(401).json({ error: "User login required" });
  }
}
router.post("/tasks", isAdvertiser, (req, res) => {
  const db = getDb2();
  try {
    const {
      type,
      // 'video' or 'quiz'
      titleEn,
      titleAr,
      descriptionEn,
      descriptionAr,
      reward,
      completionsNeeded,
      difficulty,
      duration,
      targetAgeMin,
      targetAgeMax,
      targetGender,
      targetLocations,
      targetTiers,
      allowMultipleCompletions,
      dailyLimitPerUser,
      requiresMinimumTier,
      passingScore,
      minWatchPercentage,
      taskData,
      // For video URL, etc.
      questions,
      // Array of questions
      expiresAt
    } = req.body;
    if (!type || !titleEn || !descriptionEn || !reward || !completionsNeeded || !duration) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const totalBudget = reward * completionsNeeded;
    const minimumBudget = totalBudget * 0.2;
    const insertTask = db.prepare(`
      INSERT INTO tasks (
        advertiserId, type, titleEn, titleAr, descriptionEn, descriptionAr,
        reward, totalBudget, minimumBudget, completionsNeeded,
        difficulty, duration, status,
        targetAgeMin, targetAgeMax, targetGender, targetLocations, targetTiers,
        allowMultipleCompletions, dailyLimitPerUser, requiresMinimumTier,
        verificationMethod, passingScore, minWatchPercentage,
        taskData, expiresAt
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, 'draft',
        ?, ?, ?, ?, ?,
        ?, ?, ?,
        'automatic', ?, ?,
        ?, ?
      )
    `);
    const result = insertTask.run(
      req.advertiserId,
      type,
      titleEn,
      titleAr || null,
      descriptionEn,
      descriptionAr || null,
      reward,
      totalBudget,
      minimumBudget,
      completionsNeeded,
      difficulty || "medium",
      duration,
      targetAgeMin || null,
      targetAgeMax || null,
      targetGender || "all",
      targetLocations ? JSON.stringify(targetLocations) : null,
      targetTiers ? JSON.stringify(targetTiers) : null,
      allowMultipleCompletions ? 1 : 0,
      dailyLimitPerUser || 0,
      requiresMinimumTier || null,
      passingScore || 80,
      minWatchPercentage || 80,
      taskData ? JSON.stringify(taskData) : null,
      expiresAt || null
    );
    const taskId = result.lastInsertRowid;
    if (questions && questions.length > 0) {
      const insertQuestion = db.prepare(`
        INSERT INTO task_questions (
          taskId, questionText, questionOrder, questionType,
          optionA, optionB, optionC, optionD,
          correctAnswer, explanation, imageUrl
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      questions.forEach((q, index) => {
        insertQuestion.run(
          taskId,
          q.questionText,
          index + 1,
          q.questionType || "multiple_choice",
          q.optionA || null,
          q.optionB || null,
          q.optionC || null,
          q.optionD || null,
          q.correctAnswer,
          q.explanation || null,
          q.imageUrl || null
        );
      });
    }
    res.json({
      success: true,
      taskId,
      message: "Task created successfully",
      totalBudget,
      minimumBudget
    });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: error.message });
  } finally {
    db.close();
  }
});
router.get("/tasks/my-tasks", isAdvertiser, (req, res) => {
  const db = getDb2();
  try {
    const tasks2 = db.prepare(`
      SELECT * FROM tasks 
      WHERE advertiserId = ?
      ORDER BY createdAt DESC
    `).all(req.advertiserId);
    const tasksWithParsedData = tasks2.map((task) => ({
      ...task,
      targetLocations: task.targetLocations ? JSON.parse(task.targetLocations) : null,
      targetTiers: task.targetTiers ? JSON.parse(task.targetTiers) : null,
      taskData: task.taskData ? JSON.parse(task.taskData) : null
    }));
    res.json({ tasks: tasksWithParsedData });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: error.message });
  } finally {
    db.close();
  }
});
router.post("/tasks/:id/publish", isAdvertiser, (req, res) => {
  const db = getDb2();
  const taskId = parseInt(req.params.id);
  try {
    const task = db.prepare("SELECT * FROM tasks WHERE id = ? AND advertiserId = ?").get(taskId, req.advertiserId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    db.prepare(`
      UPDATE tasks 
      SET status = 'active', publishedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(taskId);
    res.json({ success: true, message: "Task published successfully" });
  } catch (error) {
    console.error("Error publishing task:", error);
    res.status(500).json({ error: error.message });
  } finally {
    db.close();
  }
});
router.get("/tasks/:id/submissions", isAdvertiser, (req, res) => {
  const db = getDb2();
  const taskId = parseInt(req.params.id);
  try {
    const task = db.prepare("SELECT * FROM tasks WHERE id = ? AND advertiserId = ?").get(taskId, req.advertiserId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    const submissions = db.prepare(`
      SELECT 
        s.*,
        u.name as userName,
        u.email as userEmail,
        u.tier as userTier
      FROM task_submissions s
      JOIN users u ON s.userId = u.id
      WHERE s.taskId = ?
      ORDER BY s.createdAt DESC
    `).all(taskId);
    const submissionsWithParsedData = submissions.map((sub) => ({
      ...sub,
      submissionData: sub.submissionData ? JSON.parse(sub.submissionData) : null,
      uploadedFiles: sub.uploadedFiles ? JSON.parse(sub.uploadedFiles) : null,
      gpsLocation: sub.gpsLocation ? JSON.parse(sub.gpsLocation) : null
    }));
    res.json({ submissions: submissionsWithParsedData });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ error: error.message });
  } finally {
    db.close();
  }
});
router.post("/tasks/:id/submissions/:submissionId/review", isAdvertiser, (req, res) => {
  const db = getDb2();
  const taskId = parseInt(req.params.id);
  const submissionId = parseInt(req.params.submissionId);
  const { action, notes } = req.body;
  try {
    const task = db.prepare("SELECT * FROM tasks WHERE id = ? AND advertiserId = ?").get(taskId, req.advertiserId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    const submission = db.prepare("SELECT * FROM task_submissions WHERE id = ? AND taskId = ?").get(submissionId, taskId);
    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }
    if (action === "approve") {
      db.prepare(`
        UPDATE task_submissions
        SET status = 'approved', 
            reviewedBy = ?,
            reviewedAt = CURRENT_TIMESTAMP,
            reviewNotes = ?,
            rewardCredited = 1,
            creditedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(req.advertiserId, notes || null, submissionId);
      db.prepare("UPDATE tasks SET completionsCount = completionsCount + 1 WHERE id = ?").run(taskId);
      const task2 = db.prepare("SELECT titleEn FROM tasks WHERE id = ?").get(taskId);
      db.prepare(`
        INSERT INTO transactions (userId, type, amount, description, status, relatedTaskId)
        VALUES (?, 'earning', ?, ?, 'completed', ?)
      `).run(
        submission.userId,
        submission.rewardAmount,
        `Task completed: ${task2.titleEn}`,
        taskId
      );
      res.json({ success: true, message: "Submission approved and reward credited" });
    } else if (action === "reject") {
      db.prepare(`
        UPDATE task_submissions
        SET status = 'rejected',
            reviewedBy = ?,
            reviewedAt = CURRENT_TIMESTAMP,
            rejectionReason = ?
        WHERE id = ?
      `).run(req.advertiserId, notes || "Did not meet requirements", submissionId);
      res.json({ success: true, message: "Submission rejected" });
    } else {
      res.status(400).json({ error: "Invalid action" });
    }
  } catch (error) {
    console.error("Error reviewing submission:", error);
    res.status(500).json({ error: error.message });
  } finally {
    db.close();
  }
});
router.get("/tasks/:id/export", isAdvertiser, (req, res) => {
  const db = getDb2();
  const taskId = parseInt(req.params.id);
  try {
    const task = db.prepare("SELECT * FROM tasks WHERE id = ? AND advertiserId = ?").get(taskId, req.advertiserId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    const submissions = db.prepare(`
      SELECT 
        s.id, s.userId, u.name, u.email, u.tier,
        s.status, s.score, s.createdAt, s.completedAt,
        s.rewardAmount, s.rewardCredited
      FROM task_submissions s
      JOIN users u ON s.userId = u.id
      WHERE s.taskId = ?
      ORDER BY s.createdAt DESC
    `).all(taskId);
    const headers = ["ID", "User ID", "Name", "Email", "Tier", "Status", "Score", "Submitted At", "Completed At", "Reward", "Credited"];
    const rows = submissions.map((s) => [
      s.id,
      s.userId,
      s.name,
      s.email,
      s.tier,
      s.status,
      s.score || "N/A",
      s.createdAt,
      s.completedAt || "N/A",
      s.rewardAmount,
      s.rewardCredited ? "Yes" : "No"
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="task-${taskId}-submissions.csv"`);
    res.send(csv);
  } catch (error) {
    console.error("Error exporting submissions:", error);
    res.status(500).json({ error: error.message });
  } finally {
    db.close();
  }
});
router.get("/tasks", async (req, res) => {
  let userId = null;
  try {
    const user = await sdk.authenticateRequest(req);
    if (user && user.id) {
      userId = user.id;
    }
  } catch (error) {
  }
  try {
    const { type, difficulty, minReward, maxReward, advertiserId } = req.query;
    let query2 = `
      SELECT t.*, a.nameEn as advertiserName, a.nameAr as advertiserNameAr, 
             a.logoUrl as advertiserLogo, a.id as advertiserDbId
      FROM tasks t
      LEFT JOIN advertisers a ON t.advertiserId = a.id
      WHERE t.status IN ('active', 'published')
      AND t.completionsCount < t.completionsNeeded
    `;
    const params = [];
    if (type) {
      query2 += " AND t.type = ?";
      params.push(type);
    }
    if (difficulty) {
      query2 += " AND t.difficulty = ?";
      params.push(difficulty);
    }
    if (minReward) {
      query2 += " AND t.reward >= ?";
      params.push(parseFloat(minReward));
    }
    if (maxReward) {
      query2 += " AND t.reward <= ?";
      params.push(parseFloat(maxReward));
    }
    if (advertiserId) {
      query2 += " AND t.advertiserId = ?";
      params.push(parseInt(advertiserId));
    }
    query2 += " ORDER BY t.createdAt DESC";
    const tasks2 = await query(query2, params);
    let completedTaskIds = [];
    if (userId) {
      const completed = await query(`
        SELECT DISTINCT taskId FROM task_submissions 
        WHERE userId = ? AND status IN ('completed', 'approved')
      `, [userId]);
      completedTaskIds = completed.map((c) => c.taskId);
    }
    const tasksWithData = tasks2.map((task) => ({
      ...task,
      targetLocations: task.targetLocations ? JSON.parse(task.targetLocations) : null,
      targetTiers: task.targetTiers ? JSON.parse(task.targetTiers) : null,
      taskData: task.taskData ? JSON.parse(task.taskData) : null,
      isCompleted: completedTaskIds.includes(task.id),
      canComplete: !completedTaskIds.includes(task.id) || task.allowMultipleCompletions
    }));
    let userTier = null;
    if (userId) {
      const userResult = await query("SELECT tier FROM users WHERE id = ?", [userId]);
      if (userResult && userResult.length > 0) {
        userTier = userResult[0].tier;
      }
    }
    const availableTasks = tasksWithData.filter((task) => {
      if (task.isCompleted && !task.allowMultipleCompletions) {
        return false;
      }
      if (userTier && task.targetTiers && Array.isArray(task.targetTiers)) {
        const matches = task.targetTiers.includes(userTier);
        return matches;
      }
      return true;
    });
    res.json({ tasks: availableTasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: error.message });
  }
});
router.get("/tasks/:id", async (req, res) => {
  const taskId = parseInt(req.params.id);
  try {
    const tasks2 = await query(`
      SELECT * FROM tasks WHERE id = ?
    `, [taskId]);
    if (!tasks2 || tasks2.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    const task = tasks2[0];
    const questions = await query(`
      SELECT id, questionText, questionTextAr, questionOrder, questionType,
             optionA, optionAAr, optionB, optionBAr, 
             optionC, optionCAr, optionD, optionDAr, imageUrl
      FROM task_questions
      WHERE taskId = ?
      ORDER BY questionOrder
    `, [taskId]);
    const taskWithData = {
      ...task,
      targetLocations: task.targetLocations ? JSON.parse(task.targetLocations) : null,
      targetTiers: task.targetTiers ? JSON.parse(task.targetTiers) : null,
      taskData: task.taskData ? JSON.parse(task.taskData) : null,
      questions
    };
    res.json({ task: taskWithData });
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ error: error.message });
  }
});
router.post("/tasks/:id/start", isUser, (req, res) => {
  const db = getDb2();
  const taskId = parseInt(req.params.id);
  try {
    const task = db.prepare("SELECT * FROM tasks WHERE id = ? AND status = ?").get(taskId, "active");
    if (!task) {
      return res.status(404).json({ error: "Task not found or not active" });
    }
    if (!task.allowMultipleCompletions) {
      const existing = db.prepare(`
        SELECT * FROM task_submissions 
        WHERE taskId = ? AND userId = ? AND status IN ('approved', 'completed')
      `).get(taskId, req.userId);
      if (existing) {
        return res.status(400).json({ error: "You have already completed this task" });
      }
    }
    res.json({
      success: true,
      message: "Task started",
      startTime: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Error starting task:", error);
    res.status(500).json({ error: error.message });
  } finally {
    db.close();
  }
});
router.post("/tasks/:id/submit", isUser, async (req, res) => {
  const taskId = parseInt(req.params.id);
  const { answers, watchTime } = req.body;
  console.log("[Submit Task] User ID:", req.userId);
  console.log("[Submit Task] Task ID:", taskId);
  console.log("[Submit Task] Answers:", answers);
  console.log("[Submit Task] Watch Time:", watchTime);
  try {
    const tasks2 = await query("SELECT * FROM tasks WHERE id = ?", [taskId]);
    if (!tasks2 || tasks2.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    const task = tasks2[0];
    const questions = await query(`
      SELECT * FROM task_questions WHERE taskId = ? ORDER BY questionOrder
    `, [taskId]);
    let correctCount = 0;
    const answerResults = questions.map((q, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === q.correctAnswer;
      if (isCorrect) correctCount++;
      return {
        questionId: q.id,
        questionText: q.questionText,
        userAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect
      };
    });
    const score = Math.round(correctCount / questions.length * 100);
    const passed = score >= task.passingScore;
    console.log("[Submit Task] Correct Count:", correctCount);
    console.log("[Submit Task] Total Questions:", questions.length);
    console.log("[Submit Task] Score:", score);
    console.log("[Submit Task] Passing Score:", task.passingScore);
    console.log("[Submit Task] Passed:", passed);
    let watchTimePassed = true;
    if (task.type === "video" && watchTime) {
      let videoDurationSeconds = task.duration * 60;
      if (task.taskData) {
        const taskData = typeof task.taskData === "string" ? JSON.parse(task.taskData) : task.taskData;
        if (taskData.duration) {
          videoDurationSeconds = taskData.duration;
        }
      }
      const requiredWatchTime = videoDurationSeconds * task.minWatchPercentage / 100;
      watchTimePassed = watchTime >= requiredWatchTime;
      console.log("[Submit Task] Video Duration:", videoDurationSeconds, "seconds");
      console.log("[Submit Task] Required Watch Time:", requiredWatchTime, "seconds");
      console.log("[Submit Task] User Watch Time:", watchTime, "seconds");
      console.log("[Submit Task] Watch Time Passed:", watchTimePassed);
    }
    const finalPassed = passed && watchTimePassed;
    console.log("[DEBUG] About to insert submission into MySQL");
    const submissionData = JSON.stringify({
      answers: answerResults,
      passed: finalPassed,
      watchTimePassed
    });
    const mysqlDatetime = finalPassed ? (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ") : null;
    const result = await query(`
      INSERT INTO task_submissions (
        taskId, userId, status, submissionData,
        score, watchTime, correctAnswers, totalQuestions,
        rewardAmount, rewardCredited, completedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      taskId,
      req.userId,
      finalPassed ? "approved" : "rejected",
      submissionData,
      score,
      watchTime || null,
      correctCount,
      questions.length,
      finalPassed ? task.reward : 0,
      finalPassed ? 1 : 0,
      mysqlDatetime
    ]);
    if (finalPassed) {
      const existingCompletion = await query(
        `SELECT id FROM userTasks WHERE userId = ? AND taskId = ? AND status = 'completed'`,
        [req.userId, taskId]
      );
      if (existingCompletion && existingCompletion.length > 0) {
        console.log(`[DUPLICATE] User ${req.userId} already completed task ${taskId}`);
        return res.status(400).json({
          error: "You have already completed this task",
          success: false
        });
      }
      try {
        await query(
          `UPDATE users 
           SET balance = balance + ?,
               completedTasks = completedTasks + 1,
               totalEarnings = totalEarnings + ?,
               updatedAt = NOW()
           WHERE id = ?`,
          [task.reward, task.reward, req.userId]
        );
        await query(
          `INSERT INTO userTasks 
           (userId, taskId, status, submittedAt, completedAt, reward, submissionData)
           VALUES (?, ?, 'completed', NOW(), NOW(), ?, ?)`,
          [req.userId, taskId, task.reward, JSON.stringify({ score, answers: answerResults })]
        );
        await query(
          `INSERT INTO transactions 
           (userId, type, amount, balanceBefore, balanceAfter, description, status, relatedTaskId, createdAt)
           SELECT ?, 'earn', ?, balance - ?, balance, ?, 'completed', ?, NOW()
           FROM users WHERE id = ?`,
          [req.userId, task.reward, task.reward, `Task completed: ${task.titleEn}`, taskId, req.userId]
        );
        await query("UPDATE tasks SET completionsCount = completionsCount + 1 WHERE id = ?", [taskId]);
        console.log(`[WALLET] Successfully credited ${task.reward} EGP to user ${req.userId}`);
      } catch (error) {
        console.error("[WALLET] Error updating user balance:", error);
      }
    }
    const previousAttempts = await query(
      `SELECT COUNT(*) as count FROM task_submissions 
       WHERE taskId = ? AND userId = ? AND status = 'rejected'`,
      [taskId, req.userId]
    );
    const attemptNumber = (previousAttempts[0]?.count || 0) + 1;
    const canRetry = attemptNumber < 3;
    res.json({
      success: true,
      passed: finalPassed,
      score,
      correctAnswers: correctCount,
      totalQuestions: questions.length,
      reward: finalPassed ? task.reward : 0,
      message: finalPassed ? "Congratulations! Task completed successfully!" : "Sorry, you did not pass. Please try again.",
      submissionId: result.insertId,
      attemptNumber,
      canRetry,
      maxAttempts: 3,
      // Always return full answer results with correct answers for learning
      answerResults: answerResults.map((a) => ({
        questionId: a.questionId,
        questionText: a.questionText,
        userAnswer: a.userAnswer,
        correctAnswer: a.correctAnswer,
        isCorrect: a.isCorrect
      }))
    });
  } catch (error) {
    console.error("Error submitting task:", error);
    res.status(500).json({ error: error.message });
  }
});
router.get("/tasks/my-submissions", isUser, (req, res) => {
  const db = getDb2();
  try {
    const submissions = db.prepare(`
      SELECT 
        s.*,
        t.titleEn as taskTitle,
        t.type as taskType,
        a.nameEn as advertiserName
      FROM task_submissions s
      JOIN tasks t ON s.taskId = t.id
      JOIN advertisers a ON t.advertiserId = a.id
      WHERE s.userId = ?
      ORDER BY s.createdAt DESC
    `).all(req.userId);
    const submissionsWithData = submissions.map((sub) => ({
      ...sub,
      submissionData: sub.submissionData ? JSON.parse(sub.submissionData) : null
    }));
    res.json({ submissions: submissionsWithData });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ error: error.message });
  } finally {
    db.close();
  }
});
router.get("/transactions", isUser, async (req, res) => {
  try {
    const transactions2 = await query(`
      SELECT 
        id,
        type,
        amount,
        description,
        status,
        relatedTaskId,
        createdAt as date
      FROM transactions
      WHERE userId = ?
      ORDER BY createdAt DESC
    `, [req.userId]);
    res.json({ transactions: transactions2 });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: error.message });
  }
});
var task_routes_default = router;

// server/_core/profile-routes.ts
import { Router as Router4 } from "express";
var router2 = Router4();
router2.post("/complete", async (req, res) => {
  try {
    const authUser = await sdk.authenticateRequest(req);
    if (!authUser || !authUser.openId) {
      console.log("[Profile] Authentication failed");
      return res.status(401).json({
        error: "Unauthorized",
        details: "Please login again."
      });
    }
    const openId = authUser.openId;
    const { profileData } = req.body;
    console.log("[Profile] Completing profile for user:", openId);
    console.log("[Profile] Profile data:", profileData);
    const users2 = await query(
      "SELECT id, balance, profileStrength FROM users WHERE openId = ?",
      [openId]
    );
    if (users2.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const user = users2[0];
    if (user.profileStrength >= 100) {
      return res.status(400).json({ error: "Profile already completed" });
    }
    const PROFILE_REWARD = 8;
    const newBalance = parseFloat(user.balance) + PROFILE_REWARD;
    await query(
      "UPDATE users SET profileStrength = 100, balance = ? WHERE id = ?",
      [newBalance, user.id]
    );
    await query(
      `INSERT INTO transactions (userId, type, amount, status, description, createdAt) 
       VALUES (?, 'earning', ?, 'completed', 'Profile completion reward', NOW())`,
      [user.id, PROFILE_REWARD]
    );
    console.log("[Profile] Profile completed successfully");
    console.log("[Profile] Credited:", PROFILE_REWARD, "EGP");
    console.log("[Profile] New balance:", newBalance, "EGP");
    res.json({
      success: true,
      reward: PROFILE_REWARD,
      newBalance,
      profileStrength: 100
    });
  } catch (error) {
    console.error("[Profile] Error completing profile:", error);
    res.status(500).json({ error: "Failed to complete profile" });
  }
});
router2.put("/update", async (req, res) => {
  try {
    const authUser = await sdk.authenticateRequest(req);
    if (!authUser || !authUser.openId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const openId = authUser.openId;
    const { name, phone, email } = req.body;
    console.log("[Profile] Updating profile for user:", openId);
    const users2 = await query(
      "SELECT id FROM users WHERE openId = ?",
      [openId]
    );
    if (users2.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const user = users2[0];
    await query(
      "UPDATE users SET name = ?, phone = ?, email = ?, updatedAt = NOW() WHERE id = ?",
      [name, phone, email, user.id]
    );
    console.log("[Profile] Profile updated successfully");
    res.json({
      success: true
    });
  } catch (error) {
    console.error("[Profile] Error updating profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});
router2.get("/questions/:sectionKey", async (req, res) => {
  try {
    const { sectionKey } = req.params;
    const sections = await query(
      "SELECT * FROM profile_sections WHERE sectionKey = ? AND isActive = 1",
      [sectionKey]
    );
    if (sections.length === 0) {
      return res.status(404).json({ error: "Section not found" });
    }
    const section = sections[0];
    const questions = JSON.parse(section.requiredFields);
    res.json({
      section: {
        key: section.sectionKey,
        nameEn: section.nameEn,
        nameAr: section.nameAr,
        descriptionEn: section.descriptionEn,
        descriptionAr: section.descriptionAr,
        bonusAmount: section.bonusAmount,
        multiplierBonus: section.multiplierBonus
      },
      questions
    });
  } catch (error) {
    console.error("[Profile Routes] Error fetching questions:", error);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});
router2.get("/sections", async (req, res) => {
  try {
    let userId = null;
    try {
      const authUser = await sdk.authenticateRequest(req);
      if (authUser?.openId) {
        const users2 = await query("SELECT id FROM users WHERE openId = ?", [authUser.openId]);
        userId = users2[0]?.id || null;
      }
    } catch (authError) {
      console.log("[Profile Routes] User not authenticated, showing sections without completion status");
    }
    const sections = await query(
      "SELECT * FROM profile_sections WHERE isActive = 1 ORDER BY displayOrder"
    );
    let completedSections = [];
    if (userId) {
      completedSections = await query(
        "SELECT sectionKey, completedAt, bonusAwarded, multiplierAwarded FROM user_profile_completions WHERE userId = ?",
        [userId]
      );
    }
    const completedKeys = completedSections.map((c) => c.sectionKey);
    const sectionsWithStatus = sections.map((section) => {
      const isCompleted = completedKeys.includes(section.sectionKey);
      const completion = completedSections.find((c) => c.sectionKey === section.sectionKey);
      return {
        key: section.sectionKey,
        nameEn: section.nameEn,
        nameAr: section.nameAr,
        descriptionEn: section.descriptionEn,
        descriptionAr: section.descriptionAr,
        bonusAmount: section.bonusAmount,
        multiplierBonus: section.multiplierBonus,
        displayOrder: section.displayOrder,
        isCompleted,
        completedAt: completion?.completedAt || null,
        bonusAwarded: completion?.bonusAwarded || null
      };
    });
    res.json({ sections: sectionsWithStatus });
  } catch (error) {
    console.error("[Profile Routes] Error fetching sections:", error);
    res.status(500).json({ error: "Failed to fetch sections" });
  }
});
router2.post("/answers", async (req, res) => {
  try {
    const authUser = await sdk.authenticateRequest(req);
    if (!authUser || !authUser.openId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const users2 = await query("SELECT id, tier FROM users WHERE openId = ?", [authUser.openId]);
    if (users2.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const userId = users2[0].id;
    const { sectionKey, answers } = req.body;
    if (!sectionKey || !answers || typeof answers !== "object") {
      return res.status(400).json({ error: "Invalid request data" });
    }
    const sections = await query(
      "SELECT * FROM profile_sections WHERE sectionKey = ? AND isActive = 1",
      [sectionKey]
    );
    if (sections.length === 0) {
      return res.status(404).json({ error: "Section not found" });
    }
    const section = sections[0];
    const existingCompletion = await query(
      "SELECT * FROM user_profile_completions WHERE userId = ? AND sectionKey = ?",
      [userId, sectionKey]
    );
    if (existingCompletion.length > 0) {
      return res.status(400).json({ error: "Section already completed" });
    }
    for (const [questionKey, answerValue] of Object.entries(answers)) {
      await query(
        `INSERT INTO user_profile_data (userId, questionKey, answerValue)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE answerValue = VALUES(answerValue), updatedAt = CURRENT_TIMESTAMP`,
        [userId, questionKey, JSON.stringify(answerValue)]
      );
    }
    await query(
      "INSERT INTO user_profile_completions (userId, sectionKey, bonusAwarded, multiplierAwarded) VALUES (?, ?, ?, ?)",
      [userId, sectionKey, section.bonusAmount, section.multiplierBonus]
    );
    await query(
      "UPDATE users SET balance = balance + ? WHERE id = ?",
      [section.bonusAmount, userId]
    );
    await query(
      `INSERT INTO transactions (userId, type, amount, description, status, createdAt)
       VALUES (?, 'bonus', ?, ?, 'completed', NOW())`,
      [userId, section.bonusAmount, `Profile completion bonus: ${section.nameEn}`]
    );
    const completedCount = await query(
      "SELECT COUNT(*) as count FROM user_profile_completions WHERE userId = ?",
      [userId]
    );
    const totalSections = await query(
      "SELECT COUNT(*) as count FROM profile_sections WHERE isActive = 1"
    );
    const completionPercentage = completedCount[0].count / totalSections[0].count * 100;
    let newTier = "tier1";
    if (completionPercentage >= 80) {
      newTier = "tier7";
    } else if (completionPercentage >= 70) {
      newTier = "tier6";
    } else if (completionPercentage >= 60) {
      newTier = "tier5";
    } else if (completionPercentage >= 45) {
      newTier = "tier4";
    } else if (completionPercentage >= 30) {
      newTier = "tier3";
    } else if (completionPercentage >= 15) {
      newTier = "tier2";
    }
    const tierChanged = users2[0].tier !== newTier;
    if (tierChanged) {
      await query("UPDATE users SET tier = ? WHERE id = ?", [newTier, userId]);
    }
    res.json({
      success: true,
      bonusAwarded: section.bonusAmount,
      multiplierAwarded: section.multiplierBonus,
      tierChanged,
      newTier: tierChanged ? newTier : void 0,
      completionPercentage: Math.round(completionPercentage)
    });
  } catch (error) {
    console.error("[Profile Routes] Error submitting answers:", error);
    res.status(500).json({ error: "Failed to submit answers" });
  }
});
router2.get("/progress", async (req, res) => {
  try {
    const authUser = await sdk.authenticateRequest(req);
    if (!authUser || !authUser.openId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const users2 = await query("SELECT id, tier FROM users WHERE openId = ?", [authUser.openId]);
    if (users2.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const userId = users2[0].id;
    const completedCount = await query(
      "SELECT COUNT(*) as count FROM user_profile_completions WHERE userId = ?",
      [userId]
    );
    const totalSections = await query(
      "SELECT COUNT(*) as count FROM profile_sections WHERE isActive = 1"
    );
    const completionPercentage = completedCount[0].count / totalSections[0].count * 100;
    const totalBonus = await query(
      "SELECT SUM(bonusAwarded) as total FROM user_profile_completions WHERE userId = ?",
      [userId]
    );
    res.json({
      currentTier: users2[0].tier,
      completedSections: completedCount[0].count,
      totalSections: totalSections[0].count,
      completionPercentage: Math.round(completionPercentage),
      totalBonusEarned: totalBonus[0].total || 0
    });
  } catch (error) {
    console.error("[Profile Routes] Error fetching progress:", error);
    res.status(500).json({ error: "Failed to fetch progress" });
  }
});
var profile_routes_default = router2;

// server/_core/advertiser-routes.ts
import { Router as Router5 } from "express";
var router3 = Router5();
router3.get("/advertisers", async (req, res) => {
  try {
    const advertisers2 = await query(
      `SELECT id, nameEn, nameAr, slug, logoUrl, websiteUrl, descriptionEn, descriptionAr, isActive
       FROM advertisers
       WHERE isActive = 1
       ORDER BY nameEn`
    );
    res.json(advertisers2);
  } catch (error) {
    console.error("Error fetching advertisers:", error);
    res.status(500).json({ error: "Failed to fetch advertisers" });
  }
});
router3.get("/advertisers/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const advertisers2 = await query(
      `SELECT * FROM advertisers WHERE slug = ? LIMIT 1`,
      [slug]
    );
    if (!advertisers2 || advertisers2.length === 0) {
      return res.status(404).json({ error: "Advertiser not found" });
    }
    const advertiser = advertisers2[0];
    const tasks2 = await query(
      `SELECT id, titleEn, titleAr, descriptionEn, descriptionAr, type, reward, duration, 
              difficulty, status, completionsCount, completionsNeeded, taskData
       FROM tasks
       WHERE advertiserId = ?
       ORDER BY createdAt DESC`,
      [advertiser.id]
    );
    const totalTasks = tasks2.length;
    const activeTasks = tasks2.filter((t2) => t2.status === "active").length;
    const totalCompletions = tasks2.reduce((sum, t2) => sum + (t2.completionsCount || 0), 0);
    const totalPaid = tasks2.reduce((sum, t2) => sum + Number(t2.reward) * (t2.completionsCount || 0), 0);
    const uniqueUsersResult = await query(
      `SELECT COUNT(DISTINCT userId) as userCount
       FROM userTasks
       WHERE taskId IN (SELECT id FROM tasks WHERE advertiserId = ?)`,
      [advertiser.id]
    );
    const totalUsers = uniqueUsersResult[0]?.userCount || 0;
    const avgRating = 4.8;
    const reviewsCount = totalCompletions > 0 ? Math.floor(totalCompletions * 0.3) : 0;
    const totalNeeded = tasks2.reduce((sum, t2) => sum + t2.completionsNeeded, 0);
    const completionRate = totalNeeded > 0 ? totalCompletions / totalNeeded * 100 : 0;
    const response = {
      ...advertiser,
      stats: {
        activeCampaigns: activeTasks,
        totalTasks,
        totalUsers,
        totalCompletions,
        totalPaid: Number(totalPaid.toFixed(2)),
        avgRating,
        reviewsCount,
        completionRate: Number(completionRate.toFixed(1)),
        paymentRate: 99.9
        // Mock value
      },
      tasks: tasks2.map((task) => ({
        ...task,
        reward: Number(task.reward),
        completionRate: task.completionsNeeded > 0 ? Number(((task.completionsCount || 0) / task.completionsNeeded * 100).toFixed(1)) : 0
      }))
    };
    res.json(response);
  } catch (error) {
    console.error("Error fetching advertiser:", error);
    res.status(500).json({ error: "Failed to fetch advertiser details" });
  }
});
var advertiser_routes_default = router3;

// server/_core/withdrawal-routes.ts
import { Router as Router6 } from "express";
var router4 = Router6();
async function isUser2(req, res, next) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user || !user.id) {
      return res.status(401).json({ error: "User login required" });
    }
    req.userId = user.id;
    req.user = user;
    next();
  } catch (error) {
    console.error("[isUser] Authentication error:", error);
    return res.status(401).json({ error: "User login required" });
  }
}
var WITHDRAWAL_METHODS = [
  {
    id: "vodafone_cash",
    nameEn: "Vodafone Cash",
    nameAr: "\u0641\u0648\u062F\u0627\u0641\u0648\u0646 \u0643\u0627\u0634",
    minAmount: 50,
    maxAmount: 5e3,
    fee: 0,
    feePercentage: 0,
    processingTime: "24-48 hours",
    icon: "\u{1F4F1}",
    fields: [
      { name: "phoneNumber", label: "Phone Number", labelAr: "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641", type: "tel", required: true, placeholder: "01XXXXXXXXX" }
    ]
  },
  {
    id: "instapay",
    nameEn: "InstaPay",
    nameAr: "\u0625\u0646\u0633\u062A\u0627\u0628\u0627\u064A",
    minAmount: 50,
    maxAmount: 1e4,
    fee: 0,
    feePercentage: 0,
    processingTime: "1-24 hours",
    icon: "\u26A1",
    fields: [
      { name: "phoneNumber", label: "Phone Number", labelAr: "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641", type: "tel", required: true, placeholder: "01XXXXXXXXX" },
      { name: "bankName", label: "Bank Name", labelAr: "\u0627\u0633\u0645 \u0627\u0644\u0628\u0646\u0643", type: "text", required: true }
    ]
  },
  {
    id: "bank_transfer",
    nameEn: "Bank Transfer",
    nameAr: "\u062A\u062D\u0648\u064A\u0644 \u0628\u0646\u0643\u064A",
    minAmount: 100,
    maxAmount: 5e4,
    fee: 0,
    feePercentage: 0,
    processingTime: "2-5 business days",
    icon: "\u{1F3E6}",
    fields: [
      { name: "accountName", label: "Account Name", labelAr: "\u0627\u0633\u0645 \u0627\u0644\u062D\u0633\u0627\u0628", type: "text", required: true },
      { name: "accountNumber", label: "Account Number", labelAr: "\u0631\u0642\u0645 \u0627\u0644\u062D\u0633\u0627\u0628", type: "text", required: true },
      { name: "bankName", label: "Bank Name", labelAr: "\u0627\u0633\u0645 \u0627\u0644\u0628\u0646\u0643", type: "text", required: true },
      { name: "branchCode", label: "Branch Code", labelAr: "\u0643\u0648\u062F \u0627\u0644\u0641\u0631\u0639", type: "text", required: false }
    ]
  },
  {
    id: "etisalat_cash",
    nameEn: "Etisalat Cash",
    nameAr: "\u0627\u062A\u0635\u0627\u0644\u0627\u062A \u0643\u0627\u0634",
    minAmount: 50,
    maxAmount: 5e3,
    fee: 0,
    feePercentage: 0,
    processingTime: "24-48 hours",
    icon: "\u{1F4F1}",
    fields: [
      { name: "phoneNumber", label: "Phone Number", labelAr: "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641", type: "tel", required: true, placeholder: "01XXXXXXXXX" }
    ]
  },
  {
    id: "orange_cash",
    nameEn: "Orange Cash",
    nameAr: "\u0623\u0648\u0631\u0646\u062C \u0643\u0627\u0634",
    minAmount: 50,
    maxAmount: 5e3,
    fee: 0,
    feePercentage: 0,
    processingTime: "24-48 hours",
    icon: "\u{1F4F1}",
    fields: [
      { name: "phoneNumber", label: "Phone Number", labelAr: "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641", type: "tel", required: true, placeholder: "01XXXXXXXXX" }
    ]
  }
];
router4.get("/methods", (req, res) => {
  res.json({ methods: WITHDRAWAL_METHODS });
});
router4.post("/request", isUser2, async (req, res) => {
  const { amount, method, accountDetails } = req.body;
  const userId = req.userId;
  try {
    if (!amount || !method || !accountDetails) {
      return res.status(400).json({
        error: "Missing required fields",
        details: "Amount, method, and account details are required"
      });
    }
    const withdrawalAmount = parseFloat(amount);
    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }
    const methodConfig = WITHDRAWAL_METHODS.find((m) => m.id === method);
    if (!methodConfig) {
      return res.status(400).json({ error: "Invalid withdrawal method" });
    }
    if (withdrawalAmount < methodConfig.minAmount) {
      return res.status(400).json({
        error: `Minimum withdrawal amount for ${methodConfig.nameEn} is ${methodConfig.minAmount} EGP`
      });
    }
    if (withdrawalAmount > methodConfig.maxAmount) {
      return res.status(400).json({
        error: `Maximum withdrawal amount for ${methodConfig.nameEn} is ${methodConfig.maxAmount} EGP`
      });
    }
    const users2 = await query("SELECT balance FROM users WHERE id = ?", [userId]);
    if (!users2 || users2.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const userBalance = parseFloat(users2[0].balance);
    if (userBalance < withdrawalAmount) {
      return res.status(400).json({
        error: "Insufficient balance",
        currentBalance: userBalance,
        requestedAmount: withdrawalAmount
      });
    }
    const pendingWithdrawals = await query(
      "SELECT COUNT(*) as count FROM withdrawal_requests WHERE userId = ? AND status = ?",
      [userId, "pending"]
    );
    if (pendingWithdrawals[0].count > 0) {
      return res.status(400).json({
        error: "You already have a pending withdrawal request. Please wait for it to be processed or cancel it first."
      });
    }
    const result = await query(`
      INSERT INTO withdrawal_requests (userId, amount, method, accountDetails, status)
      VALUES (?, ?, ?, ?, 'pending')
    `, [userId, withdrawalAmount, method, JSON.stringify(accountDetails)]);
    const withdrawalId = result.insertId;
    await query(
      "UPDATE users SET balance = balance - ? WHERE id = ?",
      [withdrawalAmount, userId]
    );
    const transactionResult = await query(`
      INSERT INTO transactions (
        userId, type, amount, balanceBefore, balanceAfter, 
        description, status, createdAt
      )
      SELECT ?, 'withdraw', ?, balance + ?, balance, ?, 'pending', NOW()
      FROM users WHERE id = ?
    `, [
      userId,
      -withdrawalAmount,
      withdrawalAmount,
      `Withdrawal request #${withdrawalId} via ${methodConfig.nameEn}`,
      userId
    ]);
    const transactionId = transactionResult.insertId;
    await query(
      "UPDATE withdrawal_requests SET transactionId = ? WHERE id = ?",
      [transactionId, withdrawalId]
    );
    res.json({
      success: true,
      message: "Withdrawal request submitted successfully",
      withdrawal: {
        id: withdrawalId,
        amount: withdrawalAmount,
        method: methodConfig.nameEn,
        status: "pending",
        processingTime: methodConfig.processingTime
      }
    });
  } catch (error) {
    console.error("Error creating withdrawal request:", error);
    res.status(500).json({ error: error.message });
  }
});
router4.get("/", isUser2, async (req, res) => {
  try {
    const withdrawals = await query(`
      SELECT 
        wr.id,
        wr.amount,
        wr.method,
        wr.accountDetails,
        wr.status,
        wr.requestedAt,
        wr.processedAt,
        wr.rejectionReason,
        t.id as transactionId
      FROM withdrawal_requests wr
      LEFT JOIN transactions t ON wr.transactionId = t.id
      WHERE wr.userId = ?
      ORDER BY wr.requestedAt DESC
    `, [req.userId]);
    const formattedWithdrawals = withdrawals.map((w) => ({
      ...w,
      accountDetails: typeof w.accountDetails === "string" ? JSON.parse(w.accountDetails) : w.accountDetails
    }));
    res.json({ withdrawals: formattedWithdrawals });
  } catch (error) {
    console.error("Error fetching withdrawals:", error);
    res.status(500).json({ error: error.message });
  }
});
router4.get("/:id", isUser2, async (req, res) => {
  const withdrawalId = parseInt(req.params.id);
  try {
    const withdrawals = await query(`
      SELECT 
        wr.*,
        t.id as transactionId,
        t.status as transactionStatus
      FROM withdrawal_requests wr
      LEFT JOIN transactions t ON wr.transactionId = t.id
      WHERE wr.id = ? AND wr.userId = ?
    `, [withdrawalId, req.userId]);
    if (!withdrawals || withdrawals.length === 0) {
      return res.status(404).json({ error: "Withdrawal request not found" });
    }
    const withdrawal = withdrawals[0];
    withdrawal.accountDetails = typeof withdrawal.accountDetails === "string" ? JSON.parse(withdrawal.accountDetails) : withdrawal.accountDetails;
    res.json({ withdrawal });
  } catch (error) {
    console.error("Error fetching withdrawal:", error);
    res.status(500).json({ error: error.message });
  }
});
router4.post("/:id/cancel", isUser2, async (req, res) => {
  const withdrawalId = parseInt(req.params.id);
  try {
    const withdrawals = await query(
      "SELECT * FROM withdrawal_requests WHERE id = ? AND userId = ?",
      [withdrawalId, req.userId]
    );
    if (!withdrawals || withdrawals.length === 0) {
      return res.status(404).json({ error: "Withdrawal request not found" });
    }
    const withdrawal = withdrawals[0];
    if (withdrawal.status !== "pending") {
      return res.status(400).json({
        error: `Cannot cancel withdrawal with status: ${withdrawal.status}`
      });
    }
    await query(
      "UPDATE withdrawal_requests SET status = ?, processedAt = NOW() WHERE id = ?",
      ["cancelled", withdrawalId]
    );
    await query(
      "UPDATE users SET balance = balance + ? WHERE id = ?",
      [withdrawal.amount, req.userId]
    );
    if (withdrawal.transactionId) {
      await query(
        "UPDATE transactions SET status = ? WHERE id = ?",
        ["cancelled", withdrawal.transactionId]
      );
    }
    res.json({
      success: true,
      message: "Withdrawal request cancelled successfully",
      refundedAmount: withdrawal.amount
    });
  } catch (error) {
    console.error("Error cancelling withdrawal:", error);
    res.status(500).json({ error: error.message });
  }
});
var withdrawal_routes_default = router4;

// server/_core/admin-withdrawal-routes.ts
import { Router as Router7 } from "express";
var router5 = Router7();
var isAdmin = async (req, res, next) => {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const [dbUser] = await query(
      "SELECT role FROM users WHERE id = ?",
      [user.openId.replace("user_", "")]
    );
    if (!dbUser || dbUser.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }
    req.userId = user.openId.replace("user_", "");
    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};
router5.get("/withdrawals", isAdmin, async (req, res) => {
  try {
    const withdrawals = await query(`
      SELECT 
        wr.*,
        u.nameEn as userName,
        u.email as userEmail
      FROM withdrawal_requests wr
      JOIN users u ON wr.userId = u.id
      ORDER BY 
        CASE wr.status
          WHEN 'pending' THEN 1
          WHEN 'approved' THEN 2
          WHEN 'completed' THEN 3
          WHEN 'rejected' THEN 4
          ELSE 5
        END,
        wr.createdAt DESC
    `);
    const formattedWithdrawals = withdrawals.map((w) => ({
      id: w.id,
      userId: w.userId,
      amount: parseFloat(w.amount),
      paymentMethod: w.paymentMethod,
      accountDetails: typeof w.accountDetails === "string" ? JSON.parse(w.accountDetails) : w.accountDetails,
      status: w.status,
      createdAt: w.createdAt,
      processedAt: w.processedAt,
      adminNotes: w.adminNotes,
      user: {
        nameEn: w.userName,
        email: w.userEmail
      }
    }));
    res.json({ withdrawals: formattedWithdrawals });
  } catch (error) {
    console.error("Error fetching withdrawals:", error);
    res.status(500).json({ error: "Failed to fetch withdrawals" });
  }
});
router5.post("/withdrawals/:id/approve", isAdmin, async (req, res) => {
  const { id } = req.params;
  const { adminNotes } = req.body;
  try {
    const [withdrawal] = await query(
      "SELECT * FROM withdrawal_requests WHERE id = ?",
      [id]
    );
    if (!withdrawal) {
      return res.status(404).json({ error: "Withdrawal request not found" });
    }
    if (withdrawal.status !== "pending") {
      return res.status(400).json({ error: "Only pending withdrawals can be approved" });
    }
    await query(
      `UPDATE withdrawal_requests 
       SET status = 'approved', 
           processedAt = NOW(), 
           processedBy = ?,
           adminNotes = ?
       WHERE id = ?`,
      [req.userId, adminNotes || null, id]
    );
    await query(
      `INSERT INTO transactions 
       (userId, type, amount, description, status, createdAt)
       VALUES (?, 'withdrawal_approved', ?, ?, 'completed', NOW())`,
      [
        withdrawal.userId,
        withdrawal.amount,
        `Withdrawal approved - ${withdrawal.paymentMethod}`
      ]
    );
    res.json({
      success: true,
      message: "Withdrawal approved successfully"
    });
  } catch (error) {
    console.error("Error approving withdrawal:", error);
    res.status(500).json({ error: "Failed to approve withdrawal" });
  }
});
router5.post("/withdrawals/:id/reject", isAdmin, async (req, res) => {
  const { id } = req.params;
  const { adminNotes } = req.body;
  if (!adminNotes || !adminNotes.trim()) {
    return res.status(400).json({ error: "Admin notes are required for rejection" });
  }
  try {
    const [withdrawal] = await query(
      "SELECT * FROM withdrawal_requests WHERE id = ?",
      [id]
    );
    if (!withdrawal) {
      return res.status(404).json({ error: "Withdrawal request not found" });
    }
    if (withdrawal.status !== "pending") {
      return res.status(400).json({ error: "Only pending withdrawals can be rejected" });
    }
    await query(
      "UPDATE users SET balance = balance + ? WHERE id = ?",
      [withdrawal.amount, withdrawal.userId]
    );
    await query(
      `UPDATE withdrawal_requests 
       SET status = 'rejected', 
           processedAt = NOW(), 
           processedBy = ?,
           adminNotes = ?
       WHERE id = ?`,
      [req.userId, adminNotes, id]
    );
    await query(
      `INSERT INTO transactions 
       (userId, type, amount, description, status, createdAt)
       VALUES (?, 'withdrawal_refund', ?, ?, 'completed', NOW())`,
      [
        withdrawal.userId,
        withdrawal.amount,
        `Withdrawal rejected and refunded - Reason: ${adminNotes}`
      ]
    );
    res.json({
      success: true,
      message: "Withdrawal rejected and amount refunded"
    });
  } catch (error) {
    console.error("Error rejecting withdrawal:", error);
    res.status(500).json({ error: "Failed to reject withdrawal" });
  }
});
router5.post("/withdrawals/:id/complete", isAdmin, async (req, res) => {
  const { id } = req.params;
  const { adminNotes } = req.body;
  try {
    const [withdrawal] = await query(
      "SELECT * FROM withdrawal_requests WHERE id = ?",
      [id]
    );
    if (!withdrawal) {
      return res.status(404).json({ error: "Withdrawal request not found" });
    }
    if (withdrawal.status !== "approved") {
      return res.status(400).json({ error: "Only approved withdrawals can be marked as completed" });
    }
    await query(
      `UPDATE withdrawal_requests 
       SET status = 'completed',
           adminNotes = CONCAT(COALESCE(adminNotes, ''), '
', ?)
       WHERE id = ?`,
      [adminNotes || "Payment completed", id]
    );
    res.json({
      success: true,
      message: "Withdrawal marked as completed"
    });
  } catch (error) {
    console.error("Error completing withdrawal:", error);
    res.status(500).json({ error: "Failed to complete withdrawal" });
  }
});
var admin_withdrawal_routes_default = router5;

// server/_core/referral-routes.ts
import { Router as Router8 } from "express";
var router6 = Router8();
router6.get("/api/referrals/my-code", async (req, res) => {
  try {
    const authUser = await sdk.authenticateRequest(req);
    if (!authUser) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const userId = authUser.openId;
    const users2 = await query(
      "SELECT referralCode, totalReferrals, referralEarnings FROM users WHERE id = ?",
      [userId]
    );
    if (!users2 || users2.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const user = users2[0];
    const referrals = await query(
      "SELECT COUNT(*) as total, SUM(referrerReward) as totalRewards FROM referrals WHERE referrerId = ?",
      [userId]
    );
    res.json({
      referralCode: user.referralCode,
      totalReferrals: user.totalReferrals || 0,
      totalEarnings: parseFloat(user.referralEarnings) || 0,
      referrals: referrals[0]
    });
  } catch (error) {
    console.error("Error getting referral code:", error);
    res.status(500).json({ error: "Failed to get referral info" });
  }
});
router6.get("/api/referrals/list", async (req, res) => {
  try {
    const authUser = await sdk.authenticateRequest(req);
    if (!authUser) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const userId = authUser.openId;
    const referrals = await query(
      `SELECT r.*, u.email, u.name, u.completedTasks 
       FROM referrals r 
       JOIN users u ON r.refereeId = u.id 
       WHERE r.referrerId = ? 
       ORDER BY r.createdAt DESC`,
      [userId]
    );
    res.json({ referrals });
  } catch (error) {
    console.error("Error getting referrals:", error);
    res.status(500).json({ error: "Failed to get referrals" });
  }
});
router6.post("/api/referrals/apply", async (req, res) => {
  try {
    const authUser = await sdk.authenticateRequest(req);
    if (!authUser) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const userId = authUser.openId;
    const { referralCode } = req.body;
    if (!referralCode) {
      return res.status(400).json({ error: "Referral code required" });
    }
    const user = await query(
      "SELECT referredBy FROM users WHERE id = ?",
      [userId]
    );
    if (user[0]?.referredBy) {
      return res.status(400).json({ error: "You have already used a referral code" });
    }
    const referrer = await query(
      "SELECT id FROM users WHERE referralCode = ?",
      [referralCode]
    );
    if (!referrer || referrer.length === 0) {
      return res.status(404).json({ error: "Invalid referral code" });
    }
    const referrerId = referrer[0].id;
    if (referrerId === userId) {
      return res.status(400).json({ error: "Cannot use your own referral code" });
    }
    const referrerReward = 20;
    const refereeReward = 10;
    await query(
      `INSERT INTO referrals (referrerId, refereeId, referralCode, status, referrerReward, refereeReward)
       VALUES (?, ?, ?, 'completed', ?, ?)`,
      [referrerId, userId, referralCode, referrerReward, refereeReward]
    );
    await query(
      "UPDATE users SET referredBy = ?, balance = balance + ? WHERE id = ?",
      [referrerId, refereeReward, userId]
    );
    await query(
      `UPDATE users 
       SET totalReferrals = totalReferrals + 1,
           referralEarnings = referralEarnings + ?,
           balance = balance + ?
       WHERE id = ?`,
      [referrerReward, referrerReward, referrerId]
    );
    await query(
      `INSERT INTO transactions (userId, type, amount, description, status)
       VALUES 
       (?, 'earn', ?, 'Referral bonus - Welcome gift', 'completed'),
       (?, 'earn', ?, 'Referral reward - Friend joined', 'completed')`,
      [userId, refereeReward, referrerId, referrerReward]
    );
    res.json({
      success: true,
      message: `Welcome! You received ${refereeReward} EGP bonus`,
      reward: refereeReward
    });
  } catch (error) {
    console.error("Error applying referral:", error);
    res.status(500).json({ error: "Failed to apply referral code" });
  }
});
var referral_routes_default = router6;

// server/_core/gamification-routes.ts
import { Router as Router9 } from "express";
var router7 = Router9();
router7.get("/api/levels", async (req, res) => {
  try {
    const levels = await query("SELECT * FROM user_levels ORDER BY minTasks ASC");
    res.json({ levels });
  } catch (error) {
    console.error("Error getting levels:", error);
    res.status(500).json({ error: "Failed to get levels" });
  }
});
router7.get("/api/levels/my-progress", async (req, res) => {
  try {
    const authUser = await sdk.authenticateRequest(req);
    if (!authUser) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const userId = authUser.openId;
    const users2 = await query(
      `SELECT u.*, l.name as levelName, l.badgeIcon, l.color, l.rewardMultiplier, l.minTasks, l.minEarnings
       FROM users u
       JOIN user_levels l ON u.levelId = l.id
       WHERE u.id = ?`,
      [userId]
    );
    if (!users2 || users2.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const user = users2[0];
    const nextLevel = await query(
      "SELECT * FROM user_levels WHERE id > ? ORDER BY id ASC LIMIT 1",
      [user.levelId]
    );
    const progress = nextLevel.length > 0 ? {
      currentTasks: user.completedTasks || 0,
      requiredTasks: nextLevel[0].minTasks,
      currentEarnings: parseFloat(user.totalEarnings) || 0,
      requiredEarnings: parseFloat(nextLevel[0].minEarnings),
      percentage: Math.min(100, Math.max(
        user.completedTasks / nextLevel[0].minTasks * 100,
        parseFloat(user.totalEarnings) / parseFloat(nextLevel[0].minEarnings) * 100
      ))
    } : null;
    res.json({
      currentLevel: {
        id: user.levelId,
        name: user.levelName,
        icon: user.badgeIcon,
        color: user.color,
        multiplier: parseFloat(user.rewardMultiplier)
      },
      nextLevel: nextLevel.length > 0 ? nextLevel[0] : null,
      progress
    });
  } catch (error) {
    console.error("Error getting level progress:", error);
    res.status(500).json({ error: "Failed to get level progress" });
  }
});
router7.get("/api/badges", async (req, res) => {
  try {
    const badges = await query("SELECT * FROM badges ORDER BY category, rarity");
    res.json({ badges });
  } catch (error) {
    console.error("Error getting badges:", error);
    res.status(500).json({ error: "Failed to get badges" });
  }
});
router7.get("/api/badges/my-badges", async (req, res) => {
  try {
    const authUser = await sdk.authenticateRequest(req);
    if (!authUser) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const userId = authUser.openId;
    const userBadges = await query(
      `SELECT b.*, ub.earnedAt
       FROM user_badges ub
       JOIN badges b ON ub.badgeId = b.id
       WHERE ub.userId = ?
       ORDER BY ub.earnedAt DESC`,
      [userId]
    );
    res.json({ badges: userBadges });
  } catch (error) {
    console.error("Error getting user badges:", error);
    res.status(500).json({ error: "Failed to get badges" });
  }
});
router7.post("/api/daily-login", async (req, res) => {
  try {
    const authUser = await sdk.authenticateRequest(req);
    if (!authUser) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const userId = authUser.openId;
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const existing = await query(
      "SELECT * FROM daily_logins WHERE userId = ? AND loginDate = ?",
      [userId, today]
    );
    if (existing.length > 0) {
      return res.json({
        alreadyClaimed: true,
        message: "Daily reward already claimed today"
      });
    }
    const user = await query(
      "SELECT lastLoginDate, currentStreak, longestStreak FROM users WHERE id = ?",
      [userId]
    );
    const userData = user[0];
    const lastLogin = userData.lastLoginDate;
    let currentStreak = userData.currentStreak || 0;
    let longestStreak = userData.longestStreak || 0;
    if (lastLogin) {
      const lastDate = new Date(lastLogin);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1e3 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentStreak += 1;
      } else if (diffDays > 1) {
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
    }
    longestStreak = Math.max(longestStreak, currentStreak);
    const baseReward = 2;
    const streakBonus = Math.min(currentStreak * 0.5, 10);
    const reward = baseReward + streakBonus;
    await query(
      "INSERT INTO daily_logins (userId, loginDate, reward, streakDay) VALUES (?, ?, ?, ?)",
      [userId, today, reward, currentStreak]
    );
    await query(
      `UPDATE users 
       SET lastLoginDate = ?,
           currentStreak = ?,
           longestStreak = ?,
           balance = balance + ?,
           totalDailyRewards = totalDailyRewards + ?
       WHERE id = ?`,
      [today, currentStreak, longestStreak, reward, reward, userId]
    );
    await query(
      `INSERT INTO transactions (userId, type, amount, description, status)
       VALUES (?, 'earn', ?, ?, 'completed')`,
      [userId, reward, `Daily login reward - Day ${currentStreak}`]
    );
    if (currentStreak === 7) {
      await awardBadge(userId, 9);
    }
    res.json({
      success: true,
      reward,
      currentStreak,
      longestStreak,
      message: `Welcome back! Day ${currentStreak} streak - You earned ${reward} EGP`
    });
  } catch (error) {
    console.error("Error recording daily login:", error);
    res.status(500).json({ error: "Failed to record daily login" });
  }
});
async function awardBadge(userId, badgeId) {
  try {
    const existing = await query(
      "SELECT * FROM user_badges WHERE userId = ? AND badgeId = ?",
      [userId, badgeId]
    );
    if (existing.length > 0) {
      return false;
    }
    await query(
      "INSERT INTO user_badges (userId, badgeId) VALUES (?, ?)",
      [userId, badgeId]
    );
    const badge = await query(
      "SELECT rewardAmount FROM badges WHERE id = ?",
      [badgeId]
    );
    if (badge.length > 0 && badge[0].rewardAmount > 0) {
      const reward = parseFloat(badge[0].rewardAmount);
      await query(
        "UPDATE users SET balance = balance + ? WHERE id = ?",
        [reward, userId]
      );
      await query(
        `INSERT INTO transactions (userId, type, amount, description, status)
         VALUES (?, 'earn', ?, 'Badge reward', 'completed')`,
        [userId, reward]
      );
    }
    return true;
  } catch (error) {
    console.error("Error awarding badge:", error);
    return false;
  }
}
router7.post("/api/badges/check-progress", async (req, res) => {
  try {
    const authUser = await sdk.authenticateRequest(req);
    if (!authUser) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const userId = authUser.openId;
    const user = await query(
      "SELECT completedTasks, totalEarnings, totalReferrals FROM users WHERE id = ?",
      [userId]
    );
    if (!user || user.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const userData = user[0];
    const newBadges = [];
    if (userData.completedTasks >= 1) {
      if (await awardBadge(userId, 1)) newBadges.push("First Steps");
    }
    if (userData.completedTasks >= 10) {
      if (await awardBadge(userId, 2)) newBadges.push("Task Master");
    }
    if (userData.completedTasks >= 100) {
      if (await awardBadge(userId, 3)) newBadges.push("Century Club");
    }
    if (userData.totalReferrals >= 1) {
      if (await awardBadge(userId, 6)) newBadges.push("Referral Starter");
    }
    if (userData.totalReferrals >= 10) {
      if (await awardBadge(userId, 7)) newBadges.push("Influencer");
    }
    res.json({
      success: true,
      newBadges,
      message: newBadges.length > 0 ? `Congratulations! You earned ${newBadges.length} new badge(s)!` : "No new badges yet"
    });
  } catch (error) {
    console.error("Error checking badge progress:", error);
    res.status(500).json({ error: "Failed to check badge progress" });
  }
});
var gamification_routes_default = router7;

// server/_core/gamification-features-routes.ts
import { Router as Router10 } from "express";
var router8 = Router10();
router8.get("/profile-sections", async (req, res) => {
  try {
    const db = await getConnection();
    const [sections] = await db.query(
      `SELECT * FROM profile_sections WHERE isActive = TRUE ORDER BY displayOrder ASC`
    );
    res.json({ success: true, sections });
  } catch (error) {
    console.error("[Profile Sections] Error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch profile sections" });
  }
});
router8.get("/profile-sections/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const db = await getConnection();
    const [sections] = await db.query(
      `SELECT * FROM profile_sections WHERE isActive = TRUE ORDER BY displayOrder ASC`
    );
    const [completions] = await db.query(
      `SELECT sectionKey, completedAt, bonusAwarded, multiplierAwarded 
       FROM user_profile_completions 
       WHERE userId = ?`,
      [userId]
    );
    const [users2] = await db.query(
      `SELECT earningsMultiplier, profileCompletionBonus FROM users WHERE id = ?`,
      [userId]
    );
    const completionMap = new Map(completions.map((c) => [c.sectionKey, c]));
    const sectionsWithStatus = sections.map((section) => ({
      ...section,
      isCompleted: completionMap.has(section.sectionKey),
      completedAt: completionMap.get(section.sectionKey)?.completedAt || null
    }));
    res.json({
      success: true,
      sections: sectionsWithStatus,
      currentMultiplier: users2[0]?.earningsMultiplier || 1,
      totalBonus: users2[0]?.profileCompletionBonus || 0,
      completedCount: completions.length,
      totalCount: sections.length
    });
  } catch (error) {
    console.error("[Profile Sections User] Error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch user profile status" });
  }
});
router8.post("/profile-sections/complete", async (req, res) => {
  try {
    const { userId, sectionKey } = req.body;
    if (!userId || !sectionKey) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    const db = await getConnection();
    const [sections] = await db.query(
      `SELECT * FROM profile_sections WHERE sectionKey = ? AND isActive = TRUE`,
      [sectionKey]
    );
    if (sections.length === 0) {
      return res.status(404).json({ success: false, error: "Section not found" });
    }
    const section = sections[0];
    const [existing] = await db.query(
      `SELECT id FROM user_profile_completions WHERE userId = ? AND sectionKey = ?`,
      [userId, sectionKey]
    );
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: "Section already completed" });
    }
    await db.query("START TRANSACTION");
    try {
      await db.query(
        `INSERT INTO user_profile_completions (userId, sectionKey, bonusAwarded, multiplierAwarded)
         VALUES (?, ?, ?, ?)`,
        [userId, sectionKey, section.bonusAmount, section.multiplierBonus]
      );
      await db.query(
        `UPDATE users 
         SET balance = balance + ?,
             profileCompletionBonus = profileCompletionBonus + ?,
             earningsMultiplier = earningsMultiplier + ?
         WHERE id = ?`,
        [section.bonusAmount, section.bonusAmount, section.multiplierBonus, userId]
      );
      await db.query(
        `INSERT INTO transactions (userId, type, amount, description, status)
         VALUES (?, 'profile_bonus', ?, ?, 'completed')`,
        [userId, section.bonusAmount, `Profile completion bonus: ${section.nameEn}`]
      );
      await db.query("COMMIT");
      const [users2] = await db.query(
        `SELECT balance, earningsMultiplier, profileCompletionBonus FROM users WHERE id = ?`,
        [userId]
      );
      res.json({
        success: true,
        message: "Profile section completed successfully",
        bonusAwarded: section.bonusAmount,
        multiplierAwarded: section.multiplierBonus,
        newBalance: users2[0].balance,
        newMultiplier: users2[0].earningsMultiplier,
        totalBonus: users2[0].profileCompletionBonus
      });
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("[Profile Section Complete] Error:", error);
    res.status(500).json({ success: false, error: "Failed to complete profile section" });
  }
});
router8.get("/targeting-tiers", async (req, res) => {
  try {
    const db = await getConnection();
    const [tiers] = await db.query(
      `SELECT * FROM targeting_tiers WHERE isActive = TRUE ORDER BY displayOrder ASC`
    );
    res.json({ success: true, tiers });
  } catch (error) {
    console.error("[Targeting Tiers] Error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch targeting tiers" });
  }
});
router8.get("/targeting-tiers/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const db = await getConnection();
    const [tiers] = await db.query(
      `SELECT * FROM targeting_tiers WHERE isActive = TRUE ORDER BY displayOrder ASC`
    );
    const [unlocks] = await db.query(
      `SELECT tierKey, unlockedAt, verificationStatus, verifiedAt 
       FROM user_tier_unlocks 
       WHERE userId = ?`,
      [userId]
    );
    const unlockMap = new Map(unlocks.map((u) => [u.tierKey, u]));
    const tiersWithStatus = tiers.map((tier) => ({
      ...tier,
      isUnlocked: unlockMap.has(tier.tierKey),
      verificationStatus: unlockMap.get(tier.tierKey)?.verificationStatus || null,
      unlockedAt: unlockMap.get(tier.tierKey)?.unlockedAt || null
    }));
    res.json({
      success: true,
      tiers: tiersWithStatus,
      unlockedCount: unlocks.filter((u) => u.verificationStatus === "verified").length,
      totalCount: tiers.length
    });
  } catch (error) {
    console.error("[Targeting Tiers User] Error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch user tiers" });
  }
});
router8.post("/targeting-tiers/unlock", async (req, res) => {
  try {
    const { userId, tierKey, verificationData } = req.body;
    if (!userId || !tierKey) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    const db = await getConnection();
    const [tiers] = await db.query(
      `SELECT * FROM targeting_tiers WHERE tierKey = ? AND isActive = TRUE`,
      [tierKey]
    );
    if (tiers.length === 0) {
      return res.status(404).json({ success: false, error: "Tier not found" });
    }
    const tier = tiers[0];
    const [existing] = await db.query(
      `SELECT id, verificationStatus FROM user_tier_unlocks WHERE userId = ? AND tierKey = ?`,
      [userId, tierKey]
    );
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Tier already unlocked or pending verification",
        status: existing[0].verificationStatus
      });
    }
    const initialStatus = tier.verificationMethod === "self_reported" ? "verified" : "pending";
    await db.query(
      `INSERT INTO user_tier_unlocks (userId, tierKey, verificationStatus, verificationData, verifiedAt)
       VALUES (?, ?, ?, ?, ?)`,
      [
        userId,
        tierKey,
        initialStatus,
        JSON.stringify(verificationData || {}),
        initialStatus === "verified" ? /* @__PURE__ */ new Date() : null
      ]
    );
    res.json({
      success: true,
      message: initialStatus === "verified" ? "Tier unlocked successfully" : "Tier unlock request submitted for verification",
      verificationStatus: initialStatus,
      tier
    });
  } catch (error) {
    console.error("[Targeting Tier Unlock] Error:", error);
    res.status(500).json({ success: false, error: "Failed to unlock tier" });
  }
});
router8.get("/tasks/exclusive/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const db = await getConnection();
    const [userTiers] = await db.query(
      `SELECT tierKey FROM user_tier_unlocks 
       WHERE userId = ? AND verificationStatus = 'verified'`,
      [userId]
    );
    const unlockedTierKeys = userTiers.map((t2) => t2.tierKey);
    const [tasks2] = await db.query(
      `SELECT * FROM tasks WHERE isExclusive = TRUE AND status = 'active'`
    );
    const accessibleTasks = tasks2.filter((task) => {
      if (!task.requiredTiers) return true;
      const requiredTiers = JSON.parse(task.requiredTiers);
      return requiredTiers.some((tier) => unlockedTierKeys.includes(tier));
    });
    res.json({
      success: true,
      tasks: accessibleTasks,
      unlockedTiers: unlockedTierKeys
    });
  } catch (error) {
    console.error("[Exclusive Tasks] Error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch exclusive tasks" });
  }
});
router8.get("/data-bounties/active", async (req, res) => {
  try {
    const db = await getConnection();
    const [bounties] = await db.query(
      `SELECT * FROM data_bounties 
       WHERE status = 'active' 
       AND startTime <= NOW() 
       AND endTime >= NOW()
       ORDER BY rewardAmount DESC`
    );
    res.json({ success: true, bounties });
  } catch (error) {
    console.error("[Data Bounties Active] Error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch active bounties" });
  }
});
router8.get("/data-bounties/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const db = await getConnection();
    const [bounties] = await db.query(
      `SELECT db.* 
       FROM data_bounties db
       LEFT JOIN user_bounty_responses ubr ON db.id = ubr.bountyId AND ubr.userId = ?
       WHERE db.status = 'active' 
       AND db.startTime <= NOW() 
       AND db.endTime >= NOW()
       AND ubr.id IS NULL
       ORDER BY db.rewardAmount DESC`,
      [userId]
    );
    res.json({ success: true, bounties });
  } catch (error) {
    console.error("[Data Bounties User] Error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch user bounties" });
  }
});
router8.post("/data-bounties/respond", async (req, res) => {
  try {
    const { userId, bountyId, answer } = req.body;
    if (!userId || !bountyId || !answer) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    const db = await getConnection();
    const [bounties] = await db.query(
      `SELECT * FROM data_bounties WHERE id = ? AND status = 'active'`,
      [bountyId]
    );
    if (bounties.length === 0) {
      return res.status(404).json({ success: false, error: "Bounty not found or inactive" });
    }
    const bounty = bounties[0];
    const now = /* @__PURE__ */ new Date();
    if (new Date(bounty.endTime) < now) {
      return res.status(400).json({ success: false, error: "Bounty has expired" });
    }
    const [existing] = await db.query(
      `SELECT id FROM user_bounty_responses WHERE userId = ? AND bountyId = ?`,
      [userId, bountyId]
    );
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: "You have already responded to this bounty" });
    }
    await db.query("START TRANSACTION");
    try {
      await db.query(
        `INSERT INTO user_bounty_responses (bountyId, userId, answer, rewardAwarded)
         VALUES (?, ?, ?, ?)`,
        [bountyId, userId, JSON.stringify(answer), bounty.rewardAmount]
      );
      await db.query(
        `UPDATE users SET balance = balance + ? WHERE id = ?`,
        [bounty.rewardAmount, userId]
      );
      await db.query(
        `UPDATE data_bounties 
         SET currentResponses = currentResponses + 1,
             status = CASE 
               WHEN currentResponses + 1 >= targetResponses THEN 'completed'
               ELSE status
             END
         WHERE id = ?`,
        [bountyId]
      );
      await db.query(
        `INSERT INTO transactions (userId, type, amount, description, status)
         VALUES (?, 'bounty_reward', ?, ?, 'completed')`,
        [userId, bounty.rewardAmount, `Data bounty reward: ${bounty.titleEn}`]
      );
      await db.query("COMMIT");
      const [users2] = await db.query(
        `SELECT balance FROM users WHERE id = ?`,
        [userId]
      );
      res.json({
        success: true,
        message: "Bounty response submitted successfully",
        rewardAwarded: bounty.rewardAmount,
        newBalance: users2[0].balance
      });
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("[Data Bounty Respond] Error:", error);
    res.status(500).json({ success: false, error: "Failed to submit bounty response" });
  }
});
var gamification_features_routes_default = router8;

// server/_core/push-notification-routes.ts
import { Router as Router11 } from "express";
var router9 = Router11();
router9.post("/subscribe", async (req, res) => {
  try {
    const subscription = req.body;
    const userId = req.user?.id;
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription data"
      });
    }
    const connection = await getConnection();
    await connection.execute(
      `INSERT INTO push_subscriptions (userId, endpoint, p256dh, auth, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE
       p256dh = VALUES(p256dh),
       auth = VALUES(auth),
       updatedAt = NOW()`,
      [
        userId || null,
        subscription.endpoint,
        subscription.keys?.p256dh || null,
        subscription.keys?.auth || null
      ]
    );
    await connection.end();
    res.json({
      success: true,
      message: "Subscription saved successfully"
    });
  } catch (error) {
    console.error("Error saving push subscription:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save subscription"
    });
  }
});
router9.post("/unsubscribe", async (req, res) => {
  try {
    const subscription = req.body;
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription data"
      });
    }
    const connection = await getConnection();
    await connection.execute(
      "DELETE FROM push_subscriptions WHERE endpoint = ?",
      [subscription.endpoint]
    );
    await connection.end();
    res.json({
      success: true,
      message: "Subscription removed successfully"
    });
  } catch (error) {
    console.error("Error removing push subscription:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove subscription"
    });
  }
});
router9.post("/test", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    res.json({
      success: true,
      message: "Test notification infrastructure is ready. To send actual notifications, implement web-push library."
    });
  } catch (error) {
    console.error("Error sending test notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send test notification"
    });
  }
});
var push_notification_routes_default = router9;

// server/routers.ts
import bcrypt3 from "bcryptjs";

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router10 = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router10({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
import { eq as eq6 } from "drizzle-orm";

// server/config/business.config.ts
var USER_TIERS = {
  tier1: {
    tier: "tier1",
    commissionRate: 5,
    paymentSchedule: "monthly",
    paymentDelay: 720,
    // 30 days in hours
    minTasksRequired: 0,
    minRatingRequired: 0
  },
  tier2: {
    tier: "tier2",
    commissionRate: 10,
    paymentSchedule: "weekly",
    paymentDelay: 168,
    // 7 days in hours
    minTasksRequired: 20,
    minRatingRequired: 4
  },
  tier3: {
    tier: "tier3",
    commissionRate: 20,
    paymentSchedule: "instant",
    paymentDelay: 3,
    // 3 hours
    minTasksRequired: 50,
    minRatingRequired: 4.5
  }
};
var ADVERTISER_TIERS = {
  tier1: {
    tier: "tier1",
    commissionRate: 10,
    minMonthlySpend: 0,
    benefits: ["Basic support", "Standard reporting"]
  },
  tier2: {
    tier: "tier2",
    commissionRate: 15,
    minMonthlySpend: 1e3,
    benefits: ["Priority support", "Advanced reporting", "Custom targeting"]
  },
  tier3: {
    tier: "tier3",
    commissionRate: 20,
    minMonthlySpend: 5e3,
    benefits: ["Dedicated account manager", "Real-time analytics", "API access"]
  },
  tier4: {
    tier: "tier4",
    commissionRate: 25,
    minMonthlySpend: 1e4,
    benefits: ["Premium support", "Custom integrations", "White-label options"]
  }
};
var LAUNCH_PHASE = {
  isActive: true,
  // Set to false after 3 months
  userCommissionRate: 5,
  // 5% fixed for all users
  advertiserCommissionRate: 10,
  // 10% fixed for all advertisers
  endDate: /* @__PURE__ */ new Date("2025-05-03")
  // 3 months from launch (adjust as needed)
};
var BUSINESS_CONSTANTS = {
  // Minimum withdrawal amount (USD)
  MIN_WITHDRAWAL_AMOUNT: 100,
  // Average task value by year (USD)
  AVERAGE_TASK_VALUE_BY_YEAR: {
    year1: 25,
    year2: 30,
    year3: 35,
    year4: 40,
    year5: 45
  },
  // Platform target margin
  TARGET_PLATFORM_MARGIN: 30,
  // 30% total margin
  // Task completion time limits (hours)
  TASK_COMPLETION_LIMITS: {
    quick: 24,
    // Quick tasks must be completed within 24 hours
    standard: 72,
    // Standard tasks within 3 days
    extended: 168
    // Extended tasks within 7 days
  },
  // Verification time limits (hours)
  VERIFICATION_TIME_LIMIT: 48,
  // Advertiser must verify within 48 hours
  // Auto-approval if advertiser doesn't verify
  AUTO_APPROVE_AFTER_HOURS: 72
  // Auto-approve after 72 hours
};
function isLaunchPhaseActive() {
  if (!LAUNCH_PHASE.isActive) return false;
  return /* @__PURE__ */ new Date() < LAUNCH_PHASE.endDate;
}
function getUserTierConfig(tier) {
  return USER_TIERS[tier] || USER_TIERS.tier1;
}
function getAdvertiserTierConfig(tier) {
  return ADVERTISER_TIERS[tier] || ADVERTISER_TIERS.tier1;
}

// server/services/commission.service.ts
function calculateCommission(taskValue, userTier = "tier1", advertiserTier = "tier1") {
  let userCommissionRate;
  let advertiserCommissionRate;
  if (isLaunchPhaseActive()) {
    userCommissionRate = LAUNCH_PHASE.userCommissionRate;
    advertiserCommissionRate = LAUNCH_PHASE.advertiserCommissionRate;
  } else {
    const userConfig = getUserTierConfig(userTier);
    const advertiserConfig = getAdvertiserTierConfig(advertiserTier);
    userCommissionRate = userConfig.commissionRate;
    advertiserCommissionRate = advertiserConfig.commissionRate;
  }
  const userCommission = taskValue * userCommissionRate / 100;
  const advertiserCommission = taskValue * advertiserCommissionRate / 100;
  const userEarnings = taskValue - userCommission;
  const advertiserCost = taskValue + advertiserCommission;
  const platformRevenue = userCommission + advertiserCommission;
  const platformMargin = platformRevenue / taskValue * 100;
  return {
    taskValue,
    userCommission,
    advertiserCommission,
    userEarnings,
    advertiserCost,
    platformRevenue,
    platformMargin
  };
}
function getCommissionRates(userTier = "tier1", advertiserTier = "tier1") {
  if (isLaunchPhaseActive()) {
    return {
      userRate: LAUNCH_PHASE.userCommissionRate,
      advertiserRate: LAUNCH_PHASE.advertiserCommissionRate,
      isLaunchPhase: true
    };
  }
  const userConfig = getUserTierConfig(userTier);
  const advertiserConfig = getAdvertiserTierConfig(advertiserTier);
  return {
    userRate: userConfig.commissionRate,
    advertiserRate: advertiserConfig.commissionRate,
    isLaunchPhase: false
  };
}

// server/services/tier.service.ts
import { eq as eq2, and, gte, sql } from "drizzle-orm";
async function checkUserTierEligibility(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const user = await db.select().from(users).where(eq2(users.id, userId)).limit(1);
  if (!user || user.length === 0) return null;
  const currentTier = user[0].tier;
  const stats = await getUserTaskStats(userId);
  if (currentTier !== "tier3" && isEligibleForTier("tier3", stats)) {
    return "tier3";
  }
  if (currentTier !== "tier2" && isEligibleForTier("tier2", stats)) {
    return "tier2";
  }
  return null;
}
function isEligibleForTier(tier, stats) {
  const config = USER_TIERS[tier];
  return stats.tasksCompleted >= config.minTasksRequired && stats.averageRating >= config.minRatingRequired;
}
async function getUserTaskStats(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select({
    tasksCompleted: sql`COUNT(*)`,
    averageRating: sql`COALESCE(AVG(${userTasks.rating}), 0)`
  }).from(userTasks).where(
    and(
      eq2(userTasks.userId, userId),
      eq2(userTasks.status, "completed")
    )
  );
  return {
    tasksCompleted: result[0]?.tasksCompleted || 0,
    averageRating: result[0]?.averageRating || 0
  };
}
async function upgradeUserTier(userId, newTier) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db.update(users).set({
      tier: newTier,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq2(users.id, userId));
    return true;
  } catch (error) {
    console.error("Error upgrading user tier:", error);
    return false;
  }
}
async function checkAdvertiserTierEligibility(advertiserId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const advertiser = await db.select().from(advertisers).where(eq2(advertisers.id, advertiserId)).limit(1);
  if (!advertiser || advertiser.length === 0) return null;
  const currentTier = advertiser[0].tier;
  const monthlySpend = await getAdvertiserMonthlySpend(advertiserId);
  if (currentTier !== "tier4" && monthlySpend >= ADVERTISER_TIERS.tier4.minMonthlySpend) {
    return "tier4";
  }
  if (currentTier !== "tier3" && monthlySpend >= ADVERTISER_TIERS.tier3.minMonthlySpend) {
    return "tier3";
  }
  if (currentTier !== "tier2" && monthlySpend >= ADVERTISER_TIERS.tier2.minMonthlySpend) {
    return "tier2";
  }
  return null;
}
async function getAdvertiserMonthlySpend(advertiserId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const thirtyDaysAgo = /* @__PURE__ */ new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const result = await db.select({
    totalSpend: sql`COALESCE(SUM(${userTasks.taskValue}), 0)`
  }).from(userTasks).where(
    and(
      eq2(userTasks.advertiserId, advertiserId),
      gte(userTasks.createdAt, thirtyDaysAgo),
      eq2(userTasks.status, "completed")
    )
  );
  return result[0]?.totalSpend || 0;
}
async function upgradeAdvertiserTier(advertiserId, newTier) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db.update(advertisers).set({
      tier: newTier,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq2(advertisers.id, advertiserId));
    return true;
  } catch (error) {
    console.error("Error upgrading advertiser tier:", error);
    return false;
  }
}
function getTierInfo(tier, type) {
  if (type === "user") {
    return USER_TIERS[tier] || USER_TIERS.tier1;
  } else {
    return ADVERTISER_TIERS[tier] || ADVERTISER_TIERS.tier1;
  }
}

// server/services/wallet.service.ts
import { eq as eq3, and as and2, sql as sql2 } from "drizzle-orm";
async function getUserBalance(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const user = await db.select().from(users).where(eq3(users.id, userId)).limit(1);
  if (!user || user.length === 0) throw new Error("User not found");
  return user[0].balance || 0;
}
async function addFunds(userId, amount, description, relatedTaskId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const currentBalance = await getUserBalance(userId);
  const newBalance = currentBalance + amount;
  await db.update(users).set({
    balance: newBalance,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq3(users.id, userId));
  await db.insert(transactions).values({
    userId,
    type: "credit",
    amount,
    balanceBefore: currentBalance,
    balanceAfter: newBalance,
    description,
    taskId: relatedTaskId,
    status: "completed",
    createdAt: /* @__PURE__ */ new Date()
  });
  return newBalance;
}
async function requestWithdrawal(userId, amount, method, accountDetails) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (amount < BUSINESS_CONSTANTS.MIN_WITHDRAWAL_AMOUNT) {
    throw new Error(`Minimum withdrawal amount is $${BUSINESS_CONSTANTS.MIN_WITHDRAWAL_AMOUNT}`);
  }
  const currentBalance = await getUserBalance(userId);
  if (currentBalance < amount) {
    throw new Error("Insufficient balance");
  }
  const result = await db.insert(transactions).values({
    userId,
    type: "withdrawal",
    amount,
    balanceBefore: currentBalance,
    balanceAfter: currentBalance,
    // Balance not updated until withdrawal is processed
    description: `Withdrawal request via ${method}`,
    status: "pending",
    metadata: JSON.stringify({ method, accountDetails }),
    createdAt: /* @__PURE__ */ new Date()
  });
  return result.insertId;
}
async function processWithdrawal(transactionId, status, note) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const transaction = await db.select().from(transactions).where(eq3(transactions.id, transactionId)).limit(1);
  if (!transaction || transaction.length === 0) {
    throw new Error("Transaction not found");
  }
  const txn = transaction[0];
  if (txn.type !== "withdrawal" || txn.status !== "pending") {
    throw new Error("Invalid transaction for processing");
  }
  if (status === "completed") {
    const newBalance = txn.balanceBefore - txn.amount;
    await db.update(users).set({
      balance: newBalance,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq3(users.id, txn.userId));
    await db.update(transactions).set({
      status: "completed",
      balanceAfter: newBalance,
      processedAt: /* @__PURE__ */ new Date(),
      note
    }).where(eq3(transactions.id, transactionId));
  } else {
    await db.update(transactions).set({
      status: "rejected",
      processedAt: /* @__PURE__ */ new Date(),
      note
    }).where(eq3(transactions.id, transactionId));
  }
  return true;
}
async function getTransactionHistory(userId, limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(transactions).where(eq3(transactions.userId, userId)).orderBy(sql2`${transactions.createdAt} DESC`).limit(limit);
}
async function getPendingWithdrawals() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(transactions).where(
    and2(
      eq3(transactions.type, "withdrawal"),
      eq3(transactions.status, "pending")
    )
  ).orderBy(sql2`${transactions.createdAt} ASC`);
}
async function getTotalEarnings(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select({
    total: sql2`COALESCE(SUM(${transactions.amount}), 0)`
  }).from(transactions).where(
    and2(
      eq3(transactions.userId, userId),
      eq3(transactions.type, "earning"),
      eq3(transactions.status, "completed")
    )
  );
  return result[0]?.total || 0;
}
async function getTotalWithdrawals(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select({
    total: sql2`COALESCE(SUM(${transactions.amount}), 0)`
  }).from(transactions).where(
    and2(
      eq3(transactions.userId, userId),
      eq3(transactions.type, "withdrawal"),
      eq3(transactions.status, "completed")
    )
  );
  return result[0]?.total || 0;
}

// server/services/task.service.ts
import { eq as eq4, and as and3, sql as sql3, or, gte as gte2, lte } from "drizzle-orm";
async function createTask(advertiserId, taskData) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const advertiser = await db.select().from(advertisers).where(eq4(advertisers.id, advertiserId)).limit(1);
  if (!advertiser || advertiser.length === 0) {
    throw new Error("Advertiser not found");
  }
  const commission = calculateCommission(taskData.value, "tier1", advertiser[0].tier);
  const result = await db.insert(tasks).values({
    advertiserId,
    title: taskData.title,
    description: taskData.description,
    type: taskData.type,
    value: taskData.value,
    advertiserCost: commission.advertiserCost,
    countryId: taskData.countryId,
    cityId: taskData.cityId,
    targetAudience: taskData.targetAudience,
    requirements: taskData.requirements,
    deadline: taskData.deadline,
    maxAssignments: taskData.maxAssignments,
    currentAssignments: 0,
    status: "active",
    createdAt: /* @__PURE__ */ new Date()
  });
  return result.insertId;
}
async function getAvailableTasks(userId, filters) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const user = await db.select().from(users).where(eq4(users.id, userId)).limit(1);
  if (!user || user.length === 0) {
    throw new Error("User not found");
  }
  let conditions = [
    eq4(tasks.status, "active"),
    sql3`${tasks.currentAssignments} < ${tasks.maxAssignments}`
  ];
  if (filters?.countryId) {
    conditions.push(eq4(tasks.countryId, filters.countryId));
  }
  if (filters?.type) {
    conditions.push(eq4(tasks.type, filters.type));
  }
  if (filters?.minValue) {
    conditions.push(gte2(tasks.value, filters.minValue));
  }
  if (filters?.maxValue) {
    conditions.push(lte(tasks.value, filters.maxValue));
  }
  const availableTasks = await db.select().from(tasks).where(and3(...conditions)).orderBy(sql3`${tasks.createdAt} DESC`).limit(50);
  const filteredTasks = availableTasks.filter((task) => {
    if (!task.targetTiers) return true;
    try {
      const targetTiersArray = JSON.parse(task.targetTiers);
      return targetTiersArray.includes(user[0].tier);
    } catch (e) {
      console.error("Error parsing targetTiers:", e);
      return true;
    }
  });
  return filteredTasks.map((task) => {
    const commission = calculateCommission(task.value, user[0].tier);
    return {
      ...task,
      userEarnings: commission.userEarnings,
      userCommission: commission.userCommission
    };
  });
}
async function assignTaskToUser(taskId, userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const task = await db.select().from(tasks).where(eq4(tasks.id, taskId)).limit(1);
  if (!task || task.length === 0) {
    throw new Error("Task not found");
  }
  if (task[0].status !== "active") {
    throw new Error("Task is not active");
  }
  if (task[0].currentAssignments >= task[0].maxAssignments) {
    throw new Error("Task is fully assigned");
  }
  const existing = await db.select().from(userTasks).where(
    and3(
      eq4(userTasks.taskId, taskId),
      eq4(userTasks.userId, userId),
      or(
        eq4(userTasks.status, "assigned"),
        eq4(userTasks.status, "in_progress"),
        eq4(userTasks.status, "submitted")
      )
    )
  ).limit(1);
  if (existing && existing.length > 0) {
    throw new Error("User already has this task");
  }
  const user = await db.select().from(users).where(eq4(users.id, userId)).limit(1);
  if (!user || user.length === 0) {
    throw new Error("User not found");
  }
  const commission = calculateCommission(task[0].value, user[0].tier, task[0].advertiserId.toString());
  const result = await db.insert(userTasks).values({
    taskId,
    userId,
    advertiserId: task[0].advertiserId,
    taskValue: task[0].value,
    userEarnings: commission.userEarnings,
    userCommission: commission.userCommission,
    status: "assigned",
    assignedAt: /* @__PURE__ */ new Date(),
    createdAt: /* @__PURE__ */ new Date()
  });
  await db.update(tasks).set({
    currentAssignments: sql3`${tasks.currentAssignments} + 1`,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq4(tasks.id, taskId));
  return result.insertId;
}
async function submitTaskCompletion(userTaskId, submissionData) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const userTask = await db.select().from(userTasks).where(eq4(userTasks.id, userTaskId)).limit(1);
  if (!userTask || userTask.length === 0) {
    throw new Error("User task not found");
  }
  if (userTask[0].status !== "assigned" && userTask[0].status !== "in_progress") {
    throw new Error("Task cannot be submitted in current status");
  }
  await db.update(userTasks).set({
    status: "submitted",
    submittedAt: /* @__PURE__ */ new Date(),
    proof: submissionData.proof,
    notes: submissionData.notes,
    attachments: submissionData.attachments,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq4(userTasks.id, userTaskId));
  return true;
}
async function verifyTaskCompletion(userTaskId, isApproved, rating, feedback) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const userTask = await db.select().from(userTasks).where(eq4(userTasks.id, userTaskId)).limit(1);
  if (!userTask || userTask.length === 0) {
    throw new Error("User task not found");
  }
  if (userTask[0].status !== "submitted") {
    throw new Error("Task is not in submitted status");
  }
  if (isApproved) {
    await db.update(userTasks).set({
      status: "completed",
      verifiedAt: /* @__PURE__ */ new Date(),
      rating,
      feedback,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq4(userTasks.id, userTaskId));
    const user = await db.select().from(users).where(eq4(users.id, userTask[0].userId)).limit(1);
    if (user && user.length > 0) {
      const tierConfig = getUserTierConfig(user[0].tier);
      const paymentDate = /* @__PURE__ */ new Date();
      paymentDate.setHours(paymentDate.getHours() + tierConfig.paymentDelay);
      if (tierConfig.paymentSchedule === "instant") {
        await addFunds(
          userTask[0].userId,
          userTask[0].userEarnings,
          `Task completion: ${userTask[0].taskId}`,
          userTask[0].taskId
        );
      } else {
        await db.update(userTasks).set({
          scheduledPaymentAt: paymentDate
        }).where(eq4(userTasks.id, userTaskId));
      }
    }
  } else {
    await db.update(userTasks).set({
      status: "rejected",
      verifiedAt: /* @__PURE__ */ new Date(),
      feedback,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq4(userTasks.id, userTaskId));
  }
  return true;
}
async function getUserTasks(userId, status) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  let query2 = db.select().from(userTasks).where(eq4(userTasks.userId, userId));
  if (status) {
    query2 = query2.where(and3(eq4(userTasks.userId, userId), eq4(userTasks.status, status)));
  }
  return await query2.orderBy(sql3`${userTasks.createdAt} DESC`);
}
async function getAdvertiserTasks(advertiserId, status) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  let query2 = db.select().from(tasks).where(eq4(tasks.advertiserId, advertiserId));
  if (status) {
    query2 = query2.where(and3(eq4(tasks.advertiserId, advertiserId), eq4(tasks.status, status)));
  }
  return await query2.orderBy(sql3`${tasks.createdAt} DESC`);
}

// server/routers.ts
import { z as z2 } from "zod";

// server/services/analytics.service.ts
import { eq as eq5, and as and4, gte as gte3, lte as lte2, sql as sql4 } from "drizzle-orm";
async function getUserDashboardStats(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const user = await db.select().from(users).where(eq5(users.id, userId)).limit(1);
  if (!user || user.length === 0) {
    throw new Error("User not found");
  }
  const taskStats = await db.select({
    total: sql4`COUNT(*)`,
    completed: sql4`SUM(CASE WHEN ${userTasks.status} = 'completed' THEN 1 ELSE 0 END)`,
    pending: sql4`SUM(CASE WHEN ${userTasks.status} IN ('assigned', 'in_progress', 'submitted') THEN 1 ELSE 0 END)`,
    rejected: sql4`SUM(CASE WHEN ${userTasks.status} = 'rejected' THEN 1 ELSE 0 END)`,
    averageRating: sql4`COALESCE(AVG(${userTasks.rating}), 0)`
  }).from(userTasks).where(eq5(userTasks.userId, userId));
  const earningsStats = await db.select({
    totalEarnings: sql4`COALESCE(SUM(CASE WHEN ${transactions.type} = 'credit' AND ${transactions.status} = 'completed' THEN ${transactions.amount} ELSE 0 END), 0)`,
    totalWithdrawals: sql4`COALESCE(SUM(CASE WHEN ${transactions.type} = 'withdrawal' AND ${transactions.status} = 'completed' THEN ${transactions.amount} ELSE 0 END), 0)`,
    pendingEarnings: sql4`COALESCE(SUM(CASE WHEN ${userTasks.status} = 'completed' AND ${userTasks.paidAt} IS NULL THEN ${userTasks.userEarnings} ELSE 0 END), 0)`
  }).from(transactions).where(eq5(transactions.userId, userId));
  const pendingEarnings = await db.select({
    amount: sql4`COALESCE(SUM(${userTasks.userEarnings}), 0)`
  }).from(userTasks).where(
    and4(
      eq5(userTasks.userId, userId),
      eq5(userTasks.status, "completed"),
      sql4`${userTasks.paidAt} IS NULL`
    )
  );
  return {
    user: {
      id: user[0].id,
      name: user[0].name,
      tier: user[0].tier,
      balance: user[0].balance,
      isVerified: user[0].isVerified
    },
    tasks: {
      total: taskStats[0]?.total || 0,
      completed: taskStats[0]?.completed || 0,
      pending: taskStats[0]?.pending || 0,
      rejected: taskStats[0]?.rejected || 0,
      averageRating: taskStats[0]?.averageRating || 0
    },
    earnings: {
      totalEarnings: earningsStats[0]?.totalEarnings || 0,
      totalWithdrawals: earningsStats[0]?.totalWithdrawals || 0,
      pendingEarnings: pendingEarnings[0]?.amount || 0,
      currentBalance: user[0].balance || 0
    }
  };
}
async function getAdvertiserDashboardStats(advertiserId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const advertiser = await db.select().from(advertisers).where(eq5(advertisers.id, advertiserId)).limit(1);
  if (!advertiser || advertiser.length === 0) {
    throw new Error("Advertiser not found");
  }
  const taskStats = await db.select({
    total: sql4`COUNT(*)`,
    active: sql4`SUM(CASE WHEN ${tasks.status} = 'active' THEN 1 ELSE 0 END)`,
    completed: sql4`SUM(CASE WHEN ${tasks.status} = 'completed' THEN 1 ELSE 0 END)`,
    paused: sql4`SUM(CASE WHEN ${tasks.status} = 'paused' THEN 1 ELSE 0 END)`
  }).from(tasks).where(eq5(tasks.advertiserId, advertiserId));
  const userTaskStats = await db.select({
    totalAssignments: sql4`COUNT(*)`,
    completedAssignments: sql4`SUM(CASE WHEN ${userTasks.status} = 'completed' THEN 1 ELSE 0 END)`,
    pendingReview: sql4`SUM(CASE WHEN ${userTasks.status} = 'submitted' THEN 1 ELSE 0 END)`,
    averageRating: sql4`COALESCE(AVG(${userTasks.rating}), 0)`
  }).from(userTasks).where(eq5(userTasks.advertiserId, advertiserId));
  const spendingStats = await db.select({
    totalSpent: sql4`COALESCE(SUM(${userTasks.taskValue} + ${userTasks.userCommission}), 0)`,
    thisMonth: sql4`COALESCE(SUM(CASE WHEN ${userTasks.createdAt} >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN ${userTasks.taskValue} + ${userTasks.userCommission} ELSE 0 END), 0)`
  }).from(userTasks).where(
    and4(
      eq5(userTasks.advertiserId, advertiserId),
      eq5(userTasks.status, "completed")
    )
  );
  return {
    advertiser: {
      id: advertiser[0].id,
      name: advertiser[0].name,
      tier: advertiser[0].tier,
      isVerified: advertiser[0].isVerified
    },
    tasks: {
      total: taskStats[0]?.total || 0,
      active: taskStats[0]?.active || 0,
      completed: taskStats[0]?.completed || 0,
      paused: taskStats[0]?.paused || 0
    },
    assignments: {
      total: userTaskStats[0]?.totalAssignments || 0,
      completed: userTaskStats[0]?.completedAssignments || 0,
      pendingReview: userTaskStats[0]?.pendingReview || 0,
      averageRating: userTaskStats[0]?.averageRating || 0
    },
    spending: {
      totalSpent: spendingStats[0]?.totalSpent || 0,
      thisMonth: spendingStats[0]?.thisMonth || 0
    }
  };
}
async function getAdminDashboardStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const userStats = await db.select({
    total: sql4`COUNT(*)`,
    active: sql4`SUM(CASE WHEN ${users.isActive} = 1 THEN 1 ELSE 0 END)`,
    verified: sql4`SUM(CASE WHEN ${users.isVerified} = 1 THEN 1 ELSE 0 END)`
  }).from(users);
  const advertiserStats = await db.select({
    total: sql4`COUNT(*)`,
    active: sql4`SUM(CASE WHEN ${advertisers.isActive} = 1 THEN 1 ELSE 0 END)`,
    verified: sql4`SUM(CASE WHEN ${advertisers.isVerified} = 1 THEN 1 ELSE 0 END)`
  }).from(advertisers);
  const taskStats = await db.select({
    total: sql4`COUNT(*)`,
    active: sql4`SUM(CASE WHEN ${tasks.status} = 'active' THEN 1 ELSE 0 END)`,
    completed: sql4`SUM(CASE WHEN ${tasks.status} = 'completed' THEN 1 ELSE 0 END)`
  }).from(tasks);
  const userTaskStats = await db.select({
    total: sql4`COUNT(*)`,
    completed: sql4`SUM(CASE WHEN ${userTasks.status} = 'completed' THEN 1 ELSE 0 END)`,
    pending: sql4`SUM(CASE WHEN ${userTasks.status} IN ('assigned', 'in_progress', 'submitted') THEN 1 ELSE 0 END)`
  }).from(userTasks);
  const financialStats = await db.select({
    totalGMV: sql4`COALESCE(SUM(${userTasks.taskValue}), 0)`,
    totalRevenue: sql4`COALESCE(SUM(${userTasks.userCommission}), 0)`,
    thisMonthGMV: sql4`COALESCE(SUM(CASE WHEN ${userTasks.createdAt} >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN ${userTasks.taskValue} ELSE 0 END), 0)`,
    thisMonthRevenue: sql4`COALESCE(SUM(CASE WHEN ${userTasks.createdAt} >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN ${userTasks.userCommission} ELSE 0 END), 0)`
  }).from(userTasks).where(eq5(userTasks.status, "completed"));
  const pendingWithdrawals = await db.select({
    count: sql4`COUNT(*)`,
    amount: sql4`COALESCE(SUM(${transactions.amount}), 0)`
  }).from(transactions).where(
    and4(
      eq5(transactions.type, "withdrawal"),
      eq5(transactions.status, "pending")
    )
  );
  return {
    users: {
      total: userStats[0]?.total || 0,
      active: userStats[0]?.active || 0,
      verified: userStats[0]?.verified || 0
    },
    advertisers: {
      total: advertiserStats[0]?.total || 0,
      active: advertiserStats[0]?.active || 0,
      verified: advertiserStats[0]?.verified || 0
    },
    tasks: {
      total: taskStats[0]?.total || 0,
      active: taskStats[0]?.active || 0,
      completed: taskStats[0]?.completed || 0
    },
    userTasks: {
      total: userTaskStats[0]?.total || 0,
      completed: userTaskStats[0]?.completed || 0,
      pending: userTaskStats[0]?.pending || 0
    },
    financial: {
      totalGMV: financialStats[0]?.totalGMV || 0,
      totalRevenue: financialStats[0]?.totalRevenue || 0,
      thisMonthGMV: financialStats[0]?.thisMonthGMV || 0,
      thisMonthRevenue: financialStats[0]?.thisMonthRevenue || 0
    },
    withdrawals: {
      pendingCount: pendingWithdrawals[0]?.count || 0,
      pendingAmount: pendingWithdrawals[0]?.amount || 0
    }
  };
}
async function getTaskPerformanceReport(taskId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const task = await db.select().from(tasks).where(eq5(tasks.id, taskId)).limit(1);
  if (!task || task.length === 0) {
    throw new Error("Task not found");
  }
  const assignmentStats = await db.select({
    total: sql4`COUNT(*)`,
    completed: sql4`SUM(CASE WHEN ${userTasks.status} = 'completed' THEN 1 ELSE 0 END)`,
    pending: sql4`SUM(CASE WHEN ${userTasks.status} IN ('assigned', 'in_progress') THEN 1 ELSE 0 END)`,
    submitted: sql4`SUM(CASE WHEN ${userTasks.status} = 'submitted' THEN 1 ELSE 0 END)`,
    rejected: sql4`SUM(CASE WHEN ${userTasks.status} = 'rejected' THEN 1 ELSE 0 END)`,
    averageRating: sql4`COALESCE(AVG(${userTasks.rating}), 0)`,
    averageCompletionTime: sql4`COALESCE(AVG(TIMESTAMPDIFF(HOUR, ${userTasks.assignedAt}, ${userTasks.submittedAt})), 0)`
  }).from(userTasks).where(eq5(userTasks.taskId, taskId));
  return {
    task: task[0],
    statistics: {
      totalAssignments: assignmentStats[0]?.total || 0,
      completed: assignmentStats[0]?.completed || 0,
      pending: assignmentStats[0]?.pending || 0,
      submitted: assignmentStats[0]?.submitted || 0,
      rejected: assignmentStats[0]?.rejected || 0,
      averageRating: assignmentStats[0]?.averageRating || 0,
      averageCompletionTime: assignmentStats[0]?.averageCompletionTime || 0,
      completionRate: assignmentStats[0]?.total ? (assignmentStats[0]?.completed || 0) / assignmentStats[0].total * 100 : 0
    }
  };
}
async function getRevenueReport(startDate, endDate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const report = await db.select({
    totalGMV: sql4`COALESCE(SUM(${userTasks.taskValue}), 0)`,
    totalUserCommission: sql4`COALESCE(SUM(${userTasks.userCommission}), 0)`,
    totalAdvertiserCommission: sql4`COALESCE(SUM(${userTasks.taskValue} * 0.1), 0)`,
    // Assuming 10% advertiser commission
    totalRevenue: sql4`COALESCE(SUM(${userTasks.userCommission} + (${userTasks.taskValue} * 0.1)), 0)`,
    taskCount: sql4`COUNT(*)`
  }).from(userTasks).where(
    and4(
      eq5(userTasks.status, "completed"),
      gte3(userTasks.createdAt, startDate),
      lte2(userTasks.createdAt, endDate)
    )
  );
  return report[0] || {
    totalGMV: 0,
    totalUserCommission: 0,
    totalAdvertiserCommission: 0,
    totalRevenue: 0,
    taskCount: 0
  };
}

// server/routers.ts
var appRouter = router10({
  system: systemRouter,
  auth: router10({
    me: publicProcedure.query((opts) => opts.ctx.user),
    // Email/Password login (for testing/demo purposes)
    login: publicProcedure.input(z2.object({
      email: z2.string().email(),
      password: z2.string()
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.select().from(users).where(eq6(users.email, input.email)).limit(1);
      const user = result[0];
      if (!user) {
        throw new Error("Invalid email or password");
      }
      if (!user.password) {
        throw new Error("Password authentication not configured for this user");
      }
      const isPasswordValid = await bcrypt3.compare(input.password, user.password);
      if (!isPasswordValid) {
        throw new Error("Invalid email or password");
      }
      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name || ""
      });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME2, sessionToken, cookieOptions);
      return {
        success: true,
        user
      };
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME2, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
  }),
  // Countries API
  countries: router10({
    list: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return await db.select().from(countries).where(eq6(countries.isActive, 1));
    }),
    getByCode: publicProcedure.input(z2.object({ code: z2.string() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.select().from(countries).where(eq6(countries.code, input.code)).limit(1);
      return result[0] || null;
    })
  }),
  // Commission API
  commission: router10({
    calculate: publicProcedure.input(z2.object({
      taskValue: z2.number(),
      userTier: z2.string().optional(),
      advertiserTier: z2.string().optional()
    })).query(({ input }) => {
      return calculateCommission(input.taskValue, input.userTier, input.advertiserTier);
    }),
    getRates: publicProcedure.input(z2.object({
      userTier: z2.string().optional(),
      advertiserTier: z2.string().optional()
    })).query(({ input }) => {
      return getCommissionRates(input.userTier, input.advertiserTier);
    })
  }),
  // Tier Management API
  tiers: router10({
    // User tier operations
    checkUserEligibility: publicProcedure.input(z2.object({ userId: z2.number() })).query(async ({ input }) => {
      return await checkUserTierEligibility(input.userId);
    }),
    upgradeUser: publicProcedure.input(z2.object({
      userId: z2.number(),
      newTier: z2.enum(["tier1", "tier2", "tier3"])
    })).mutation(async ({ input }) => {
      return await upgradeUserTier(input.userId, input.newTier);
    }),
    getUserTierInfo: publicProcedure.input(z2.object({ tier: z2.string() })).query(({ input }) => {
      return getTierInfo(input.tier, "user");
    }),
    // Advertiser tier operations
    checkAdvertiserEligibility: publicProcedure.input(z2.object({ advertiserId: z2.number() })).query(async ({ input }) => {
      return await checkAdvertiserTierEligibility(input.advertiserId);
    }),
    upgradeAdvertiser: publicProcedure.input(z2.object({
      advertiserId: z2.number(),
      newTier: z2.enum(["tier1", "tier2", "tier3", "tier4"])
    })).mutation(async ({ input }) => {
      return await upgradeAdvertiserTier(input.advertiserId, input.newTier);
    }),
    getAdvertiserTierInfo: publicProcedure.input(z2.object({ tier: z2.string() })).query(({ input }) => {
      return getTierInfo(input.tier, "advertiser");
    })
  }),
  // Wallet API
  wallet: router10({
    getBalance: publicProcedure.input(z2.object({ userId: z2.number() })).query(async ({ input }) => {
      return await getUserBalance(input.userId);
    }),
    requestWithdrawal: publicProcedure.input(z2.object({
      userId: z2.number(),
      amount: z2.number(),
      method: z2.enum(["vodafone_cash", "instapay", "fawry", "bank_transfer"]),
      accountDetails: z2.string()
    })).mutation(async ({ input }) => {
      return await requestWithdrawal(
        input.userId,
        input.amount,
        input.method,
        input.accountDetails
      );
    }),
    processWithdrawal: publicProcedure.input(z2.object({
      transactionId: z2.number(),
      status: z2.enum(["completed", "rejected"]),
      note: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      if (!ctx.user || ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
      return await processWithdrawal(input.transactionId, input.status, input.note);
    }),
    getTransactionHistory: publicProcedure.input(z2.object({
      userId: z2.number(),
      limit: z2.number().optional()
    })).query(async ({ input }) => {
      return await getTransactionHistory(input.userId, input.limit);
    }),
    getPendingWithdrawals: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user || ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
      return await getPendingWithdrawals();
    }),
    getTotalEarnings: publicProcedure.input(z2.object({ userId: z2.number() })).query(async ({ input }) => {
      return await getTotalEarnings(input.userId);
    }),
    getTotalWithdrawals: publicProcedure.input(z2.object({ userId: z2.number() })).query(async ({ input }) => {
      return await getTotalWithdrawals(input.userId);
    })
  }),
  // Tasks API
  tasks: router10({
    // Create task (Advertiser)
    create: publicProcedure.input(z2.object({
      advertiserId: z2.number(),
      title: z2.string(),
      description: z2.string(),
      type: z2.string(),
      value: z2.number(),
      countryId: z2.number(),
      cityId: z2.number().optional(),
      targetAudience: z2.string().optional(),
      requirements: z2.string().optional(),
      deadline: z2.date().optional(),
      maxAssignments: z2.number()
    })).mutation(async ({ input }) => {
      return await createTask(input.advertiserId, input);
    }),
    // Get available tasks (User)
    getAvailable: publicProcedure.input(z2.object({
      userId: z2.number(),
      countryId: z2.number().optional(),
      type: z2.string().optional(),
      minValue: z2.number().optional(),
      maxValue: z2.number().optional()
    })).query(async ({ input }) => {
      const { userId, ...filters } = input;
      return await getAvailableTasks(userId, filters);
    }),
    // Assign task to user
    assign: publicProcedure.input(z2.object({
      taskId: z2.number(),
      userId: z2.number()
    })).mutation(async ({ input }) => {
      return await assignTaskToUser(input.taskId, input.userId);
    }),
    // Submit task completion
    submit: publicProcedure.input(z2.object({
      userTaskId: z2.number(),
      proof: z2.string().optional(),
      notes: z2.string().optional(),
      attachments: z2.string().optional()
    })).mutation(async ({ input }) => {
      const { userTaskId, ...submissionData } = input;
      return await submitTaskCompletion(userTaskId, submissionData);
    }),
    // Verify task completion (Advertiser)
    verify: publicProcedure.input(z2.object({
      userTaskId: z2.number(),
      isApproved: z2.boolean(),
      rating: z2.number().min(1).max(5).optional(),
      feedback: z2.string().optional()
    })).mutation(async ({ input }) => {
      return await verifyTaskCompletion(
        input.userTaskId,
        input.isApproved,
        input.rating,
        input.feedback
      );
    }),
    // Get user's tasks
    getUserTasks: publicProcedure.input(z2.object({
      userId: z2.number(),
      status: z2.string().optional()
    })).query(async ({ input }) => {
      return await getUserTasks(input.userId, input.status);
    }),
    // Get advertiser's tasks
    getAdvertiserTasks: publicProcedure.input(z2.object({
      advertiserId: z2.number(),
      status: z2.string().optional()
    })).query(async ({ input }) => {
      return await getAdvertiserTasks(input.advertiserId, input.status);
    }),
    // Original endpoints (kept for compatibility)
    list: publicProcedure.input(z2.object({
      countryId: z2.number().optional(),
      advertiserId: z2.number().optional(),
      status: z2.string().optional()
    }).optional()).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      let query2 = db.select().from(tasks);
      if (input?.countryId) {
        query2 = query2.where(eq6(tasks.countryId, input.countryId));
      }
      if (input?.advertiserId) {
        query2 = query2.where(eq6(tasks.advertiserId, input.advertiserId));
      }
      if (input?.status) {
        query2 = query2.where(eq6(tasks.status, input.status));
      }
      return await query2;
    }),
    getById: publicProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.select().from(tasks).where(eq6(tasks.id, input.id)).limit(1);
      return result[0] || null;
    })
  }),
  // Advertisers API
  advertisers: router10({
    list: publicProcedure.input(z2.object({ countryId: z2.number().optional() }).optional()).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      if (input?.countryId) {
        return await db.select().from(advertisers).where(eq6(advertisers.countryId, input.countryId));
      }
      return await db.select().from(advertisers).where(eq6(advertisers.isActive, 1));
    }),
    getBySlug: publicProcedure.input(z2.object({ slug: z2.string() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.select().from(advertisers).where(eq6(advertisers.slug, input.slug)).limit(1);
      return result[0] || null;
    })
  }),
  // User Profile API
  user: router10({
    getProfile: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user?.openId) {
        return null;
      }
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const userProfile = await getUserByOpenId(ctx.user.openId);
      return userProfile || null;
    }),
    updateProfile: publicProcedure.input(z2.object({
      phone: z2.string().optional(),
      countryId: z2.number().optional()
    })).mutation(async ({ ctx, input }) => {
      if (!ctx.user?.openId) {
        throw new Error("Not authenticated");
      }
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(users).set({
        phone: input.phone,
        countryId: input.countryId,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq6(users.openId, ctx.user.openId));
      return { success: true };
    }),
    // Admin endpoints
    listAll: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user || ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return await db.select().from(users);
    }),
    updateUser: publicProcedure.input(z2.object({
      userId: z2.number(),
      name: z2.string().optional(),
      email: z2.string().email().optional(),
      phone: z2.string().optional(),
      role: z2.enum(["user", "admin"]).optional(),
      tier: z2.enum(["bronze", "silver", "gold", "platinum"]).optional(),
      isVerified: z2.number().min(0).max(1).optional()
    })).mutation(async ({ ctx, input }) => {
      if (!ctx.user || ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { userId, ...updateData } = input;
      await db.update(users).set({
        ...updateData,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq6(users.id, userId));
      return { success: true };
    })
  })
});
var analyticsRouter = router10({
  // User dashboard
  getUserDashboard: publicProcedure.input(z2.object({ userId: z2.number() })).query(async ({ input }) => {
    return await getUserDashboardStats(input.userId);
  }),
  // Advertiser dashboard
  getAdvertiserDashboard: publicProcedure.input(z2.object({ advertiserId: z2.number() })).query(async ({ input }) => {
    return await getAdvertiserDashboardStats(input.advertiserId);
  }),
  // Admin dashboard
  getAdminDashboard: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }
    return await getAdminDashboardStats();
  }),
  // Task performance report
  getTaskPerformance: publicProcedure.input(z2.object({ taskId: z2.number() })).query(async ({ input }) => {
    return await getTaskPerformanceReport(input.taskId);
  }),
  // Revenue report
  getRevenueReport: publicProcedure.input(z2.object({
    startDate: z2.date(),
    endDate: z2.date()
  })).query(async ({ ctx, input }) => {
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }
    return await getRevenueReport(input.startDate, input.endDate);
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs from "fs";
import { nanoid } from "nanoid";
import path3 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path2.resolve(import.meta.dirname),
  root: path2.resolve(import.meta.dirname, "client"),
  publicDir: path2.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          "ui-vendor": ["lucide-react", "recharts"],
          "query-vendor": ["@tanstack/react-query"],
          "i18n-vendor": ["i18next", "react-i18next"]
        }
      }
    },
    chunkSizeWarningLimit: 1e3,
    minify: "esbuild"
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    hmr: {
      clientPort: 443,
      protocol: "wss"
    },
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path3.resolve(import.meta.dirname, "../..", "dist", "public") : path3.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/_core/security.ts
import rateLimit from "express-rate-limit";
import helmet from "helmet";
var loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 20,
  // Limit each IP to 20 requests per windowMs (increased for development)
  message: "Too many login attempts from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false
});
var apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1e3,
  // 1 minute
  max: 100,
  // Limit each IP to 100 requests per minute
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false
});
var bountyLimiter = rateLimit({
  windowMs: 1 * 60 * 1e3,
  // 1 minute
  max: 10,
  // Limit to 10 bounty responses per minute
  message: "Too many bounty submissions, please slow down",
  standardHeaders: true,
  legacyHeaders: false
});
var securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      // Note: unsafe-eval needed for Vite in dev
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https:"]
    }
  },
  crossOriginEmbedderPolicy: false
});
var corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000", "http://localhost:3005"],
  credentials: true,
  optionsSuccessStatus: 200
};
var addSecurityHeaders = (req, res, next) => {
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
};
var validateBodySize = (req, res, next) => {
  const contentLength = req.headers["content-length"];
  const maxSize = 10 * 1024 * 1024;
  if (contentLength && parseInt(contentLength) > maxSize) {
    return res.status(413).json({
      success: false,
      error: "Request body too large"
    });
  }
  next();
};

// server/_core/csrf.ts
import crypto from "crypto";
var csrfTokens = /* @__PURE__ */ new Map();
var TOKEN_EXPIRATION = 60 * 60 * 1e3;
function generateCsrfToken(sessionId) {
  const token = crypto.randomBytes(32).toString("hex");
  csrfTokens.set(sessionId, {
    token,
    createdAt: Date.now()
  });
  return token;
}
function verifyCsrfToken(sessionId, token) {
  const stored = csrfTokens.get(sessionId);
  if (!stored) {
    return false;
  }
  if (Date.now() - stored.createdAt > TOKEN_EXPIRATION) {
    csrfTokens.delete(sessionId);
    return false;
  }
  return stored.token === token;
}
function csrfTokenMiddleware(req, res, next) {
  const sessionId = req.user?.id?.toString() || req.ip || "anonymous";
  const token = generateCsrfToken(sessionId);
  res.locals.csrfToken = token;
  res.setHeader("X-CSRF-Token", token);
  next();
}
function csrfProtection(req, res, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }
  const sessionId = req.user?.id?.toString() || req.ip || "anonymous";
  const token = req.headers["x-csrf-token"] || req.body._csrf;
  if (!token) {
    return res.status(403).json({
      success: false,
      error: "CSRF token missing"
    });
  }
  if (!verifyCsrfToken(sessionId, token)) {
    return res.status(403).json({
      success: false,
      error: "Invalid CSRF token"
    });
  }
  next();
}
function getCsrfTokenHandler(req, res) {
  const sessionId = req.user?.id?.toString() || req.ip || "anonymous";
  const token = generateCsrfToken(sessionId);
  res.json({
    success: true,
    csrfToken: token
  });
}
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, data] of csrfTokens.entries()) {
    if (now - data.createdAt > TOKEN_EXPIRATION) {
      csrfTokens.delete(sessionId);
    }
  }
}, TOKEN_EXPIRATION);

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.set("trust proxy", 1);
  app.use(securityHeaders);
  app.use(addSecurityHeaders);
  app.use(validateBodySize);
  app.use(cookieParser());
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  app.get("/api/csrf-token", getCsrfTokenHandler);
  app.use(csrfTokenMiddleware);
  registerOAuthRoutes(app);
  app.use("/api/auth", loginLimiter, authRouter);
  app.use("/api/admin", csrfProtection, adminRouter);
  app.use("/api", task_routes_default);
  app.use("/api/profile", profile_routes_default);
  app.use("/api", advertiser_routes_default);
  app.use("/api/withdrawals", csrfProtection, withdrawal_routes_default);
  app.use("/api/admin", admin_withdrawal_routes_default);
  app.use(referral_routes_default);
  app.use(gamification_routes_default);
  app.use("/api/gamification", csrfProtection, gamification_features_routes_default);
  app.use("/api/push", push_notification_routes_default);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
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
