import { int, json, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  password: varchar("password", { length: 255 }), // bcrypt hashed password for email/password auth
  phone: varchar("phone", { length: 20 }),
  isPhoneVerified: int("isPhoneVerified", { unsigned: true }).default(0).notNull(), // 0 = not verified, 1 = verified
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),

  // TASKKASH-specific fields
  balance: int("balance", { unsigned: true }).default(0).notNull(), // in smallest currency unit
  completedTasks: int("completedTasks", { unsigned: true }).default(0).notNull(),
  totalEarnings: int("totalEarnings", { unsigned: true }).default(0).notNull(), // in smallest currency unit
  tier: mysqlEnum("tier", ["vip", "prestige", "elite"]).default("vip").notNull(),
  // Virtual generated column for easy >= tier filtering
  tierRank: int("tierRank"),
  profileStrength: int("profileStrength", { unsigned: true }).default(30).notNull(), // percentage 0-100
  countryId: int("countryId"), // foreign key to countries table
  avatar: varchar("avatar", { length: 500 }),
  isVerified: int("isVerified", { unsigned: true }).default(0).notNull(), // 0 = not verified, 1 = verified

  // User profile fields for campaign targeting
  age: int("age"),
  gender: varchar("gender", { length: 10 }),
  city: varchar("city", { length: 100 }),
  district: varchar("district", { length: 100 }),
  incomeLevel: varchar("incomeLevel", { length: 50 }),

  // KYC and Trust Layer (Sprint 1a)
  kycStatus: mysqlEnum("kycStatus", ["pending", "submitted", "verified", "rejected"]).default("pending").notNull(),
  kycVerifiedAt: timestamp("kycVerifiedAt"),
  kycProvider: varchar("kycProvider", { length: 50 }),
  kycRejectionReason: varchar("kycRejectionReason", { length: 255 }),

  // Device context freshness (Sprint 2)
  deviceTierLastUpdated: timestamp("deviceTierLastUpdated"),

  // Soft-delete (Sprint 5)
  pendingDeletion: int("pendingDeletion").default(0).notNull(), // 0 = active, 1 = pending deletion
  deletionRequestedAt: timestamp("deletionRequestedAt"),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * User Consents table - Append-only audit log for GDPR compliance (Sprint 1b)
 */
export const userConsents = mysqlTable("userConsents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  consentType: varchar("consentType", { length: 100 }).notNull(), // e.g., 'personalisation', 'marketing'
  consentVersion: varchar("consentVersion", { length: 50 }).notNull(),
  eventType: mysqlEnum("eventType", ["granted", "revoked", "updated", "refreshed", "exported"]).notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(), // When this consent event occurred
});

export type UserConsent = typeof userConsents.$inferSelect;
export type InsertUserConsent = typeof userConsents.$inferInsert;

/**
 * User Profile table - Psychographic, behavioral, and device DNA (Sprint 2)
 */
