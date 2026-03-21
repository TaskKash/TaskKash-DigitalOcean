import { Router, Request, Response } from 'express';
import { query } from './mysql-db';
import bcrypt from 'bcryptjs';
import { sdk } from './sdk';
import { COOKIE_NAME } from '../../shared/const';

const router = Router();

// ─── Auth Middleware ──────────────────────────────────────────────────────────
// Resolves the userId from the session cookie. All privacy routes are user-only.
async function requireUser(req: Request, res: Response): Promise<number | null> {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    res.status(401).json({ error: 'Not authenticated' });
    return null;
  }
  try {
    const session = await sdk.verifySession(token);
    if (!session?.openId || session.openId.startsWith('advertiser_') || session.openId.startsWith('admin_')) {
      res.status(403).json({ error: 'Access denied' });
      return null;
    }
    const rows = await query('SELECT id FROM users WHERE openId = ? LIMIT 1', [session.openId]);
    if (!rows || rows.length === 0) {
      res.status(401).json({ error: 'User not found' });
      return null;
    }
    return rows[0].id as number;
  } catch {
    res.status(401).json({ error: 'Invalid session' });
    return null;
  }
}

// Helper to get IP address from request
function getIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return (Array.isArray(forwarded) ? forwarded[0] : forwarded).split(',')[0].trim();
  return req.socket?.remoteAddress || '0.0.0.0';
}

// Consent types supported
const CONSENT_TYPES = ['personalisation', 'analytics', 'marketing', 'income_spi', 'linked_cards'] as const;
const CONSENT_VERSION = '2025-v1';

// ─── GET /api/privacy/consents ─────────────────────────────────────────────────
// Returns latest active state per consent type for the current user
router.get('/consents', async (req: Request, res: Response) => {
  const userId = await requireUser(req, res);
  if (!userId) return;

  try {
    // For each consentType, get the most recent row
    const rows = await query(`
      SELECT consentType, eventType
      FROM userconsents c1
      WHERE userId = ?
        AND consentType IN ('personalisation','analytics','marketing','income_spi','linked_cards')
        AND createdAt = (
          SELECT MAX(createdAt) FROM userconsents c2
          WHERE c2.userId = c1.userId AND c2.consentType = c1.consentType
        )
    `, [userId]);

    const consentMap: Record<string, boolean> = {};
    for (const type of CONSENT_TYPES) {
      consentMap[type] = true; // DEFAULT TO TRUE
    }
    for (const row of rows) {
      consentMap[row.consentType] = row.eventType === 'granted';
    }

    res.json({ consents: consentMap });
  } catch (e: any) {
    console.error('[Privacy] GET consents error:', e.message);
    res.status(500).json({ error: 'Failed to fetch consent state' });
  }
});

// ─── POST /api/privacy/consents ────────────────────────────────────────────────
// Appends a new grant/revoke row for a single consent type. Never modifies existing rows.
router.post('/consents', async (req: Request, res: Response) => {
  const userId = await requireUser(req, res);
  if (!userId) return;

  const { consentType, granted } = req.body as { consentType: string; granted: boolean };

  if (!CONSENT_TYPES.includes(consentType as any)) {
    return res.status(400).json({ error: 'Invalid consentType' });
  }
  if (typeof granted !== 'boolean') {
    return res.status(400).json({ error: 'granted must be a boolean' });
  }

  try {
    const eventType = granted ? 'granted' : 'revoked';
    const ipAddress = getIp(req);

    await query(
      'INSERT INTO userconsents (userId, consentType, consentVersion, eventType, ipAddress, createdAt) VALUES (?, ?, ?, ?, ?, NOW())',
      [userId, consentType, CONSENT_VERSION, eventType, ipAddress]
    );

    res.json({ success: true, consentType, eventType });
  } catch (e: any) {
    console.error('[Privacy] POST consents error:', e.message);
    res.status(500).json({ error: 'Failed to save consent' });
  }
});

