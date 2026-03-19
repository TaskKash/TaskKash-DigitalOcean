import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { nanoid } from "nanoid";
import { getUserByEmailOrPhone, getUserByOpenId } from "../db";
import { sdk } from "./sdk";
import { COOKIE_NAME } from "../../shared/const";
import { getPool, query } from "./mysql-pool";

// Reusable helper: always use Secure + SameSite=None (requires HTTPS)
const cookieOptions = (req: any) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  path: "/",
});

// Reusable Zod schemas
const emailSchema = z.string().email().max(254);
const passwordSchema = z.string().min(8).max(128);
const nameSchema = z.string().min(1).max(100);

export const authRouter = Router();

// Login endpoint
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    // Get user from database by email or phone
    const user = await getUserByEmailOrPhone(email);
    if (process.env.NODE_ENV === 'development') {
      console.log('[Auth] User found:', user ? 'YES' : 'NO');
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Check if user has a password set
    if (!user.password) {
      return res.status(401).json({
        success: false,
        error: "Password not set for this account. Please use social login or reset your password.",
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (process.env.NODE_ENV === 'development') {
      console.log('[Auth] Password valid:', isValidPassword);
    }

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Create session token
    const token = await sdk.signSession({
      openId: user.openId,
      appId: 'taskkash-app',
      name: user.name || user.email || 'User',
    });

    // Set cookie
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: req.secure || req.headers["x-forwarded-proto"] === "https",
      sameSite: req.secure || req.headers["x-forwarded-proto"] === "https" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: "/",
    });

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    return res.json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("[Auth] Login error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// Logout endpoint
authRouter.post("/logout", (req, res) => {
  try {
    // Clear session cookie
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: req.secure || req.headers["x-forwarded-proto"] === "https",
      sameSite: req.secure || req.headers["x-forwarded-proto"] === "https" ? "none" : "lax",
      path: "/",
    });

    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("[Auth] Logout error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// Get current user endpoint
authRouter.get("/me", async (req, res) => {
  try {
    // Get session token from cookie (use cookie-parser result or parse manually)
    const sessionToken = req.cookies?.[COOKIE_NAME] ||
      req.headers.cookie?.split(';').reduce((acc: any, c: string) => {
        const [k, v] = c.trim().split('=');
        acc[k] = v;
        return acc;
      }, {})[COOKIE_NAME];

    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
    }

    // Verify session and get openId
    const session = await sdk.verifySession(sessionToken);

    if (!session || !session.openId) {
      return res.status(401).json({
        success: false,
        error: "Invalid session",
      });
    }

    // Get user from database using openId
    const user = await getUserByOpenId(session.openId);
    if (process.env.NODE_ENV === 'development') console.log('[Auth /me] User from DB:', user ? user.name : 'null');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found",
      });
    }

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    return res.json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("[Auth] Get user error:", error);
    return res.status(401).json({
      success: false,
      error: "Not authenticated",
    });
  }
});

// Register endpoint
authRouter.post("/register", async (req, res) => {
  console.log('[Auth] POST /api/auth/register - Body keys:', Object.keys(req.body));
  try {
    const { name, email, password, phone, countryId } = req.body;

    console.log('[Auth] Registration attempt:', { name, email, phone });

    if (!email || !password || !name) {
      console.warn('[Auth] Registration failed: Missing required fields', { name: !!name, email: !!email, password: !!password });
      return res.status(400).json({
        success: false,
        error: "Name, email, and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 8 characters",
      });
    }

    // Validate inputs with Zod
    const emailResult = emailSchema.safeParse(email);
    const passResult = passwordSchema.safeParse(password);
    const nameResult = nameSchema.safeParse(name);

    if (!emailResult.success || !passResult.success || !nameResult.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid name, email, or password format",
      });
    }

    // Hash password with bcrypt (same as login verification)
    const hashedPassword = await bcrypt.hash(password, 10);
    const openId = `user_${nanoid()}`;

    if (process.env.NODE_ENV === 'development') console.log('[Auth] Creating user with openId:', openId);

    const pool = getPool();

    try {
      // Check if email already exists
      const [existing] = await pool.execute(
        "SELECT id FROM users WHERE email = ?",
        [email]
      );

      if (Array.isArray(existing) && existing.length > 0) {
        return res.status(400).json({
          success: false,
          error: "Email already exists",
        });
      }

      // Insert new user
      const [result] = await pool.execute(
        `INSERT INTO users (openId, name, email, password, phone, countryId, role, balance, tier, isVerified, profileStrength, completedTasks, totalEarnings, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          openId,
          name,
          email,
          hashedPassword,
          phone || null,
          countryId || null,
          'user',
          0,
          'bronze',
          0,
          0,
          0,
          0
        ]
      );

      if (process.env.NODE_ENV === 'development') console.log('[Auth] User created successfully:', result);

      // Create session token for auto-login
      const token = await sdk.signSession({
        openId: openId,
        appId: 'taskkash-app',
        name: name,
      });

      // Set cookie
      res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: req.secure || req.headers["x-forwarded-proto"] === "https",
        sameSite: req.secure || req.headers["x-forwarded-proto"] === "https" ? "none" : "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: "/",
      });

      return res.status(201).json({
        success: true,
        message: "Registration successful",
        user: {
          openId,
          name,
          email,
          phone,
          role: 'user',
          balance: 0,
          tier: 'bronze'
        }
      });
    } catch (dbError) {
      throw dbError;
    }
  } catch (error) {
    console.error("[Auth] Register error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// Advertiser Registration endpoint
authRouter.post("/advertiser/register", async (req, res) => {
  try {
    const { companyName, contactPerson, email, phone, industry, companySize, password, tier = "basic", countryId } = req.body;
    if (!companyName || !contactPerson || !email || !password) {
      return res.status(400).json({ success: false, error: "Company name, contact person, email, and password are required" });
    }

    const pool = getPool();
    const [existingAdvertisers] = await pool.execute("SELECT id FROM advertisers WHERE email = ?", [email]);

    if (Array.isArray(existingAdvertisers) && existingAdvertisers.length > 0) {
      return res.status(400).json({ success: false, error: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const openId = `adv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const baseSlug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const slug = `${baseSlug}-${Math.random().toString(36).substr(2, 6)}`;

    const [result] = await pool.execute(
      `INSERT INTO advertisers (openId, email, password, nameEn, nameAr, slug, tier, isActive, balance, totalSpent, countryId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0, 0, ?, NOW(), NOW())`,
      [openId, email, hashedPassword, companyName, companyName, slug, tier, countryId || null]
    );

    const insertId = (result as any).insertId;
    const [advertisers] = await pool.execute("SELECT * FROM advertisers WHERE id = ?", [insertId]);

    if (!Array.isArray(advertisers) || advertisers.length === 0) {
      return res.status(500).json({ success: false, error: "Failed to create advertiser account" });
    }

    const advertiser = (advertisers as any)[0];
    const token = await sdk.createSessionToken(`advertiser_${advertiser.id}`, { name: advertiser.nameEn || advertiser.email });

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: req.secure || req.headers["x-forwarded-proto"] === "https",
      sameSite: req.secure || req.headers["x-forwarded-proto"] === "https" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    const { password: _, ...advertiserWithoutPassword } = advertiser;
    return res.json({ success: true, advertiser: advertiserWithoutPassword });
  } catch (error) {
    console.error("[Auth] Advertiser registration error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// Advertiser Login endpoint
authRouter.post("/advertiser/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    // Get advertiser from database using pool
    const pool = getPool();
    const [advertisers] = await pool.execute(
      "SELECT * FROM advertisers WHERE email = ? AND isActive = 1",
      [email]
    );

    if (!Array.isArray(advertisers) || advertisers.length === 0) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    const advertiser = (advertisers as any)[0];

    // Check if advertiser has a password set
    if (!advertiser.password) {
      return res.status(401).json({
        success: false,
        error: "Password not set for this account",
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, advertiser.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Create session token (using advertiser slug as openId)
    const token = await sdk.createSessionToken(`advertiser_${advertiser.id}`, {
      name: advertiser.nameEn || advertiser.email,
    });

    // Set cookie
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: req.secure || req.headers["x-forwarded-proto"] === "https",
      sameSite: req.secure || req.headers["x-forwarded-proto"] === "https" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: "/",
    });

    // Return advertiser data (without password)
    const { password: _, ...advertiserWithoutPassword } = advertiser;

    return res.json({
      success: true,
      advertiser: advertiserWithoutPassword,
    });
  } catch (error) {
    console.error("[Auth] Advertiser login error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// Get current advertiser endpoint
authRouter.get("/advertiser/me", async (req, res) => {
  try {
    // Get session token from cookie
    const token = req.cookies[COOKIE_NAME];
    if (process.env.NODE_ENV === 'development') console.log('[Advertiser /me] Token:', token ? 'exists' : 'missing');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
    }

    // Verify token
    const payload = await sdk.verifySession(token);

    if (!payload || !payload.openId) {
      return res.status(401).json({
        success: false,
        error: "Invalid session",
      });
    }

    // Extract advertiser ID from openId (format: "advertiser_10")
    if (!payload.openId.startsWith('advertiser_')) {
      return res.status(403).json({
        success: false,
        error: "Not an advertiser account",
      });
    }

    const advertiserId = payload.openId.replace('advertiser_', '');

    // Get advertiser from database using pool
    const pool = getPool();
    const [advertisers] = await pool.execute(
      "SELECT * FROM advertisers WHERE id = ? AND isActive = 1",
      [advertiserId]
    );

    if (!Array.isArray(advertisers) || advertisers.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Advertiser not found",
      });
    }

    const advertiser = (advertisers as any)[0];

    // Return advertiser data (without password)
    const { password: _, ...advertiserWithoutPassword } = advertiser;

    return res.json({
      success: true,
      advertiser: advertiserWithoutPassword,
    });
  } catch (error) {
    console.error("[Auth] Get advertiser error:", error);
    return res.status(401).json({
      success: false,
      error: "Not authenticated",
    });
  }
});

// Admin Login endpoint
authRouter.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    // Admin credentials from environment variables
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@taskkash.com";
    const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "";

    if (email !== ADMIN_EMAIL) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Verify password using bcrypt
    let isValidPassword = false;
    if (ADMIN_PASSWORD_HASH) {
      isValidPassword = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    } else if (process.env.NODE_ENV === "development") {
      // Dev-only fallback: check ADMIN_PASSWORD_PLAIN env var
      const devPassword = process.env.ADMIN_PASSWORD_PLAIN || "";
      isValidPassword = devPassword.length > 0 && password === devPassword;
      if (!ADMIN_PASSWORD_HASH) {
        console.warn("[Auth] WARNING: ADMIN_PASSWORD_HASH not set. Using dev plaintext fallback only.");
      }
    }

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Create session token
    const token = await sdk.createSessionToken("admin_001", {
      name: "Admin User",
    });

    // Set cookie
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: req.secure || req.headers["x-forwarded-proto"] === "https",
      sameSite: req.secure || req.headers["x-forwarded-proto"] === "https" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: "/",
    });

    // Return admin data
    return res.json({
      success: true,
      admin: {
        id: 1,
        openId: "admin_001",
        email: ADMIN_EMAIL,
        name: "Admin User",
        role: "admin",
      },
    });
  } catch (error) {
    console.error("[Auth] Admin login error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// Get current admin endpoint
authRouter.get("/admin/me", async (req, res) => {
  try {
    // Get session token from cookie
    const token = req.cookies[COOKIE_NAME];
    if (process.env.NODE_ENV === 'development') console.log('[Admin /me] Token:', token ? 'exists' : 'missing');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
    }

    // Verify token
    const payload = await sdk.verifySession(token);

    if (!payload || !payload.openId) {
      return res.status(401).json({
        success: false,
        error: "Invalid session",
      });
    }

    // Check if admin
    if (!payload.openId.startsWith('admin_')) {
      return res.status(403).json({
        success: false,
        error: "Not an admin account",
      });
    }

    // Return admin data
    return res.json({
      success: true,
      admin: {
        id: 1,
        openId: payload.openId,
        email: "admin@taskkash.com",
        name: payload.name || "Admin User",
        role: "admin",
      },
    });
  } catch (error) {
    console.error("[Auth] Get admin error:", error);
    return res.status(401).json({
      success: false,
      error: "Not authenticated",
    });
  }
});