export const userProfiles = mysqlTable("userProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(), // One-to-one with users

  // Passive Device Layer
  deviceModel: varchar("deviceModel", { length: 100 }),
  deviceOs: varchar("deviceOs", { length: 50 }),
  deviceOsVersion: varchar("deviceOsVersion", { length: 50 }),
  deviceTier: mysqlEnum("deviceTier", ["A", "B", "C"]),
  networkCarrier: varchar("networkCarrier", { length: 100 }),
  connectionType: varchar("connectionType", { length: 50 }), // WiFi, 4G, 5G

  // Psychographic Data
  interests: json("interests"),
  brandAffinity: json("brandAffinity"),
  lifeStage: mysqlEnum("lifeStage", ["single", "engaged", "married", "parent"]),
  nextPurchaseIntent: json("nextPurchaseIntent"),
  shoppingFrequency: mysqlEnum("shoppingFrequency", ["daily", "weekly", "monthly", "rarely"]),
  preferredStores: json("preferredStores"),
  householdSize: int("householdSize"),
  values: json("values"),

  // Professional Data
  industry: varchar("industry", { length: 100 }),
  jobTitle: varchar("jobTitle", { length: 100 }),
  workType: mysqlEnum("workType", ["remote", "office", "hybrid"]),

  // Mobility & Home
  hasVehicle: int("hasVehicle", { unsigned: true }).default(0).notNull(), // boolean 0/1
  vehicleBrand: varchar("vehicleBrand", { length: 100 }),
  vehicleModel: varchar("vehicleModel", { length: 100 }),
  homeOwnership: mysqlEnum("homeOwnership", ["owner", "renter"]),

  // Behavioral Scoring
  urgencyScore: int("urgencyScore").default(0),
  impulseScore: int("impulseScore").default(0),
  influenceScore: int("influenceScore").default(0),
  activityPattern: mysqlEnum("activityPattern", ["night_owl", "commuter", "daytime"]),

  profileUpdatedAt: timestamp("profileUpdatedAt").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

/**
 * User KYC Vault - Isolated highly-sensitive personal data (Sprint 1a)
 * Stored separately from the main users table.
 */
export const userKycVault = mysqlTable("user_kyc_vault", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id, { onDelete: "restrict" }),
  idNumber: varchar("idNumber", { length: 100 }).notNull(),
  dateOfBirth: timestamp("dateOfBirth"),
  fullAddress: text("fullAddress"),
  livenessToken: varchar("livenessToken", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserKycVault = typeof userKycVault.$inferSelect;
export type InsertUserKycVault = typeof userKycVault.$inferInsert;

/**
 * Countries table - stores supported countries with their currencies
 */
export const countries = mysqlTable("countries", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 2 }).notNull().unique(), // ISO 3166-1 alpha-2 (e.g., EG, SA, AE)
  nameAr: varchar("nameAr", { length: 100 }).notNull(),
  nameEn: varchar("nameEn", { length: 100 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(), // ISO 4217 (e.g., EGP, SAR, AED)
  currencySymbol: varchar("currencySymbol", { length: 10 }).notNull(),
  isActive: int("isActive", { unsigned: true }).default(1).notNull(), // 1 = active, 0 = inactive
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Country = typeof countries.$inferSelect;
export type InsertCountry = typeof countries.$inferInsert;

/**
 * Advertisers table - stores advertiser/brand information
 */
export const advertisers = mysqlTable("advertisers", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(), // URL-friendly identifier (e.g., vodafone-egypt)
  nameAr: varchar("nameAr", { length: 200 }).notNull(),
  nameEn: varchar("nameEn", { length: 200 }).notNull(),
  descriptionAr: text("descriptionAr"),
  descriptionEn: text("descriptionEn"),
  logoUrl: varchar("logoUrl", { length: 500 }),
  coverImage: varchar("coverImage", { length: 500 }),
  category: varchar("category", { length: 100 }), // e.g., telecommunications, ecommerce, transport
  verified: int("verified", { unsigned: true }).default(0).notNull(),
  followers: int("followers", { unsigned: true }).default(0).notNull(),
  totalCampaigns: int("totalCampaigns", { unsigned: true }).default(0).notNull(),
  activeUsers: int("activeUsers", { unsigned: true }).default(0).notNull(),
  paymentRate: int("paymentRate", { unsigned: true }).default(100).notNull(), // percentage (0-100)
  rating: int("rating", { unsigned: true }).default(0).notNull(), // rating * 10 (e.g., 48 = 4.8)
  reviewCount: int("reviewCount", { unsigned: true }).default(0).notNull(),
  countryId: int("countryId").notNull(),
  isActive: int("isActive", { unsigned: true }).default(1).notNull(),
  tier: mysqlEnum("tier", ["basic", "pro", "premium", "enterprise"]).default("basic").notNull(),
  totalSpend: int("totalSpend", { unsigned: true }).default(0).notNull(), // in smallest currency unit
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Advertiser = typeof advertisers.$inferSelect;
export type InsertAdvertiser = typeof advertisers.$inferInsert;

/**
 * Tasks table - stores available tasks/campaigns
 */
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  advertiserId: int("advertiserId").notNull(),
  titleAr: varchar("titleAr", { length: 300 }).notNull(),
  titleEn: varchar("titleEn", { length: 300 }).notNull(),
  descriptionAr: text("descriptionAr"),
  descriptionEn: text("descriptionEn"),
  type: mysqlEnum("type", ["survey", "app", "visit", "review", "social", "video", "quiz", "other"]).notNull(),
  reward: int("reward", { unsigned: true }).notNull(), // in smallest currency unit (e.g., cents/piasters)
  duration: int("duration", { unsigned: true }).notNull(), // in minutes
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]).default("easy").notNull(),
  requiredProfileStrength: int("requiredProfileStrength", { unsigned: true }).default(0).notNull(),
  maxCompletions: int("maxCompletions", { unsigned: true }),
  currentCompletions: int("currentCompletions", { unsigned: true }).default(0).notNull(),
  image: varchar("image", { length: 500 }),
  rating: int("rating", { unsigned: true }).default(0).notNull(), // rating * 10
  status: mysqlEnum("status", ["available", "completed", "upcoming", "active", "published"]).default("available").notNull(),
  launchDate: timestamp("launchDate"),
  expiryDate: timestamp("expiryDate"),
  countryId: int("countryId").notNull(),
  targetTiers: text("targetTiers"), // JSON array of target tiers: ["tier1", "tier2", "tier3"]
  requiredTiers: json("requiredTiers"), // JSON object for tier requirements
  requiresMinimumTier: varchar("requiresMinimumTier", { length: 10 }),
  targetAgeMin: int("targetAgeMin"),
  targetAgeMax: int("targetAgeMax"),
  targetGender: varchar("targetGender", { length: 10 }),
  targetLocations: text("targetLocations"),
  // Task-specific configuration
  config: json("config"), // JSON object for task-specific settings (video URL, survey questions, etc.)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

/**
 * User tasks table - tracks user task completions
 */
export const userTasks = mysqlTable("userTasks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  taskId: int("taskId").notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "rejected"]).default("pending").notNull(),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserTask = typeof userTasks.$inferSelect;
export type InsertUserTask = typeof userTasks.$inferInsert;

/**
 * Transactions table - stores financial transactions
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["earning", "withdrawal", "bonus", "refund"]).notNull(),
  amount: int("amount").notNull(), // in smallest currency unit (can be negative for withdrawals)
  currency: varchar("currency", { length: 3 }).notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed", "cancelled"]).default("pending").notNull(),
  taskId: int("taskId"), // null for non-task transactions
  campaignId: int("campaignId"), // null for non-campaign transactions
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * Escrow Ledger - Holds funds securely during an active campaign
 */
export const escrowLedger = mysqlTable("escrow_ledger", {
  id: int("id").autoincrement().primaryKey(),
  advertiserId: int("advertiserId").notNull(),
  campaignId: int("campaignId"), // null if for a single task
  taskId: int("taskId"), // null if for a multi-task campaign
  amount: int("amount").notNull(), // in smallest currency unit
  currency: varchar("currency", { length: 3 }).notNull(),
  status: mysqlEnum("status", ["held", "released", "refunded"]).default("held").notNull(),
  reason: varchar("reason", { length: 255 }),
  releaseDate: timestamp("releaseDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EscrowLedger = typeof escrowLedger.$inferSelect;
export type InsertEscrowLedger = typeof escrowLedger.$inferInsert;

/**
 * Notifications table - stores user notifications
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["task", "payment", "system", "promotion", "campaign"]).notNull(),
  titleAr: varchar("titleAr", { length: 300 }).notNull(),
  titleEn: varchar("titleEn", { length: 300 }).notNull(),
  messageAr: text("messageAr").notNull(),
  messageEn: text("messageEn").notNull(),
  actionUrl: varchar("actionUrl", { length: 500 }),
  isRead: int("isRead", { unsigned: true }).default(0).notNull(), // 0 = unread, 1 = read
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// ============================================
// MULTI-TASK CAMPAIGN TABLES
// ============================================

/**
 * Campaigns table - stores multi-task campaign definitions
 */
export const campaigns = mysqlTable("campaigns", {
  id: int("id").autoincrement().primaryKey(),
  advertiserId: int("advertiserId").notNull(),
  nameAr: varchar("nameAr", { length: 300 }).notNull(),
  nameEn: varchar("nameEn", { length: 300 }).notNull(),
  descriptionAr: text("descriptionAr"),
  descriptionEn: text("descriptionEn"),
  image: varchar("image", { length: 500 }),
  budget: int("budget", { unsigned: true }).notNull(), // Total budget in smallest currency unit
  reward: int("reward", { unsigned: true }).notNull(), // Reward for completing entire campaign
  status: mysqlEnum("status", ["draft", "active", "paused", "completed"]).default("draft").notNull(),
  // Campaign settings
  videoCompletionThreshold: int("videoCompletionThreshold", { unsigned: true }).default(70).notNull(), // Minimum video completion %
  visitDurationThreshold: int("visitDurationThreshold", { unsigned: true }).default(30).notNull(), // Minimum visit duration in minutes
  // Targeting
  countryId: int("countryId").notNull(),
  targetAgeMin: int("targetAgeMin"),
  targetAgeMax: int("targetAgeMax"),
  targetGender: varchar("targetGender", { length: 10 }),
  targetLocations: text("targetLocations"), // JSON array of target locations
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;

/**
 * Campaign personas table - stores persona-specific content for campaigns
 */
export const campaignPersonas = mysqlTable("campaignPersonas", {
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
  targetCriteria: json("targetCriteria"), // JSON object with criteria to match users
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CampaignPersona = typeof campaignPersonas.$inferSelect;
export type InsertCampaignPersona = typeof campaignPersonas.$inferInsert;

/**
 * Campaign tasks table - links tasks to campaigns with sequence order
 */
export const campaignTasks = mysqlTable("campaignTasks", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull(),
  taskId: int("taskId").notNull(),
  sequence: int("sequence", { unsigned: true }).notNull(), // Order in the campaign sequence (1, 2, 3, ...)
  // Task-specific gating rules
  gatingRules: json("gatingRules"), // JSON object with rules for passing this task
  isRequired: int("isRequired", { unsigned: true }).default(1).notNull(), // 1 = required, 0 = optional
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CampaignTask = typeof campaignTasks.$inferSelect;
export type InsertCampaignTask = typeof campaignTasks.$inferInsert;

/**
 * Campaign qualifications table - stores qualification criteria for campaigns
 */
export const campaignQualifications = mysqlTable("campaignQualifications", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull(),
  criteriaType: mysqlEnum("criteriaType", ["demographic", "behavioral", "interest", "exclusion"]).notNull(),
  criteriaKey: varchar("criteriaKey", { length: 100 }).notNull(), // e.g., "age", "location", "income"
  operator: mysqlEnum("operator", ["=", "!=", ">", "<", ">=", "<=", "in", "not_in"]).notNull(),
  value: varchar("value", { length: 255 }).notNull(), // The value to compare against
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CampaignQualification = typeof campaignQualifications.$inferSelect;
export type InsertCampaignQualification = typeof campaignQualifications.$inferInsert;

/**
 * User campaign progress table - tracks user progress through campaigns
 */
export const userCampaignProgress = mysqlTable("userCampaignProgress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  campaignId: int("campaignId").notNull(),
  personaId: int("personaId"), // The persona assigned to this user (if any)
  currentTaskId: int("currentTaskId"), // The current task the user is on
  currentSequence: int("currentSequence", { unsigned: true }).default(1).notNull(), // Current sequence number
  status: mysqlEnum("status", ["in_progress", "completed", "disqualified", "abandoned"]).default("in_progress").notNull(),
  disqualificationReason: text("disqualificationReason"), // Reason for disqualification (if any)
  // Progress tracking
  tasksCompleted: int("tasksCompleted", { unsigned: true }).default(0).notNull(),
  totalTasks: int("totalTasks", { unsigned: true }).notNull(),
  // Timestamps
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserCampaignProgress = typeof userCampaignProgress.$inferSelect;
export type InsertUserCampaignProgress = typeof userCampaignProgress.$inferInsert;

/**
 * User journey logs table - detailed logs of user actions in campaigns
 */
export const userJourneyLogs = mysqlTable("userJourneyLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  campaignId: int("campaignId").notNull(),
  taskId: int("taskId"),
  eventType: varchar("eventType", { length: 100 }).notNull(), // e.g., "campaign_started", "task_completed", "visit_verified"
  eventData: json("eventData"), // Additional data about the event
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserJourneyLog = typeof userJourneyLogs.$inferSelect;
export type InsertUserJourneyLog = typeof userJourneyLogs.$inferInsert;

/**
 * Campaign KPIs table - tracks real-time KPI values for campaigns
 */
export const campaignKpis = mysqlTable("campaignKpis", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull(),
  kpiName: varchar("kpiName", { length: 100 }).notNull(), // e.g., "video_completion_rate", "filter_pass_rate"
  targetValue: int("targetValue", { unsigned: true }), // Target value (percentage or count)
  actualValue: int("actualValue", { unsigned: true }).default(0).notNull(), // Current actual value
  lastCalculatedAt: timestamp("lastCalculatedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CampaignKpi = typeof campaignKpis.$inferSelect;
export type InsertCampaignKpi = typeof campaignKpis.$inferInsert;

/**
 * Visit verifications table - stores visit verification data
 */
export const visitVerifications = mysqlTable("visitVerifications", {
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
  visitDuration: int("visitDuration", { unsigned: true }), // Duration in minutes
  // Verification method
  verificationMethod: mysqlEnum("verificationMethod", ["gps", "qr_code", "manual"]),
  gpsLatitude: varchar("gpsLatitude", { length: 20 }),
  gpsLongitude: varchar("gpsLongitude", { length: 20 }),
  qrCodeScanned: varchar("qrCodeScanned", { length: 100 }),
  // Status
  status: mysqlEnum("status", ["booked", "checked_in", "verified", "cancelled", "no_show"]).default("booked").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VisitVerification = typeof visitVerifications.$inferSelect;
export type InsertVisitVerification = typeof visitVerifications.$inferInsert;