// ─── GET /api/privacy/profile ────────────────────────────────────────────────
// Returns joined user + userProfiles data as a human-readable profile summary
router.get('/profile', async (req: Request, res: Response) => {
  const userId = await requireUser(req, res);
  if (!userId) return;

  try {
    const userRows = await query(
      'SELECT id, name, email, phone, city, district, age, gender, incomeLevel, tier, profileStrength, completedTasks, totalEarnings, kycStatus, countryId, createdAt FROM users WHERE id = ? LIMIT 1',
      [userId]
    );
    if (!userRows || userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = userRows[0];

    const profileRows = await query(
      `SELECT deviceModel, deviceOs, deviceTier, networkCarrier, connectionType,
              interests, brandAffinity, lifeStage, nextPurchaseIntent, shoppingFrequency,
              preferredStores, householdSize, values, industry, jobTitle, workType,
              hasVehicle, vehicleBrand, vehicleModel, homeOwnership,
              urgencyScore, impulseScore, influenceScore, activityPattern
       FROM userprofiles WHERE userId = ? LIMIT 1`,
      [userId]
    );
    const profile = profileRows?.[0] || {};

    // Safely parse JSON arrays
    const parseJsonArray = (val: any): string[] => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      try { return JSON.parse(val); } catch { return []; }
    };

    res.json({
      identity: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,
        district: user.district,
      },
      demographic: {
        age: user.age,
        gender: user.gender,
        incomeLevel: user.incomeLevel,
        tier: user.tier,
        kycStatus: user.kycStatus,
        memberSince: user.createdAt,
      },
      device: {
        deviceModel: profile.deviceModel,
        deviceOs: profile.deviceOs,
        deviceTier: profile.deviceTier,
        networkCarrier: profile.networkCarrier,
        connectionType: profile.connectionType,
      },
      psychographic: {
        interests: parseJsonArray(profile.interests),
        brandAffinity: parseJsonArray(profile.brandAffinity),
        values: parseJsonArray(profile.values),
        lifeStage: profile.lifeStage,
      },
      behavioral: {
        shoppingFrequency: profile.shoppingFrequency,
        preferredStores: parseJsonArray(profile.preferredStores),
        nextPurchaseIntent: parseJsonArray(profile.nextPurchaseIntent),
        workType: profile.workType,
        homeOwnership: profile.homeOwnership,
        activityPattern: profile.activityPattern,
      },
      engagement: {
        profileStrength: user.profileStrength,
        completedTasks: user.completedTasks,
        totalEarnings: user.totalEarnings,
        influenceScore: profile.influenceScore,
      },
    });
  } catch (e: any) {
    console.error('[Privacy] GET profile error:', e.message);
    res.status(500).json({ error: 'Failed to fetch profile data' });
  }
});

