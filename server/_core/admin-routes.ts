import { Router } from "express";
import bcrypt from "bcryptjs";
import { sdk } from "./sdk";
import { COOKIE_NAME } from "../../shared/const";
import { getPool } from "./mysql-pool";

export const adminRouter = Router();

// Middleware to verify admin access
const verifyAdmin = async (req: any, res: any, next: any) => {
  try {
    const token = req.cookies[COOKIE_NAME];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
    }

    const payload = await sdk.verifySession(token);
    
    if (!payload || !payload.openId || !payload.openId.startsWith('admin_')) {
      return res.status(403).json({
        success: false,
        error: "Admin access required",
      });
    }

    req.admin = payload;
    next();
  } catch (error) {
    console.error("[Admin] Verification error:", error);
    return res.status(401).json({
      success: false,
      error: "Invalid session",
    });
  }
};

// ==================== USER MANAGEMENT ====================

// Create new user
adminRouter.post("/users", verifyAdmin, async (req, res) => {
  try {
    const { name, email, password, phone, role, balance, tier, isVerified } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: "Name, email, and password are required",
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters",
      });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const openId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    
    const connection = getPool();
    
    // Check if email already exists
    const [existing] = await connection.execute(
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
    const [result] = await connection.execute(
      `INSERT INTO users (openId, name, email, password, phone, role, balance, tier, isVerified, profileStrength, completedTasks, totalEarnings, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        openId,
        name,
        email,
        hashedPassword,
        phone || null,
        role || 'user',
        balance || 0,
        tier || 'tier1',
        isVerified ? 1 : 0,
        0,
        0,
        0
      ]
    );
    
    // Get the created user
    const [users] = await connection.execute(
      "SELECT id, openId, name, email, phone, role, balance, tier, isVerified FROM users WHERE id = ?",
      [(result as any).insertId]
    );
    


    return res.json({
      success: true,
      user: users[0],
      message: "User created successfully",
    });
  } catch (error) {
    console.error("[Admin] Create user error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to create user",
    });
  }
});

// Get all users
adminRouter.get("/users", verifyAdmin, async (req, res) => {
  try {
    const connection = getPool();
    
    const [users] = await connection.execute(
      "SELECT id, openId, name, email, phone, role, balance, completedTasks, totalEarnings, tier, profileStrength, countryId, isVerified, createdAt, updatedAt, lastSignedIn FROM users ORDER BY createdAt DESC"
    );


    return res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("[Admin] Get users error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch users",
    });
  }
});

// Get single user
adminRouter.get("/users/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const mysql = await import("mysql2/promise");
    const connection = await mysql.createConnection(process.env.DATABASE_URL!);
    
    const [users] = await connection.execute(
      "SELECT id, openId, name, email, phone, role, balance, completedTasks, totalEarnings, tier, profileStrength, countryId, isVerified, createdAt, updatedAt, lastSignedIn FROM users WHERE id = ?",
      [id]
    );
    

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    return res.json({
      success: true,
      user: users[0],
    });
  } catch (error) {
    console.error("[Admin] Get user error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch user",
    });
  }
});

// Update user
adminRouter.put("/users/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, balance, tier, isVerified, profileStrength } = req.body;
    
    const connection = getPool();
    
    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    
    if (name !== undefined) {
      updates.push("name = ?");
      values.push(name);
    }
    if (email !== undefined) {
      updates.push("email = ?");
      values.push(email);
    }
    if (phone !== undefined) {
      updates.push("phone = ?");
      values.push(phone);
    }
    if (role !== undefined) {
      updates.push("role = ?");
      values.push(role);
    }
    if (balance !== undefined) {
      updates.push("balance = ?");
      values.push(balance);
    }
    if (tier !== undefined) {
      updates.push("tier = ?");
      values.push(tier);
    }
    if (isVerified !== undefined) {
      updates.push("isVerified = ?");
      values.push(isVerified ? 1 : 0);
    }
    if (profileStrength !== undefined) {
      updates.push("profileStrength = ?");
      values.push(profileStrength);
    }
    
    updates.push("updatedAt = NOW()");
    values.push(id);
    
    await connection.execute(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
      values
    );
    
    // Get updated user
    const [users] = await connection.execute(
      "SELECT id, openId, name, email, phone, role, balance, completedTasks, totalEarnings, tier, profileStrength, countryId, isVerified, createdAt, updatedAt FROM users WHERE id = ?",
      [id]
    );
    


    return res.json({
      success: true,
      user: users[0],
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("[Admin] Update user error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to update user",
    });
  }
});

// Reset user password
adminRouter.post("/users/:id/reset-password", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 8 characters",
      });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const connection = getPool();
    
    await connection.execute(
      "UPDATE users SET password = ?, updatedAt = NOW() WHERE id = ?",
      [hashedPassword, id]
    );
    


    return res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("[Admin] Reset password error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to reset password",
    });
  }
});

// Delete user
adminRouter.delete("/users/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const connection = getPool();
    
    await connection.execute("DELETE FROM users WHERE id = ?", [id]);
    


    return res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("[Admin] Delete user error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to delete user",
    });
  }
});

// ==================== ADVERTISER MANAGEMENT ====================

// Create new advertiser
adminRouter.post("/advertisers", verifyAdmin, async (req, res) => {
  try {
    const { email, password, nameEn, nameAr, slug, isActive } = req.body;
    
    if (!email || !password || !nameEn) {
      return res.status(400).json({
        success: false,
        error: "Email, password, and English name are required",
      });
    }
    
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 8 characters",
      });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const finalSlug = slug || nameEn.toLowerCase().replace(/\s+/g, '-');
    
    const connection = getPool();
    
    // Check if email already exists
    const [existing] = await connection.execute(
      "SELECT id FROM advertisers WHERE email = ? OR slug = ?",
      [email, finalSlug]
    );
    
    if (Array.isArray(existing) && existing.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Email or slug already exists",
      });
    }
    
    // Insert new advertiser
    const [result] = await connection.execute(
      `INSERT INTO advertisers (email, password, nameEn, nameAr, slug, isActive, countryId, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        email,
        hashedPassword,
        nameEn,
        nameAr || null,
        finalSlug,
        isActive !== undefined ? (isActive ? 1 : 0) : 1,
        1 // Default countryId
      ]
    );
    
    // Get the created advertiser
    const [advertisers] = await connection.execute(
      "SELECT id, email, nameEn, nameAr, slug, isActive FROM advertisers WHERE id = ?",
      [(result as any).insertId]
    );
    


    return res.json({
      success: true,
      advertiser: advertisers[0],
      message: "Advertiser created successfully",
    });
  } catch (error) {
    console.error("[Admin] Create advertiser error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to create advertiser",
    });
  }
});

