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

// ==================== SYSTEM ANALYTICS ====================

adminRouter.get("/analytics", verifyAdmin, async (req, res) => {
  try {
    const connection = getPool();
    
    // Overview metrics — each wrapped individually so a missing table won't crash the whole endpoint
    let totalUsers = 0, totalAdvertisers = 0, activeCampaigns = 0;
    let totalPaidOut = 0, currentEscrow = 0, netRevenue = 0;
    let dailyCompletions: any[] = [];

    try {
      const [r]: any = await connection.execute("SELECT COUNT(*) as count FROM users WHERE role = 'user'");
      totalUsers = r[0]?.count || 0;
    } catch (e) { /* table may not exist */ }

    try {
      const [r]: any = await connection.execute("SELECT COUNT(*) as count FROM advertisers");
      totalAdvertisers = r[0]?.count || 0;
    } catch (e) { /* table may not exist */ }

    try {
      const [r]: any = await connection.execute("SELECT COUNT(*) as count FROM campaigns WHERE status = 'active'");
      activeCampaigns = r[0]?.count || 0;
    } catch (e) { /* table may not exist */ }

    // Financials — these tables may not exist yet
    try {
      const [r]: any = await connection.execute("SELECT SUM(amount) as total FROM withdrawal_requests WHERE status = 'completed'");
      totalPaidOut = r[0]?.total || 0;
    } catch (e) {
      try {
        const [r]: any = await connection.execute("SELECT SUM(amount) as total FROM withdrawalRequests WHERE status = 'completed'");
        totalPaidOut = r[0]?.total || 0;
      } catch (e2) { /* neither table exists */ }
    }

    try {
      const [held]: any = await connection.execute("SELECT SUM(amount) as total FROM escrow_ledger WHERE action = 'hold'");
      const [released]: any = await connection.execute("SELECT SUM(amount) as total FROM escrow_ledger WHERE action IN ('release', 'refund')");
      currentEscrow = Math.max(0, (held[0]?.total || 0) - (released[0]?.total || 0));
    } catch (e) { /* escrow_ledger may not exist */ }

    try {
      const [r]: any = await connection.execute("SELECT SUM(commissionAmount) as total FROM escrow_ledger WHERE action = 'release'");
      netRevenue = r[0]?.total || 0;
    } catch (e) { /* escrow_ledger may not exist */ }

    // Daily completions (last 7 days)
    try {
      const [rows]: any = await connection.execute(`
        SELECT DATE(completedAt) as date, COUNT(*) as completions
        FROM userCampaignProgress 
        WHERE status = 'completed' AND completedAt >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(completedAt)
        ORDER BY date ASC
      `);
      dailyCompletions = rows.map((d: any) => ({
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        completions: d.completions
      }));
    } catch (e) { /* userCampaignProgress may not exist */ }

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalAdvertisers,
        activeCampaigns,
        totalPaidOut,
        currentEscrow,
        netRevenue,
        dailyCompletions
      }
    });
  } catch (error) {
    console.error("[Admin] Analytics error:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch analytics" });
  }
});

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
    const [existing]: any = await connection.execute(
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
    const [result]: any = await connection.execute(
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
    const [users]: any = await connection.execute(
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

// Get all users (Paginated)
adminRouter.get("/users", verifyAdmin, async (req, res) => {
  try {
    const connection = getPool();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;
    
    // Get total count
    const [countResult]: any = await connection.execute("SELECT COUNT(*) as total FROM users");
    const total = countResult[0].total;
    
    // 100K users causes browser freeze without LIMIT
    const [users]: any = await connection.execute(
      `SELECT id, openId, name, email, phone, role, balance, completedTasks, totalEarnings, tier, profileStrength, countryId, isVerified, createdAt, updatedAt, lastSignedIn 
       FROM users 
       ORDER BY createdAt DESC 
       LIMIT ${limit} OFFSET ${offset}`
    );

    return res.json({
      success: true,
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
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
    
    const [users]: any = await connection.execute(
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
    const [users]: any = await connection.execute(
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
    const [existing]: any = await connection.execute(
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
    const [result]: any = await connection.execute(
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
    const [advertisers]: any = await connection.execute(
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
    
    const [advertisers]: any = await connection.execute(
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
    
    const [advertisers]: any = await connection.execute(
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
    const [advertisers]: any = await connection.execute(
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
    
    const [userCount]: any = await connection.execute("SELECT COUNT(*) as count FROM users");
    const [advertiserCount]: any = await connection.execute("SELECT COUNT(*) as count FROM advertisers WHERE isActive = 1");
    const [verifiedUsers]: any = await connection.execute("SELECT COUNT(*) as count FROM users WHERE isVerified = 1");
    const [pendingCampaigns]: any = await connection.execute("SELECT COUNT(*) as count FROM campaigns WHERE approvalStatus = 'pending'");
    


    return res.json({
      success: true,
      stats: {
        totalUsers: userCount[0].count,
        totalAdvertisers: advertiserCount[0].count,
        verifiedUsers: verifiedUsers[0].count,
        pendingCampaigns: pendingCampaigns[0].count,
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

// ==================== CAMPAIGN APPROVAL ====================

// Get campaigns pending review
adminRouter.get("/campaigns/pending", verifyAdmin, async (req, res) => {
  try {
    const connection = getPool();
    const [campaigns]: any = await connection.execute(`
      SELECT c.*, a.nameEn as advertiserName, a.nameAr as advertiserNameAr, a.logoUrl as advertiserLogo
      FROM campaigns c
      LEFT JOIN advertisers a ON c.advertiserId = a.id
      WHERE c.approvalStatus IN ('pending', 'pending_review')
      ORDER BY c.createdAt DESC
    `);
    return res.json({ success: true, campaigns });
  } catch (error) {
    console.error("[Admin] Get pending campaigns error:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch pending campaigns" });
  }
});

// Get all campaigns with approval status
adminRouter.get("/campaigns", verifyAdmin, async (req, res) => {
  try {
    const connection = getPool();
    const status = req.query.approvalStatus as string;
    let query = `
      SELECT c.*, a.nameEn as advertiserName, a.nameAr as advertiserNameAr, a.logoUrl as advertiserLogo
      FROM campaigns c
      LEFT JOIN advertisers a ON c.advertiserId = a.id
    `;
    const params: any[] = [];
    if (status) {
      query += ` WHERE c.approvalStatus = ?`;
      params.push(status);
    }
    query += ` ORDER BY c.createdAt DESC`;
    const [campaigns]: any = await connection.execute(query, params);
    return res.json({ success: true, campaigns });
  } catch (error) {
    console.error("[Admin] Get campaigns error:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch campaigns" });
  }
});

// Approve a campaign
adminRouter.post("/campaigns/:id/approve", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const connection = getPool();
    
    await connection.execute(`
      UPDATE campaigns 
      SET approvalStatus = 'approved', adminReviewNotes = ?, reviewedAt = NOW()
      WHERE id = ?
    `, [notes || 'Approved by admin', id]);

    return res.json({ success: true, message: "Campaign approved" });
  } catch (error) {
    console.error("[Admin] Approve campaign error:", error);
    return res.status(500).json({ success: false, error: "Failed to approve campaign" });
  }
});

// Reject a campaign
adminRouter.post("/campaigns/:id/reject", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const connection = getPool();
    
    if (!notes) {
      return res.status(400).json({ success: false, error: "Rejection reason is required" });
    }

    await connection.execute(`
      UPDATE campaigns 
      SET approvalStatus = 'rejected', adminReviewNotes = ?, reviewedAt = NOW()
      WHERE id = ?
    `, [notes, id]);

    return res.json({ success: true, message: "Campaign rejected" });
  } catch (error) {
    console.error("[Admin] Reject campaign error:", error);
    return res.status(500).json({ success: false, error: "Failed to reject campaign" });
  }
});

// Request revision on a campaign
adminRouter.post("/campaigns/:id/request-revision", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const connection = getPool();
    
    if (!notes) {
      return res.status(400).json({ success: false, error: "Revision notes are required" });
    }

    await connection.execute(`
      UPDATE campaigns 
      SET approvalStatus = 'revision_requested', adminReviewNotes = ?, reviewedAt = NOW()
      WHERE id = ?
    `, [notes, id]);

    return res.json({ success: true, message: "Revision requested" });
  } catch (error) {
    console.error("[Admin] Request revision error:", error);
    return res.status(500).json({ success: false, error: "Failed to request revision" });
  }
});

// ==================== DISPUTE MANAGEMENT ====================

// Get all disputes
adminRouter.get("/disputes", verifyAdmin, async (req, res) => {
  try {
    const connection = getPool();
    const status = req.query.status as string;
    let query = `
      SELECT d.*, 
             u.name as userName, u.email as userEmail,
             a.nameEn as advertiserName,
             c.nameEn as campaignName
      FROM disputes d
      LEFT JOIN users u ON d.userId = u.id
      LEFT JOIN advertisers a ON d.advertiserId = a.id
      LEFT JOIN campaigns c ON d.campaignId = c.id
    `;
    const params: any[] = [];
    if (status) {
      query += ` WHERE d.status = ?`;
      params.push(status);
    }
    query += ` ORDER BY d.createdAt DESC`;
    const [disputes]: any = await connection.execute(query, params);
    return res.json({ success: true, disputes });
  } catch (error) {
    console.error("[Admin] Get disputes error:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch disputes" });
  }
});

// Resolve a dispute
adminRouter.post("/disputes/:id/resolve", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution, adminNotes } = req.body;
    const connection = getPool();

    if (!resolution || !['resolved_user', 'resolved_advertiser', 'dismissed'].includes(resolution)) {
      return res.status(400).json({ 
        success: false, 
        error: "resolution must be 'resolved_user', 'resolved_advertiser', or 'dismissed'" 
      });
    }

    await connection.execute(`
      UPDATE disputes 
      SET status = ?, adminNotes = ?, resolvedAt = NOW()
      WHERE id = ?
    `, [resolution, adminNotes || null, id]);

    return res.json({ success: true, message: "Dispute resolved" });
  } catch (error) {
    console.error("[Admin] Resolve dispute error:", error);
    return res.status(500).json({ success: false, error: "Failed to resolve dispute" });
  }
});

// ==================== FRAUD DETECTION MANAGEMENT ====================

// Get all fraud flags
adminRouter.get("/fraud", verifyAdmin, async (req, res) => {
  try {
    const connection = getPool();
    const status = req.query.status as string;
    
    let query = `
      SELECT f.*, 
             u.name as userName, u.email as userEmail,
             c.nameEn as campaignName
      FROM fraud_flags f
      LEFT JOIN users u ON f.userId = u.id
      LEFT JOIN campaigns c ON f.campaignId = c.id
    `;
    const params: any[] = [];
    
    if (status) {
      query += ` WHERE f.status = ?`;
      params.push(status);
    }
    
    query += ` ORDER BY f.createdAt DESC`;
    
    const [flags]: any = await connection.execute(query, params);
    return res.json({ success: true, flags });
  } catch (error) {
    console.error("[Admin] Get fraud flags error (fallback to empty array):", error);
    return res.json({ success: true, flags: [] });
  }
});

// Resolve a fraud flag
adminRouter.post("/fraud/:id/resolve", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    const connection = getPool();

    // status should be 'resolved_innocent' or 'resolved_guilty'
    if (!status || !['resolved_innocent', 'resolved_guilty'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: "status must be 'resolved_innocent' or 'resolved_guilty'" 
      });
    }

    await connection.execute(`
      UPDATE fraud_flags 
      SET status = ?, adminNotes = ?, resolvedAt = NOW()
      WHERE id = ?
    `, [status, adminNotes || null, id]);

    // If resolved innocent, we should probably update the related task_submission to approved
    if (status === 'resolved_innocent') {
      const [flag]: any = await connection.execute(`SELECT taskCompletionId FROM fraud_flags WHERE id = ?`, [id]);
      if (flag && flag[0] && flag[0].taskCompletionId) {
        await connection.execute(`
          UPDATE task_submissions SET status = 'approved' WHERE id = ?
        `, [flag[0].taskCompletionId]);
      }
    } else if (status === 'resolved_guilty') {
      const [flag]: any = await connection.execute(`SELECT taskCompletionId FROM fraud_flags WHERE id = ?`, [id]);
      if (flag && flag[0] && flag[0].taskCompletionId) {
        await connection.execute(`
          UPDATE task_submissions SET status = 'rejected' WHERE id = ?
        `, [flag[0].taskCompletionId]);
      }
    }

    return res.json({ success: true, message: "Fraud flag resolved" });
  } catch (error) {
    console.error("[Admin] Resolve fraud flag error:", error);
    return res.status(500).json({ success: false, error: "Failed to resolve fraud flag" });
  }
});

// ==================== WITHDRAWAL BATCH PROCESSING ====================

/**
 * GET /api/admin/withdrawal-batches
 * Get pending withdrawals grouped by tier queue
 */
adminRouter.get("/withdrawal-batches", verifyAdmin, async (req, res) => {
  try {
    const connection = getPool();

    // Get all pending withdrawals joined with user tier info
    const [rows]: any = await connection.execute(`
      SELECT 
        wr.id, wr.userId, wr.amount, wr.method, wr.accountDetails,
        wr.commissionRate, wr.commissionAmount, wr.netAmount,
        wr.requestedAt,
        u.name as userName, u.email as userEmail, u.tier as userTier
      FROM withdrawal_requests wr
      JOIN users u ON wr.userId = u.id
      WHERE wr.status = 'pending'
      ORDER BY wr.requestedAt ASC
    `);

    // Group by tier queue
    const threeHourQueue = rows.filter((r: any) => r.userTier === 'gold' || r.userTier === 'platinum');
    const weeklyQueue = rows.filter((r: any) => r.userTier === 'silver');
    const monthlyQueue = rows.filter((r: any) => r.userTier === 'bronze' || (!r.userTier));

    return res.json({
      success: true,
      batches: {
        threeHour: {
          label: '3-Hour (Gold/Platinum)',
          count: threeHourQueue.length,
          totalAmount: threeHourQueue.reduce((s: number, r: any) => s + Number(r.netAmount || r.amount), 0),
          items: threeHourQueue
        },
        weekly: {
          label: 'Weekly (Silver)',
          count: weeklyQueue.length,
          totalAmount: weeklyQueue.reduce((s: number, r: any) => s + Number(r.netAmount || r.amount), 0),
          items: weeklyQueue
        },
        monthly: {
          label: 'Monthly (Bronze)',
          count: monthlyQueue.length,
          totalAmount: monthlyQueue.reduce((s: number, r: any) => s + Number(r.netAmount || r.amount), 0),
          items: monthlyQueue
        }
      }
    });
  } catch (error) {
    console.error("[Admin] Withdrawal batches error:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch withdrawal batches" });
  }
});

/**
 * POST /api/admin/withdrawal-batches/process
 * Process a batch of withdrawals (mark as completed)
 */
adminRouter.post("/withdrawal-batches/process", verifyAdmin, async (req, res) => {
  try {
    const { ids } = req.body; // array of withdrawal request IDs

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, error: "No withdrawal IDs provided" });
    }

    const connection = getPool();
    let processed = 0;

    for (const id of ids) {
      // Mark as completed
      const [result]: any = await connection.execute(
        `UPDATE withdrawal_requests SET status = 'completed', processedAt = NOW() WHERE id = ? AND status = 'pending'`,
        [id]
      );
      if (result.affectedRows > 0) {
        processed++;
        // Also update the linked transaction
        await connection.execute(
          `UPDATE transactions SET status = 'completed' WHERE id = (SELECT transactionId FROM withdrawal_requests WHERE id = ?)`,
          [id]
        );
      }
    }

    return res.json({
      success: true,
      message: `${processed} withdrawal(s) processed successfully`,
      processedCount: processed
    });
  } catch (error) {
    console.error("[Admin] Process batch error:", error);
    return res.status(500).json({ success: false, error: "Failed to process withdrawal batch" });
  }
});