// ─── GET /api/privacy/export ─────────────────────────────────────────────────
// Downloads user data as JSON or CSV. Rate-limited: 3 exports per 24h per user.
router.get('/export', async (req: Request, res: Response) => {
  const userId = await requireUser(req, res);
  if (!userId) return;

  const format = (req.query.format as string) || 'json';
  if (format !== 'json' && format !== 'csv') {
    return res.status(400).json({ error: 'format must be json or csv' });
  }

  try {
    // Rate limit check: count 'exported' events in last 24h for this user
    const rateRows = await query(
      `SELECT COUNT(*) as cnt FROM userconsents
       WHERE userId = ? AND eventType = 'exported' AND createdAt >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`,
      [userId]
    );
    const exportCount = Number(rateRows?.[0]?.cnt || 0);
    if (exportCount >= 3) {
      return res.status(429).json({
        error: 'Export limit reached. You can download your data at most 3 times per 24 hours.',
        retryAfter: '24h',
      });
    }

    // Fetch user data
    const userRows = await query(
      'SELECT id, name, email, phone, city, district, age, gender, incomeLevel, tier, profileStrength, completedTasks, totalEarnings, kycStatus, createdAt FROM users WHERE id = ? LIMIT 1',
      [userId]
    );
    if (!userRows || userRows.length === 0) return res.status(404).json({ error: 'User not found' });
    const user = userRows[0];

    // Fetch profile data
    const profileRows = await query('SELECT * FROM userprofiles WHERE userId = ? LIMIT 1', [userId]);
    const profile = profileRows?.[0] || {};

    // Fetch last 50 consent events (excluding KYC vault — AML hold)
    const consentRows = await query(
      `SELECT consentType, consentVersion, eventType, createdAt FROM userconsents
       WHERE userId = ? ORDER BY createdAt DESC LIMIT 50`,
      [userId]
    );

    const parseJsonArray = (val: any): string[] => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      try { return JSON.parse(val); } catch { return []; }
    };

    const dateStr = new Date().toISOString().split('T')[0];

    // Log the export event (append-only audit)
    await query(
      'INSERT INTO userconsents (userId, consentType, consentVersion, eventType, ipAddress, createdAt) VALUES (?, ?, ?, ?, ?, NOW())',
      [userId, 'data_export', CONSENT_VERSION, 'exported', getIp(req)]
    );

    if (format === 'json') {
      const exportData = {
        exportedAt: new Date().toISOString(),
        exportVersion: '1.0',
        legal: 'KYC/AML identity verification records are retained separately per AML law and are not included.',
        identity: { name: user.name, email: user.email, phone: user.phone, city: user.city, district: user.district },
        demographic: { age: user.age, gender: user.gender, incomeLevel: user.incomeLevel, tier: user.tier, kycStatus: user.kycStatus },
        device: { deviceModel: profile.deviceModel, deviceOs: profile.deviceOs, deviceTier: profile.deviceTier, networkCarrier: profile.networkCarrier, connectionType: profile.connectionType },
        psychographic: {
          interests: parseJsonArray(profile.interests),
          brandAffinity: parseJsonArray(profile.brandAffinity),
          values: parseJsonArray(profile.values),
          lifeStage: profile.lifeStage,
        },
        behavioral: {
          shoppingFrequency: profile.shoppingFrequency,
          preferredStores: parseJsonArray(profile.preferredStores),
          nextPurchaseIntent: parseJsonArray(profile.nextPurchaseIntent),
          workType: profile.workType,
          homeOwnership: profile.homeOwnership,
        },
        engagement: { profileStrength: user.profileStrength, completedTasks: user.completedTasks, totalEarnings: user.totalEarnings },
        consentHistory: consentRows.map((r: any) => ({ consentType: r.consentType, eventType: r.eventType, timestamp: r.createdAt })),
        memberSince: user.createdAt,
      };

      res.setHeader('Content-Disposition', `attachment; filename="taskkash-my-data-${dateStr}.json"`);
      res.setHeader('Content-Type', 'application/json');
      return res.json(exportData);
    } else {
      // CSV format — flatten all fields, JSON arrays as comma-joined strings
      const csvRows: string[][] = [];
      csvRows.push(['Field', 'Value']);
      // Identity
      csvRows.push(['name', user.name || '']);
      csvRows.push(['email', user.email || '']);
      csvRows.push(['phone', user.phone || '']);
      csvRows.push(['city', user.city || '']);
      csvRows.push(['district', user.district || '']);
      // Demographic
      csvRows.push(['age', user.age || '']);
      csvRows.push(['gender', user.gender || '']);
      csvRows.push(['incomeLevel', user.incomeLevel || '']);
      csvRows.push(['tier', user.tier || '']);
      csvRows.push(['kycStatus', user.kycStatus || '']);
      // Device
      csvRows.push(['deviceModel', profile.deviceModel || '']);
      csvRows.push(['deviceOs', profile.deviceOs || '']);
      csvRows.push(['deviceTier', profile.deviceTier || '']);
      csvRows.push(['networkCarrier', profile.networkCarrier || '']);
      csvRows.push(['connectionType', profile.connectionType || '']);
      // Psychographic (JSON arrays flattened)
      csvRows.push(['interests', parseJsonArray(profile.interests).join(', ')]);
      csvRows.push(['brandAffinity', parseJsonArray(profile.brandAffinity).join(', ')]);
      csvRows.push(['values', parseJsonArray(profile.values).join(', ')]);
      csvRows.push(['lifeStage', profile.lifeStage || '']);
      // Behavioral
      csvRows.push(['shoppingFrequency', profile.shoppingFrequency || '']);
      csvRows.push(['preferredStores', parseJsonArray(profile.preferredStores).join(', ')]);
      csvRows.push(['nextPurchaseIntent', parseJsonArray(profile.nextPurchaseIntent).join(', ')]);
      csvRows.push(['workType', profile.workType || '']);
      csvRows.push(['homeOwnership', profile.homeOwnership || '']);
      // Engagement
      csvRows.push(['profileStrength', String(user.profileStrength || 0)]);
      csvRows.push(['completedTasks', String(user.completedTasks || 0)]);
      csvRows.push(['totalEarnings', String(user.totalEarnings || 0)]);
      csvRows.push(['memberSince', String(user.createdAt || '')]);
      // Consent history (each as its own row)
      csvRows.push(['', '']);
      csvRows.push(['--- CONSENT HISTORY (last 50) ---', '']);
      for (const c of consentRows) {
        csvRows.push([`${c.consentType} | ${c.eventType}`, String(c.createdAt)]);
      }

      const csvContent = csvRows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

      res.setHeader('Content-Disposition', `attachment; filename="taskkash-my-data-${dateStr}.csv"`);
      res.setHeader('Content-Type', 'text/csv');
      return res.send(csvContent);
    }
  } catch (e: any) {
    console.error('[Privacy] GET export error:', e.message);
    res.status(500).json({ error: 'Failed to generate export' });
  }
});