// Get all advertisers
adminRouter.get("/advertisers", verifyAdmin, async (req, res) => {
  try {
    const connection = getPool();
    
    const [advertisers] = await connection.execute(
      "SELECT id, email, nameEn, nameAr, slug, isActive, createdAt, updatedAt FROM advertisers ORDER BY createdAt DESC"
    );
    


    return res.json({
      success: true,
      advertisers,
    });
  } catch (error) {
    console.error("[Admin] Get advertisers error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch advertisers",
    });
  }
});

// Get single advertiser
adminRouter.get("/advertisers/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const connection = getPool();
    
    const [advertisers] = await connection.execute(
      "SELECT id, email, nameEn, nameAr, slug, isActive, createdAt, updatedAt FROM advertisers WHERE id = ?",
      [id]
    );
    


    if (!Array.isArray(advertisers) || advertisers.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Advertiser not found",
      });
    }

    return res.json({
      success: true,
      advertiser: advertisers[0],
    });
  } catch (error) {
    console.error("[Admin] Get advertiser error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch advertiser",
    });
  }
});

// Update advertiser
adminRouter.put("/advertisers/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, nameEn, nameAr, slug, isActive } = req.body;
    
    const connection = getPool();
    
    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    
    if (email !== undefined) {
      updates.push("email = ?");
      values.push(email);
    }
    if (nameEn !== undefined) {
      updates.push("nameEn = ?");
      values.push(nameEn);
    }
    if (nameAr !== undefined) {
      updates.push("nameAr = ?");
      values.push(nameAr);
    }
    if (slug !== undefined) {
      updates.push("slug = ?");
      values.push(slug);
    }
    if (isActive !== undefined) {
      updates.push("isActive = ?");
      values.push(isActive ? 1 : 0);
    }
    
    updates.push("updatedAt = NOW()");
    values.push(id);
    
    await connection.execute(
      `UPDATE advertisers SET ${updates.join(", ")} WHERE id = ?`,
      values
    );
    
    // Get updated advertiser
    const [advertisers] = await connection.execute(
      "SELECT id, email, nameEn, nameAr, slug, isActive, createdAt, updatedAt FROM advertisers WHERE id = ?",
      [id]
    );
    


    return res.json({
      success: true,
      advertiser: advertisers[0],
      message: "Advertiser updated successfully",
    });
  } catch (error) {
    console.error("[Admin] Update advertiser error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to update advertiser",
    });
  }
});

// Reset advertiser password
adminRouter.post("/advertisers/:id/reset-password", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 8 characters",
      });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const connection = getPool();
    
    await connection.execute(
      "UPDATE advertisers SET password = ?, updatedAt = NOW() WHERE id = ?",
      [hashedPassword, id]
    );
    


    return res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("[Admin] Reset advertiser password error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to reset password",
    });
  }
});

// Delete advertiser
adminRouter.delete("/advertisers/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const connection = getPool();
    
    await connection.execute("DELETE FROM advertisers WHERE id = ?", [id]);
    


    return res.json({
      success: true,
      message: "Advertiser deleted successfully",
    });
  } catch (error) {
    console.error("[Admin] Delete advertiser error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to delete advertiser",
    });
  }
});

// ==================== STATISTICS ====================

// Get admin dashboard statistics
adminRouter.get("/stats", verifyAdmin, async (req, res) => {
  try {
    const connection = getPool();
    
    const [userCount] = await connection.execute("SELECT COUNT(*) as count FROM users");
    const [advertiserCount] = await connection.execute("SELECT COUNT(*) as count FROM advertisers WHERE isActive = 1");
    const [verifiedUsers] = await connection.execute("SELECT COUNT(*) as count FROM users WHERE isVerified = 1");
    


    return res.json({
      success: true,
      stats: {
        totalUsers: userCount[0].count,
        totalAdvertisers: advertiserCount[0].count,
        verifiedUsers: verifiedUsers[0].count,
      },
    });
  } catch (error) {
    console.error("[Admin] Get stats error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch statistics",
    });
  }
});
