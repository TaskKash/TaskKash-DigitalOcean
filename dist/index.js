var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

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
  // User profile fields for campaign targeting
  age: int("age"),
  gender: varchar("gender", { length: 10 }),
  city: varchar("city", { length: 100 }),
  incomeLevel: varchar("incomeLevel", { length: 50 }),
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
  type: mysqlEnum("type", ["survey", "app", "visit", "review", "social", "video", "quiz", "other"]).notNull(),
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
  // Task-specific configuration
  config: json("config"),
  // JSON object for task-specific settings (video URL, survey questions, etc.)
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
  campaignId: int("campaignId"),
  // null for non-campaign transactions
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["task", "payment", "system", "promotion", "campaign"]).notNull(),
  titleAr: varchar("titleAr", { length: 300 }).notNull(),
  titleEn: varchar("titleEn", { length: 300 }).notNull(),
  messageAr: text("messageAr").notNull(),
  messageEn: text("messageEn").notNull(),
  actionUrl: varchar("actionUrl", { length: 500 }),
  isRead: int("isRead", { unsigned: true }).default(0).notNull(),
  // 0 = unread, 1 = read
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var campaigns = mysqlTable("campaigns", {
  id: int("id").autoincrement().primaryKey(),
  advertiserId: int("advertiserId").notNull(),
  nameAr: varchar("nameAr", { length: 300 }).notNull(),
  nameEn: varchar("nameEn", { length: 300 }).notNull(),
  descriptionAr: text("descriptionAr"),
  descriptionEn: text("descriptionEn"),
  image: varchar("image", { length: 500 }),
  budget: int("budget", { unsigned: true }).notNull(),
  // Total budget in smallest currency unit
  reward: int("reward", { unsigned: true }).notNull(),
  // Reward for completing entire campaign
  status: mysqlEnum("status", ["draft", "active", "paused", "completed"]).default("draft").notNull(),
  // Campaign settings
  videoCompletionThreshold: int("videoCompletionThreshold", { unsigned: true }).default(70).notNull(),
  // Minimum video completion %
  visitDurationThreshold: int("visitDurationThreshold", { unsigned: true }).default(30).notNull(),
  // Minimum visit duration in minutes
  // Targeting
  countryId: int("countryId").notNull(),
  targetAgeMin: int("targetAgeMin"),
  targetAgeMax: int("targetAgeMax"),
  targetGender: varchar("targetGender", { length: 10 }),
  targetLocations: text("targetLocations"),
  // JSON array of target locations
  targetIncomeLevel: varchar("targetIncomeLevel", { length: 50 }),
  // KPI targets
  targetVideoCompletionRate: int("targetVideoCompletionRate", { unsigned: true }),
  targetFilterPassRate: int("targetFilterPassRate", { unsigned: true }),
  targetSurveyCompletionRate: int("targetSurveyCompletionRate", { unsigned: true }),
  targetVisitAttendanceRate: int("targetVisitAttendanceRate", { unsigned: true }),
  targetCostPerVisit: int("targetCostPerVisit", { unsigned: true }),
  // Statistics
  totalParticipants: int("totalParticipants", { unsigned: true }).default(0).notNull(),
  completedParticipants: int("completedParticipants", { unsigned: true }).default(0).notNull(),
  disqualifiedParticipants: int("disqualifiedParticipants", { unsigned: true }).default(0).notNull(),
  // Timestamps
  launchDate: timestamp("launchDate"),
  expiryDate: timestamp("expiryDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var campaignPersonas = mysqlTable("campaignPersonas", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull(),
  nameAr: varchar("nameAr", { length: 100 }).notNull(),
  nameEn: varchar("nameEn", { length: 100 }).notNull(),
  descriptionAr: text("descriptionAr"),
  descriptionEn: text("descriptionEn"),
  // Persona-specific content
  videoUrl: varchar("videoUrl", { length: 500 }),
  adHeadlineAr: varchar("adHeadlineAr", { length: 255 }),
  adHeadlineEn: varchar("adHeadlineEn", { length: 255 }),
  adBodyAr: text("adBodyAr"),
  adBodyEn: text("adBodyEn"),
  // Persona targeting criteria (used to auto-assign users to personas)
  targetCriteria: json("targetCriteria"),
  // JSON object with criteria to match users
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var campaignTasks = mysqlTable("campaignTasks", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull(),
  taskId: int("taskId").notNull(),
  sequence: int("sequence", { unsigned: true }).notNull(),
  // Order in the campaign sequence (1, 2, 3, ...)
  // Task-specific gating rules
  gatingRules: json("gatingRules"),
  // JSON object with rules for passing this task
  isRequired: int("isRequired", { unsigned: true }).default(1).notNull(),
  // 1 = required, 0 = optional
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var campaignQualifications = mysqlTable("campaignQualifications", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull(),
  criteriaType: mysqlEnum("criteriaType", ["demographic", "behavioral", "interest", "exclusion"]).notNull(),
  criteriaKey: varchar("criteriaKey", { length: 100 }).notNull(),
  // e.g., "age", "location", "income"
  operator: mysqlEnum("operator", ["=", "!=", ">", "<", ">=", "<=", "in", "not_in"]).notNull(),
  value: varchar("value", { length: 255 }).notNull(),
  // The value to compare against
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var userCampaignProgress = mysqlTable("userCampaignProgress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  campaignId: int("campaignId").notNull(),
  personaId: int("personaId"),
  // The persona assigned to this user (if any)
  currentTaskId: int("currentTaskId"),
  // The current task the user is on
  currentSequence: int("currentSequence", { unsigned: true }).default(1).notNull(),
  // Current sequence number
  status: mysqlEnum("status", ["in_progress", "completed", "disqualified", "abandoned"]).default("in_progress").notNull(),
  disqualificationReason: text("disqualificationReason"),
  // Reason for disqualification (if any)
  // Progress tracking
  tasksCompleted: int("tasksCompleted", { unsigned: true }).default(0).notNull(),
  totalTasks: int("totalTasks", { unsigned: true }).notNull(),
  // Timestamps
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var userJourneyLogs = mysqlTable("userJourneyLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  campaignId: int("campaignId").notNull(),
  taskId: int("taskId"),
  eventType: varchar("eventType", { length: 100 }).notNull(),
  // e.g., "campaign_started", "task_completed", "visit_verified"
  eventData: json("eventData"),
  // Additional data about the event
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var campaignKpis = mysqlTable("campaignKpis", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull(),
  kpiName: varchar("kpiName", { length: 100 }).notNull(),
  // e.g., "video_completion_rate", "filter_pass_rate"
  targetValue: int("targetValue", { unsigned: true }),
  // Target value (percentage or count)
  actualValue: int("actualValue", { unsigned: true }).default(0).notNull(),
  // Current actual value
  lastCalculatedAt: timestamp("lastCalculatedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var visitVerifications = mysqlTable("visitVerifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  campaignId: int("campaignId").notNull(),
  taskId: int("taskId").notNull(),
  // Booking information
  bookingDate: timestamp("bookingDate"),
  bookingTimeSlot: varchar("bookingTimeSlot", { length: 50 }),
  // Visit verification
  checkInTime: timestamp("checkInTime"),
  checkOutTime: timestamp("checkOutTime"),
  visitDuration: int("visitDuration", { unsigned: true }),
  // Duration in minutes
  // Verification method
  verificationMethod: mysqlEnum("verificationMethod", ["gps", "qr_code", "manual"]),
  gpsLatitude: varchar("gpsLatitude", { length: 20 }),
  gpsLongitude: varchar("gpsLongitude", { length: 20 }),
  qrCodeScanned: varchar("qrCodeScanned", { length: 100 }),
  // Status
  status: mysqlEnum("status", ["booked", "checked_in", "verified", "cancelled", "no_show"]).default("booked").notNull(),
  notes: text("notes"),
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
var _pool = null;
var _db = null;
function getPool() {
  if (!_pool && process.env.DATABASE_URL) {
    try {
      _pool = mysql.createPool({
        uri: process.env.DATABASE_URL,
        waitForConnections: true,
        connectionLimit: 10,
        maxIdle: 10,
        idleTimeout: 6e4,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 1e4
      });
      _pool.on("connection", () => {
        console.log("[Database] New connection established from pool");
      });
      _pool.on("release", () => {
        console.log("[Database] Connection released back to pool");
      });
      console.log("[Database] Connection pool initialized successfully");
    } catch (error) {
      console.error("[Database] Failed to create connection pool:", error);
      _pool = null;
    }
  }
  return _pool;
}
async function getDb() {
  const pool2 = getPool();
  if (!pool2) {
    console.warn("[Database] Connection pool not available");
    return null;
  }
  if (!_db) {
    _db = drizzle(pool2);
    console.log("[Database] Drizzle ORM initialized with connection pool");
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

// server/_core/mysql-pool.ts
import mysql2 from "mysql2/promise";
var _pool2 = null;
function getPool2() {
  if (!_pool2) {
    if (!process.env.DATABASE_URL) {
      throw new Error("[Database] DATABASE_URL environment variable is not set");
    }
    _pool2 = mysql2.createPool({
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: 20,
      maxIdle: 10,
      idleTimeout: 6e4,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 1e4
    });
    console.log("[Database] MySQL connection pool initialized");
    _pool2.on("connection", () => {
      console.log("[Database] New connection established from pool");
    });
    _pool2.on("release", () => {
      console.log("[Database] Connection released back to pool");
    });
    _pool2.on("enqueue", () => {
      console.log("[Database] Waiting for available connection slot");
    });
  }
  return _pool2;
}

// server/_core/auth-routes.ts
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
    if (!user.password) {
      return res.status(401).json({
        success: false,
        error: "Password not set for this account. Please use social login or reset your password."
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
    const pool2 = getPool2();
    try {
      const [existing] = await pool2.execute(
        "SELECT id FROM users WHERE email = ?",
        [email]
      );
      if (Array.isArray(existing) && existing.length > 0) {
        return res.status(400).json({
          success: false,
          error: "Email already exists"
        });
      }
      const [result] = await pool2.execute(
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
authRouter.post("/advertiser/register", async (req, res) => {
  try {
    const { companyName, contactPerson, email, phone, industry, companySize, password, tier = "basic" } = req.body;
    if (!companyName || !contactPerson || !email || !password) {
      return res.status(400).json({ success: false, error: "Company name, contact person, email, and password are required" });
    }
    const pool2 = getPool2();
    const [existingAdvertisers] = await pool2.execute("SELECT id FROM advertisers WHERE email = ?", [email]);
    if (Array.isArray(existingAdvertisers) && existingAdvertisers.length > 0) {
      return res.status(400).json({ success: false, error: "An account with this email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const openId = `adv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const [result] = await pool2.execute(
      `INSERT INTO advertisers (openId, email, password, nameEn, nameAr, slug, tier, isActive, balance, totalSpent, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0, 0, NOW(), NOW())`,
      [openId, email, hashedPassword, companyName, companyName, slug, tier]
    );
    const insertId = result.insertId;
    const [advertisers2] = await pool2.execute("SELECT * FROM advertisers WHERE id = ?", [insertId]);
    if (!Array.isArray(advertisers2) || advertisers2.length === 0) {
      return res.status(500).json({ success: false, error: "Failed to create advertiser account" });
    }
    const advertiser = advertisers2[0];
    const token = await sdk.createSessionToken(`advertiser_${advertiser.id}`, { name: advertiser.nameEn || advertiser.email });
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: req.secure || req.headers["x-forwarded-proto"] === "https",
      sameSite: req.secure || req.headers["x-forwarded-proto"] === "https" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1e3,
      path: "/"
    });
    const { password: _, ...advertiserWithoutPassword } = advertiser;
    return res.json({ success: true, advertiser: advertiserWithoutPassword });
  } catch (error) {
    console.error("[Auth] Advertiser registration error:", error);
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
    const pool2 = getPool2();
    const [advertisers2] = await pool2.execute(
      "SELECT * FROM advertisers WHERE email = ? AND isActive = 1",
      [email]
    );
    if (!Array.isArray(advertisers2) || advertisers2.length === 0) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }
    const advertiser = advertisers2[0];
    if (!advertiser.password) {
      return res.status(401).json({
        success: false,
        error: "Password not set for this account"
      });
    }
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
    const pool2 = getPool2();
    const [advertisers2] = await pool2.execute(
      "SELECT * FROM advertisers WHERE id = ? AND isActive = 1",
      [advertiserId]
    );
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
    const mysql4 = await import("mysql2/promise");
    const connection = await mysql4.createConnection(process.env.DATABASE_URL);
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
    const mysql4 = await import("mysql2/promise");
    const connection = await mysql4.createConnection(process.env.DATABASE_URL);
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
    const mysql4 = await import("mysql2/promise");
    const connection = await mysql4.createConnection(process.env.DATABASE_URL);
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
    const mysql4 = await import("mysql2/promise");
    const connection = await mysql4.createConnection(process.env.DATABASE_URL);
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
    const mysql4 = await import("mysql2/promise");
    const connection = await mysql4.createConnection(process.env.DATABASE_URL);
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
    const mysql4 = await import("mysql2/promise");
    const connection = await mysql4.createConnection(process.env.DATABASE_URL);
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
    const mysql4 = await import("mysql2/promise");
    const connection = await mysql4.createConnection(process.env.DATABASE_URL);
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
    const mysql4 = await import("mysql2/promise");
    const connection = await mysql4.createConnection(process.env.DATABASE_URL);
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
    const mysql4 = await import("mysql2/promise");
    const connection = await mysql4.createConnection(process.env.DATABASE_URL);
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
    const mysql4 = await import("mysql2/promise");
    const connection = await mysql4.createConnection(process.env.DATABASE_URL);
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
    const mysql4 = await import("mysql2/promise");
    const connection = await mysql4.createConnection(process.env.DATABASE_URL);
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
    const mysql4 = await import("mysql2/promise");
    const connection = await mysql4.createConnection(process.env.DATABASE_URL);
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
    const mysql4 = await import("mysql2/promise");
    const connection = await mysql4.createConnection(process.env.DATABASE_URL);
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
import mysql3 from "mysql2/promise";
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
var pool = mysql3.createPool({
  ...getDatabaseConfig(),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
async function query2(sql6, params) {
  const [results] = await pool.execute(sql6, params);
  return results;
}
async function getConnection() {
  return await pool.getConnection();
}

// server/_core/commission.service.ts
var ADVERTISER_COMMISSION_RATES = {
  "enterprise": 0.1,
  // 10% commission
  "premium": 0.15,
  // 15% commission
  "standard": 0.2,
  // 20% commission
  "basic": 0.25
  // 25% commission
};
var USER_WITHDRAWAL_COMMISSION_RATES = {
  "tier1": 0.2,
  // 20% commission
  "tier2": 0.1,
  // 10% commission
  "tier3": 0.05
  // 5% commission
};
function getAdvertiserCommissionRate(tier) {
  const normalizedTier = tier?.toLowerCase() || "basic";
  return ADVERTISER_COMMISSION_RATES[normalizedTier] || ADVERTISER_COMMISSION_RATES["basic"];
}
function getUserWithdrawalCommissionRate(tier) {
  const normalizedTier = tier?.toLowerCase() || "tier1";
  return USER_WITHDRAWAL_COMMISSION_RATES[normalizedTier] || USER_WITHDRAWAL_COMMISSION_RATES["tier1"];
}
function calculateAdvertiserCommission(reward, advertiserTier) {
  const commissionRate = getAdvertiserCommissionRate(advertiserTier);
  const commissionAmount = reward * commissionRate;
  const totalCost = reward + commissionAmount;
  return {
    reward,
    commissionRate: commissionRate * 100,
    // Return as percentage
    commissionAmount: Math.round(commissionAmount * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100
  };
}
function calculateUserWithdrawalCommission(amount, userTier) {
  const commissionRate = getUserWithdrawalCommissionRate(userTier);
  const commissionAmount = amount * commissionRate;
  const netAmount = amount - commissionAmount;
  return {
    requestedAmount: amount,
    commissionRate: commissionRate * 100,
    // Return as percentage
    commissionAmount: Math.round(commissionAmount * 100) / 100,
    netAmount: Math.round(netAmount * 100) / 100
  };
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
    const tasks3 = db.prepare(`
      SELECT * FROM tasks 
      WHERE advertiserId = ?
      ORDER BY createdAt DESC
    `).all(req.advertiserId);
    const tasksWithParsedData = tasks3.map((task) => ({
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
    let query3 = `
      SELECT t.*, a.nameEn as advertiserName, a.nameAr as advertiserNameAr, 
             a.logoUrl as advertiserLogo, a.id as advertiserDbId
      FROM tasks t
      LEFT JOIN advertisers a ON t.advertiserId = a.id
      WHERE t.status IN ('active', 'published')
      AND t.completionsCount < t.completionsNeeded
    `;
    const params = [];
    if (type) {
      query3 += " AND t.type = ?";
      params.push(type);
    }
    if (difficulty) {
      query3 += " AND t.difficulty = ?";
      params.push(difficulty);
    }
    if (minReward) {
      query3 += " AND t.reward >= ?";
      params.push(parseFloat(minReward));
    }
    if (maxReward) {
      query3 += " AND t.reward <= ?";
      params.push(parseFloat(maxReward));
    }
    if (advertiserId) {
      query3 += " AND t.advertiserId = ?";
      params.push(parseInt(advertiserId));
    }
    query3 += " ORDER BY t.createdAt DESC";
    const tasks3 = await query2(query3, params);
    let completedTaskIds = [];
    if (userId) {
      const completed = await query2(`
        SELECT DISTINCT taskId FROM task_submissions 
        WHERE userId = ? AND status IN ('completed', 'approved')
      `, [userId]);
      completedTaskIds = completed.map((c) => c.taskId);
    }
    const tasksWithData = tasks3.map((task) => {
      const parsedTaskData = task.taskData ? JSON.parse(task.taskData) : null;
      const extractStrings = (items) => {
        if (!items || !Array.isArray(items)) return [];
        return items.map((item) => {
          if (typeof item === "string") return item;
          if (typeof item === "object" && item !== null) {
            return item.descriptionEn || item.descriptionAr || item.instructionEn || item.instructionAr || item.text || item.title || JSON.stringify(item);
          }
          return String(item);
        });
      };
      return {
        ...task,
        targetLocations: task.targetLocations ? JSON.parse(task.targetLocations) : null,
        targetTiers: task.targetTiers ? JSON.parse(task.targetTiers) : null,
        taskData: parsedTaskData,
        requirements: extractStrings(parsedTaskData?.requirements),
        steps: extractStrings(parsedTaskData?.steps),
        isCompleted: completedTaskIds.includes(task.id),
        canComplete: !completedTaskIds.includes(task.id) || task.allowMultipleCompletions
      };
    });
    let userTier = null;
    if (userId) {
      const userResult = await query2("SELECT tier FROM users WHERE id = ?", [userId]);
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
router.get("/tasks/my-submissions", isUser, async (req, res) => {
  try {
    const submissions = await query2(`
      SELECT 
        s.id,
        s.taskId,
        s.status,
        s.score,
        s.rewardAmount,
        s.createdAt,
        s.completedAt,
        t.titleEn as taskTitle,
        t.type as taskType,
        a.nameEn as advertiserName
      FROM task_submissions s
      JOIN tasks t ON s.taskId = t.id
      JOIN advertisers a ON t.advertiserId = a.id
      WHERE s.userId = ? AND s.status IN ('approved', 'completed')
      ORDER BY s.createdAt DESC
    `, [req.userId]);
    res.json({ submissions });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ error: error.message });
  }
});
router.get("/tasks/:id", async (req, res) => {
  const taskId = parseInt(req.params.id);
  try {
    const tasks3 = await query2(`
      SELECT * FROM tasks WHERE id = ?
    `, [taskId]);
    if (!tasks3 || tasks3.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    const task = tasks3[0];
    const questions = await query2(`
      SELECT id, questionText, questionTextAr, questionOrder, questionType,
             optionA, optionAAr, optionB, optionBAr, 
             optionC, optionCAr, optionD, optionDAr, imageUrl
      FROM task_questions
      WHERE taskId = ?
      ORDER BY questionOrder
    `, [taskId]);
    let surveyQuestions = [];
    if (task.type === "survey") {
      const rawSurveyQuestions = await query2(`
        SELECT * FROM survey_questions WHERE taskId = ? ORDER BY questionOrder
      `, [taskId]);
      surveyQuestions = rawSurveyQuestions.map((q) => ({
        ...q,
        options: typeof q.options === "string" ? JSON.parse(q.options) : q.options,
        optionsAr: typeof q.optionsAr === "string" ? JSON.parse(q.optionsAr) : q.optionsAr
      }));
    }
    const taskWithData = {
      ...task,
      targetLocations: task.targetLocations ? JSON.parse(task.targetLocations) : null,
      targetTiers: task.targetTiers ? JSON.parse(task.targetTiers) : null,
      taskData: task.taskData ? JSON.parse(task.taskData) : null,
      questions,
      surveyQuestions
    };
    res.json({ task: taskWithData });
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ error: error.message });
  }
});
router.post("/tasks/:id/start", isUser, async (req, res) => {
  const taskId = parseInt(req.params.id);
  try {
    const tasks3 = await query2("SELECT * FROM tasks WHERE id = ? AND status = ?", [taskId, "active"]);
    if (!tasks3 || tasks3.length === 0) {
      return res.status(404).json({ error: "Task not found or not active" });
    }
    const task = tasks3[0];
    if (!task.allowMultipleCompletions) {
      const existing = await query2(`
        SELECT * FROM task_submissions 
        WHERE taskId = ? AND userId = ? AND status IN ('approved', 'completed')
      `, [taskId, req.userId]);
      if (existing && existing.length > 0) {
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
    const tasks3 = await query2("SELECT * FROM tasks WHERE id = ?", [taskId]);
    if (!tasks3 || tasks3.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    const task = tasks3[0];
    const questions = await query2(`
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
    const submissionData = JSON.stringify({
      answers: answerResults,
      passed: finalPassed,
      watchTimePassed
    });
    const mysqlDatetime = finalPassed ? (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ") : null;
    const result = await query2(`
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
      const existingCompletion = await query2(
        `SELECT id FROM task_submissions WHERE userId = ? AND taskId = ? AND status = 'approved'`,
        [req.userId, taskId]
      );
      if (existingCompletion && existingCompletion.length > 1) {
        console.log(`[DUPLICATE] User ${req.userId} already completed task ${taskId}`);
        return res.status(400).json({
          error: "You have already completed this task",
          success: false
        });
      }
      try {
        await query2(
          `UPDATE users 
           SET balance = balance + ?,
               completedTasks = completedTasks + 1,
               totalEarnings = totalEarnings + ?,
               updatedAt = NOW()
           WHERE id = ?`,
          [task.reward, task.reward, req.userId]
        );
        await query2(
          `INSERT INTO userTasks 
           (userId, taskId, status, submittedAt, completedAt, reward, submissionData)
           VALUES (?, ?, 'completed', NOW(), NOW(), ?, ?)`,
          [req.userId, taskId, task.reward, JSON.stringify({ score, answers: answerResults })]
        );
        const advertiserData = await query2(
          `SELECT tier FROM advertisers WHERE id = ?`,
          [task.advertiserId]
        );
        const advertiserTier = advertiserData[0]?.tier || "basic";
        const commission = calculateAdvertiserCommission(parseFloat(task.reward), advertiserTier);
        const userBalanceData = await query2(
          `SELECT balance FROM users WHERE id = ?`,
          [req.userId]
        );
        const balanceBefore = userBalanceData[0]?.balance || 0;
        const balanceAfter = parseFloat(balanceBefore) + parseFloat(task.reward);
        await query2(
          `INSERT INTO transactions 
           (userId, type, amount, balanceBefore, balanceAfter, description, status, relatedTaskId, commissionAmount, commissionRate, netAmount, createdAt)
           VALUES (?, 'earn', ?, ?, ?, ?, 'completed', ?, ?, ?, ?, NOW())`,
          [req.userId, task.reward, balanceBefore, balanceAfter, `Task completed: ${task.titleEn}`, taskId, commission.commissionAmount, commission.commissionRate, task.reward]
        );
        await query2(
          `UPDATE advertisers SET balance = balance - ?, totalSpent = totalSpent + ? WHERE id = ?`,
          [commission.totalCost, commission.totalCost, task.advertiserId]
        );
        await query2("UPDATE tasks SET completionsCount = completionsCount + 1 WHERE id = ?", [taskId]);
        console.log(`[WALLET] Successfully credited ${task.reward} EGP to user ${req.userId}`);
      } catch (error) {
        console.error("[WALLET] Error updating user balance:", error);
      }
    }
    const previousAttempts = await query2(
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
router.post("/tasks/:id/submit-survey", isUser, async (req, res) => {
  const taskId = parseInt(req.params.id);
  const { answers } = req.body;
  console.log("[Submit Survey] User ID:", req.userId);
  console.log("[Submit Survey] Task ID:", taskId);
  console.log("[Submit Survey] Answers:", JSON.stringify(answers));
  try {
    const tasks3 = await query2("SELECT * FROM tasks WHERE id = ? AND type = ?", [taskId, "survey"]);
    if (!tasks3 || tasks3.length === 0) {
      return res.status(404).json({ error: "Survey task not found" });
    }
    const task = tasks3[0];
    const questions = await query2(`
      SELECT * FROM survey_questions WHERE taskId = ? ORDER BY questionOrder
    `, [taskId]);
    if (!questions || questions.length === 0) {
      return res.status(404).json({ error: "Survey questions not found" });
    }
    const answeredQuestionIds = new Set(answers.map((a) => a.questionId));
    const requiredQuestions = questions.filter((q) => q.isRequired);
    const missingQuestions = requiredQuestions.filter((q) => !answeredQuestionIds.has(q.id));
    if (missingQuestions.length > 0) {
      return res.status(400).json({
        error: "Missing required answers",
        missingQuestions: missingQuestions.map((q) => q.id)
      });
    }
    const existingSubmissions = await query2(`
      SELECT * FROM task_submissions 
      WHERE taskId = ? AND userId = ? AND status = 'approved'
    `, [taskId, req.userId]);
    if (existingSubmissions && existingSubmissions.length > 0) {
      return res.status(400).json({ error: "You have already completed this survey" });
    }
    const submissionData = JSON.stringify({ answers });
    const mysqlDatetime = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
    const result = await query2(`
      INSERT INTO task_submissions (
        taskId, userId, status, submissionData,
        score, correctAnswers, totalQuestions,
        rewardAmount, rewardCredited, completedAt
      ) VALUES (?, ?, 'approved', ?, 100, ?, ?, ?, 1, ?)
    `, [
      taskId,
      req.userId,
      submissionData,
      questions.length,
      questions.length,
      task.reward,
      mysqlDatetime
    ]);
    const submissionId = result.insertId;
    for (const answer of answers) {
      await query2(`
        INSERT INTO survey_responses (submissionId, questionId, selectedOptions)
        VALUES (?, ?, ?)
      `, [submissionId, answer.questionId, JSON.stringify(answer.selectedOptions)]);
    }
    const userBefore = await query2("SELECT balance FROM users WHERE id = ?", [req.userId]);
    const balanceBefore = userBefore[0]?.balance || 0;
    const balanceAfter = parseFloat(balanceBefore) + parseFloat(task.reward);
    await query2(`
      UPDATE users SET balance = balance + ?, completedTasks = completedTasks + 1, totalEarnings = totalEarnings + ? WHERE id = ?
    `, [task.reward, task.reward, req.userId]);
    const advertiserData = await query2(
      `SELECT tier FROM advertisers WHERE id = ?`,
      [task.advertiserId]
    );
    const advertiserTier = advertiserData[0]?.tier || "basic";
    const commission = calculateAdvertiserCommission(parseFloat(task.reward), advertiserTier);
    await query2(`
      INSERT INTO transactions (userId, type, amount, status, description, relatedTaskId, balanceBefore, balanceAfter, commissionAmount, commissionRate, netAmount, createdAt)
      VALUES (?, "earn", ?, "completed", ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [req.userId, task.reward, `Survey completed: ${task.titleEn}`, taskId, balanceBefore, balanceAfter, commission.commissionAmount, commission.commissionRate, task.reward]);
    await query2(
      `UPDATE advertisers SET balance = balance - ?, totalSpent = totalSpent + ? WHERE id = ?`,
      [commission.totalCost, commission.totalCost, task.advertiserId]
    );
    await query2(`
      UPDATE tasks SET completionsCount = completionsCount + 1 WHERE id = ?
    `, [taskId]);
    console.log("[Submit Survey] Survey completed successfully");
    console.log("[Submit Survey] Reward credited:", task.reward);
    res.json({
      success: true,
      passed: true,
      rewardAmount: task.reward,
      message: "Survey completed successfully"
    });
  } catch (error) {
    console.error("[Submit Survey] Error:", error);
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
    const transactions2 = await query2(`
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
router.get("/weekly-earnings", isUser, async (req, res) => {
  console.log("[Weekly Earnings] User ID:", req.userId, "User:", req.user?.name);
  try {
    const earnings = await query2(`
	      SELECT 
	        DATE(createdAt) as dateValue,
	        DATE_FORMAT(DATE(createdAt), '%Y-%m-%d') as date,
	        DAYNAME(DATE(createdAt)) as dayName,
	        SUM(amount) as totalAmount
	      FROM transactions 
	      WHERE userId = ? 
	        AND type IN ('earn', 'earning') 
	        AND status = 'completed'
	        AND DATE(createdAt) >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
	      GROUP BY DATE(createdAt), dateValue, dayName
	      ORDER BY dateValue ASC
	    `, [req.userId]);
    const prevWeekEarnings = await query2(`
	      SELECT SUM(amount) as total
	      FROM transactions 
	      WHERE userId = ? 
	        AND type IN ('earn', 'earning') 
	        AND status = 'completed'
	        AND DATE(createdAt) >= DATE_SUB(CURDATE(), INTERVAL 13 DAY)
	        AND DATE(createdAt) <= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
	    `, [req.userId]);
    const today = /* @__PURE__ */ new Date();
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;
      const earning = earnings.find((e) => {
        const eDate = typeof e.date === "string" ? e.date : String(e.date).split("T")[0];
        return eDate === dateStr;
      });
      last7Days.push({
        day: dayName,
        date: dateStr,
        amount: earning ? parseFloat(earning.totalAmount) : 0
      });
    }
    const totalEarnings = last7Days.reduce((sum, d) => sum + d.amount, 0);
    const prevWeekTotal = prevWeekEarnings[0]?.total ? parseFloat(prevWeekEarnings[0].total) : 0;
    res.json({
      earnings: last7Days,
      totalEarnings,
      prevWeekTotal,
      change: prevWeekTotal > 0 ? ((totalEarnings - prevWeekTotal) / prevWeekTotal * 100).toFixed(1) : "0"
    });
  } catch (error) {
    console.error("[Weekly Earnings] Error:", error);
    res.status(500).json({ error: error.message });
  }
});
router.get("/profile/strength", isUser, async (req, res) => {
  console.log("[Profile Strength] User ID:", req.userId);
  try {
    let strength = 0;
    if (req.user?.phoneVerified) strength += 20;
    if (req.user?.emailVerified) strength += 10;
    const kycResult = await query2(`
      SELECT COUNT(*) as count FROM user_verifications 
      WHERE userId = ? AND verificationType = 'national_id' AND status = 'verified'
    `, [req.userId]);
    if (kycResult[0]?.count > 0) strength += 20;
    const socialResult = await query2(`
      SELECT COUNT(*) as count FROM user_social_profiles WHERE userId = ?
    `, [req.userId]);
    if (socialResult[0]?.count > 0) strength += 10;
    const profileDataResult = await query2(`
      SELECT COUNT(*) as count FROM user_profile_data WHERE userId = ?
    `, [req.userId]);
    const questionCount = profileDataResult[0]?.count || 0;
    strength += Math.min(questionCount * 4, 40);
    strength = Math.min(strength, 100);
    res.json({
      strength,
      breakdown: {
        phoneVerified: req.user?.phoneVerified ? 20 : 0,
        emailVerified: req.user?.emailVerified ? 10 : 0,
        kycVerified: kycResult[0]?.count > 0 ? 20 : 0,
        socialConnected: socialResult[0]?.count > 0 ? 10 : 0,
        profileQuestions: Math.min(questionCount * 4, 40)
      }
    });
  } catch (error) {
    console.error("[Profile Strength] Error:", error);
    res.json({ strength: req.user?.profileStrength || 30 });
  }
});
var task_routes_default = router;

// server/_core/profile-routes.ts
import { fileURLToPath } from "url";
import { dirname } from "path";
import { Router as Router4 } from "express";
import multer from "multer";
import path2 from "path";
import fs from "fs";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "/var/www/taskkash/dist/public/uploads/avatars";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "avatar-" + uniqueSuffix + path2.extname(file.originalname));
  }
});
var upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path2.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  }
});
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
    const users2 = await query2(
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
    await query2(
      "UPDATE users SET profileStrength = 100, balance = ? WHERE id = ?",
      [newBalance, user.id]
    );
    await query2(
      `INSERT INTO transactions (userId, type, amount, balanceBefore, balanceAfter, status, description, createdAt) 
       VALUES (?, 'earn', ?, ?, ?, 'completed', 'Profile completion reward', NOW())`,
      [user.id, PROFILE_REWARD, user.balance, newBalance]
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
    const users2 = await query2(
      "SELECT id FROM users WHERE openId = ?",
      [openId]
    );
    if (users2.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const user = users2[0];
    await query2(
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
    const sections = await query2(
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
        const users2 = await query2("SELECT id FROM users WHERE openId = ?", [authUser.openId]);
        userId = users2[0]?.id || null;
      }
    } catch (authError) {
      console.log("[Profile Routes] User not authenticated, showing sections without completion status");
    }
    const sections = await query2(
      "SELECT * FROM profile_sections WHERE isActive = 1 ORDER BY displayOrder"
    );
    let completedSections = [];
    if (userId) {
      completedSections = await query2(
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
    const users2 = await query2("SELECT id, tier FROM users WHERE openId = ?", [authUser.openId]);
    if (users2.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const userId = users2[0].id;
    const { sectionKey, answers } = req.body;
    if (!sectionKey || !answers || typeof answers !== "object") {
      return res.status(400).json({ error: "Invalid request data" });
    }
    const sections = await query2(
      "SELECT * FROM profile_sections WHERE sectionKey = ? AND isActive = 1",
      [sectionKey]
    );
    if (sections.length === 0) {
      return res.status(404).json({ error: "Section not found" });
    }
    const section = sections[0];
    const existingCompletion = await query2(
      "SELECT * FROM user_profile_completions WHERE userId = ? AND sectionKey = ?",
      [userId, sectionKey]
    );
    if (existingCompletion.length > 0) {
      return res.status(400).json({ error: "Section already completed" });
    }
    for (const [questionKey, answerValue] of Object.entries(answers)) {
      await query2(
        `INSERT INTO user_profile_data (userId, questionKey, answerValue)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE answerValue = VALUES(answerValue), updatedAt = CURRENT_TIMESTAMP`,
        [userId, questionKey, JSON.stringify(answerValue)]
      );
    }
    await query2(
      "INSERT INTO user_profile_completions (userId, sectionKey, bonusAwarded, multiplierAwarded) VALUES (?, ?, ?, ?)",
      [userId, sectionKey, section.bonusAmount, section.multiplierBonus]
    );
    const userBefore = await query2("SELECT balance FROM users WHERE id = ?", [userId]);
    const balanceBefore = userBefore[0]?.balance || 0;
    const balanceAfter = parseFloat(balanceBefore) + parseFloat(section.bonusAmount);
    await query2(
      "UPDATE users SET balance = balance + ? WHERE id = ?",
      [section.bonusAmount, userId]
    );
    await query2(
      `INSERT INTO transactions (userId, type, amount, balanceBefore, balanceAfter, description, status, createdAt)
       VALUES (?, "bonus", ?, ?, ?, ?, "completed", NOW())`,
      [userId, section.bonusAmount, balanceBefore, balanceAfter, `Profile completion bonus: ${section.nameEn}`]
    );
    const completedCount = await query2(
      "SELECT COUNT(*) as count FROM user_profile_completions WHERE userId = ?",
      [userId]
    );
    const totalSections = await query2(
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
      await query2("UPDATE users SET tier = ? WHERE id = ?", [newTier, userId]);
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
    const users2 = await query2("SELECT id, tier FROM users WHERE openId = ?", [authUser.openId]);
    if (users2.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const userId = users2[0].id;
    const completedCount = await query2(
      "SELECT COUNT(*) as count FROM user_profile_completions WHERE userId = ?",
      [userId]
    );
    const totalSections = await query2(
      "SELECT COUNT(*) as count FROM profile_sections WHERE isActive = 1"
    );
    const completionPercentage = completedCount[0].count / totalSections[0].count * 100;
    const totalBonus = await query2(
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
router2.post("/avatar", upload.single("avatar"), async (req, res) => {
  console.log("[Avatar Upload] Request received");
  console.log("[Avatar Upload] Cookies:", req.headers.cookie ? "present" : "missing");
  console.log("[Avatar Upload] File:", req.file ? req.file.filename : "no file");
  try {
    const authUser = await sdk.authenticateRequest(req);
    if (!authUser || !authUser.openId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const users2 = await query2("SELECT id, avatar FROM users WHERE openId = ?", [authUser.openId]);
    if (users2.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const user = users2[0];
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    if (user.avatar && user.avatar.startsWith("/uploads/avatars/")) {
      const oldAvatarPath = path2.join("/var/www/taskkash/dist/public", user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }
    await query2(
      "UPDATE users SET avatar = ?, updatedAt = NOW() WHERE id = ?",
      [avatarUrl, user.id]
    );
    console.log("[Profile] Avatar updated successfully for user:", authUser.openId);
    res.json({
      success: true,
      avatarUrl
    });
  } catch (error) {
    console.error("[Profile] Error uploading avatar:", error);
    res.status(500).json({ error: "Failed to upload avatar" });
  }
});
var profile_routes_default = router2;

// server/_core/advertiser-routes.ts
import { Router as Router5 } from "express";
var router3 = Router5();
router3.get("/advertisers", async (req, res) => {
  try {
    const advertisers2 = await query2(
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
router3.get("/advertisers/with-active-tasks", async (req, res) => {
  try {
    const advertisers2 = await query2(`
      SELECT DISTINCT 
        a.id, 
        a.nameEn, 
        a.nameAr,
        a.logoUrl,
        COUNT(t.id) as activeTaskCount
      FROM advertisers a
      INNER JOIN tasks t ON a.id = t.advertiserId
      WHERE t.status = "active"
      GROUP BY a.id, a.nameEn, a.nameAr, a.logoUrl
      ORDER BY activeTaskCount DESC
    `);
    res.json({ advertisers: advertisers2 });
  } catch (error) {
    console.error("[Advertisers] Error fetching advertisers with active tasks:", error);
    res.status(500).json({ error: error.message });
  }
});
router3.get("/advertisers/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const advertisers2 = await query2(
      `SELECT * FROM advertisers WHERE slug = ? LIMIT 1`,
      [slug]
    );
    if (!advertisers2 || advertisers2.length === 0) {
      return res.status(404).json({ error: "Advertiser not found" });
    }
    const advertiser = advertisers2[0];
    const tasks3 = await query2(
      `SELECT id, titleEn, titleAr, descriptionEn, descriptionAr, type, reward, duration, 
              difficulty, status, completionsCount, completionsNeeded, taskData
       FROM tasks
       WHERE advertiserId = ?
       ORDER BY createdAt DESC`,
      [advertiser.id]
    );
    const totalTasks = tasks3.length;
    const activeTasks = tasks3.filter((t2) => t2.status === "active").length;
    const totalCompletions = tasks3.reduce((sum, t2) => sum + (t2.completionsCount || 0), 0);
    const totalPaid = tasks3.reduce((sum, t2) => sum + Number(t2.reward) * (t2.completionsCount || 0), 0);
    const uniqueUsersResult = await query2(
      `SELECT COUNT(DISTINCT userId) as userCount
       FROM userTasks
       WHERE taskId IN (SELECT id FROM tasks WHERE advertiserId = ?)`,
      [advertiser.id]
    );
    const totalUsers = uniqueUsersResult[0]?.userCount || 0;
    const avgRating = 4.8;
    const reviewsCount = totalCompletions > 0 ? Math.floor(totalCompletions * 0.3) : 0;
    const totalNeeded = tasks3.reduce((sum, t2) => sum + t2.completionsNeeded, 0);
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
      },
      tasks: tasks3.map((task) => ({
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
router3.get("/advertiser/dashboard", async (req, res) => {
  try {
    const advertiserId = req.user?.advertiserId || 1;
    const advertiserResult = await query2(
      `SELECT * FROM advertisers WHERE id = ?`,
      [advertiserId]
    );
    const advertiser = advertiserResult[0];
    const campaignStats = await query2(`
      SELECT 
        COUNT(*) as totalCampaigns,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeCampaigns,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedCampaigns,
        SUM(totalParticipants) as totalParticipants,
        SUM(completedParticipants) as completedParticipants,
        SUM(budget) as totalBudget,
        SUM(reward * completedParticipants) as totalSpent
      FROM campaigns
      WHERE advertiserId = ?
    `, [advertiserId]);
    const taskStats = await query2(`
      SELECT 
        COUNT(*) as totalTasks,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeTasks,
        SUM(completionsCount) as totalCompletions,
        SUM(reward * completionsCount) as totalPaid
      FROM tasks
      WHERE advertiserId = ?
    `, [advertiserId]);
    const recentActivity = await query2(`
      SELECT 
        'task_completion' as type,
        t.titleEn as title,
        ut.completedAt as timestamp,
        t.reward as amount
      FROM userTasks ut
      JOIN tasks t ON ut.taskId = t.id
      WHERE t.advertiserId = ?
        AND ut.status = 'approved'
      ORDER BY ut.completedAt DESC
      LIMIT 10
    `, [advertiserId]);
    const weeklyData = await query2(`
      SELECT 
        DATE(ut.completedAt) as date,
        COUNT(*) as completions,
        SUM(t.reward) as spent
      FROM userTasks ut
      JOIN tasks t ON ut.taskId = t.id
      WHERE t.advertiserId = ?
        AND ut.status = 'approved'
        AND ut.completedAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(ut.completedAt)
      ORDER BY date ASC
    `, [advertiserId]);
    res.json({
      advertiser,
      campaignStats: campaignStats[0],
      taskStats: taskStats[0],
      recentActivity,
      weeklyData
    });
  } catch (error) {
    console.error("Error fetching advertiser dashboard:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});
router3.get("/advertiser/campaigns", async (req, res) => {
  try {
    const advertiserId = req.user?.advertiserId || 1;
    const campaigns2 = await query2(`
      SELECT 
        c.*,
        (SELECT COUNT(*) FROM campaignTasks WHERE campaignId = c.id) as totalTasks,
        (SELECT COUNT(*) FROM userCampaignProgress WHERE campaignId = c.id AND status = 'completed') as completions,
        (SELECT COUNT(*) FROM userCampaignProgress WHERE campaignId = c.id AND status = 'in_progress') as inProgress
      FROM campaigns c
      WHERE c.advertiserId = ?
      ORDER BY c.createdAt DESC
    `, [advertiserId]);
    res.json(campaigns2);
  } catch (error) {
    console.error("Error fetching advertiser campaigns:", error);
    res.status(500).json({ error: "Failed to fetch campaigns" });
  }
});
router3.get("/advertiser/campaigns/:id/analytics", async (req, res) => {
  try {
    const campaignId = parseInt(req.params.id);
    const advertiserId = req.user?.advertiserId || 1;
    const campaignResult = await query2(
      `SELECT * FROM campaigns WHERE id = ? AND advertiserId = ?`,
      [campaignId, advertiserId]
    );
    if (campaignResult.length === 0) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    const campaign = campaignResult[0];
    const funnelData = await query2(`
      SELECT 
        ct.sequence,
        t.titleEn as taskTitle,
        t.type as taskType,
        COUNT(DISTINCT ucp.userId) as started,
        COUNT(DISTINCT CASE WHEN ucp.currentSequence > ct.sequence THEN ucp.userId END) as completed
      FROM campaignTasks ct
      JOIN tasks t ON ct.taskId = t.id
      LEFT JOIN userCampaignProgress ucp ON ucp.campaignId = ct.campaignId
      WHERE ct.campaignId = ?
      GROUP BY ct.sequence, t.titleEn, t.type
      ORDER BY ct.sequence ASC
    `, [campaignId]);
    const demographics = await query2(`
      SELECT 
        CASE 
          WHEN TIMESTAMPDIFF(YEAR, u.dateOfBirth, CURDATE()) < 25 THEN '18-24'
          WHEN TIMESTAMPDIFF(YEAR, u.dateOfBirth, CURDATE()) < 35 THEN '25-34'
          WHEN TIMESTAMPDIFF(YEAR, u.dateOfBirth, CURDATE()) < 45 THEN '35-44'
          WHEN TIMESTAMPDIFF(YEAR, u.dateOfBirth, CURDATE()) < 55 THEN '45-54'
          ELSE '55+'
        END as ageGroup,
        u.gender,
        COUNT(*) as count
      FROM userCampaignProgress ucp
      JOIN users u ON ucp.userId = u.id
      WHERE ucp.campaignId = ?
      GROUP BY ageGroup, u.gender
    `, [campaignId]);
    const dailyPerformance = await query2(`
      SELECT 
        DATE(ujl.timestamp) as date,
        COUNT(CASE WHEN ujl.eventType = 'campaign_started' THEN 1 END) as starts,
        COUNT(CASE WHEN ujl.eventType = 'campaign_completed' THEN 1 END) as completions,
        COUNT(CASE WHEN ujl.eventType = 'disqualified' THEN 1 END) as disqualifications
      FROM userJourneyLogs ujl
      WHERE ujl.campaignId = ?
        AND ujl.timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(ujl.timestamp)
      ORDER BY date ASC
    `, [campaignId]);
    const totalStarted = campaign.totalParticipants || 0;
    const totalCompleted = campaign.completedParticipants || 0;
    const totalDisqualified = campaign.disqualifiedParticipants || 0;
    const conversionRate = totalStarted > 0 ? (totalCompleted / totalStarted * 100).toFixed(2) : 0;
    const costPerCompletion = totalCompleted > 0 ? (campaign.reward * totalCompleted / totalCompleted).toFixed(2) : 0;
    const totalSpent = campaign.reward * totalCompleted;
    const budgetUtilization = campaign.budget > 0 ? (totalSpent / campaign.budget * 100).toFixed(2) : 0;
    res.json({
      campaign,
      kpis: {
        totalStarted,
        totalCompleted,
        totalDisqualified,
        conversionRate,
        costPerCompletion,
        totalSpent,
        budgetUtilization
      },
      funnelData,
      demographics,
      dailyPerformance
    });
  } catch (error) {
    console.error("Error fetching campaign analytics:", error);
    res.status(500).json({ error: "Failed to fetch campaign analytics" });
  }
});
router3.post("/advertiser/campaigns", async (req, res) => {
  try {
    const advertiserId = req.user?.advertiserId || 1;
    const {
      nameEn,
      nameAr,
      descriptionEn,
      descriptionAr,
      image,
      budget,
      reward,
      videoCompletionThreshold,
      visitDurationThreshold,
      countryId,
      targetAgeMin,
      targetAgeMax,
      targetGender,
      targetLocations,
      targetIncomeLevel,
      launchDate,
      expiryDate,
      tasks: tasks3,
      personas,
      qualifications
    } = req.body;
    const campaignResult = await query2(`
      INSERT INTO campaigns (
        advertiserId, nameEn, nameAr, descriptionEn, descriptionAr, image,
        budget, reward, videoCompletionThreshold, visitDurationThreshold,
        countryId, targetAgeMin, targetAgeMax, targetGender, targetLocations,
        targetIncomeLevel, launchDate, expiryDate, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')
    `, [
      advertiserId,
      nameEn,
      nameAr,
      descriptionEn,
      descriptionAr,
      image,
      budget,
      reward,
      videoCompletionThreshold || 70,
      visitDurationThreshold || 30,
      countryId || 1,
      targetAgeMin,
      targetAgeMax,
      targetGender,
      JSON.stringify(targetLocations),
      targetIncomeLevel,
      launchDate,
      expiryDate
    ]);
    const campaignId = campaignResult.insertId;
    if (tasks3 && tasks3.length > 0) {
      for (let i = 0; i < tasks3.length; i++) {
        const task = tasks3[i];
        const taskResult = await query2(`
          INSERT INTO tasks (
            advertiserId, type, titleEn, titleAr, descriptionEn, descriptionAr,
            reward, totalBudget, completionsNeeded, difficulty, duration, status
          ) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, 'active')
        `, [
          advertiserId,
          task.type,
          task.titleEn,
          task.titleAr,
          task.descriptionEn,
          task.descriptionAr,
          budget / tasks3.length,
          task.completionsNeeded || 1e3,
          task.difficulty || "medium",
          task.duration || 5
        ]);
        const taskId = taskResult.insertId;
        await query2(`
          INSERT INTO campaignTasks (campaignId, taskId, sequence, gatingRules, isRequired)
          VALUES (?, ?, ?, ?, 1)
        `, [campaignId, taskId, i + 1, JSON.stringify(task.gatingRules || {})]);
      }
    }
    if (personas && personas.length > 0) {
      for (const persona of personas) {
        await query2(`
          INSERT INTO campaignPersonas (
            campaignId, nameEn, nameAr, descriptionEn, descriptionAr,
            videoUrl, adHeadlineEn, adHeadlineAr, adBodyEn, adBodyAr, targetCriteria
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          campaignId,
          persona.nameEn,
          persona.nameAr,
          persona.descriptionEn,
          persona.descriptionAr,
          persona.videoUrl,
          persona.adHeadlineEn,
          persona.adHeadlineAr,
          persona.adBodyEn,
          persona.adBodyAr,
          JSON.stringify(persona.targetCriteria || {})
        ]);
      }
    }
    if (qualifications && qualifications.length > 0) {
      for (const qual of qualifications) {
        await query2(`
          INSERT INTO campaignQualifications (campaignId, criteriaType, criteriaKey, operator, value)
          VALUES (?, ?, ?, ?, ?)
        `, [campaignId, qual.criteriaType, qual.criteriaKey, qual.operator, qual.value]);
      }
    }
    res.json({
      message: "Campaign created successfully",
      campaignId
    });
  } catch (error) {
    console.error("Error creating campaign:", error);
    res.status(500).json({ error: "Failed to create campaign" });
  }
});
router3.post("/advertiser/campaigns/:id/launch", async (req, res) => {
  try {
    const campaignId = parseInt(req.params.id);
    const advertiserId = req.user?.advertiserId || 1;
    const campaignResult = await query2(
      `SELECT * FROM campaigns WHERE id = ? AND advertiserId = ?`,
      [campaignId, advertiserId]
    );
    if (campaignResult.length === 0) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    const campaign = campaignResult[0];
    if (campaign.status !== "draft") {
      return res.status(400).json({ error: "Campaign is not in draft status" });
    }
    const tasksResult = await query2(
      `SELECT COUNT(*) as count FROM campaignTasks WHERE campaignId = ?`,
      [campaignId]
    );
    if (tasksResult[0].count === 0) {
      return res.status(400).json({ error: "Campaign must have at least one task" });
    }
    await query2(`
      UPDATE campaigns SET
        status = 'active',
        launchDate = NOW(),
        updatedAt = NOW()
      WHERE id = ?
    `, [campaignId]);
    res.json({ message: "Campaign launched successfully" });
  } catch (error) {
    console.error("Error launching campaign:", error);
    res.status(500).json({ error: "Failed to launch campaign" });
  }
});
router3.post("/advertiser/targeting/audience-estimate", async (req, res) => {
  try {
    const {
      countryId,
      ageMin,
      ageMax,
      gender,
      locations,
      incomeLevel
    } = req.body;
    let conditions = ["1=1"];
    if (countryId) {
      conditions.push(`countryId = ${countryId}`);
    }
    if (ageMin) {
      conditions.push(`TIMESTAMPDIFF(YEAR, dateOfBirth, CURDATE()) >= ${ageMin}`);
    }
    if (ageMax) {
      conditions.push(`TIMESTAMPDIFF(YEAR, dateOfBirth, CURDATE()) <= ${ageMax}`);
    }
    if (gender) {
      conditions.push(`gender = '${gender}'`);
    }
    const result = await query2(`
      SELECT COUNT(*) as estimatedAudience
      FROM users
      WHERE ${conditions.join(" AND ")}
        AND isActive = 1
    `);
    const estimatedAudience = result[0].estimatedAudience;
    res.json({
      estimatedAudience,
      criteria: { countryId, ageMin, ageMax, gender, locations, incomeLevel }
    });
  } catch (error) {
    console.error("Error estimating audience:", error);
    res.status(500).json({ error: "Failed to estimate audience" });
  }
});
router3.get("/advertiser/tasks", async (req, res) => {
  try {
    const advertiserId = req.user?.advertiserId || 1;
    const tasks3 = await query2(`
      SELECT 
        t.*,
        (SELECT COUNT(*) FROM userTasks WHERE taskId = t.id AND status = 'approved') as approvedCount,
        (SELECT COUNT(*) FROM userTasks WHERE taskId = t.id AND status = 'pending') as pendingCount,
        (SELECT COUNT(*) FROM userTasks WHERE taskId = t.id AND status = 'rejected') as rejectedCount
      FROM tasks t
      WHERE t.advertiserId = ?
      ORDER BY t.createdAt DESC
    `, [advertiserId]);
    res.json(tasks3);
  } catch (error) {
    console.error("Error fetching advertiser tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});
router3.post("/advertiser/tasks", async (req, res) => {
  try {
    const advertiserId = req.user?.advertiserId || 1;
    const {
      type,
      titleEn,
      titleAr,
      descriptionEn,
      descriptionAr,
      reward,
      totalBudget,
      completionsNeeded,
      difficulty,
      duration,
      targetAgeMin,
      targetAgeMax,
      targetGender,
      targetLocations,
      taskData
    } = req.body;
    const result = await query2(`
      INSERT INTO tasks (
        advertiserId, type, titleEn, titleAr, descriptionEn, descriptionAr,
        reward, totalBudget, completionsNeeded, difficulty, duration,
        targetAgeMin, targetAgeMax, targetGender, targetLocations,
        taskData, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `, [
      advertiserId,
      type,
      titleEn,
      titleAr,
      descriptionEn,
      descriptionAr,
      reward,
      totalBudget,
      completionsNeeded,
      difficulty || "medium",
      duration || 5,
      targetAgeMin,
      targetAgeMax,
      targetGender,
      JSON.stringify(targetLocations),
      JSON.stringify(taskData)
    ]);
    res.json({
      message: "Task created successfully",
      taskId: result.insertId
    });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
});
router3.get("/advertiser/templates", async (req, res) => {
  try {
    const templates = [
      {
        id: "survey-basic",
        type: "survey",
        nameEn: "Basic Survey",
        nameAr: "\u0627\u0633\u062A\u0628\u064A\u0627\u0646 \u0623\u0633\u0627\u0633\u064A",
        descriptionEn: "A simple survey with multiple choice questions",
        descriptionAr: "\u0627\u0633\u062A\u0628\u064A\u0627\u0646 \u0628\u0633\u064A\u0637 \u0645\u0639 \u0623\u0633\u0626\u0644\u0629 \u0627\u062E\u062A\u064A\u0627\u0631 \u0645\u0646 \u0645\u062A\u0639\u062F\u062F",
        defaultConfig: {
          questions: [
            { type: "multiple_choice", questionEn: "Sample Question", options: ["Option 1", "Option 2", "Option 3"] }
          ],
          passingScore: 0
        }
      },
      {
        id: "survey-nps",
        type: "survey",
        nameEn: "NPS Survey",
        nameAr: "\u0627\u0633\u062A\u0628\u064A\u0627\u0646 NPS",
        descriptionEn: "Net Promoter Score survey template",
        descriptionAr: "\u0642\u0627\u0644\u0628 \u0627\u0633\u062A\u0628\u064A\u0627\u0646 \u0635\u0627\u0641\u064A \u0646\u0642\u0627\u0637 \u0627\u0644\u062A\u0631\u0648\u064A\u062C",
        defaultConfig: {
          questions: [
            { type: "rating", questionEn: "How likely are you to recommend us?", min: 0, max: 10 }
          ],
          passingScore: 0
        }
      },
      {
        id: "video-watch",
        type: "video",
        nameEn: "Video Watch",
        nameAr: "\u0645\u0634\u0627\u0647\u062F\u0629 \u0641\u064A\u062F\u064A\u0648",
        descriptionEn: "Watch a promotional video",
        descriptionAr: "\u0645\u0634\u0627\u0647\u062F\u0629 \u0641\u064A\u062F\u064A\u0648 \u062A\u0631\u0648\u064A\u062C\u064A",
        defaultConfig: {
          minWatchPercentage: 70,
          allowSkip: false
        }
      },
      {
        id: "quiz-knowledge",
        type: "quiz",
        nameEn: "Knowledge Quiz",
        nameAr: "\u0627\u062E\u062A\u0628\u0627\u0631 \u0645\u0639\u0631\u0641\u064A",
        descriptionEn: "Test user knowledge about your product",
        descriptionAr: "\u0627\u062E\u062A\u0628\u0627\u0631 \u0645\u0639\u0631\u0641\u0629 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0628\u0645\u0646\u062A\u062C\u0643",
        defaultConfig: {
          questions: [],
          passingScore: 80,
          timeLimit: 300
        }
      },
      {
        id: "visit-store",
        type: "visit",
        nameEn: "Store Visit",
        nameAr: "\u0632\u064A\u0627\u0631\u0629 \u0645\u062A\u062C\u0631",
        descriptionEn: "Visit a physical store location",
        descriptionAr: "\u0632\u064A\u0627\u0631\u0629 \u0645\u0648\u0642\u0639 \u0645\u062A\u062C\u0631 \u0641\u0639\u0644\u064A",
        defaultConfig: {
          requireGps: true,
          minDuration: 15,
          requirePhoto: true
        }
      },
      {
        id: "campaign-real-estate",
        type: "multi-task",
        nameEn: "Real Estate Lead Generation",
        nameAr: "\u062A\u0648\u0644\u064A\u062F \u0639\u0645\u0644\u0627\u0621 \u0639\u0642\u0627\u0631\u064A\u064A\u0646",
        descriptionEn: "Complete campaign for real estate lead qualification",
        descriptionAr: "\u062D\u0645\u0644\u0629 \u0643\u0627\u0645\u0644\u0629 \u0644\u062A\u0623\u0647\u064A\u0644 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u0645\u062D\u062A\u0645\u0644\u064A\u0646 \u0641\u064A \u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062A",
        defaultConfig: {
          tasks: [
            { type: "video", titleEn: "Watch Property Video" },
            { type: "survey", titleEn: "Financial Qualification" },
            { type: "survey", titleEn: "Property Preferences" },
            { type: "survey", titleEn: "Confirm Interest" },
            { type: "survey", titleEn: "Book Visit" },
            { type: "visit", titleEn: "Complete Site Visit" }
          ]
        }
      }
    ];
    res.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.status(500).json({ error: "Failed to fetch templates" });
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
    const users2 = await query2("SELECT balance FROM users WHERE id = ?", [userId]);
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
    const pendingWithdrawals = await query2(
      "SELECT COUNT(*) as count FROM withdrawal_requests WHERE userId = ? AND status = ?",
      [userId, "pending"]
    );
    if (pendingWithdrawals[0].count > 0) {
      return res.status(400).json({
        error: "You already have a pending withdrawal request. Please wait for it to be processed or cancel it first."
      });
    }
    const userData = await query2("SELECT tier FROM users WHERE id = ?", [userId]);
    const userTier = userData[0]?.tier || "tier1";
    const commission = calculateUserWithdrawalCommission(withdrawalAmount, userTier);
    const result = await query2(`
      INSERT INTO withdrawal_requests (userId, amount, method, accountDetails, status, commissionRate, commissionAmount, netAmount)
      VALUES (?, ?, ?, ?, 'pending', ?, ?, ?)
    `, [userId, withdrawalAmount, method, JSON.stringify(accountDetails), commission.commissionRate, commission.commissionAmount, commission.netAmount]);
    const withdrawalId = result.insertId;
    await query2(
      "UPDATE users SET balance = balance - ? WHERE id = ?",
      [withdrawalAmount, userId]
    );
    const transactionResult = await query2(`
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
    await query2(
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
    const withdrawals = await query2(`
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
    const withdrawals = await query2(`
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
    const withdrawals = await query2(
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
    await query2(
      "UPDATE withdrawal_requests SET status = ?, processedAt = NOW() WHERE id = ?",
      ["cancelled", withdrawalId]
    );
    await query2(
      "UPDATE users SET balance = balance + ? WHERE id = ?",
      [withdrawal.amount, req.userId]
    );
    if (withdrawal.transactionId) {
      await query2(
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
    const [dbUser] = await query2(
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
    const withdrawals = await query2(`
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
    const [withdrawal] = await query2(
      "SELECT * FROM withdrawal_requests WHERE id = ?",
      [id]
    );
    if (!withdrawal) {
      return res.status(404).json({ error: "Withdrawal request not found" });
    }
    if (withdrawal.status !== "pending") {
      return res.status(400).json({ error: "Only pending withdrawals can be approved" });
    }
    await query2(
      `UPDATE withdrawal_requests 
       SET status = 'approved', 
           processedAt = NOW(), 
           processedBy = ?,
           adminNotes = ?
       WHERE id = ?`,
      [req.userId, adminNotes || null, id]
    );
    await query2(
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
    const [withdrawal] = await query2(
      "SELECT * FROM withdrawal_requests WHERE id = ?",
      [id]
    );
    if (!withdrawal) {
      return res.status(404).json({ error: "Withdrawal request not found" });
    }
    if (withdrawal.status !== "pending") {
      return res.status(400).json({ error: "Only pending withdrawals can be rejected" });
    }
    await query2(
      "UPDATE users SET balance = balance + ? WHERE id = ?",
      [withdrawal.amount, withdrawal.userId]
    );
    await query2(
      `UPDATE withdrawal_requests 
       SET status = 'rejected', 
           processedAt = NOW(), 
           processedBy = ?,
           adminNotes = ?
       WHERE id = ?`,
      [req.userId, adminNotes, id]
    );
    await query2(
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
    const [withdrawal] = await query2(
      "SELECT * FROM withdrawal_requests WHERE id = ?",
      [id]
    );
    if (!withdrawal) {
      return res.status(404).json({ error: "Withdrawal request not found" });
    }
    if (withdrawal.status !== "approved") {
      return res.status(400).json({ error: "Only approved withdrawals can be marked as completed" });
    }
    await query2(
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
router6.get("/my-code", async (req, res) => {
  try {
    const authUser = await sdk.authenticateRequest(req);
    if (!authUser || !authUser.id) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const userId = authUser.id;
    const users2 = await query2(
      "SELECT referralCode, totalReferrals, referralEarnings FROM users WHERE id = ?",
      [userId]
    );
    if (!users2 || users2.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const user = users2[0];
    const referrals = await query2(
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
router6.get("/list", async (req, res) => {
  try {
    const authUser = await sdk.authenticateRequest(req);
    if (!authUser || !authUser.id) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const userId = authUser.id;
    const referrals = await query2(
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
router6.post("/apply", async (req, res) => {
  try {
    const authUser = await sdk.authenticateRequest(req);
    if (!authUser || !authUser.id) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const userId = authUser.id;
    const { referralCode } = req.body;
    if (!referralCode) {
      return res.status(400).json({ error: "Referral code required" });
    }
    const user = await query2(
      "SELECT referredBy FROM users WHERE id = ?",
      [userId]
    );
    if (user[0]?.referredBy) {
      return res.status(400).json({ error: "You have already used a referral code" });
    }
    const referrer = await query2(
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
    await query2(
      `INSERT INTO referrals (referrerId, refereeId, referralCode, status, referrerReward, refereeReward)
       VALUES (?, ?, ?, 'completed', ?, ?)`,
      [referrerId, userId, referralCode, referrerReward, refereeReward]
    );
    await query2(
      "UPDATE users SET referredBy = ?, balance = balance + ? WHERE id = ?",
      [referrerId, refereeReward, userId]
    );
    await query2(
      `UPDATE users 
       SET totalReferrals = totalReferrals + 1,
           referralEarnings = referralEarnings + ?,
           balance = balance + ?
       WHERE id = ?`,
      [referrerReward, referrerReward, referrerId]
    );
    await query2(
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
    const levels = await query2("SELECT * FROM user_levels ORDER BY minTasks ASC");
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
    const users2 = await query2(
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
    const nextLevel = await query2(
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
    const badges = await query2("SELECT * FROM badges ORDER BY category, rarity");
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
    const userBadges = await query2(
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
    const existing = await query2(
      "SELECT * FROM daily_logins WHERE userId = ? AND loginDate = ?",
      [userId, today]
    );
    if (existing.length > 0) {
      return res.json({
        alreadyClaimed: true,
        message: "Daily reward already claimed today"
      });
    }
    const user = await query2(
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
    await query2(
      "INSERT INTO daily_logins (userId, loginDate, reward, streakDay) VALUES (?, ?, ?, ?)",
      [userId, today, reward, currentStreak]
    );
    await query2(
      `UPDATE users 
       SET lastLoginDate = ?,
           currentStreak = ?,
           longestStreak = ?,
           balance = balance + ?,
           totalDailyRewards = totalDailyRewards + ?
       WHERE id = ?`,
      [today, currentStreak, longestStreak, reward, reward, userId]
    );
    await query2(
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
    const existing = await query2(
      "SELECT * FROM user_badges WHERE userId = ? AND badgeId = ?",
      [userId, badgeId]
    );
    if (existing.length > 0) {
      return false;
    }
    await query2(
      "INSERT INTO user_badges (userId, badgeId) VALUES (?, ?)",
      [userId, badgeId]
    );
    const badge = await query2(
      "SELECT rewardAmount FROM badges WHERE id = ?",
      [badgeId]
    );
    if (badge.length > 0 && badge[0].rewardAmount > 0) {
      const reward = parseFloat(badge[0].rewardAmount);
      await query2(
        "UPDATE users SET balance = balance + ? WHERE id = ?",
        [reward, userId]
      );
      await query2(
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
    const user = await query2(
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
    const [tasks3] = await db.query(
      `SELECT * FROM tasks WHERE isExclusive = TRUE AND status = 'active'`
    );
    const accessibleTasks = tasks3.filter((task) => {
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

// server/_core/notification-routes.ts
import { Router as Router12 } from "express";
import { eq as eq2, desc, and } from "drizzle-orm";
var router10 = Router12();
async function isUser3(req, res, next) {
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
router10.get("/", isUser3, async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }
    const userNotifications = await db.select().from(notifications).where(eq2(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
    const transformedNotifications = userNotifications.map((n) => ({
      id: n.id.toString(),
      title: n.titleEn,
      // Will be replaced by frontend based on language
      titleAr: n.titleAr,
      titleEn: n.titleEn,
      message: n.messageEn,
      // Will be replaced by frontend based on language
      messageAr: n.messageAr,
      messageEn: n.messageEn,
      date: n.createdAt.toISOString(),
      read: n.isRead === 1,
      type: n.type,
      actionUrl: n.actionUrl || void 0
    }));
    res.json({ notifications: transformedNotifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});
router10.put("/:id/read", isUser3, async (req, res) => {
  try {
    const userId = req.userId;
    const notificationId = parseInt(req.params.id);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (isNaN(notificationId)) {
      return res.status(400).json({ error: "Invalid notification ID" });
    }
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }
    await db.update(notifications).set({ isRead: 1 }).where(and(
      eq2(notifications.id, notificationId),
      eq2(notifications.userId, userId)
    ));
    res.json({ success: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});
router10.put("/read-all", isUser3, async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }
    await db.update(notifications).set({ isRead: 1 }).where(eq2(notifications.userId, userId));
    res.json({ success: true });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ error: "Failed to mark all notifications as read" });
  }
});
router10.get("/unread-count", isUser3, async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }
    const unreadNotifications = await db.select().from(notifications).where(and(
      eq2(notifications.userId, userId),
      eq2(notifications.isRead, 0)
    ));
    res.json({ count: unreadNotifications.length });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ error: "Failed to fetch unread count" });
  }
});
var notification_routes_default = router10;

// server/_core/campaign-routes.ts
import { Router as Router13 } from "express";
import { sql } from "drizzle-orm";
var router11 = Router13();
router11.get("/campaigns", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }
    const userId = req.user?.id;
    const countryId = req.query.countryId ? parseInt(req.query.countryId) : 1;
    const campaigns2 = await db.execute(sql`
      SELECT 
        c.*,
        a.nameEn as advertiserName,
        a.nameAr as advertiserNameAr,
        a.logoUrl as advertiserLogo,
        (SELECT COUNT(*) FROM campaignTasks WHERE campaignId = c.id) as totalTasks,
        (SELECT COUNT(*) FROM userCampaignProgress WHERE campaignId = c.id AND status = 'completed') as completions
      FROM campaigns c
      LEFT JOIN advertisers a ON c.advertiserId = a.id
      WHERE c.status = 'active' 
        AND c.countryId = ${countryId}
        AND (c.launchDate IS NULL OR c.launchDate <= NOW())
        AND (c.expiryDate IS NULL OR c.expiryDate >= NOW())
      ORDER BY c.createdAt DESC
    `);
    let userProgress = [];
    if (userId) {
      const progressResult = await db.execute(sql`
        SELECT campaignId, status, tasksCompleted, totalTasks, currentSequence
        FROM userCampaignProgress
        WHERE userId = ${userId}
      `);
      userProgress = progressResult[0];
    }
    const campaignsWithProgress = campaigns2[0].map((campaign) => {
      const progress = userProgress.find((p) => p.campaignId === campaign.id);
      return {
        ...campaign,
        userProgress: progress || null
      };
    });
    res.json(campaignsWithProgress);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({ error: "Failed to fetch campaigns" });
  }
});
router11.get("/campaigns/:id", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }
    const campaignId = parseInt(req.params.id);
    const userId = req.user?.id;
    const campaignResult = await db.execute(sql`
      SELECT 
        c.*,
        a.nameEn as advertiserName,
        a.nameAr as advertiserNameAr,
        a.logoUrl as advertiserLogo,
        a.descriptionEn as advertiserDescription,
        a.descriptionAr as advertiserDescriptionAr
      FROM campaigns c
      LEFT JOIN advertisers a ON c.advertiserId = a.id
      WHERE c.id = ${campaignId}
    `);
    if (campaignResult[0].length === 0) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    const campaign = campaignResult[0][0];
    const tasksResult = await db.execute(sql`
      SELECT 
        ct.id as campaignTaskId,
        ct.sequence,
        ct.gatingRules,
        ct.isRequired,
        t.*
      FROM campaignTasks ct
      JOIN tasks t ON ct.taskId = t.id
      WHERE ct.campaignId = ${campaignId}
      ORDER BY ct.sequence ASC
    `);
    const personasResult = await db.execute(sql`
      SELECT * FROM campaignPersonas
      WHERE campaignId = ${campaignId}
    `);
    const qualificationsResult = await db.execute(sql`
      SELECT * FROM campaignQualifications
      WHERE campaignId = ${campaignId}
    `);
    let userProgress = null;
    if (userId) {
      const progressResult = await db.execute(sql`
        SELECT * FROM userCampaignProgress
        WHERE userId = ${userId} AND campaignId = ${campaignId}
      `);
      if (progressResult[0].length > 0) {
        userProgress = progressResult[0][0];
      }
    }
    res.json({
      ...campaign,
      tasks: tasksResult[0],
      personas: personasResult[0],
      qualifications: qualificationsResult[0],
      userProgress
    });
  } catch (error) {
    console.error("Error fetching campaign:", error);
    res.status(500).json({ error: "Failed to fetch campaign" });
  }
});
router11.post("/campaigns/:id/start", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }
    const campaignId = parseInt(req.params.id);
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const existingProgress = await db.execute(sql`
      SELECT * FROM userCampaignProgress
      WHERE userId = ${userId} AND campaignId = ${campaignId}
    `);
    if (existingProgress[0].length > 0) {
      const progress = existingProgress[0][0];
      if (progress.status === "completed") {
        return res.status(400).json({ error: "You have already completed this campaign" });
      }
      if (progress.status === "disqualified") {
        return res.status(400).json({ error: "You are not eligible for this campaign", reason: progress.disqualificationReason });
      }
      return res.json({ message: "Campaign already started", progress });
    }
    const campaignResult = await db.execute(sql`
      SELECT * FROM campaigns WHERE id = ${campaignId} AND status = 'active'
    `);
    if (campaignResult[0].length === 0) {
      return res.status(404).json({ error: "Campaign not found or not active" });
    }
    const campaign = campaignResult[0][0];
    const qualificationResult = await checkUserQualification(db, userId, campaignId);
    if (!qualificationResult.qualified) {
      await db.execute(sql`
        INSERT INTO userJourneyLogs (userId, campaignId, eventType, eventData)
        VALUES (${userId}, ${campaignId}, 'disqualified', ${JSON.stringify({ reason: qualificationResult.reason })})
      `);
      return res.status(400).json({
        error: "You are not eligible for this campaign",
        reason: qualificationResult.reason
      });
    }
    const tasksCountResult = await db.execute(sql`
      SELECT COUNT(*) as count FROM campaignTasks WHERE campaignId = ${campaignId}
    `);
    const totalTasks = tasksCountResult[0][0].count;
    const firstTaskResult = await db.execute(sql`
      SELECT ct.*, t.* FROM campaignTasks ct
      JOIN tasks t ON ct.taskId = t.id
      WHERE ct.campaignId = ${campaignId}
      ORDER BY ct.sequence ASC
      LIMIT 1
    `);
    if (firstTaskResult[0].length === 0) {
      return res.status(400).json({ error: "Campaign has no tasks" });
    }
    const firstTask = firstTaskResult[0][0];
    let personaId = null;
    const personasResult = await db.execute(sql`
      SELECT * FROM campaignPersonas WHERE campaignId = ${campaignId}
    `);
    if (personasResult[0].length > 0) {
      personaId = personasResult[0][0].id;
    }
    await db.execute(sql`
      INSERT INTO userCampaignProgress 
      (userId, campaignId, personaId, currentTaskId, currentSequence, status, tasksCompleted, totalTasks)
      VALUES (${userId}, ${campaignId}, ${personaId}, ${firstTask.taskId}, 1, 'in_progress', 0, ${totalTasks})
    `);
    await db.execute(sql`
      INSERT INTO userJourneyLogs (userId, campaignId, eventType, eventData)
      VALUES (${userId}, ${campaignId}, 'campaign_started', ${JSON.stringify({ personaId })})
    `);
    await db.execute(sql`
      UPDATE campaigns SET totalParticipants = totalParticipants + 1 WHERE id = ${campaignId}
    `);
    res.json({
      message: "Campaign started successfully",
      currentTask: firstTask,
      totalTasks,
      personaId
    });
  } catch (error) {
    console.error("Error starting campaign:", error);
    res.status(500).json({ error: "Failed to start campaign" });
  }
});
router11.post("/campaigns/:id/complete-task", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }
    const campaignId = parseInt(req.params.id);
    const userId = req.user?.id;
    const { taskData } = req.body;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const progressResult = await db.execute(sql`
      SELECT * FROM userCampaignProgress
      WHERE userId = ${userId} AND campaignId = ${campaignId}
    `);
    if (progressResult[0].length === 0) {
      return res.status(400).json({ error: "You have not started this campaign" });
    }
    const progress = progressResult[0][0];
    if (progress.status !== "in_progress") {
      return res.status(400).json({ error: "Campaign is not in progress" });
    }
    const currentTaskResult = await db.execute(sql`
      SELECT ct.*, t.* FROM campaignTasks ct
      JOIN tasks t ON ct.taskId = t.id
      WHERE ct.campaignId = ${campaignId} AND ct.sequence = ${progress.currentSequence}
    `);
    if (currentTaskResult[0].length === 0) {
      return res.status(400).json({ error: "Current task not found" });
    }
    const currentTask = currentTaskResult[0][0];
    const validationResult = validateTaskCompletion(currentTask, taskData);
    if (!validationResult.valid) {
      await db.execute(sql`
        INSERT INTO userJourneyLogs (userId, campaignId, taskId, eventType, eventData)
        VALUES (${userId}, ${campaignId}, ${currentTask.taskId}, 'task_failed', ${JSON.stringify({ reason: validationResult.reason, taskData })})
      `);
      if (validationResult.disqualify) {
        await db.execute(sql`
          UPDATE userCampaignProgress 
          SET status = 'disqualified', disqualificationReason = ${validationResult.reason}
          WHERE userId = ${userId} AND campaignId = ${campaignId}
        `);
        await db.execute(sql`
          UPDATE campaigns SET disqualifiedParticipants = disqualifiedParticipants + 1 WHERE id = ${campaignId}
        `);
        return res.status(400).json({
          error: "You have been disqualified from this campaign",
          reason: validationResult.reason
        });
      }
      return res.status(400).json({ error: "Task not completed correctly", reason: validationResult.reason });
    }
    await db.execute(sql`
      INSERT INTO userJourneyLogs (userId, campaignId, taskId, eventType, eventData)
      VALUES (${userId}, ${campaignId}, ${currentTask.taskId}, 'task_completed', ${JSON.stringify(taskData)})
    `);
    const nextTaskResult = await db.execute(sql`
      SELECT ct.*, t.* FROM campaignTasks ct
      JOIN tasks t ON ct.taskId = t.id
      WHERE ct.campaignId = ${campaignId} AND ct.sequence = ${progress.currentSequence + 1}
    `);
    if (nextTaskResult[0].length === 0) {
      await db.execute(sql`
        UPDATE userCampaignProgress 
        SET status = 'completed', 
            tasksCompleted = tasksCompleted + 1,
            completedAt = NOW()
        WHERE userId = ${userId} AND campaignId = ${campaignId}
      `);
      const campaignResult = await db.execute(sql`
        SELECT reward FROM campaigns WHERE id = ${campaignId}
      `);
      const reward = campaignResult[0][0].reward;
      await db.execute(sql`
        UPDATE users SET balance = balance + ${reward}, totalEarnings = totalEarnings + ${reward}
        WHERE id = ${userId}
      `);
      await db.execute(sql`
        INSERT INTO transactions (userId, type, amount, currency, status, campaignId, description)
        VALUES (${userId}, 'earning', ${reward}, 'EGP', 'completed', ${campaignId}, 'Campaign completion reward')
      `);
      await db.execute(sql`
        UPDATE campaigns SET completedParticipants = completedParticipants + 1 WHERE id = ${campaignId}
      `);
      await db.execute(sql`
        INSERT INTO userJourneyLogs (userId, campaignId, eventType, eventData)
        VALUES (${userId}, ${campaignId}, 'campaign_completed', ${JSON.stringify({ reward })})
      `);
      return res.json({
        message: "Congratulations! Campaign completed!",
        completed: true,
        reward
      });
    }
    const nextTask = nextTaskResult[0][0];
    await db.execute(sql`
      UPDATE userCampaignProgress 
      SET currentTaskId = ${nextTask.taskId},
          currentSequence = ${progress.currentSequence + 1},
          tasksCompleted = tasksCompleted + 1
      WHERE userId = ${userId} AND campaignId = ${campaignId}
    `);
    res.json({
      message: "Task completed! Proceeding to next task.",
      completed: false,
      nextTask,
      tasksCompleted: progress.tasksCompleted + 1,
      totalTasks: progress.totalTasks
    });
  } catch (error) {
    console.error("Error completing task:", error);
    res.status(500).json({ error: "Failed to complete task" });
  }
});
router11.get("/campaigns/:id/progress", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }
    const campaignId = parseInt(req.params.id);
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const progressResult = await db.execute(sql`
      SELECT 
        ucp.*,
        t.titleEn as currentTaskTitle,
        t.titleAr as currentTaskTitleAr,
        t.type as currentTaskType
      FROM userCampaignProgress ucp
      LEFT JOIN tasks t ON ucp.currentTaskId = t.id
      WHERE ucp.userId = ${userId} AND ucp.campaignId = ${campaignId}
    `);
    if (progressResult[0].length === 0) {
      return res.json({ started: false });
    }
    const progress = progressResult[0][0];
    const logsResult = await db.execute(sql`
      SELECT * FROM userJourneyLogs
      WHERE userId = ${userId} AND campaignId = ${campaignId}
      ORDER BY createdAt ASC
    `);
    res.json({
      started: true,
      ...progress,
      journeyLogs: logsResult[0]
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    res.status(500).json({ error: "Failed to fetch progress" });
  }
});
router11.post("/campaigns/:id/book-visit", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }
    const campaignId = parseInt(req.params.id);
    const userId = req.user?.id;
    const { taskId, bookingDate, bookingTimeSlot } = req.body;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const progressResult = await db.execute(sql`
      SELECT * FROM userCampaignProgress
      WHERE userId = ${userId} AND campaignId = ${campaignId} AND currentTaskId = ${taskId}
    `);
    if (progressResult[0].length === 0) {
      return res.status(400).json({ error: "You are not at this task in the campaign" });
    }
    await db.execute(sql`
      INSERT INTO visitVerifications (userId, campaignId, taskId, bookingDate, bookingTimeSlot, status)
      VALUES (${userId}, ${campaignId}, ${taskId}, ${bookingDate}, ${bookingTimeSlot}, 'booked')
    `);
    await db.execute(sql`
      INSERT INTO userJourneyLogs (userId, campaignId, taskId, eventType, eventData)
      VALUES (${userId}, ${campaignId}, ${taskId}, 'visit_booked', ${JSON.stringify({ bookingDate, bookingTimeSlot })})
    `);
    res.json({
      message: "Visit booked successfully",
      bookingDate,
      bookingTimeSlot
    });
  } catch (error) {
    console.error("Error booking visit:", error);
    res.status(500).json({ error: "Failed to book visit" });
  }
});
router11.post("/campaigns/:id/verify-visit", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }
    const campaignId = parseInt(req.params.id);
    const userId = req.user?.id;
    const { taskId, verificationMethod, gpsLatitude, gpsLongitude, qrCodeScanned } = req.body;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const visitResult = await db.execute(sql`
      SELECT * FROM visitVerifications
      WHERE userId = ${userId} AND campaignId = ${campaignId} AND taskId = ${taskId}
      ORDER BY createdAt DESC LIMIT 1
    `);
    if (visitResult[0].length === 0) {
      return res.status(400).json({ error: "No visit booking found" });
    }
    const visit = visitResult[0][0];
    if (visit.status === "verified") {
      return res.status(400).json({ error: "Visit already verified" });
    }
    if (visit.status === "booked") {
      await db.execute(sql`
        UPDATE visitVerifications 
        SET checkInTime = NOW(), 
            verificationMethod = ${verificationMethod},
            gpsLatitude = ${gpsLatitude || null},
            gpsLongitude = ${gpsLongitude || null},
            qrCodeScanned = ${qrCodeScanned || null},
            status = 'checked_in'
        WHERE id = ${visit.id}
      `);
      await db.execute(sql`
        INSERT INTO userJourneyLogs (userId, campaignId, taskId, eventType, eventData)
        VALUES (${userId}, ${campaignId}, ${taskId}, 'visit_checked_in', ${JSON.stringify({ verificationMethod, gpsLatitude, gpsLongitude })})
      `);
      res.json({
        message: "Check-in successful",
        status: "checked_in"
      });
    } else if (visit.status === "checked_in") {
      const checkInTime = new Date(visit.checkInTime);
      const checkOutTime = /* @__PURE__ */ new Date();
      const durationMinutes = Math.floor((checkOutTime.getTime() - checkInTime.getTime()) / (1e3 * 60));
      await db.execute(sql`
        UPDATE visitVerifications 
        SET checkOutTime = NOW(), 
            visitDuration = ${durationMinutes},
            status = 'verified'
        WHERE id = ${visit.id}
      `);
      await db.execute(sql`
        INSERT INTO userJourneyLogs (userId, campaignId, taskId, eventType, eventData)
        VALUES (${userId}, ${campaignId}, ${taskId}, 'visit_verified', ${JSON.stringify({ durationMinutes })})
      `);
      res.json({
        message: "Visit verified successfully",
        status: "verified",
        duration: durationMinutes
      });
    }
  } catch (error) {
    console.error("Error verifying visit:", error);
    res.status(500).json({ error: "Failed to verify visit" });
  }
});
router11.get("/campaigns/:id/kpis", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }
    const campaignId = parseInt(req.params.id);
    const campaignResult = await db.execute(sql`
      SELECT 
        totalParticipants,
        completedParticipants,
        disqualifiedParticipants,
        budget,
        reward
      FROM campaigns WHERE id = ${campaignId}
    `);
    if (campaignResult[0].length === 0) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    const campaign = campaignResult[0][0];
    const videoCompletionRate = await db.execute(sql`
      SELECT 
        COUNT(CASE WHEN eventType = 'task_completed' AND JSON_EXTRACT(eventData, '$.completionPercentage') >= 70 THEN 1 END) * 100.0 / 
        NULLIF(COUNT(CASE WHEN eventType = 'campaign_started' THEN 1 END), 0) as rate
      FROM userJourneyLogs
      WHERE campaignId = ${campaignId}
    `);
    const filterPassRate = await db.execute(sql`
      SELECT 
        COUNT(CASE WHEN eventType = 'task_completed' THEN 1 END) * 100.0 / 
        NULLIF(COUNT(CASE WHEN eventType IN ('task_completed', 'task_failed') THEN 1 END), 0) as rate
      FROM userJourneyLogs
      WHERE campaignId = ${campaignId}
    `);
    const visitAttendanceRate = await db.execute(sql`
      SELECT 
        COUNT(CASE WHEN status = 'verified' THEN 1 END) * 100.0 / 
        NULLIF(COUNT(*), 0) as rate
      FROM visitVerifications
      WHERE campaignId = ${campaignId}
    `);
    const totalSpent = campaign.completedParticipants * campaign.reward;
    const costPerVisit = campaign.completedParticipants > 0 ? totalSpent / campaign.completedParticipants : 0;
    res.json({
      totalParticipants: campaign.totalParticipants,
      completedParticipants: campaign.completedParticipants,
      disqualifiedParticipants: campaign.disqualifiedParticipants,
      conversionRate: campaign.totalParticipants > 0 ? (campaign.completedParticipants / campaign.totalParticipants * 100).toFixed(2) : 0,
      videoCompletionRate: videoCompletionRate[0][0]?.rate?.toFixed(2) || 0,
      filterPassRate: filterPassRate[0][0]?.rate?.toFixed(2) || 0,
      visitAttendanceRate: visitAttendanceRate[0][0]?.rate?.toFixed(2) || 0,
      totalSpent,
      costPerVisit: costPerVisit.toFixed(2),
      budgetRemaining: campaign.budget - totalSpent
    });
  } catch (error) {
    console.error("Error fetching KPIs:", error);
    res.status(500).json({ error: "Failed to fetch KPIs" });
  }
});
async function checkUserQualification(db, userId, campaignId) {
  const userResult = await db.execute(sql`
    SELECT * FROM users WHERE id = ${userId}
  `);
  if (userResult[0].length === 0) {
    return { qualified: false, reason: "User not found" };
  }
  const user = userResult[0][0];
  const qualificationsResult = await db.execute(sql`
    SELECT * FROM campaignQualifications WHERE campaignId = ${campaignId}
  `);
  const qualifications = qualificationsResult[0];
  for (const qual of qualifications) {
    const userValue = user[qual.criteriaKey];
    const qualValue = qual.value;
    switch (qual.operator) {
      case "=":
        if (userValue != qualValue) {
          return { qualified: false, reason: `Does not meet ${qual.criteriaKey} requirement` };
        }
        break;
      case "!=":
        if (userValue == qualValue) {
          return { qualified: false, reason: `Does not meet ${qual.criteriaKey} requirement` };
        }
        break;
      case ">":
        if (!(userValue > parseFloat(qualValue))) {
          return { qualified: false, reason: `Does not meet ${qual.criteriaKey} requirement` };
        }
        break;
      case "<":
        if (!(userValue < parseFloat(qualValue))) {
          return { qualified: false, reason: `Does not meet ${qual.criteriaKey} requirement` };
        }
        break;
      case ">=":
        if (!(userValue >= parseFloat(qualValue))) {
          return { qualified: false, reason: `Does not meet ${qual.criteriaKey} requirement` };
        }
        break;
      case "<=":
        if (!(userValue <= parseFloat(qualValue))) {
          return { qualified: false, reason: `Does not meet ${qual.criteriaKey} requirement` };
        }
        break;
      case "in":
        const inValues = JSON.parse(qualValue);
        if (!inValues.includes(userValue)) {
          return { qualified: false, reason: `Does not meet ${qual.criteriaKey} requirement` };
        }
        break;
      case "not_in":
        const notInValues = JSON.parse(qualValue);
        if (notInValues.includes(userValue)) {
          return { qualified: false, reason: `Does not meet ${qual.criteriaKey} requirement` };
        }
        break;
    }
  }
  return { qualified: true };
}
function validateTaskCompletion(task, taskData) {
  let gatingRules = {};
  try {
    gatingRules = task.gatingRules ? typeof task.gatingRules === "string" ? JSON.parse(task.gatingRules) : task.gatingRules : {};
  } catch (e) {
    gatingRules = {};
  }
  switch (task.type) {
    case "video":
      const minCompletion = gatingRules.minCompletion || 70;
      if (!taskData?.completionPercentage || taskData.completionPercentage < minCompletion) {
        return { valid: false, reason: `Video must be watched at least ${minCompletion}%` };
      }
      break;
    case "survey":
      if (!taskData?.answers || Object.keys(taskData.answers).length === 0) {
        return { valid: false, reason: "All survey questions must be answered" };
      }
      if (gatingRules.disqualifyingAnswers) {
        for (const [questionId, disqualifyingValues] of Object.entries(gatingRules.disqualifyingAnswers)) {
          if (disqualifyingValues.includes(taskData.answers[questionId])) {
            return { valid: false, reason: "You do not meet the requirements for this campaign", disqualify: true };
          }
        }
      }
      break;
    case "quiz":
      const minScore = gatingRules.minScore || 70;
      if (!taskData?.score || taskData.score < minScore) {
        return { valid: false, reason: `Minimum score of ${minScore}% required` };
      }
      break;
    case "visit":
      const minDuration = gatingRules.minDuration || 30;
      if (!taskData?.duration || taskData.duration < minDuration) {
        return { valid: false, reason: `Visit must be at least ${minDuration} minutes` };
      }
      if (gatingRules.requireGps && !taskData?.gpsVerified) {
        return { valid: false, reason: "GPS verification required" };
      }
      break;
    default:
      if (!taskData) {
        return { valid: false, reason: "Task data required" };
      }
  }
  if (gatingRules.antiIncentiveGate && taskData?.answer === "no") {
    return { valid: false, reason: "Thank you for your honesty. This campaign is for users genuinely interested in the product.", disqualify: true };
  }
  return { valid: true };
}
var campaign_routes_default = router11;

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
var router12 = t.router;
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
var systemRouter = router12({
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
import { eq as eq6, sql as sql5 } from "drizzle-orm";
import { z as z2 } from "zod";

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
import { eq as eq3, and as and2, gte, sql as sql2 } from "drizzle-orm";
async function checkUserTierEligibility(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const user = await db.select().from(users).where(eq3(users.id, userId)).limit(1);
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
    tasksCompleted: sql2`COUNT(*)`,
    averageRating: sql2`COALESCE(AVG(${userTasks.rating}), 0)`
  }).from(userTasks).where(
    and2(
      eq3(userTasks.userId, userId),
      eq3(userTasks.status, "completed")
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
    }).where(eq3(users.id, userId));
    return true;
  } catch (error) {
    console.error("Error upgrading user tier:", error);
    return false;
  }
}
async function checkAdvertiserTierEligibility(advertiserId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const advertiser = await db.select().from(advertisers).where(eq3(advertisers.id, advertiserId)).limit(1);
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
    totalSpend: sql2`COALESCE(SUM(${userTasks.taskValue}), 0)`
  }).from(userTasks).where(
    and2(
      eq3(userTasks.advertiserId, advertiserId),
      gte(userTasks.createdAt, thirtyDaysAgo),
      eq3(userTasks.status, "completed")
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
    }).where(eq3(advertisers.id, advertiserId));
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
import { eq as eq4, and as and3, sql as sql3 } from "drizzle-orm";
async function getUserBalance(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const user = await db.select().from(users).where(eq4(users.id, userId)).limit(1);
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
  }).where(eq4(users.id, userId));
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
  const transaction = await db.select().from(transactions).where(eq4(transactions.id, transactionId)).limit(1);
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
    }).where(eq4(users.id, txn.userId));
    await db.update(transactions).set({
      status: "completed",
      balanceAfter: newBalance,
      processedAt: /* @__PURE__ */ new Date(),
      note
    }).where(eq4(transactions.id, transactionId));
  } else {
    await db.update(transactions).set({
      status: "rejected",
      processedAt: /* @__PURE__ */ new Date(),
      note
    }).where(eq4(transactions.id, transactionId));
  }
  return true;
}
async function getTransactionHistory(userId, limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(transactions).where(eq4(transactions.userId, userId)).orderBy(sql3`${transactions.createdAt} DESC`).limit(limit);
}
async function getPendingWithdrawals() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(transactions).where(
    and3(
      eq4(transactions.type, "withdrawal"),
      eq4(transactions.status, "pending")
    )
  ).orderBy(sql3`${transactions.createdAt} ASC`);
}
async function getTotalEarnings(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select({
    total: sql3`COALESCE(SUM(${transactions.amount}), 0)`
  }).from(transactions).where(
    and3(
      eq4(transactions.userId, userId),
      eq4(transactions.type, "earning"),
      eq4(transactions.status, "completed")
    )
  );
  return result[0]?.total || 0;
}
async function getTotalWithdrawals(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select({
    total: sql3`COALESCE(SUM(${transactions.amount}), 0)`
  }).from(transactions).where(
    and3(
      eq4(transactions.userId, userId),
      eq4(transactions.type, "withdrawal"),
      eq4(transactions.status, "completed")
    )
  );
  return result[0]?.total || 0;
}

// server/services/task.service.ts
import { eq as eq5, and as and4, sql as sql4, or, gte as gte2, lte } from "drizzle-orm";
async function createTask(advertiserId, taskData) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const advertiser = await db.select().from(advertisers).where(eq5(advertisers.id, advertiserId)).limit(1);
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
  const user = await db.select().from(users).where(eq5(users.id, userId)).limit(1);
  if (!user || user.length === 0) {
    throw new Error("User not found");
  }
  let conditions = [
    eq5(tasks.status, "active"),
    sql4`${tasks.currentAssignments} < ${tasks.maxAssignments}`
  ];
  if (filters?.countryId) {
    conditions.push(eq5(tasks.countryId, filters.countryId));
  }
  if (filters?.type) {
    conditions.push(eq5(tasks.type, filters.type));
  }
  if (filters?.minValue) {
    conditions.push(gte2(tasks.value, filters.minValue));
  }
  if (filters?.maxValue) {
    conditions.push(lte(tasks.value, filters.maxValue));
  }
  const availableTasks = await db.select().from(tasks).where(and4(...conditions)).orderBy(sql4`${tasks.createdAt} DESC`).limit(50);
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
  const task = await db.select().from(tasks).where(eq5(tasks.id, taskId)).limit(1);
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
    and4(
      eq5(userTasks.taskId, taskId),
      eq5(userTasks.userId, userId),
      or(
        eq5(userTasks.status, "assigned"),
        eq5(userTasks.status, "in_progress"),
        eq5(userTasks.status, "submitted")
      )
    )
  ).limit(1);
  if (existing && existing.length > 0) {
    throw new Error("User already has this task");
  }
  const user = await db.select().from(users).where(eq5(users.id, userId)).limit(1);
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
    currentAssignments: sql4`${tasks.currentAssignments} + 1`,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq5(tasks.id, taskId));
  return result.insertId;
}
async function submitTaskCompletion(userTaskId, submissionData) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const userTask = await db.select().from(userTasks).where(eq5(userTasks.id, userTaskId)).limit(1);
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
  }).where(eq5(userTasks.id, userTaskId));
  return true;
}
async function verifyTaskCompletion(userTaskId, isApproved, rating, feedback) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const userTask = await db.select().from(userTasks).where(eq5(userTasks.id, userTaskId)).limit(1);
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
    }).where(eq5(userTasks.id, userTaskId));
    const user = await db.select().from(users).where(eq5(users.id, userTask[0].userId)).limit(1);
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
        }).where(eq5(userTasks.id, userTaskId));
      }
    }
  } else {
    await db.update(userTasks).set({
      status: "rejected",
      verifiedAt: /* @__PURE__ */ new Date(),
      feedback,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq5(userTasks.id, userTaskId));
  }
  return true;
}
async function getUserTasks(userId, status) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  let query3 = db.select().from(userTasks).where(eq5(userTasks.userId, userId));
  if (status) {
    query3 = query3.where(and4(eq5(userTasks.userId, userId), eq5(userTasks.status, status)));
  }
  return await query3.orderBy(sql4`${userTasks.createdAt} DESC`);
}
async function getAdvertiserTasks(advertiserId, status) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  let query3 = db.select().from(tasks).where(eq5(tasks.advertiserId, advertiserId));
  if (status) {
    query3 = query3.where(and4(eq5(tasks.advertiserId, advertiserId), eq5(tasks.status, status)));
  }
  return await query3.orderBy(sql4`${tasks.createdAt} DESC`);
}

// server/routers.ts
async function recalculateProfileStrength(userId) {
  const db = await getDb();
  if (!db) return;
  let strength = 0;
  const user = await db.select().from(users).where(eq6(users.id, userId)).limit(1);
  if (user[0]?.phoneVerified) strength += 20;
  if (user[0]?.emailVerified) strength += 10;
  const kycVerification = await db.execute(sql5`SELECT * FROM user_verifications WHERE userId = ${userId} AND verificationType = 'national_id' AND status = 'verified'`);
  if (kycVerification.length > 0) strength += 20;
  const socialProfiles = await db.execute(sql5`SELECT * FROM user_social_profiles WHERE userId = ${userId}`);
  if (socialProfiles.length > 0) strength += 10;
  const profileData = await db.execute(sql5`SELECT * FROM user_profile_data WHERE userId = ${userId}`);
  const questionCount = profileData.length;
  strength += Math.min(questionCount * 4, 40);
  await db.update(users).set({ profileStrength: Math.min(strength, 100) }).where(eq6(users.id, userId));
}
var appRouter = router12({
  system: systemRouter,
  auth: router12({
    me: publicProcedure.query((opts) => opts.ctx.user),
    // Send OTP to phone number
    sendOTP: publicProcedure.input(z2.object({
      phone: z2.string().min(10).max(20)
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const code = Math.floor(1e5 + Math.random() * 9e5).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1e3);
      await db.execute(sql5`DELETE FROM otp_codes WHERE phone = ${input.phone}`);
      await db.execute(sql5`
          INSERT INTO otp_codes (phone, code, expiresAt, verified, attempts)
          VALUES (${input.phone}, ${code}, ${expiresAt}, FALSE, 0)
        `);
      console.log(`[MOCK OTP] Code ${code} sent to ${input.phone}`);
      return {
        success: true,
        message: `OTP sent to ${input.phone}`,
        mockCode: code
        // Remove in production
      };
    }),
    // Verify OTP and login/register user
    verifyOTP: publicProcedure.input(z2.object({
      phone: z2.string().min(10).max(20),
      code: z2.string().length(6),
      deviceInfo: z2.object({
        deviceBrand: z2.string().optional(),
        deviceModel: z2.string().optional(),
        osName: z2.string().optional(),
        osVersion: z2.string().optional()
      }).optional()
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const otpResult = await db.execute(sql5`
          SELECT * FROM otp_codes 
          WHERE phone = ${input.phone} AND verified = FALSE 
          ORDER BY createdAt DESC LIMIT 1
        `);
      const otpRows = otpResult[0];
      const otpRecord = otpRows?.[0];
      if (!otpRecord) {
        throw new Error("No OTP found. Please request a new one.");
      }
      if (new Date(otpRecord.expiresAt) < /* @__PURE__ */ new Date()) {
        throw new Error("OTP has expired. Please request a new one.");
      }
      if (otpRecord.attempts >= 3) {
        throw new Error("Too many attempts. Please request a new OTP.");
      }
      await db.execute(sql5`UPDATE otp_codes SET attempts = attempts + 1 WHERE id = ${otpRecord.id}`);
      if (otpRecord.code !== input.code) {
        throw new Error("Invalid OTP code.");
      }
      await db.execute(sql5`UPDATE otp_codes SET verified = TRUE WHERE id = ${otpRecord.id}`);
      const userResult = await db.select().from(users).where(eq6(users.phone, input.phone)).limit(1);
      let user = userResult[0];
      let isNewUser = false;
      if (!user) {
        isNewUser = true;
        const openId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const referralCode = `REF${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
        await db.insert(users).values({
          openId,
          phone: input.phone,
          phoneVerified: true,
          kycLevel: 1,
          profileStrength: 40,
          referralCode,
          nationality: "Egypt"
        });
        const newUserResult = await db.select().from(users).where(eq6(users.phone, input.phone)).limit(1);
        user = newUserResult[0];
        await db.execute(sql5`
            INSERT INTO user_verifications (userId, verificationType, status, verifiedAt, extractedData)
            VALUES (${user.id}, 'phone', 'verified', NOW(), ${JSON.stringify({ phone: input.phone })})
          `);
        await db.execute(sql5`
            INSERT INTO user_consents (userId, consentType, isGranted, grantedAt, ipAddress)
            VALUES 
              (${user.id}, 'mandatory_kyc', TRUE, NOW(), ${ctx.req.ip || "unknown"}),
              (${user.id}, 'analytics', TRUE, NOW(), ${ctx.req.ip || "unknown"})
          `);
      } else {
        await db.update(users).set({ phoneVerified: true, lastSignedIn: /* @__PURE__ */ new Date() }).where(eq6(users.id, user.id));
      }
      if (input.deviceInfo) {
        const deviceId = `device_${user.id}_${Date.now()}`;
        await db.execute(sql5`UPDATE user_devices SET isCurrentDevice = FALSE WHERE userId = ${user.id}`);
        await db.execute(sql5`
            INSERT INTO user_devices (userId, deviceId, deviceBrand, deviceModel, osName, osVersion, ipAddress, isCurrentDevice)
            VALUES (${user.id}, ${deviceId}, ${input.deviceInfo.deviceBrand || "Unknown"}, ${input.deviceInfo.deviceModel || "Unknown"}, ${input.deviceInfo.osName || "Unknown"}, ${input.deviceInfo.osVersion || "Unknown"}, ${ctx.req.ip || "unknown"}, TRUE)
          `);
      }
      const sessionToken = await sdk.createSessionToken(user.openId, { name: user.name || "" });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME2, sessionToken, cookieOptions);
      return { success: true, user, isNewUser };
    }),
    // Phone login (direct - for demo)
    phoneLogin: publicProcedure.input(z2.object({
      phone: z2.string().min(10).max(20)
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.select().from(users).where(eq6(users.phone, input.phone)).limit(1);
      const user = result[0];
      if (!user) {
        throw new Error("User not found. Please register first.");
      }
      await db.update(users).set({ lastSignedIn: /* @__PURE__ */ new Date() }).where(eq6(users.id, user.id));
      const sessionToken = await sdk.createSessionToken(user.openId, { name: user.name || "" });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME2, sessionToken, cookieOptions);
      return { success: true, user };
    }),
    // Email/Password login
    login: publicProcedure.input(z2.object({
      email: z2.string().email(),
      password: z2.string()
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.select().from(users).where(eq6(users.email, input.email)).limit(1);
      const user = result[0];
      if (!user) throw new Error("Invalid email or password");
      if (!user.password) throw new Error("Password authentication not configured");
      const isPasswordValid = await bcrypt3.compare(input.password, user.password);
      if (!isPasswordValid) throw new Error("Invalid email or password");
      const sessionToken = await sdk.createSessionToken(user.openId, { name: user.name || "" });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME2, sessionToken, cookieOptions);
      return { success: true, user };
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME2, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    })
  }),
  // User Profile & Verification API
  userProfile: router12({
    getProfile: publicProcedure.input(z2.object({ userId: z2.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const user = await db.select().from(users).where(eq6(users.id, input.userId)).limit(1);
      if (!user[0]) throw new Error("User not found");
      const verifications = await db.execute(sql5`SELECT * FROM user_verifications WHERE userId = ${input.userId}`);
      const socialProfiles = await db.execute(sql5`SELECT * FROM user_social_profiles WHERE userId = ${input.userId}`);
      const consents = await db.execute(sql5`SELECT * FROM user_consents WHERE userId = ${input.userId}`);
      const devices = await db.execute(sql5`SELECT * FROM user_devices WHERE userId = ${input.userId} ORDER BY lastSeenAt DESC`);
      const profileData = await db.execute(sql5`SELECT * FROM user_profile_data WHERE userId = ${input.userId}`);
      return { user: user[0], verifications, socialProfiles, consents, devices, profileData };
    }),
    updateProfile: publicProcedure.input(z2.object({
      userId: z2.number(),
      name: z2.string().optional(),
      email: z2.string().email().optional(),
      avatar: z2.string().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const updateData = {};
      if (input.name) updateData.name = input.name;
      if (input.email) updateData.email = input.email;
      if (input.avatar) updateData.avatar = input.avatar;
      await db.update(users).set(updateData).where(eq6(users.id, input.userId));
      return { success: true };
    }),
    submitKYC: publicProcedure.input(z2.object({
      userId: z2.number(),
      documentType: z2.enum(["national_id", "passport", "drivers_license"]),
      documentUrl: z2.string()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const extractedData = {
        fullName: "Verified User Name",
        documentNumber: Math.floor(Math.random() * 9e12 + 1e12).toString(),
        dateOfBirth: "1990-01-15",
        gender: Math.random() > 0.5 ? "male" : "female",
        nationality: "Egypt"
      };
      await db.execute(sql5`
          INSERT INTO user_verifications (userId, verificationType, status, documentUrl, extractedData, verifiedAt)
          VALUES (${input.userId}, ${input.documentType}, 'verified', ${input.documentUrl}, ${JSON.stringify(extractedData)}, NOW())
          ON DUPLICATE KEY UPDATE status = 'verified', documentUrl = ${input.documentUrl}, extractedData = ${JSON.stringify(extractedData)}, verifiedAt = NOW()
        `);
      await db.update(users).set({
        kycLevel: 2,
        isVerified: 1,
        fullName: extractedData.fullName,
        dateOfBirth: extractedData.dateOfBirth,
        gender: extractedData.gender,
        nationality: extractedData.nationality,
        lastKycAt: /* @__PURE__ */ new Date()
      }).where(eq6(users.id, input.userId));
      await recalculateProfileStrength(input.userId);
      return { success: true, extractedData };
    }),
    connectSocial: publicProcedure.input(z2.object({
      userId: z2.number(),
      provider: z2.enum(["google", "facebook", "instagram"])
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const mockId = Math.floor(Math.random() * 9e9 + 1e9).toString();
      const profile = {
        socialId: `${input.provider}_${mockId}`,
        email: input.provider !== "instagram" ? `mockuser${mockId.slice(-4)}@${input.provider === "google" ? "gmail.com" : "yahoo.com"}` : null,
        displayName: `Mock ${input.provider.charAt(0).toUpperCase() + input.provider.slice(1)} User`,
        avatarUrl: `https://ui-avatars.com/api/?name=Mock+User&background=random`
      };
      await db.execute(sql5`
          INSERT INTO user_social_profiles (userId, provider, socialId, email, displayName, avatarUrl, connectedAt)
          VALUES (${input.userId}, ${input.provider}, ${profile.socialId}, ${profile.email}, ${profile.displayName}, ${profile.avatarUrl}, NOW())
          ON DUPLICATE KEY UPDATE socialId = ${profile.socialId}, email = ${profile.email}, displayName = ${profile.displayName}, avatarUrl = ${profile.avatarUrl}, lastSyncAt = NOW()
        `);
      if (profile.email) {
        await db.update(users).set({ email: profile.email, emailVerified: true }).where(eq6(users.id, input.userId));
      }
      await recalculateProfileStrength(input.userId);
      return { success: true, profile };
    }),
    updateConsent: publicProcedure.input(z2.object({
      userId: z2.number(),
      consentType: z2.enum(["mandatory_kyc", "personalization", "analytics", "marketing", "data_sharing"]),
      isGranted: z2.boolean()
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const now = (/* @__PURE__ */ new Date()).toISOString();
      await db.execute(sql5`
          INSERT INTO user_consents (userId, consentType, isGranted, grantedAt, withdrawnAt, ipAddress)
          VALUES (${input.userId}, ${input.consentType}, ${input.isGranted}, ${input.isGranted ? now : null}, ${!input.isGranted ? now : null}, ${ctx.req.ip || "unknown"})
          ON DUPLICATE KEY UPDATE isGranted = ${input.isGranted}, grantedAt = IF(${input.isGranted}, ${now}, grantedAt), withdrawnAt = IF(${!input.isGranted}, ${now}, NULL), ipAddress = ${ctx.req.ip || "unknown"}, updatedAt = NOW()
        `);
      return { success: true };
    }),
    saveProfileAnswer: publicProcedure.input(z2.object({
      userId: z2.number(),
      questionKey: z2.string(),
      answerValue: z2.string()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.execute(sql5`
          INSERT INTO user_profile_data (userId, questionKey, answerValue)
          VALUES (${input.userId}, ${input.questionKey}, ${input.answerValue})
          ON DUPLICATE KEY UPDATE answerValue = ${input.answerValue}, updatedAt = NOW()
        `);
      await recalculateProfileStrength(input.userId);
      return { success: true };
    })
  }),
  // Countries API
  countries: router12({
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
  commission: router12({
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
  tiers: router12({
    checkUserEligibility: publicProcedure.input(z2.object({ userId: z2.number() })).query(async ({ input }) => {
      return await checkUserTierEligibility(input.userId);
    }),
    upgradeUser: publicProcedure.input(z2.object({
      userId: z2.number(),
      targetTier: z2.string()
    })).mutation(async ({ input }) => {
      return await upgradeUserTier(input.userId, input.targetTier);
    }),
    checkAdvertiserEligibility: publicProcedure.input(z2.object({ advertiserId: z2.string() })).query(async ({ input }) => {
      return await checkAdvertiserTierEligibility(input.advertiserId);
    }),
    upgradeAdvertiser: publicProcedure.input(z2.object({
      advertiserId: z2.string(),
      targetTier: z2.string()
    })).mutation(async ({ input }) => {
      return await upgradeAdvertiserTier(input.advertiserId, input.targetTier);
    }),
    getInfo: publicProcedure.input(z2.object({ tier: z2.string() })).query(({ input }) => {
      return getTierInfo(input.tier);
    })
  }),
  // Wallet API
  wallet: router12({
    getBalance: publicProcedure.input(z2.object({ userId: z2.number() })).query(async ({ input }) => {
      return await getUserBalance(input.userId);
    }),
    requestWithdrawal: publicProcedure.input(z2.object({
      userId: z2.number(),
      amount: z2.number(),
      method: z2.string(),
      accountDetails: z2.string()
    })).mutation(async ({ input }) => {
      return await requestWithdrawal(input.userId, input.amount, input.method, input.accountDetails);
    }),
    processWithdrawal: publicProcedure.input(z2.object({
      withdrawalId: z2.string(),
      status: z2.enum(["approved", "rejected"]),
      adminNotes: z2.string().optional()
    })).mutation(async ({ input }) => {
      return await processWithdrawal(input.withdrawalId, input.status, input.adminNotes);
    }),
    getTransactions: publicProcedure.input(z2.object({
      userId: z2.number(),
      limit: z2.number().optional(),
      offset: z2.number().optional()
    })).query(async ({ input }) => {
      return await getTransactionHistory(input.userId, input.limit, input.offset);
    }),
    getPendingWithdrawals: publicProcedure.query(async () => {
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
  tasks: router12({
    create: publicProcedure.input(z2.object({
      advertiserId: z2.string(),
      title: z2.string(),
      description: z2.string(),
      type: z2.string(),
      reward: z2.number(),
      requirements: z2.any().optional(),
      maxCompletions: z2.number().optional()
    })).mutation(async ({ input }) => {
      return await createTask(input);
    }),
    getAvailable: publicProcedure.input(z2.object({
      userId: z2.number().optional(),
      type: z2.string().optional(),
      limit: z2.number().optional()
    })).query(async ({ input }) => {
      return await getAvailableTasks(input.userId, input.type, input.limit);
    }),
    assign: publicProcedure.input(z2.object({
      taskId: z2.number(),
      userId: z2.number()
    })).mutation(async ({ input }) => {
      return await assignTaskToUser(input.taskId, input.userId);
    }),
    submit: publicProcedure.input(z2.object({
      taskId: z2.number(),
      userId: z2.number(),
      proof: z2.any().optional()
    })).mutation(async ({ input }) => {
      return await submitTaskCompletion(input.taskId, input.userId, input.proof);
    }),
    verify: publicProcedure.input(z2.object({
      submissionId: z2.string(),
      status: z2.enum(["approved", "rejected"]),
      reviewNotes: z2.string().optional()
    })).mutation(async ({ input }) => {
      return await verifyTaskCompletion(input.submissionId, input.status, input.reviewNotes);
    }),
    getUserTasks: publicProcedure.input(z2.object({
      userId: z2.number(),
      status: z2.string().optional()
    })).query(async ({ input }) => {
      return await getUserTasks(input.userId, input.status);
    }),
    getAdvertiserTasks: publicProcedure.input(z2.object({
      advertiserId: z2.string(),
      status: z2.string().optional()
    })).query(async ({ input }) => {
      return await getAdvertiserTasks(input.advertiserId, input.status);
    })
  }),
  // Advertisers API
  advertisers: router12({
    list: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return await db.select().from(advertisers);
    }),
    getBySlug: publicProcedure.input(z2.object({ slug: z2.string() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.select().from(advertisers).where(eq6(advertisers.slug, input.slug)).limit(1);
      return result[0] || null;
    }),
    getById: publicProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.select().from(advertisers).where(eq6(advertisers.id, input.id)).limit(1);
      return result[0] || null;
    })
  }),
  // Campaign Builder APIs
  campaignBuilder: router12({
    // Get estimated reach based on targeting criteria
    getEstimatedReach: publicProcedure.input(z2.object({
      targeting: z2.object({
        ageMin: z2.number().optional(),
        ageMax: z2.number().optional(),
        gender: z2.enum(["male", "female", "all"]).optional(),
        minKYCLevel: z2.number().optional(),
        minProfileStrength: z2.number().optional(),
        userTiers: z2.array(z2.string()).optional()
      })
    })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      let baseCount = 3;
      let matchCount = baseCount;
      if (input.targeting.minProfileStrength) {
        if (input.targeting.minProfileStrength > 75) matchCount = 1;
        else if (input.targeting.minProfileStrength > 40) matchCount = 2;
      }
      if (input.targeting.minKYCLevel) {
        if (input.targeting.minKYCLevel >= 3) matchCount = 1;
        else if (input.targeting.minKYCLevel >= 2) matchCount = 2;
      }
      return {
        estimatedReach: matchCount * 1e3,
        // Simulated reach
        estimatedCost: matchCount * 500
      };
    }),
    // Create a new campaign with advanced targeting
    createCampaign: publicProcedure.input(z2.object({
      advertiserId: z2.number(),
      titleEn: z2.string(),
      titleAr: z2.string().optional(),
      descriptionEn: z2.string(),
      descriptionAr: z2.string().optional(),
      type: z2.enum(["survey", "video", "app", "social", "referral"]),
      reward: z2.number(),
      totalBudget: z2.number(),
      completionsNeeded: z2.number(),
      targeting: z2.object({
        ageMin: z2.number().optional(),
        ageMax: z2.number().optional(),
        gender: z2.enum(["male", "female", "all"]).optional(),
        nationalities: z2.array(z2.string()).optional(),
        countries: z2.array(z2.string()).optional(),
        cities: z2.array(z2.string()).optional(),
        deviceBrands: z2.array(z2.string()).optional(),
        carriers: z2.array(z2.string()).optional(),
        interests: z2.array(z2.string()).optional(),
        requireKYCVerified: z2.boolean().optional(),
        minKYCLevel: z2.number().optional(),
        purchaseIntent: z2.array(z2.string()).optional(),
        userTiers: z2.array(z2.string()).optional(),
        minProfileStrength: z2.number().optional()
      }),
      taskData: z2.any().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [advRows] = await db.execute(sql5`SELECT tier FROM advertisers WHERE id = ${input.advertiserId}`);
      const advertiser = advRows[0];
      if (!advertiser) throw new Error("Advertiser not found");
      const tier = advertiser.tier || "basic";
      if (tier === "basic") {
        if (input.targeting.deviceBrands || input.targeting.carriers || input.targeting.interests) {
          throw new Error("Upgrade to Pro tier to access advanced targeting");
        }
      }
      if (tier !== "enterprise") {
        if (input.targeting.purchaseIntent) {
          throw new Error("Upgrade to Enterprise tier for intent-based targeting");
        }
      }
      await db.execute(sql5`
          INSERT INTO tasks (advertiserId, type, titleEn, titleAr, descriptionEn, descriptionAr,
            reward, totalBudget, completionsNeeded, minimumBudget, status, duration,
            targetAgeMin, targetAgeMax, targetGender, taskData)
          VALUES (${input.advertiserId}, ${input.type}, ${input.titleEn}, ${input.titleAr || ""},
            ${input.descriptionEn}, ${input.descriptionAr || ""}, ${input.reward},
            ${input.totalBudget}, ${input.completionsNeeded}, ${input.totalBudget}, 'draft', 5,
            ${input.targeting.ageMin || null}, ${input.targeting.ageMax || null},
            ${input.targeting.gender || null}, ${JSON.stringify(input.taskData || {})})
        `);
      const [taskRows] = await db.execute(sql5`SELECT LAST_INSERT_ID() as id`);
      const taskId = taskRows[0].id;
      await db.execute(sql5`
          INSERT INTO campaign_targeting (taskId, targetAgeMin, targetAgeMax, targetGender,
            targetNationalities, targetCountries, targetCities, targetDeviceBrands, targetCarriers,
            targetInterests, requireKYCVerified, minKYCLevel, targetPurchaseIntent, targetUserTiers, minProfileStrength)
          VALUES (${taskId}, ${input.targeting.ageMin || null}, ${input.targeting.ageMax || null},
            ${input.targeting.gender || "all"}, ${JSON.stringify(input.targeting.nationalities || [])},
            ${JSON.stringify(input.targeting.countries || [])}, ${JSON.stringify(input.targeting.cities || [])},
            ${JSON.stringify(input.targeting.deviceBrands || [])}, ${JSON.stringify(input.targeting.carriers || [])},
            ${JSON.stringify(input.targeting.interests || [])}, ${input.targeting.requireKYCVerified || false},
            ${input.targeting.minKYCLevel || 0}, ${JSON.stringify(input.targeting.purchaseIntent || [])},
            ${JSON.stringify(input.targeting.userTiers || [])}, ${input.targeting.minProfileStrength || 0})
        `);
      return { success: true, taskId };
    })
  }),
  // Campaign Analytics APIs
  campaignAnalytics: router12({
    getSummary: publicProcedure.input(z2.object({ taskId: z2.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [taskRows] = await db.execute(sql5`
          SELECT t.*, a.nameEn as advertiserName FROM tasks t
          JOIN advertisers a ON t.advertiserId = a.id WHERE t.id = ${input.taskId}
        `);
      const task = taskRows[0];
      if (!task) throw new Error("Task not found");
      const [statsRows] = await db.execute(sql5`
          SELECT COUNT(*) as totalCompletions, COUNT(DISTINCT userId) as uniqueUsers,
            SUM(rewardAmount) as totalSpent
          FROM task_submissions WHERE taskId = ${input.taskId} AND status = 'approved'
        `);
      const stats = statsRows[0];
      return {
        task,
        summary: {
          totalCompletions: stats.totalCompletions || 0,
          uniqueUsers: stats.uniqueUsers || 0,
          totalSpent: stats.totalSpent || 0,
          completionRate: task.completionsNeeded > 0 ? (stats.totalCompletions / task.completionsNeeded * 100).toFixed(1) : 0
        }
      };
    }),
    getDailyStats: publicProcedure.input(z2.object({ taskId: z2.number(), days: z2.number().default(7) })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [rows] = await db.execute(sql5`
          SELECT DATE(completedAt) as date, COUNT(*) as completions,
            COUNT(DISTINCT userId) as uniqueUsers, SUM(rewardAmount) as spent
          FROM task_submissions WHERE taskId = ${input.taskId} AND status = 'approved'
            AND completedAt >= DATE_SUB(CURDATE(), INTERVAL ${input.days} DAY)
          GROUP BY DATE(completedAt) ORDER BY date ASC
        `);
      return rows;
    })
  }),
  // Saved Audiences (Enterprise only)
  savedAudiences: router12({
    list: publicProcedure.input(z2.object({ advertiserId: z2.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [rows] = await db.execute(sql5`SELECT * FROM saved_audiences WHERE advertiserId = ${input.advertiserId}`);
      return rows;
    }),
    create: publicProcedure.input(z2.object({
      advertiserId: z2.number(),
      name: z2.string(),
      description: z2.string().optional(),
      targetingCriteria: z2.any()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [advRows] = await db.execute(sql5`SELECT tier FROM advertisers WHERE id = ${input.advertiserId}`);
      const advertiser = advRows[0];
      if (advertiser?.tier !== "enterprise") {
        throw new Error("Saved Audiences is an Enterprise-only feature");
      }
      await db.execute(sql5`
          INSERT INTO saved_audiences (advertiserId, name, description, targetingCriteria)
          VALUES (${input.advertiserId}, ${input.name}, ${input.description || ""}, ${JSON.stringify(input.targetingCriteria)})
        `);
      return { success: true };
    })
  }),
  // ============================================
  // CONSENT MANAGEMENT APIs
  // ============================================
  consent: router12({
    // Get current consent preferences
    getPreferences: publicProcedure.input(z2.object({ userId: z2.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [userRows] = await db.execute(sql5`
          SELECT behavioralConsent, marketingConsent, marketingFrequency, consentUpdatedAt
          FROM users WHERE id = ${input.userId}
        `);
      const user = userRows[0];
      if (!user) throw new Error("User not found");
      return {
        layer1Security: true,
        layer2Behavioral: user.behavioralConsent === 1,
        layer3Marketing: user.marketingConsent === 1,
        marketingFrequency: user.marketingFrequency || "off",
        lastUpdated: user.consentUpdatedAt
      };
    }),
    // Update consent preferences
    updatePreferences: publicProcedure.input(z2.object({
      userId: z2.number(),
      layer2Behavioral: z2.boolean(),
      layer3Marketing: z2.boolean(),
      marketingFrequency: z2.enum(["off", "low", "medium", "high"]).optional()
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const ipAddress = ctx.req?.headers?.["x-forwarded-for"]?.split(",")[0] || "unknown";
      const userAgent = ctx.req?.headers?.["user-agent"] || "unknown";
      const [currentRows] = await db.execute(sql5`
          SELECT behavioralConsent, marketingConsent FROM users WHERE id = ${input.userId}
        `);
      const current = currentRows[0];
      if (!current) throw new Error("User not found");
      if (current.behavioralConsent !== (input.layer2Behavioral ? 1 : 0)) {
        await db.execute(sql5`
            INSERT INTO user_consent_audit (userId, consentType, previousValue, newValue, ipAddress, userAgent, legalBasis)
            VALUES (${input.userId}, 'layer2_behavioral', ${current.behavioralConsent}, ${input.layer2Behavioral ? 1 : 0}, 
                    ${ipAddress}, ${userAgent}, 'GDPR Article 6(1)(a) - Consent')
          `);
      }
      if (current.marketingConsent !== (input.layer3Marketing ? 1 : 0)) {
        await db.execute(sql5`
            INSERT INTO user_consent_audit (userId, consentType, previousValue, newValue, ipAddress, userAgent, legalBasis)
            VALUES (${input.userId}, 'layer3_marketing', ${current.marketingConsent}, ${input.layer3Marketing ? 1 : 0},
                    ${ipAddress}, ${userAgent}, 'GDPR Article 6(1)(a) - Consent')
          `);
      }
      await db.execute(sql5`
          UPDATE users SET 
            behavioralConsent = ${input.layer2Behavioral ? 1 : 0},
            marketingConsent = ${input.layer3Marketing ? 1 : 0},
            marketingFrequency = ${input.marketingFrequency || "off"},
            consentUpdatedAt = NOW()
          WHERE id = ${input.userId}
        `);
      if (!input.layer2Behavioral && current.behavioralConsent === 1) {
        await db.execute(sql5`
            INSERT INTO data_deletion_requests (userId, requestType, status, retentionNote)
            VALUES (${input.userId}, 'behavioral_only', 'pending', 
                    'Consent withdrawn - behavioral data scheduled for deletion. KYC data retained per legal requirement.')
          `);
      }
      return {
        success: true,
        message: "Consent preferences updated successfully",
        redirectUrl: "/home",
        profileStrength: 30
      };
    })
  }),
  // ============================================
  // PROFILE TIER QUESTIONS APIs
  // ============================================
  profileTiers: router12({
    // Get questions for a specific tier
    getQuestions: publicProcedure.input(z2.object({
      tier: z2.enum(["tier1", "tier2", "tier3"]),
      userId: z2.number().optional()
    })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [questions] = await db.execute(sql5`
          SELECT id, questionKey, questionTextEn, questionTextAr, questionType, options, displayOrder
          FROM profile_tier_questions
          WHERE tier = ${input.tier} AND isActive = 1
          ORDER BY displayOrder ASC
        `);
      let answers = {};
      if (input.userId) {
        const [answerRows] = await db.execute(sql5`
            SELECT ptq.questionKey, upta.answerValue
            FROM user_profile_tier_answers upta
            JOIN profile_tier_questions ptq ON upta.questionId = ptq.id
            WHERE upta.userId = ${input.userId} AND ptq.tier = ${input.tier}
          `);
        answerRows.forEach((row) => {
          answers[row.questionKey] = row.answerValue;
        });
      }
      return {
        tier: input.tier,
        questions: questions.map((q) => ({
          ...q,
          options: typeof q.options === "string" ? JSON.parse(q.options) : q.options,
          currentAnswer: answers[q.questionKey] || null
        })),
        totalQuestions: questions.length
      };
    }),
    // Submit tier answers
    submitAnswers: publicProcedure.input(z2.object({
      userId: z2.number(),
      tier: z2.enum(["tier1", "tier2", "tier3"]),
      answers: z2.record(z2.string(), z2.any())
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [userRows] = await db.execute(sql5`
          SELECT behavioralConsent FROM users WHERE id = ${input.userId}
        `);
      const user = userRows[0];
      if (!user || user.behavioralConsent !== 1) {
        throw new Error("Behavioral consent required to complete profile questions");
      }
      for (const [questionKey, answerValue] of Object.entries(input.answers)) {
        const [questionRows] = await db.execute(sql5`
            SELECT id FROM profile_tier_questions WHERE questionKey = ${questionKey} AND tier = ${input.tier}
          `);
        const question = questionRows[0];
        if (question) {
          const value = typeof answerValue === "object" ? JSON.stringify(answerValue) : String(answerValue);
          await db.execute(sql5`
              INSERT INTO user_profile_tier_answers (userId, questionId, answerValue)
              VALUES (${input.userId}, ${question.id}, ${value})
              ON DUPLICATE KEY UPDATE answerValue = ${value}, updatedAt = NOW()
            `);
        }
      }
      const [tier1Count] = await db.execute(sql5`
          SELECT COUNT(*) as count FROM user_profile_tier_answers upta
          JOIN profile_tier_questions ptq ON upta.questionId = ptq.id
          WHERE upta.userId = ${input.userId} AND ptq.tier = 'tier1'
        `);
      const [tier2Count] = await db.execute(sql5`
          SELECT COUNT(*) as count FROM user_profile_tier_answers upta
          JOIN profile_tier_questions ptq ON upta.questionId = ptq.id
          WHERE upta.userId = ${input.userId} AND ptq.tier = 'tier2'
        `);
      const [tier3Count] = await db.execute(sql5`
          SELECT COUNT(*) as count FROM user_profile_tier_answers upta
          JOIN profile_tier_questions ptq ON upta.questionId = ptq.id
          WHERE upta.userId = ${input.userId} AND ptq.tier = 'tier3'
        `);
      const [kycStatus] = await db.execute(sql5`
          SELECT status FROM kyc_verifications WHERE userId = ${input.userId} AND status = 'approved' LIMIT 1
        `);
      const t1 = tier1Count[0]?.count || 0;
      const t2 = tier2Count[0]?.count || 0;
      const t3 = tier3Count[0]?.count || 0;
      const kycApproved = kycStatus.length > 0;
      let newTier = "bronze";
      let profileStrength = 30;
      if (t1 >= 8) {
        newTier = "silver";
        profileStrength = 50;
      }
      if (t1 >= 8 && t2 >= 10) {
        newTier = "gold";
        profileStrength = 60;
      }
      if (t1 >= 8 && t2 >= 10 && t3 >= 10) {
        newTier = "platinum";
        profileStrength = 70;
      }
      if (t1 >= 8 && t2 >= 10 && t3 >= 10 && kycApproved) {
        newTier = "elite";
        profileStrength = 100;
      }
      await db.execute(sql5`
          UPDATE users SET profileTier = ${newTier}, profileStrength = ${profileStrength}
          WHERE id = ${input.userId}
        `);
      return { success: true, profileStrength, tier: newTier };
    }),
    // Get completion status
    getCompletionStatus: publicProcedure.input(z2.object({ userId: z2.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [userRows] = await db.execute(sql5`
          SELECT profileTier, profileStrength, behavioralConsent, marketingConsent
          FROM users WHERE id = ${input.userId}
        `);
      const user = userRows[0];
      if (!user) throw new Error("User not found");
      const [tier1] = await db.execute(sql5`
          SELECT COUNT(*) as count FROM user_profile_tier_answers upta
          JOIN profile_tier_questions ptq ON upta.questionId = ptq.id
          WHERE upta.userId = ${input.userId} AND ptq.tier = 'tier1'
        `);
      const [tier2] = await db.execute(sql5`
          SELECT COUNT(*) as count FROM user_profile_tier_answers upta
          JOIN profile_tier_questions ptq ON upta.questionId = ptq.id
          WHERE upta.userId = ${input.userId} AND ptq.tier = 'tier2'
        `);
      const [tier3] = await db.execute(sql5`
          SELECT COUNT(*) as count FROM user_profile_tier_answers upta
          JOIN profile_tier_questions ptq ON upta.questionId = ptq.id
          WHERE upta.userId = ${input.userId} AND ptq.tier = 'tier3'
        `);
      const [kycRows] = await db.execute(sql5`
          SELECT status FROM kyc_verifications WHERE userId = ${input.userId} ORDER BY submittedAt DESC LIMIT 1
        `);
      const [incomeRows] = await db.execute(sql5`
          SELECT incomeRange FROM user_income_spi WHERE userId = ${input.userId}
        `);
      return {
        currentTier: user.profileTier,
        profileStrength: user.profileStrength,
        behavioralConsentEnabled: user.behavioralConsent === 1,
        marketingConsentEnabled: user.marketingConsent === 1,
        tier1: { completed: tier1[0]?.count || 0, total: 8, isComplete: tier1[0]?.count >= 8 },
        tier2: { completed: tier2[0]?.count || 0, total: 10, isComplete: tier2[0]?.count >= 10 },
        tier3: { completed: tier3[0]?.count || 0, total: 10, isComplete: tier3[0]?.count >= 10 },
        kyc: { status: kycRows[0]?.status || "not_started", isComplete: kycRows[0]?.status === "approved" },
        income: { provided: incomeRows.length > 0 }
      };
    })
  }),
  // ============================================
  // INCOME SPI APIs
  // ============================================
  incomeSpi: router12({
    submit: publicProcedure.input(z2.object({
      userId: z2.number(),
      incomeRange: z2.enum(["under_3000", "3000_5000", "5000_10000", "10000_20000", "20000_50000", "over_50000", "prefer_not_to_say"]),
      spiConsentCheckboxes: z2.object({
        dataUsageAcknowledged: z2.boolean(),
        thirdPartyShareConsent: z2.boolean(),
        retentionAcknowledged: z2.boolean()
      })
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      if (!input.spiConsentCheckboxes.dataUsageAcknowledged || !input.spiConsentCheckboxes.thirdPartyShareConsent || !input.spiConsentCheckboxes.retentionAcknowledged) {
        throw new Error("All consent checkboxes must be checked");
      }
      const ipAddress = ctx.req?.headers?.["x-forwarded-for"]?.split(",")[0] || "unknown";
      const expiresAt = /* @__PURE__ */ new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 3);
      await db.execute(sql5`
          INSERT INTO user_income_spi (userId, incomeRange, spiConsentGiven, spiConsentTimestamp, spiConsentIp,
            dataUsageAcknowledged, thirdPartyShareConsent, retentionAcknowledged, expiresAt)
          VALUES (${input.userId}, ${input.incomeRange}, 1, NOW(), ${ipAddress}, 1, 1, 1, ${expiresAt.toISOString().split("T")[0]})
          ON DUPLICATE KEY UPDATE incomeRange = ${input.incomeRange}, spiConsentGiven = 1, spiConsentTimestamp = NOW()
        `);
      await db.execute(sql5`
          INSERT INTO user_consent_audit (userId, consentType, previousValue, newValue, ipAddress, legalBasis)
          VALUES (${input.userId}, 'income_spi', 0, 1, ${ipAddress}, 'GDPR Article 9(2)(a) - Explicit consent for SPI')
        `);
      return { success: true, message: "Income data saved (optional)" };
    }),
    get: publicProcedure.input(z2.object({ userId: z2.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [rows] = await db.execute(sql5`
          SELECT incomeRange, spiConsentGiven, spiConsentTimestamp, expiresAt
          FROM user_income_spi WHERE userId = ${input.userId}
        `);
      return rows[0] || null;
    }),
    delete: publicProcedure.input(z2.object({ userId: z2.number() })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const ipAddress = ctx.req?.headers?.["x-forwarded-for"]?.split(",")[0] || "unknown";
      await db.execute(sql5`DELETE FROM user_income_spi WHERE userId = ${input.userId}`);
      await db.execute(sql5`
          INSERT INTO user_consent_audit (userId, consentType, previousValue, newValue, ipAddress, legalBasis)
          VALUES (${input.userId}, 'income_spi', 1, 0, ${ipAddress}, 'User requested deletion')
        `);
      return { success: true };
    })
  }),
  // ============================================
  // PRIVACY & DATA RIGHTS APIs
  // ============================================
  privacy: router12({
    getMyData: publicProcedure.input(z2.object({ userId: z2.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [userRows] = await db.execute(sql5`
          SELECT id, name, email, phone, gender, governorate, profileTier, profileStrength,
            behavioralConsent, marketingConsent, createdAt, lastSignedIn
          FROM users WHERE id = ${input.userId}
        `);
      const [profileRows] = await db.execute(sql5`
          SELECT ptq.tier, ptq.questionKey, ptq.questionTextEn, upta.answerValue
          FROM user_profile_tier_answers upta
          JOIN profile_tier_questions ptq ON upta.questionId = ptq.id
          WHERE upta.userId = ${input.userId}
        `);
      const [incomeRows] = await db.execute(sql5`
          SELECT incomeRange, spiConsentGiven FROM user_income_spi WHERE userId = ${input.userId}
        `);
      const [kycRows] = await db.execute(sql5`
          SELECT status, nameVerified, ageVerified, addressVerified, verifiedAt
          FROM kyc_verifications WHERE userId = ${input.userId} ORDER BY submittedAt DESC LIMIT 1
        `);
      return {
        personalInfo: userRows[0] || null,
        profileData: {
          tier1Responses: profileRows.filter((r) => r.tier === "tier1"),
          tier2Responses: profileRows.filter((r) => r.tier === "tier2"),
          tier3Responses: profileRows.filter((r) => r.tier === "tier3")
        },
        incomeData: incomeRows[0] || null,
        kycData: kycRows[0] || null
      };
    }),
    requestExport: publicProcedure.input(z2.object({ userId: z2.number(), format: z2.enum(["json", "csv"]).default("json") })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const downloadToken = __require("crypto").randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 3600 * 1e3);
      await db.execute(sql5`
          INSERT INTO data_export_requests (userId, exportFormat, status, downloadToken, expiresAt)
          VALUES (${input.userId}, ${input.format}, 'ready', ${downloadToken}, ${expiresAt.toISOString()})
        `);
      return { success: true, downloadUrl: `/api/v1/privacy/download/${downloadToken}`, expiresIn: 3600 };
    }),
    requestDeletion: publicProcedure.input(z2.object({
      userId: z2.number(),
      dataType: z2.enum(["behavioral_only", "income_only", "full_account"]),
      confirmationText: z2.string()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      if (input.confirmationText !== "DELETE") {
        throw new Error("Please type DELETE to confirm");
      }
      const ticketId = `DEL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      await db.execute(sql5`
          INSERT INTO data_deletion_requests (userId, requestType, status, ticketId, retentionNote)
          VALUES (${input.userId}, ${input.dataType}, 'pending', ${ticketId},
            'KYC data retained 5-7 years per AML/CBE requirements')
        `);
      if (input.dataType === "behavioral_only") {
        await db.execute(sql5`DELETE FROM user_profile_tier_answers WHERE userId = ${input.userId}`);
        await db.execute(sql5`DELETE FROM user_income_spi WHERE userId = ${input.userId}`);
        await db.execute(sql5`
            UPDATE users SET behavioralConsent = 0, profileTier = 'bronze', profileStrength = 30
            WHERE id = ${input.userId}
          `);
        await db.execute(sql5`
            UPDATE data_deletion_requests SET status = 'completed', completedAt = NOW()
            WHERE ticketId = ${ticketId}
          `);
      }
      return { success: true, ticketId, estimatedCompletion: "30 days", dpoContact: "dpo@taskkash.com" };
    })
  }),
  // ============================================
  // KYC VERIFICATION APIs
  // ============================================
  kyc: router12({
    startVerification: publicProcedure.input(z2.object({
      userId: z2.number(),
      method: z2.enum(["biometric_fast", "id_only_standard"]),
      biometricConsent: z2.boolean().optional()
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      if (input.method === "biometric_fast" && !input.biometricConsent) {
        throw new Error("Biometric consent required for fast verification");
      }
      const ipAddress = ctx.req?.headers?.["x-forwarded-for"]?.split(",")[0] || "unknown";
      const [result] = await db.execute(sql5`
          INSERT INTO kyc_verifications (userId, verificationMethod, status, biometricConsentGiven, biometricConsentTimestamp)
          VALUES (${input.userId}, ${input.method}, 'pending', ${input.biometricConsent ? 1 : 0}, ${input.biometricConsent ? sql5`NOW()` : null})
        `);
      if (input.biometricConsent) {
        await db.execute(sql5`
            INSERT INTO user_consent_audit (userId, consentType, previousValue, newValue, ipAddress, legalBasis)
            VALUES (${input.userId}, 'kyc_biometric', 0, 1, ${ipAddress}, 'GDPR Article 9(2)(a) - Explicit consent for biometric')
          `);
      }
      return { success: true, verificationId: result.insertId, nextStep: "/upload-id" };
    }),
    uploadId: publicProcedure.input(z2.object({
      userId: z2.number(),
      verificationId: z2.number(),
      idFrontImage: z2.string(),
      idBackImage: z2.string().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const mockOcrData = { name: "User Name", dob: "1990-01-01", gender: "male", address: "Cairo, Egypt" };
      await db.execute(sql5`
          UPDATE kyc_verifications SET
            idFrontImagePath = ${`/secure/kyc/${input.userId}/id_front.jpg`},
            idBackImagePath = ${input.idBackImage ? `/secure/kyc/${input.userId}/id_back.jpg` : null},
            extractedName = ${mockOcrData.name},
            extractedDob = ${mockOcrData.dob},
            extractedGender = ${mockOcrData.gender},
            extractedAddress = ${mockOcrData.address},
            status = 'processing'
          WHERE id = ${input.verificationId}
        `);
      const [verificationRows] = await db.execute(sql5`
          SELECT verificationMethod FROM kyc_verifications WHERE id = ${input.verificationId}
        `);
      return {
        success: true,
        ocrData: mockOcrData,
        nextStep: verificationRows[0]?.verificationMethod === "biometric_fast" ? "/upload-selfie" : null
      };
    }),
    uploadSelfie: publicProcedure.input(z2.object({
      userId: z2.number(),
      verificationId: z2.number(),
      selfieImage: z2.string(),
      livenessData: z2.object({ blink: z2.boolean(), turnHead: z2.boolean() })
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const scheduledDeletion = new Date(Date.now() + 24 * 60 * 60 * 1e3);
      await db.execute(sql5`
          UPDATE kyc_verifications SET
            selfieImagePath = ${`/secure/kyc/${input.userId}/selfie.jpg`},
            livenessCheckPassed = ${input.livenessData.blink && input.livenessData.turnHead ? 1 : 0},
            livenessData = ${JSON.stringify(input.livenessData)},
            biometricScheduledDeletion = ${scheduledDeletion.toISOString()},
            status = 'processing'
          WHERE id = ${input.verificationId}
        `);
      return { success: true, verificationStatus: "processing" };
    }),
    getStatus: publicProcedure.input(z2.object({ userId: z2.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [rows] = await db.execute(sql5`
          SELECT status, verificationMethod, nameVerified, ageVerified, addressVerified,
            verifiedAt, rejectionReason, biometricDeleted
          FROM kyc_verifications WHERE userId = ${input.userId}
          ORDER BY submittedAt DESC LIMIT 1
        `);
      const verification = rows[0];
      if (!verification) {
        return { status: "not_started", profileStrength: 70, canWithdraw: false };
      }
      return {
        status: verification.status,
        verifiedAt: verification.verifiedAt,
        kycData: {
          nameVerified: verification.nameVerified === 1,
          ageVerified: verification.ageVerified === 1,
          addressVerified: verification.addressVerified === 1
        },
        profileStrength: verification.status === "approved" ? 100 : 70,
        canWithdraw: verification.status === "approved",
        biometricDeleted: verification.biometricDeleted === 1
      };
    }),
    // Approve KYC (admin only - for testing)
    approveVerification: publicProcedure.input(z2.object({ verificationId: z2.number(), userId: z2.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const retentionExpires = /* @__PURE__ */ new Date();
      retentionExpires.setFullYear(retentionExpires.getFullYear() + 7);
      await db.execute(sql5`
          UPDATE kyc_verifications SET
            status = 'approved',
            nameVerified = 1,
            ageVerified = 1,
            addressVerified = 1,
            documentAuthentic = 1,
            verifiedAt = NOW(),
            retentionExpiresAt = ${retentionExpires.toISOString().split("T")[0]}
          WHERE id = ${input.verificationId}
        `);
      await db.execute(sql5`
          UPDATE users SET profileTier = 'elite', profileStrength = 100
          WHERE id = ${input.userId}
        `);
      return { success: true };
    })
  }),
  // =====================================================
  // SURVEY FRAMEWORK ROUTES
  // =====================================================
  surveyManagement: router12({
    // Get pricing tiers
    getPricingTiers: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.execute(sql5`
        SELECT * FROM survey_pricing_tiers WHERE isActive = TRUE ORDER BY minPricePerComplete ASC
      `);
      return result[0] || [];
    }),
    // Create new survey
    createSurvey: publicProcedure.input(z2.object({
      advertiserId: z2.number(),
      title: z2.string().min(3).max(255),
      titleAr: z2.string().optional(),
      description: z2.string().optional(),
      descriptionAr: z2.string().optional(),
      serviceTier: z2.enum(["basic", "professional", "enterprise", "custom"]),
      estimatedDuration: z2.number().min(1).max(60).optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.execute(sql5`
          INSERT INTO surveys (advertiserId, title, titleAr, description, descriptionAr, serviceTier, estimatedDuration, status)
          VALUES (${input.advertiserId}, ${input.title}, ${input.titleAr || null}, ${input.description || null}, 
                  ${input.descriptionAr || null}, ${input.serviceTier}, ${input.estimatedDuration || 5}, 'draft')
        `);
      const newSurvey = await db.execute(sql5`SELECT LAST_INSERT_ID() as id`);
      const surveyId = newSurvey[0][0].id;
      return { success: true, surveyId, message: "Survey created successfully" };
    }),
    // Get survey by ID
    getSurvey: publicProcedure.input(z2.object({ surveyId: z2.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const survey = await db.execute(sql5`
          SELECT s.*, (SELECT COUNT(*) FROM survey_questions_new WHERE surveyId = s.id) as questionCount
          FROM surveys s WHERE s.id = ${input.surveyId}
        `);
      if (survey[0]?.length === 0) throw new Error("Survey not found");
      const questions = await db.execute(sql5`
          SELECT * FROM survey_questions_new WHERE surveyId = ${input.surveyId} ORDER BY questionOrder ASC
        `);
      return { survey: survey[0][0], questions: questions[0] || [] };
    }),
    // Get all surveys for advertiser
    getAdvertiserSurveys: publicProcedure.input(z2.object({ advertiserId: z2.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const surveys = await db.execute(sql5`
          SELECT s.*,
                 (SELECT COUNT(*) FROM survey_questions_new WHERE surveyId = s.id) as questionCount,
                 (SELECT COUNT(*) FROM survey_campaigns WHERE surveyId = s.id) as campaignCount,
                 (SELECT SUM(currentCompletions) FROM survey_campaigns WHERE surveyId = s.id) as totalCompletions
          FROM surveys s WHERE s.advertiserId = ${input.advertiserId} ORDER BY s.createdAt DESC
        `);
      return surveys[0] || [];
    }),
    // Add question to survey
    addQuestion: publicProcedure.input(z2.object({
      surveyId: z2.number(),
      questionText: z2.string().min(5),
      questionTextAr: z2.string().optional(),
      questionType: z2.enum(["single_choice", "multiple_choice", "open_text", "rating_scale", "nps", "matrix", "ranking", "slider"]),
      options: z2.array(z2.object({ text: z2.string(), value: z2.string().optional() })).optional(),
      optionsAr: z2.array(z2.object({ text: z2.string(), value: z2.string().optional() })).optional(),
      isRequired: z2.boolean().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const orderResult = await db.execute(sql5`
          SELECT COALESCE(MAX(questionOrder), 0) + 1 as nextOrder FROM survey_questions_new WHERE surveyId = ${input.surveyId}
        `);
      const nextOrder = orderResult[0][0].nextOrder;
      await db.execute(sql5`
          INSERT INTO survey_questions_new (surveyId, questionText, questionTextAr, questionType, options, optionsAr, questionOrder, isRequired)
          VALUES (${input.surveyId}, ${input.questionText}, ${input.questionTextAr || null}, ${input.questionType},
                  ${input.options ? JSON.stringify(input.options) : null}, ${input.optionsAr ? JSON.stringify(input.optionsAr) : null},
                  ${nextOrder}, ${input.isRequired !== false})
        `);
      await db.execute(sql5`
          UPDATE surveys SET totalQuestions = (SELECT COUNT(*) FROM survey_questions_new WHERE surveyId = ${input.surveyId}) WHERE id = ${input.surveyId}
        `);
      return { success: true, message: "Question added successfully" };
    }),
    // Delete question
    deleteQuestion: publicProcedure.input(z2.object({ questionId: z2.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const question = await db.execute(sql5`SELECT surveyId FROM survey_questions_new WHERE id = ${input.questionId}`);
      const surveyId = question[0]?.[0]?.surveyId;
      await db.execute(sql5`DELETE FROM survey_questions_new WHERE id = ${input.questionId}`);
      if (surveyId) {
        await db.execute(sql5`
            UPDATE surveys SET totalQuestions = (SELECT COUNT(*) FROM survey_questions_new WHERE surveyId = ${surveyId}) WHERE id = ${surveyId}
          `);
      }
      return { success: true, message: "Question deleted successfully" };
    }),
    // Create campaign
    createCampaign: publicProcedure.input(z2.object({
      surveyId: z2.number(),
      campaignName: z2.string().min(3),
      serviceTier: z2.enum(["basic", "professional", "enterprise", "custom"]),
      pricePerComplete: z2.number().min(8),
      userReward: z2.number().min(5),
      totalBudget: z2.number().min(100),
      targetCompletions: z2.number().min(10),
      targetAgeMin: z2.number().optional(),
      targetAgeMax: z2.number().optional(),
      targetGender: z2.enum(["all", "male", "female"]).optional(),
      targetLocations: z2.array(z2.string()).optional(),
      targetProfileTiers: z2.array(z2.string()).optional(),
      requireKycVerification: z2.boolean().optional(),
      minCompletionTime: z2.number().optional(),
      startDate: z2.string().optional(),
      endDate: z2.string().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.execute(sql5`
          INSERT INTO survey_campaigns (
            surveyId, campaignName, status, serviceTier, pricePerComplete, userReward, 
            totalBudget, targetCompletions, targetAgeMin, targetAgeMax, targetGender,
            targetLocations, targetProfileTiers, requireKycVerification, minCompletionTime,
            startDate, endDate
          ) VALUES (
            ${input.surveyId}, ${input.campaignName}, 'active', ${input.serviceTier},
            ${input.pricePerComplete}, ${input.userReward}, ${input.totalBudget}, ${input.targetCompletions},
            ${input.targetAgeMin || null}, ${input.targetAgeMax || null}, ${input.targetGender || "all"},
            ${input.targetLocations ? JSON.stringify(input.targetLocations) : null},
            ${input.targetProfileTiers ? JSON.stringify(input.targetProfileTiers) : null},
            ${input.requireKycVerification || false}, ${input.minCompletionTime || 60},
            ${input.startDate || null}, ${input.endDate || null}
          )
        `);
      const newCampaign = await db.execute(sql5`SELECT LAST_INSERT_ID() as id`);
      const campaignId = newCampaign[0][0].id;
      await db.execute(sql5`UPDATE surveys SET status = 'active' WHERE id = ${input.surveyId}`);
      return { success: true, campaignId, message: "Campaign created and activated" };
    }),
    // Get campaign analytics
    getCampaignAnalytics: publicProcedure.input(z2.object({ campaignId: z2.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const stats = await db.execute(sql5`
          SELECT COUNT(*) as totalResponses,
                 SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedResponses,
                 AVG(timeSpentSeconds) as avgTimeSpent,
                 AVG(qualityScore) as avgQualityScore
          FROM survey_responses_new WHERE campaignId = ${input.campaignId}
        `);
      const dailyStats = await db.execute(sql5`
          SELECT DATE(completedAt) as date, COUNT(*) as completions, AVG(timeSpentSeconds) as avgTime
          FROM survey_responses_new WHERE campaignId = ${input.campaignId} AND status = 'completed'
          GROUP BY DATE(completedAt) ORDER BY date DESC LIMIT 30
        `);
      return { overview: stats[0]?.[0] || {}, dailyStats: dailyStats[0] || [] };
    }),
    // Get survey results
    getSurveyResults: publicProcedure.input(z2.object({ surveyId: z2.number(), campaignId: z2.number().optional() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const questions = await db.execute(sql5`
          SELECT * FROM survey_questions_new WHERE surveyId = ${input.surveyId} ORDER BY questionOrder
        `);
      const results = [];
      for (const question of questions[0] || []) {
        let answerStats;
        if (question.questionType === "single_choice" || question.questionType === "multiple_choice") {
          answerStats = await db.execute(sql5`
              SELECT JSON_UNQUOTE(answerValue) as answer, COUNT(*) as count
              FROM survey_answers sa JOIN survey_responses_new sr ON sa.responseId = sr.id
              WHERE sa.questionId = ${question.id} AND sr.status = 'completed'
              GROUP BY JSON_UNQUOTE(answerValue)
            `);
        } else if (question.questionType === "rating_scale" || question.questionType === "nps") {
          answerStats = await db.execute(sql5`
              SELECT AVG(CAST(JSON_UNQUOTE(answerValue) AS DECIMAL)) as average, COUNT(*) as count
              FROM survey_answers sa JOIN survey_responses_new sr ON sa.responseId = sr.id
              WHERE sa.questionId = ${question.id} AND sr.status = 'completed'
            `);
        } else {
          answerStats = await db.execute(sql5`
              SELECT JSON_UNQUOTE(answerValue) as answer FROM survey_answers sa
              JOIN survey_responses_new sr ON sa.responseId = sr.id
              WHERE sa.questionId = ${question.id} AND sr.status = 'completed'
              ORDER BY sa.answeredAt DESC LIMIT 50
            `);
        }
        results.push({ question, stats: answerStats[0] || [] });
      }
      return results;
    })
  }),
  // =====================================================
  // USER SURVEY TAKING
  // =====================================================
  userSurvey: router12({
    // Get available surveys for user
    getAvailableSurveys: publicProcedure.input(z2.object({ userId: z2.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const userProfile = await db.execute(sql5`
          SELECT id, profileTier, gender, governorate, dateOfBirth FROM users WHERE id = ${input.userId}
        `);
      const user = userProfile[0]?.[0];
      if (!user) throw new Error("User not found");
      const surveys = await db.execute(sql5`
          SELECT c.id as campaignId, s.id as surveyId, s.title, s.titleAr, s.description, s.descriptionAr,
                 s.estimatedDuration, s.totalQuestions, c.userReward, c.serviceTier
          FROM survey_campaigns c
          JOIN surveys s ON c.surveyId = s.id
          WHERE c.status = 'active'
            AND c.currentCompletions < c.targetCompletions
            AND (c.startDate IS NULL OR c.startDate <= NOW())
            AND (c.endDate IS NULL OR c.endDate >= NOW())
            AND NOT EXISTS (SELECT 1 FROM survey_responses_new WHERE surveyId = s.id AND userId = ${input.userId})
          ORDER BY c.userReward DESC LIMIT 20
        `);
      return surveys[0] || [];
    }),
    // Start survey
    startSurvey: publicProcedure.input(z2.object({ userId: z2.number(), surveyId: z2.number(), campaignId: z2.number(), deviceType: z2.string().optional() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const existing = await db.execute(sql5`
          SELECT id, status FROM survey_responses_new WHERE surveyId = ${input.surveyId} AND userId = ${input.userId}
        `);
      if (existing[0]?.length > 0) {
        const existingResponse = existing[0][0];
        if (existingResponse.status === "completed") throw new Error("You have already completed this survey");
        return { responseId: existingResponse.id, resumed: true };
      }
      await db.execute(sql5`
          INSERT INTO survey_responses_new (surveyId, userId, campaignId, status, deviceType)
          VALUES (${input.surveyId}, ${input.userId}, ${input.campaignId}, 'in_progress', ${input.deviceType || "unknown"})
        `);
      const newResponse = await db.execute(sql5`SELECT LAST_INSERT_ID() as id`);
      const responseId = newResponse[0][0].id;
      const questions = await db.execute(sql5`
          SELECT id, questionText, questionTextAr, questionType, options, optionsAr, questionOrder, isRequired, mediaUrl
          FROM survey_questions_new WHERE surveyId = ${input.surveyId} ORDER BY questionOrder ASC
        `);
      return { responseId, resumed: false, questions: questions[0] || [] };
    }),
    // Submit answer
    submitAnswer: publicProcedure.input(z2.object({
      responseId: z2.number(),
      questionId: z2.number(),
      answerValue: z2.any(),
      timeSpentSeconds: z2.number().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const existing = await db.execute(sql5`
          SELECT id FROM survey_answers WHERE responseId = ${input.responseId} AND questionId = ${input.questionId}
        `);
      if (existing[0]?.length > 0) {
        await db.execute(sql5`
            UPDATE survey_answers SET answerValue = ${JSON.stringify(input.answerValue)}, 
                   timeSpentSeconds = ${input.timeSpentSeconds || 0}, answeredAt = NOW()
            WHERE responseId = ${input.responseId} AND questionId = ${input.questionId}
          `);
      } else {
        await db.execute(sql5`
            INSERT INTO survey_answers (responseId, questionId, answerValue, timeSpentSeconds)
            VALUES (${input.responseId}, ${input.questionId}, ${JSON.stringify(input.answerValue)}, ${input.timeSpentSeconds || 0})
          `);
      }
      return { success: true };
    }),
    // Complete survey
    completeSurvey: publicProcedure.input(z2.object({ userId: z2.number(), responseId: z2.number(), totalTimeSeconds: z2.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const response = await db.execute(sql5`
          SELECT sr.*, c.userReward, c.minCompletionTime, c.id as campaignId
          FROM survey_responses_new sr JOIN survey_campaigns c ON sr.campaignId = c.id
          WHERE sr.id = ${input.responseId} AND sr.userId = ${input.userId}
        `);
      if (response[0]?.length === 0) throw new Error("Survey response not found");
      const resp = response[0][0];
      if (input.totalTimeSeconds < (resp.minCompletionTime || 60)) {
        await db.execute(sql5`
            UPDATE survey_responses_new SET status = 'disqualified', completedAt = NOW(), timeSpentSeconds = ${input.totalTimeSeconds}
            WHERE id = ${input.responseId}
          `);
        await db.execute(sql5`UPDATE survey_campaigns SET disqualifiedCount = disqualifiedCount + 1 WHERE id = ${resp.campaignId}`);
        throw new Error("Survey completed too quickly. Your response has been disqualified.");
      }
      const qualityScore = 0.85;
      await db.execute(sql5`
          UPDATE survey_responses_new SET status = 'completed', completedAt = NOW(), 
                 timeSpentSeconds = ${input.totalTimeSeconds}, qualityScore = ${qualityScore}
          WHERE id = ${input.responseId}
        `);
      await db.execute(sql5`UPDATE survey_campaigns SET currentCompletions = currentCompletions + 1 WHERE id = ${resp.campaignId}`);
      const userReward = resp.userReward;
      await db.execute(sql5`UPDATE users SET balance = balance + ${userReward} WHERE id = ${input.userId}`);
      await db.execute(sql5`
          INSERT INTO transactions (userId, type, amount, description, status)
          VALUES (${input.userId}, 'survey_reward', ${userReward}, 'Survey completion reward', 'completed')
        `);
      return { success: true, reward: userReward, qualityScore, message: "Survey completed! You earned " + userReward + " EGP" };
    }),
    // Get survey history
    getSurveyHistory: publicProcedure.input(z2.object({ userId: z2.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const history = await db.execute(sql5`
          SELECT sr.id as responseId, sr.status, sr.startedAt, sr.completedAt, sr.timeSpentSeconds, sr.qualityScore,
                 s.title, s.titleAr, c.userReward
          FROM survey_responses_new sr
          JOIN surveys s ON sr.surveyId = s.id
          JOIN survey_campaigns c ON sr.campaignId = c.id
          WHERE sr.userId = ${input.userId}
          ORDER BY sr.startedAt DESC LIMIT 50
        `);
      return history[0] || [];
    })
  }),
  // =====================================================
  // VOTE MANAGEMENT ROUTES (Advertiser)
  // =====================================================
  "voteManagement.getPricingTiers": protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const tiers = await db.execute(sql5`
      SELECT id, tierName, displayName, displayNameAr, description, descriptionAr,
             minPricePerVote, maxPricePerVote, defaultUserReward,
             minQuestions, maxQuestions, minOptions, maxOptions, features
      FROM vote_pricing_tiers WHERE isActive = TRUE ORDER BY minPricePerVote ASC
    `);
    return tiers[0] || [];
  }),
  "voteManagement.createVote": protectedProcedure.input(z2.object({
    pricingTierId: z2.number(),
    title: z2.string().min(1),
    titleAr: z2.string().optional(),
    description: z2.string().optional(),
    descriptionAr: z2.string().optional(),
    category: z2.string().optional(),
    estimatedDuration: z2.number().default(2),
    successThreshold: z2.number().default(60)
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.execute(sql5`
        INSERT INTO votes (advertiserId, pricingTierId, title, titleAr, description, descriptionAr, category, estimatedDuration, successThreshold)
        VALUES (${ctx.user.id}, ${input.pricingTierId}, ${input.title}, ${input.titleAr || null}, ${input.description || null}, ${input.descriptionAr || null}, ${input.category || null}, ${input.estimatedDuration}, ${input.successThreshold})
      `);
    return { voteId: result[0].insertId, message: "Vote created successfully" };
  }),
  "voteManagement.getVote": protectedProcedure.input(z2.object({ voteId: z2.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const votes = await db.execute(sql5`
        SELECT v.*, vpt.tierName, vpt.displayName as tierDisplayName, vpt.features
        FROM votes v JOIN vote_pricing_tiers vpt ON v.pricingTierId = vpt.id WHERE v.id = ${input.voteId}
      `);
    if (!votes[0]?.length) return null;
    const vote = votes[0][0];
    const questions = await db.execute(sql5`SELECT * FROM vote_questions WHERE voteId = ${input.voteId} ORDER BY questionOrder ASC`);
    vote.questions = questions[0] || [];
    for (const q of vote.questions) {
      const options = await db.execute(sql5`SELECT * FROM vote_options WHERE questionId = ${q.id} ORDER BY optionOrder ASC`);
      q.options = options[0] || [];
    }
    return vote;
  }),
  "voteManagement.getAdvertiserVotes": protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const votes = await db.execute(sql5`
      SELECT v.*, vpt.displayName as tierDisplayName,
             (SELECT COUNT(*) FROM vote_campaigns WHERE voteId = v.id) as campaignCount,
             (SELECT COALESCE(SUM(completedVotes), 0) FROM vote_campaigns WHERE voteId = v.id) as totalVotes
      FROM votes v JOIN vote_pricing_tiers vpt ON v.pricingTierId = vpt.id
      WHERE v.advertiserId = ${ctx.user.id} ORDER BY v.createdAt DESC
    `);
    return votes[0] || [];
  }),
  "voteManagement.addQuestion": protectedProcedure.input(z2.object({
    voteId: z2.number(),
    questionType: z2.enum(["single_choice", "multiple_choice", "ranking", "slider"]).default("single_choice"),
    questionText: z2.string().min(1),
    questionTextAr: z2.string().optional(),
    sectionTitle: z2.string().optional(),
    sectionTitleAr: z2.string().optional(),
    successThreshold: z2.number().optional(),
    maxSelections: z2.number().default(1),
    options: z2.array(z2.object({
      optionText: z2.string().min(1),
      optionTextAr: z2.string().optional(),
      imageUrl: z2.string().optional()
    })).min(2)
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const countResult = await db.execute(sql5`SELECT COUNT(*) as count FROM vote_questions WHERE voteId = ${input.voteId}`);
    const questionOrder = (countResult[0][0]?.count || 0) + 1;
    const questionResult = await db.execute(sql5`
        INSERT INTO vote_questions (voteId, questionOrder, questionType, questionText, questionTextAr, sectionTitle, sectionTitleAr, successThreshold, maxSelections)
        VALUES (${input.voteId}, ${questionOrder}, ${input.questionType}, ${input.questionText}, ${input.questionTextAr || null}, ${input.sectionTitle || null}, ${input.sectionTitleAr || null}, ${input.successThreshold || null}, ${input.maxSelections})
      `);
    const questionId = questionResult[0].insertId;
    for (let i = 0; i < input.options.length; i++) {
      const opt = input.options[i];
      await db.execute(sql5`
          INSERT INTO vote_options (questionId, optionOrder, optionText, optionTextAr, imageUrl)
          VALUES (${questionId}, ${i + 1}, ${opt.optionText}, ${opt.optionTextAr || null}, ${opt.imageUrl || null})
        `);
    }
    await db.execute(sql5`UPDATE votes SET totalQuestions = totalQuestions + 1 WHERE id = ${input.voteId}`);
    return { questionId, message: "Question added successfully" };
  }),
  "voteManagement.updateOptionImage": protectedProcedure.input(z2.object({ optionId: z2.number(), imageUrl: z2.string() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.execute(sql5`UPDATE vote_options SET imageUrl = ${input.imageUrl} WHERE id = ${input.optionId}`);
    return { message: "Option image updated successfully" };
  }),
  "voteManagement.deleteQuestion": protectedProcedure.input(z2.object({ questionId: z2.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const questions = await db.execute(sql5`SELECT voteId FROM vote_questions WHERE id = ${input.questionId}`);
    if (questions[0]?.length) {
      const voteId = questions[0][0].voteId;
      await db.execute(sql5`DELETE FROM vote_questions WHERE id = ${input.questionId}`);
      await db.execute(sql5`UPDATE votes SET totalQuestions = totalQuestions - 1 WHERE id = ${voteId}`);
    }
    return { message: "Question deleted successfully" };
  }),
  "voteManagement.createCampaign": protectedProcedure.input(z2.object({
    voteId: z2.number(),
    campaignName: z2.string().min(1),
    totalBudget: z2.number().min(1),
    pricePerVote: z2.number().min(1),
    userReward: z2.number().min(1),
    targetVotes: z2.number().min(1),
    targetAgeMin: z2.number().optional(),
    targetAgeMax: z2.number().optional(),
    targetGender: z2.enum(["all", "male", "female"]).default("all"),
    requireKyc: z2.boolean().default(false)
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.execute(sql5`
        INSERT INTO vote_campaigns (voteId, campaignName, totalBudget, pricePerVote, userReward, targetVotes,
                                   targetAgeMin, targetAgeMax, targetGender, requireKyc, status)
        VALUES (${input.voteId}, ${input.campaignName}, ${input.totalBudget}, ${input.pricePerVote}, ${input.userReward}, ${input.targetVotes},
                ${input.targetAgeMin || null}, ${input.targetAgeMax || null}, ${input.targetGender}, ${input.requireKyc}, 'active')
      `);
    await db.execute(sql5`UPDATE votes SET status = 'active' WHERE id = ${input.voteId}`);
    return { campaignId: result[0].insertId, message: "Campaign created and launched successfully" };
  }),
  "voteManagement.getCampaignAnalytics": protectedProcedure.input(z2.object({ campaignId: z2.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const campaigns2 = await db.execute(sql5`
        SELECT vc.*, v.title, v.titleAr FROM vote_campaigns vc JOIN votes v ON vc.voteId = v.id WHERE vc.id = ${input.campaignId}
      `);
    if (!campaigns2[0]?.length) return null;
    return campaigns2[0][0];
  }),
  // =====================================================
  // USER VOTE ROUTES
  // =====================================================
  "userVote.getAvailableVotes": protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const userId = ctx.user.id;
    const votes = await db.execute(sql5`
      SELECT v.id as voteId, v.title, v.titleAr, v.description, v.descriptionAr,
             v.estimatedDuration, v.totalQuestions, v.category,
             vc.id as campaignId, vc.userReward, vc.targetVotes, vc.completedVotes,
             vpt.tierName, vpt.displayName as tierDisplayName
      FROM votes v
      JOIN vote_campaigns vc ON v.id = vc.voteId
      JOIN vote_pricing_tiers vpt ON v.pricingTierId = vpt.id
      WHERE vc.status = 'active' AND vc.completedVotes < vc.targetVotes
        AND NOT EXISTS (SELECT 1 FROM vote_responses vr WHERE vr.campaignId = vc.id AND vr.userId = ${userId})
      ORDER BY vc.userReward DESC
    `);
    return votes[0] || [];
  }),
  "userVote.startVote": protectedProcedure.input(z2.object({ voteId: z2.number(), campaignId: z2.number() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const userId = ctx.user.id;
    const existing = await db.execute(sql5`SELECT id, status FROM vote_responses WHERE userId = ${userId} AND campaignId = ${input.campaignId}`);
    if (existing[0]?.length) {
      return { responseId: existing[0][0].id, resumed: true };
    }
    const campaigns2 = await db.execute(sql5`SELECT userReward FROM vote_campaigns WHERE id = ${input.campaignId}`);
    const userReward = campaigns2[0]?.[0]?.userReward || 0;
    const result = await db.execute(sql5`
        INSERT INTO vote_responses (campaignId, voteId, userId, rewardAmount) VALUES (${input.campaignId}, ${input.voteId}, ${userId}, ${userReward})
      `);
    const questions = await db.execute(sql5`SELECT * FROM vote_questions WHERE voteId = ${input.voteId} ORDER BY questionOrder ASC`);
    const questionList = questions[0] || [];
    for (const q of questionList) {
      const options = await db.execute(sql5`SELECT * FROM vote_options WHERE questionId = ${q.id} ORDER BY optionOrder ASC`);
      q.options = options[0] || [];
    }
    return { responseId: result[0].insertId, resumed: false, questions: questionList, totalQuestions: questionList.length };
  }),
  "userVote.submitAnswer": protectedProcedure.input(z2.object({
    responseId: z2.number(),
    questionId: z2.number(),
    selectedOptionIds: z2.array(z2.number()),
    timeSpentSeconds: z2.number(),
    openFeedback: z2.string().optional()
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const existing = await db.execute(sql5`SELECT id FROM vote_answers WHERE responseId = ${input.responseId} AND questionId = ${input.questionId}`);
    const selectedJson = JSON.stringify(input.selectedOptionIds);
    if (existing[0]?.length) {
      await db.execute(sql5`
          UPDATE vote_answers SET selectedOptionIds = ${selectedJson}, openFeedback = ${input.openFeedback || null}, timeSpentSeconds = ${input.timeSpentSeconds}, answeredAt = NOW() WHERE id = ${existing[0][0].id}
        `);
    } else {
      await db.execute(sql5`
          INSERT INTO vote_answers (responseId, questionId, selectedOptionIds, openFeedback, timeSpentSeconds) VALUES (${input.responseId}, ${input.questionId}, ${selectedJson}, ${input.openFeedback || null}, ${input.timeSpentSeconds})
        `);
    }
    await db.execute(sql5`UPDATE vote_responses SET status = 'in_progress' WHERE id = ${input.responseId} AND status = 'started'`);
    return { message: "Answer submitted successfully" };
  }),
  "userVote.completeVote": protectedProcedure.input(z2.object({ responseId: z2.number() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const userId = ctx.user.id;
    const responses = await db.execute(sql5`
        SELECT vr.*, vc.userReward, vc.id as campaignId FROM vote_responses vr JOIN vote_campaigns vc ON vr.campaignId = vc.id WHERE vr.id = ${input.responseId} AND vr.userId = ${userId}
      `);
    if (!responses[0]?.length) throw new Error("Vote response not found");
    const response = responses[0][0];
    const timeResult = await db.execute(sql5`SELECT SUM(timeSpentSeconds) as totalTime FROM vote_answers WHERE responseId = ${input.responseId}`);
    const totalTime = timeResult[0]?.[0]?.totalTime || 0;
    await db.execute(sql5`UPDATE vote_responses SET status = 'completed', completedAt = NOW(), totalTimeSeconds = ${totalTime} WHERE id = ${input.responseId}`);
    await db.execute(sql5`UPDATE vote_campaigns SET completedVotes = completedVotes + 1 WHERE id = ${response.campaignId}`);
    await db.execute(sql5`UPDATE users SET balance = balance + ${response.userReward} WHERE id = ${userId}`);
    await db.execute(sql5`UPDATE vote_responses SET rewardPaid = TRUE WHERE id = ${input.responseId}`);
    await db.execute(sql5`INSERT INTO transactions (userId, type, amount, description, status) VALUES (${userId}, 'vote_reward', ${response.userReward}, 'Vote completion reward', 'completed')`);
    return { message: "Vote completed successfully", reward: response.userReward, totalTime };
  }),
  "userVote.getVoteHistory": protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const history = await db.execute(sql5`
      SELECT vr.id, vr.status, vr.completedAt, vr.rewardAmount, v.title, v.titleAr, v.category, vpt.displayName as tierDisplayName
      FROM vote_responses vr JOIN votes v ON vr.voteId = v.id JOIN vote_pricing_tiers vpt ON v.pricingTierId = vpt.id
      WHERE vr.userId = ${ctx.user.id} ORDER BY vr.startedAt DESC
    `);
    return history[0] || [];
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
import fs2 from "fs";
import { nanoid } from "nanoid";
import path4 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path3 from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path3.resolve(import.meta.dirname, "client", "src"),
      "@shared": path3.resolve(import.meta.dirname, "shared"),
      "@assets": path3.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path3.resolve(import.meta.dirname),
  root: path3.resolve(import.meta.dirname, "client"),
  publicDir: path3.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path3.resolve(import.meta.dirname, "dist/public"),
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
      const clientTemplate = path4.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
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
  const distPath = process.env.NODE_ENV === "development" ? path4.resolve(import.meta.dirname, "../..", "dist", "public") : path4.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path4.resolve(distPath, "index.html"));
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
  app.use("/api/referrals", referral_routes_default);
  app.use("/api/gamification", gamification_routes_default);
  app.use("/api/gamification", csrfProtection, gamification_features_routes_default);
  app.use("/api/push", push_notification_routes_default);
  app.use("/api/notifications", notification_routes_default);
  app.use("/api", campaign_routes_default);
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