// ─── POST /api/privacy/delete-request ────────────────────────────────────────
// Submits account deletion request. Requires bcrypt password confirmation.
router.post('/delete-request', async (req: Request, res: Response) => {
  const userId = await requireUser(req, res);
  if (!userId) return;

  const { password } = req.body as { password: string };
  if (!password) {
    return res.status(400).json({ error: 'Password confirmation is required' });
  }

  try {
    // Fetch user with password hash and current balance
    const userRows = await query('SELECT id, password, balance, email FROM users WHERE id = ? LIMIT 1', [userId]);
    if (!userRows || userRows.length === 0) return res.status(404).json({ error: 'User not found' });
    const user = userRows[0];

    // Balance gate: must be zero before deletion
    if (user.balance > 0) {
      return res.status(400).json({
        error: 'balance_not_zero',
        message: 'Please withdraw your remaining balance before deleting your account.',
        balance: user.balance,
      });
    }

    // Bcrypt password verification
    if (!user.password) {
      return res.status(400).json({ error: 'No password set on this account. Use your social login provider to manage your account.' });
    }
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return res.status(403).json({ error: 'Password confirmation failed. Deletion request rejected.' });
    }

    // Mark for deletion (soft-delete)
    await query(
      'UPDATE users SET pendingDeletion = 1, deletionRequestedAt = NOW() WHERE id = ?',
      [userId]
    );

    // Log deletion request in consent audit log
    await query(
      'INSERT INTO userconsents (userId, consentType, consentVersion, eventType, ipAddress, createdAt) VALUES (?, ?, ?, ?, ?, NOW())',
      [userId, 'account_deletion', CONSENT_VERSION, 'revoked', getIp(req)]
    );

    res.json({
      success: true,
      message: 'Your deletion request has been received. Your account will be fully deleted within 30 days.',
      note: 'Your identity verification records will be retained for 5–7 years as required by AML law.',
    });
  } catch (e: any) {
    console.error('[Privacy] POST delete-request error:', e.message);
    res.status(500).json({ error: 'Failed to submit deletion request' });
  }
});

export default router;
