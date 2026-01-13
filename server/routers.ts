import { COOKIE_NAME } from "./_core/cookies";
import bcrypt from 'bcryptjs';
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb, getUserByOpenId } from "./db";
import { sdk } from "./_core/sdk";
import { advertisers, countries, tasks, users } from "../drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

// Import services
import { calculateCommission, getCommissionRates } from "./services/commission.service";
import { 
  checkUserTierEligibility, 
  checkAdvertiserTierEligibility,
  upgradeUserTier,
  upgradeAdvertiserTier,
  getTierInfo 
} from "./services/tier.service";
import {
  getUserBalance,
  requestWithdrawal,
  processWithdrawal,
  getTransactionHistory,
  getPendingWithdrawals,
  getTotalEarnings,
  getTotalWithdrawals
} from "./services/wallet.service";
import {
  createTask,
  getAvailableTasks,
  assignTaskToUser,
  submitTaskCompletion,
  verifyTaskCompletion,
  getUserTasks,
  getAdvertiserTasks
} from "./services/task.service";

// Helper function to recalculate profile strength
async function recalculateProfileStrength(userId: number) {
  const db = await getDb();
  if (!db) return;
  
  let strength = 0;
  
  // Phone verified = 20%
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (user[0]?.phoneVerified) strength += 20;
  
  // Email verified = 10%
  if (user[0]?.emailVerified) strength += 10;
  
  // KYC verified = 20%
  const kycVerification = await db.execute(sql`SELECT * FROM user_verifications WHERE userId = ${userId} AND verificationType = 'national_id' AND status = 'verified'`);
  if ((kycVerification as any[]).length > 0) strength += 20;
  
  // Social profile connected = 10%
  const socialProfiles = await db.execute(sql`SELECT * FROM user_social_profiles WHERE userId = ${userId}`);
  if ((socialProfiles as any[]).length > 0) strength += 10;
  
  // Profile questions answered = up to 40%
  const profileData = await db.execute(sql`SELECT * FROM user_profile_data WHERE userId = ${userId}`);
  const questionCount = (profileData as any[]).length;
  strength += Math.min(questionCount * 4, 40);
  
  await db.update(users).set({ profileStrength: Math.min(strength, 100) }).where(eq(users.id, userId));
}

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    // Send OTP to phone number
    sendOTP: publicProcedure
      .input(z.object({
        phone: z.string().min(10).max(20),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        
        await db.execute(sql`DELETE FROM otp_codes WHERE phone = ${input.phone}`);
        await db.execute(sql`
          INSERT INTO otp_codes (phone, code, expiresAt, verified, attempts)
          VALUES (${input.phone}, ${code}, ${expiresAt}, FALSE, 0)
        `);
        
        console.log(`[MOCK OTP] Code ${code} sent to ${input.phone}`);
        
        return {
          success: true,
          message: `OTP sent to ${input.phone}`,
          mockCode: code, // Remove in production
        };
      }),
    
    // Verify OTP and login/register user
    verifyOTP: publicProcedure
      .input(z.object({
        phone: z.string().min(10).max(20),
        code: z.string().length(6),
        deviceInfo: z.object({
          deviceBrand: z.string().optional(),
          deviceModel: z.string().optional(),
          osName: z.string().optional(),
          osVersion: z.string().optional(),
        }).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const otpResult = await db.execute(sql`
          SELECT * FROM otp_codes 
          WHERE phone = ${input.phone} AND verified = FALSE 
          ORDER BY createdAt DESC LIMIT 1
        `);
        const otpRows = (otpResult as any)[0];
        const otpRecord = otpRows?.[0];
        
        if (!otpRecord) {
          throw new Error('No OTP found. Please request a new one.');
        }
        
        if (new Date(otpRecord.expiresAt) < new Date()) {
          throw new Error('OTP has expired. Please request a new one.');
        }
        
        if (otpRecord.attempts >= 3) {
          throw new Error('Too many attempts. Please request a new OTP.');
        }
        
        await db.execute(sql`UPDATE otp_codes SET attempts = attempts + 1 WHERE id = ${otpRecord.id}`);
        
        if (otpRecord.code !== input.code) {
          throw new Error('Invalid OTP code.');
        }
        
        await db.execute(sql`UPDATE otp_codes SET verified = TRUE WHERE id = ${otpRecord.id}`);
        
        // Check if user exists
        const userResult = await db.select().from(users).where(eq(users.phone, input.phone)).limit(1);
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
            nationality: 'Egypt',
          });
          
          const newUserResult = await db.select().from(users).where(eq(users.phone, input.phone)).limit(1);
          user = newUserResult[0];
          
          await db.execute(sql`
            INSERT INTO user_verifications (userId, verificationType, status, verifiedAt, extractedData)
            VALUES (${user.id}, 'phone', 'verified', NOW(), ${JSON.stringify({ phone: input.phone })})
          `);
          
          await db.execute(sql`
            INSERT INTO user_consents (userId, consentType, isGranted, grantedAt, ipAddress)
            VALUES 
              (${user.id}, 'mandatory_kyc', TRUE, NOW(), ${(ctx.req as any).ip || 'unknown'}),
              (${user.id}, 'analytics', TRUE, NOW(), ${(ctx.req as any).ip || 'unknown'})
          `);
        } else {
          await db.update(users).set({ phoneVerified: true, lastSignedIn: new Date() }).where(eq(users.id, user.id));
        }
        
        // Log device info
        if (input.deviceInfo) {
          const deviceId = `device_${user.id}_${Date.now()}`;
          await db.execute(sql`UPDATE user_devices SET isCurrentDevice = FALSE WHERE userId = ${user.id}`);
          await db.execute(sql`
            INSERT INTO user_devices (userId, deviceId, deviceBrand, deviceModel, osName, osVersion, ipAddress, isCurrentDevice)
            VALUES (${user.id}, ${deviceId}, ${input.deviceInfo.deviceBrand || 'Unknown'}, ${input.deviceInfo.deviceModel || 'Unknown'}, ${input.deviceInfo.osName || 'Unknown'}, ${input.deviceInfo.osVersion || 'Unknown'}, ${(ctx.req as any).ip || 'unknown'}, TRUE)
          `);
        }
        
        const sessionToken = await sdk.createSessionToken(user.openId, { name: user.name || '' });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);
        
        return { success: true, user, isNewUser };
      }),
    
    // Phone login (direct - for demo)
    phoneLogin: publicProcedure
      .input(z.object({
        phone: z.string().min(10).max(20),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const result = await db.select().from(users).where(eq(users.phone, input.phone)).limit(1);
        const user = result[0];
        
        if (!user) {
          throw new Error('User not found. Please register first.');
        }
        
        await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));
        
        const sessionToken = await sdk.createSessionToken(user.openId, { name: user.name || '' });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);
        
        return { success: true, user };
      }),
    
    // Email/Password login
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const result = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
        const user = result[0];
        
        if (!user) throw new Error('Invalid email or password');
        if (!user.password) throw new Error('Password authentication not configured');
        
        const isPasswordValid = await bcrypt.compare(input.password, user.password);
        if (!isPasswordValid) throw new Error('Invalid email or password');
        
        const sessionToken = await sdk.createSessionToken(user.openId, { name: user.name || '' });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);
        
        return { success: true, user };
      }),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    }),
  }),

  // User Profile & Verification API
  userProfile: router({
    getProfile: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const user = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
        if (!user[0]) throw new Error('User not found');
        
        const verifications = await db.execute(sql`SELECT * FROM user_verifications WHERE userId = ${input.userId}`);
        const socialProfiles = await db.execute(sql`SELECT * FROM user_social_profiles WHERE userId = ${input.userId}`);
        const consents = await db.execute(sql`SELECT * FROM user_consents WHERE userId = ${input.userId}`);
        const devices = await db.execute(sql`SELECT * FROM user_devices WHERE userId = ${input.userId} ORDER BY lastSeenAt DESC`);
        const profileData = await db.execute(sql`SELECT * FROM user_profile_data WHERE userId = ${input.userId}`);
        
        return { user: user[0], verifications, socialProfiles, consents, devices, profileData };
      }),
    
    updateProfile: publicProcedure
      .input(z.object({
        userId: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        avatar: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const updateData: any = {};
        if (input.name) updateData.name = input.name;
        if (input.email) updateData.email = input.email;
        if (input.avatar) updateData.avatar = input.avatar;
        
        await db.update(users).set(updateData).where(eq(users.id, input.userId));
        return { success: true };
      }),
    
    submitKYC: publicProcedure
      .input(z.object({
        userId: z.number(),
        documentType: z.enum(['national_id', 'passport', 'drivers_license']),
        documentUrl: z.string(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const extractedData = {
          fullName: 'Verified User Name',
          documentNumber: Math.floor(Math.random() * 9000000000000 + 1000000000000).toString(),
          dateOfBirth: '1990-01-15',
          gender: Math.random() > 0.5 ? 'male' : 'female',
          nationality: 'Egypt',
        };
        
        await db.execute(sql`
          INSERT INTO user_verifications (userId, verificationType, status, documentUrl, extractedData, verifiedAt)
          VALUES (${input.userId}, ${input.documentType}, 'verified', ${input.documentUrl}, ${JSON.stringify(extractedData)}, NOW())
          ON DUPLICATE KEY UPDATE status = 'verified', documentUrl = ${input.documentUrl}, extractedData = ${JSON.stringify(extractedData)}, verifiedAt = NOW()
        `);
        
        await db.update(users).set({ 
          kycLevel: 2, 
          isVerified: 1,
          fullName: extractedData.fullName,
          dateOfBirth: extractedData.dateOfBirth,
          gender: extractedData.gender as any,
          nationality: extractedData.nationality,
          lastKycAt: new Date(),
        }).where(eq(users.id, input.userId));
        
        await recalculateProfileStrength(input.userId);
        
        return { success: true, extractedData };
      }),
    
    connectSocial: publicProcedure
      .input(z.object({
        userId: z.number(),
        provider: z.enum(['google', 'facebook', 'instagram']),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const mockId = Math.floor(Math.random() * 9000000000 + 1000000000).toString();
        const profile = {
          socialId: `${input.provider}_${mockId}`,
          email: input.provider !== 'instagram' ? `mockuser${mockId.slice(-4)}@${input.provider === 'google' ? 'gmail.com' : 'yahoo.com'}` : null,
          displayName: `Mock ${input.provider.charAt(0).toUpperCase() + input.provider.slice(1)} User`,
          avatarUrl: `https://ui-avatars.com/api/?name=Mock+User&background=random`,
        };
        
        await db.execute(sql`
          INSERT INTO user_social_profiles (userId, provider, socialId, email, displayName, avatarUrl, connectedAt)
          VALUES (${input.userId}, ${input.provider}, ${profile.socialId}, ${profile.email}, ${profile.displayName}, ${profile.avatarUrl}, NOW())
          ON DUPLICATE KEY UPDATE socialId = ${profile.socialId}, email = ${profile.email}, displayName = ${profile.displayName}, avatarUrl = ${profile.avatarUrl}, lastSyncAt = NOW()
        `);
        
        if (profile.email) {
          await db.update(users).set({ email: profile.email, emailVerified: true }).where(eq(users.id, input.userId));
        }
        
        await recalculateProfileStrength(input.userId);
        
        return { success: true, profile };
      }),
    
    updateConsent: publicProcedure
      .input(z.object({
        userId: z.number(),
        consentType: z.enum(['mandatory_kyc', 'personalization', 'analytics', 'marketing', 'data_sharing']),
        isGranted: z.boolean(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const now = new Date().toISOString();
        
        await db.execute(sql`
          INSERT INTO user_consents (userId, consentType, isGranted, grantedAt, withdrawnAt, ipAddress)
          VALUES (${input.userId}, ${input.consentType}, ${input.isGranted}, ${input.isGranted ? now : null}, ${!input.isGranted ? now : null}, ${(ctx.req as any).ip || 'unknown'})
          ON DUPLICATE KEY UPDATE isGranted = ${input.isGranted}, grantedAt = IF(${input.isGranted}, ${now}, grantedAt), withdrawnAt = IF(${!input.isGranted}, ${now}, NULL), ipAddress = ${(ctx.req as any).ip || 'unknown'}, updatedAt = NOW()
        `);
        
        return { success: true };
      }),
    
    saveProfileAnswer: publicProcedure
      .input(z.object({
        userId: z.number(),
        questionKey: z.string(),
        answerValue: z.string(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        await db.execute(sql`
          INSERT INTO user_profile_data (userId, questionKey, answerValue)
          VALUES (${input.userId}, ${input.questionKey}, ${input.answerValue})
          ON DUPLICATE KEY UPDATE answerValue = ${input.answerValue}, updatedAt = NOW()
        `);
        
        await recalculateProfileStrength(input.userId);
        
        return { success: true };
      }),
  }),

  // Countries API
  countries: router({
    list: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      return await db.select().from(countries).where(eq(countries.isActive, 1));
    }),
    getByCode: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        const result = await db.select().from(countries)
          .where(eq(countries.code, input.code))
          .limit(1);
        return result[0] || null;
      }),
  }),

  // Commission API
  commission: router({
    calculate: publicProcedure
      .input(z.object({
        taskValue: z.number(),
        userTier: z.string().optional(),
        advertiserTier: z.string().optional(),
      }))
      .query(({ input }) => {
        return calculateCommission(input.taskValue, input.userTier, input.advertiserTier);
      }),
    getRates: publicProcedure
      .input(z.object({
        userTier: z.string().optional(),
        advertiserTier: z.string().optional(),
      }))
      .query(({ input }) => {
        return getCommissionRates(input.userTier, input.advertiserTier);
      }),
  }),

  // Tier Management API
  tiers: router({
    checkUserEligibility: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await checkUserTierEligibility(input.userId);
      }),
    upgradeUser: publicProcedure
      .input(z.object({
        userId: z.number(),
        targetTier: z.string(),
      }))
      .mutation(async ({ input }) => {
        return await upgradeUserTier(input.userId, input.targetTier);
      }),
    checkAdvertiserEligibility: publicProcedure
      .input(z.object({ advertiserId: z.string() }))
      .query(async ({ input }) => {
        return await checkAdvertiserTierEligibility(input.advertiserId);
      }),
    upgradeAdvertiser: publicProcedure
      .input(z.object({
        advertiserId: z.string(),
        targetTier: z.string(),
      }))
      .mutation(async ({ input }) => {
        return await upgradeAdvertiserTier(input.advertiserId, input.targetTier);
      }),
    getInfo: publicProcedure
      .input(z.object({ tier: z.string() }))
      .query(({ input }) => {
        return getTierInfo(input.tier);
      }),
  }),

  // Wallet API
  wallet: router({
    getBalance: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await getUserBalance(input.userId);
      }),
    requestWithdrawal: publicProcedure
      .input(z.object({
        userId: z.number(),
        amount: z.number(),
        method: z.string(),
        accountDetails: z.string(),
      }))
      .mutation(async ({ input }) => {
        return await requestWithdrawal(input.userId, input.amount, input.method, input.accountDetails);
      }),
    processWithdrawal: publicProcedure
      .input(z.object({
        withdrawalId: z.string(),
        status: z.enum(['approved', 'rejected']),
        adminNotes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await processWithdrawal(input.withdrawalId, input.status, input.adminNotes);
      }),
    getTransactions: publicProcedure
      .input(z.object({
        userId: z.number(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await getTransactionHistory(input.userId, input.limit, input.offset);
      }),
    getPendingWithdrawals: publicProcedure.query(async () => {
      return await getPendingWithdrawals();
    }),
    getTotalEarnings: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await getTotalEarnings(input.userId);
      }),
    getTotalWithdrawals: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await getTotalWithdrawals(input.userId);
      }),
  }),

  // Tasks API
  tasks: router({
    create: publicProcedure
      .input(z.object({
        advertiserId: z.string(),
        title: z.string(),
        description: z.string(),
        type: z.string(),
        reward: z.number(),
        requirements: z.any().optional(),
        maxCompletions: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return await createTask(input);
      }),
    getAvailable: publicProcedure
      .input(z.object({
        userId: z.number().optional(),
        type: z.string().optional(),
        limit: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await getAvailableTasks(input.userId, input.type, input.limit);
      }),
    assign: publicProcedure
      .input(z.object({
        taskId: z.number(),
        userId: z.number(),
      }))
      .mutation(async ({ input }) => {
        return await assignTaskToUser(input.taskId, input.userId);
      }),
    submit: publicProcedure
      .input(z.object({
        taskId: z.number(),
        userId: z.number(),
        proof: z.any().optional(),
      }))
      .mutation(async ({ input }) => {
        return await submitTaskCompletion(input.taskId, input.userId, input.proof);
      }),
    verify: publicProcedure
      .input(z.object({
        submissionId: z.string(),
        status: z.enum(['approved', 'rejected']),
        reviewNotes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await verifyTaskCompletion(input.submissionId, input.status, input.reviewNotes);
      }),
    getUserTasks: publicProcedure
      .input(z.object({
        userId: z.number(),
        status: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await getUserTasks(input.userId, input.status);
      }),
    getAdvertiserTasks: publicProcedure
      .input(z.object({
        advertiserId: z.string(),
        status: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await getAdvertiserTasks(input.advertiserId, input.status);
      }),
  }),

  // Advertisers API
  advertisers: router({
    list: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      return await db.select().from(advertisers);
    }),
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        const result = await db.select().from(advertisers)
          .where(eq(advertisers.slug, input.slug))
          .limit(1);
        return result[0] || null;
      }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        const result = await db.select().from(advertisers)
          .where(eq(advertisers.id, input.id))
          .limit(1);
        return result[0] || null;
      }),
  }),

  // Campaign Builder APIs
  campaignBuilder: router({
    // Get estimated reach based on targeting criteria
    getEstimatedReach: publicProcedure
      .input(z.object({
        targeting: z.object({
          ageMin: z.number().optional(),
          ageMax: z.number().optional(),
          gender: z.enum(['male', 'female', 'all']).optional(),
          minKYCLevel: z.number().optional(),
          minProfileStrength: z.number().optional(),
          userTiers: z.array(z.string()).optional(),
        }),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        let baseCount = 3; // Our 3 sample users
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
          estimatedReach: matchCount * 1000, // Simulated reach
          estimatedCost: matchCount * 500,
        };
      }),

    // Create a new campaign with advanced targeting
    createCampaign: publicProcedure
      .input(z.object({
        advertiserId: z.number(),
        titleEn: z.string(),
        titleAr: z.string().optional(),
        descriptionEn: z.string(),
        descriptionAr: z.string().optional(),
        type: z.enum(['survey', 'video', 'app', 'social', 'referral']),
        reward: z.number(),
        totalBudget: z.number(),
        completionsNeeded: z.number(),
        targeting: z.object({
          ageMin: z.number().optional(),
          ageMax: z.number().optional(),
          gender: z.enum(['male', 'female', 'all']).optional(),
          nationalities: z.array(z.string()).optional(),
          countries: z.array(z.string()).optional(),
          cities: z.array(z.string()).optional(),
          deviceBrands: z.array(z.string()).optional(),
          carriers: z.array(z.string()).optional(),
          interests: z.array(z.string()).optional(),
          requireKYCVerified: z.boolean().optional(),
          minKYCLevel: z.number().optional(),
          purchaseIntent: z.array(z.string()).optional(),
          userTiers: z.array(z.string()).optional(),
          minProfileStrength: z.number().optional(),
        }),
        taskData: z.any().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        // Check advertiser tier
        const [advRows] = await db.execute(sql`SELECT tier FROM advertisers WHERE id = ${input.advertiserId}`);
        const advertiser = (advRows as any)[0];
        if (!advertiser) throw new Error('Advertiser not found');
        
        const tier = advertiser.tier || 'basic';
        
        // Validate targeting based on tier
        if (tier === 'basic') {
          if (input.targeting.deviceBrands || input.targeting.carriers || input.targeting.interests) {
            throw new Error('Upgrade to Pro tier to access advanced targeting');
          }
        }
        if (tier !== 'enterprise') {
          if (input.targeting.purchaseIntent) {
            throw new Error('Upgrade to Enterprise tier for intent-based targeting');
          }
        }
        
        // Create task
        await db.execute(sql`
          INSERT INTO tasks (advertiserId, type, titleEn, titleAr, descriptionEn, descriptionAr,
            reward, totalBudget, completionsNeeded, minimumBudget, status, duration,
            targetAgeMin, targetAgeMax, targetGender, taskData)
          VALUES (${input.advertiserId}, ${input.type}, ${input.titleEn}, ${input.titleAr || ''},
            ${input.descriptionEn}, ${input.descriptionAr || ''}, ${input.reward},
            ${input.totalBudget}, ${input.completionsNeeded}, ${input.totalBudget}, 'draft', 5,
            ${input.targeting.ageMin || null}, ${input.targeting.ageMax || null},
            ${input.targeting.gender || null}, ${JSON.stringify(input.taskData || {})})
        `);
        
        const [taskRows] = await db.execute(sql`SELECT LAST_INSERT_ID() as id`);
        const taskId = (taskRows as any)[0].id;
        
        // Insert targeting
        await db.execute(sql`
          INSERT INTO campaign_targeting (taskId, targetAgeMin, targetAgeMax, targetGender,
            targetNationalities, targetCountries, targetCities, targetDeviceBrands, targetCarriers,
            targetInterests, requireKYCVerified, minKYCLevel, targetPurchaseIntent, targetUserTiers, minProfileStrength)
          VALUES (${taskId}, ${input.targeting.ageMin || null}, ${input.targeting.ageMax || null},
            ${input.targeting.gender || 'all'}, ${JSON.stringify(input.targeting.nationalities || [])},
            ${JSON.stringify(input.targeting.countries || [])}, ${JSON.stringify(input.targeting.cities || [])},
            ${JSON.stringify(input.targeting.deviceBrands || [])}, ${JSON.stringify(input.targeting.carriers || [])},
            ${JSON.stringify(input.targeting.interests || [])}, ${input.targeting.requireKYCVerified || false},
            ${input.targeting.minKYCLevel || 0}, ${JSON.stringify(input.targeting.purchaseIntent || [])},
            ${JSON.stringify(input.targeting.userTiers || [])}, ${input.targeting.minProfileStrength || 0})
        `);
        
        return { success: true, taskId };
      }),
  }),

  // Campaign Analytics APIs
  campaignAnalytics: router({
    getSummary: publicProcedure
      .input(z.object({ taskId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const [taskRows] = await db.execute(sql`
          SELECT t.*, a.nameEn as advertiserName FROM tasks t
          JOIN advertisers a ON t.advertiserId = a.id WHERE t.id = ${input.taskId}
        `);
        const task = (taskRows as any)[0];
        if (!task) throw new Error('Task not found');
        
        const [statsRows] = await db.execute(sql`
          SELECT COUNT(*) as totalCompletions, COUNT(DISTINCT userId) as uniqueUsers,
            SUM(rewardAmount) as totalSpent
          FROM task_submissions WHERE taskId = ${input.taskId} AND status = 'approved'
        `);
        const stats = (statsRows as any)[0];
        
        return {
          task,
          summary: {
            totalCompletions: stats.totalCompletions || 0,
            uniqueUsers: stats.uniqueUsers || 0,
            totalSpent: stats.totalSpent || 0,
            completionRate: task.completionsNeeded > 0 
              ? ((stats.totalCompletions / task.completionsNeeded) * 100).toFixed(1) : 0,
          },
        };
      }),

    getDailyStats: publicProcedure
      .input(z.object({ taskId: z.number(), days: z.number().default(7) }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const [rows] = await db.execute(sql`
          SELECT DATE(completedAt) as date, COUNT(*) as completions,
            COUNT(DISTINCT userId) as uniqueUsers, SUM(rewardAmount) as spent
          FROM task_submissions WHERE taskId = ${input.taskId} AND status = 'approved'
            AND completedAt >= DATE_SUB(CURDATE(), INTERVAL ${input.days} DAY)
          GROUP BY DATE(completedAt) ORDER BY date ASC
        `);
        return rows;
      }),
  }),

  // Saved Audiences (Enterprise only)
  savedAudiences: router({
    list: publicProcedure
      .input(z.object({ advertiserId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        const [rows] = await db.execute(sql`SELECT * FROM saved_audiences WHERE advertiserId = ${input.advertiserId}`);
        return rows;
      }),

    create: publicProcedure
      .input(z.object({
        advertiserId: z.number(),
        name: z.string(),
        description: z.string().optional(),
        targetingCriteria: z.any(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const [advRows] = await db.execute(sql`SELECT tier FROM advertisers WHERE id = ${input.advertiserId}`);
        const advertiser = (advRows as any)[0];
        if (advertiser?.tier !== 'enterprise') {
          throw new Error('Saved Audiences is an Enterprise-only feature');
        }
        
        await db.execute(sql`
          INSERT INTO saved_audiences (advertiserId, name, description, targetingCriteria)
          VALUES (${input.advertiserId}, ${input.name}, ${input.description || ''}, ${JSON.stringify(input.targetingCriteria)})
        `);
        return { success: true };
      }),
  }),


  // ============================================
  // CONSENT MANAGEMENT APIs
  // ============================================
  consent: router({
    // Get current consent preferences
    getPreferences: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const [userRows] = await db.execute(sql`
          SELECT behavioralConsent, marketingConsent, marketingFrequency, consentUpdatedAt
          FROM users WHERE id = ${input.userId}
        `);
        const user = (userRows as any)[0];
        if (!user) throw new Error('User not found');
        
        return {
          layer1Security: true,
          layer2Behavioral: user.behavioralConsent === 1,
          layer3Marketing: user.marketingConsent === 1,
          marketingFrequency: user.marketingFrequency || 'off',
          lastUpdated: user.consentUpdatedAt,
        };
      }),
    
    // Update consent preferences
    updatePreferences: publicProcedure
      .input(z.object({
        userId: z.number(),
        layer2Behavioral: z.boolean(),
        layer3Marketing: z.boolean(),
        marketingFrequency: z.enum(['off', 'low', 'medium', 'high']).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const ipAddress = ctx.req?.headers?.['x-forwarded-for']?.split(',')[0] || 'unknown';
        const userAgent = ctx.req?.headers?.['user-agent'] || 'unknown';
        
        const [currentRows] = await db.execute(sql`
          SELECT behavioralConsent, marketingConsent FROM users WHERE id = ${input.userId}
        `);
        const current = (currentRows as any)[0];
        if (!current) throw new Error('User not found');
        
        if (current.behavioralConsent !== (input.layer2Behavioral ? 1 : 0)) {
          await db.execute(sql`
            INSERT INTO user_consent_audit (userId, consentType, previousValue, newValue, ipAddress, userAgent, legalBasis)
            VALUES (${input.userId}, 'layer2_behavioral', ${current.behavioralConsent}, ${input.layer2Behavioral ? 1 : 0}, 
                    ${ipAddress}, ${userAgent}, 'GDPR Article 6(1)(a) - Consent')
          `);
        }
        
        if (current.marketingConsent !== (input.layer3Marketing ? 1 : 0)) {
          await db.execute(sql`
            INSERT INTO user_consent_audit (userId, consentType, previousValue, newValue, ipAddress, userAgent, legalBasis)
            VALUES (${input.userId}, 'layer3_marketing', ${current.marketingConsent}, ${input.layer3Marketing ? 1 : 0},
                    ${ipAddress}, ${userAgent}, 'GDPR Article 6(1)(a) - Consent')
          `);
        }
        
        await db.execute(sql`
          UPDATE users SET 
            behavioralConsent = ${input.layer2Behavioral ? 1 : 0},
            marketingConsent = ${input.layer3Marketing ? 1 : 0},
            marketingFrequency = ${input.marketingFrequency || 'off'},
            consentUpdatedAt = NOW()
          WHERE id = ${input.userId}
        `);
        
        if (!input.layer2Behavioral && current.behavioralConsent === 1) {
          await db.execute(sql`
            INSERT INTO data_deletion_requests (userId, requestType, status, retentionNote)
            VALUES (${input.userId}, 'behavioral_only', 'pending', 
                    'Consent withdrawn - behavioral data scheduled for deletion. KYC data retained per legal requirement.')
          `);
        }
        
        return { 
          success: true, 
          message: 'Consent preferences updated successfully',
          redirectUrl: '/home',
          profileStrength: 30
        };
      }),
  }),

  // ============================================
  // PROFILE TIER QUESTIONS APIs
  // ============================================
  profileTiers: router({
    // Get questions for a specific tier
    getQuestions: publicProcedure
      .input(z.object({ 
        tier: z.enum(['tier1', 'tier2', 'tier3']),
        userId: z.number().optional()
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const [questions] = await db.execute(sql`
          SELECT id, questionKey, questionTextEn, questionTextAr, questionType, options, displayOrder
          FROM profile_tier_questions
          WHERE tier = ${input.tier} AND isActive = 1
          ORDER BY displayOrder ASC
        `);
        
        let answers: any = {};
        if (input.userId) {
          const [answerRows] = await db.execute(sql`
            SELECT ptq.questionKey, upta.answerValue
            FROM user_profile_tier_answers upta
            JOIN profile_tier_questions ptq ON upta.questionId = ptq.id
            WHERE upta.userId = ${input.userId} AND ptq.tier = ${input.tier}
          `);
          (answerRows as any[]).forEach((row: any) => {
            answers[row.questionKey] = row.answerValue;
          });
        }
        
        return {
          tier: input.tier,
          questions: (questions as any[]).map(q => ({
            ...q,
            options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
            currentAnswer: answers[q.questionKey] || null
          })),
          totalQuestions: (questions as any[]).length
        };
      }),
    
    // Submit tier answers
    submitAnswers: publicProcedure
      .input(z.object({
        userId: z.number(),
        tier: z.enum(['tier1', 'tier2', 'tier3']),
        answers: z.record(z.string(), z.any()),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const [userRows] = await db.execute(sql`
          SELECT behavioralConsent FROM users WHERE id = ${input.userId}
        `);
        const user = (userRows as any)[0];
        if (!user || user.behavioralConsent !== 1) {
          throw new Error('Behavioral consent required to complete profile questions');
        }
        
        for (const [questionKey, answerValue] of Object.entries(input.answers)) {
          const [questionRows] = await db.execute(sql`
            SELECT id FROM profile_tier_questions WHERE questionKey = ${questionKey} AND tier = ${input.tier}
          `);
          const question = (questionRows as any)[0];
          if (question) {
            const value = typeof answerValue === 'object' ? JSON.stringify(answerValue) : String(answerValue);
            await db.execute(sql`
              INSERT INTO user_profile_tier_answers (userId, questionId, answerValue)
              VALUES (${input.userId}, ${question.id}, ${value})
              ON DUPLICATE KEY UPDATE answerValue = ${value}, updatedAt = NOW()
            `);
          }
        }
        
        // Recalculate tier
        const [tier1Count] = await db.execute(sql`
          SELECT COUNT(*) as count FROM user_profile_tier_answers upta
          JOIN profile_tier_questions ptq ON upta.questionId = ptq.id
          WHERE upta.userId = ${input.userId} AND ptq.tier = 'tier1'
        `);
        const [tier2Count] = await db.execute(sql`
          SELECT COUNT(*) as count FROM user_profile_tier_answers upta
          JOIN profile_tier_questions ptq ON upta.questionId = ptq.id
          WHERE upta.userId = ${input.userId} AND ptq.tier = 'tier2'
        `);
        const [tier3Count] = await db.execute(sql`
          SELECT COUNT(*) as count FROM user_profile_tier_answers upta
          JOIN profile_tier_questions ptq ON upta.questionId = ptq.id
          WHERE upta.userId = ${input.userId} AND ptq.tier = 'tier3'
        `);
        const [kycStatus] = await db.execute(sql`
          SELECT status FROM kyc_verifications WHERE userId = ${input.userId} AND status = 'approved' LIMIT 1
        `);
        
        const t1 = (tier1Count as any)[0]?.count || 0;
        const t2 = (tier2Count as any)[0]?.count || 0;
        const t3 = (tier3Count as any)[0]?.count || 0;
        const kycApproved = (kycStatus as any[]).length > 0;
        
        let newTier = 'bronze';
        let profileStrength = 30;
        
        if (t1 >= 8) { newTier = 'silver'; profileStrength = 50; }
        if (t1 >= 8 && t2 >= 10) { newTier = 'gold'; profileStrength = 60; }
        if (t1 >= 8 && t2 >= 10 && t3 >= 10) { newTier = 'platinum'; profileStrength = 70; }
        if (t1 >= 8 && t2 >= 10 && t3 >= 10 && kycApproved) { newTier = 'elite'; profileStrength = 100; }
        
        await db.execute(sql`
          UPDATE users SET profileTier = ${newTier}, profileStrength = ${profileStrength}
          WHERE id = ${input.userId}
        `);
        
        return { success: true, profileStrength, tier: newTier };
      }),
    
    // Get completion status
    getCompletionStatus: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const [userRows] = await db.execute(sql`
          SELECT profileTier, profileStrength, behavioralConsent, marketingConsent
          FROM users WHERE id = ${input.userId}
        `);
        const user = (userRows as any)[0];
        if (!user) throw new Error('User not found');
        
        const [tier1] = await db.execute(sql`
          SELECT COUNT(*) as count FROM user_profile_tier_answers upta
          JOIN profile_tier_questions ptq ON upta.questionId = ptq.id
          WHERE upta.userId = ${input.userId} AND ptq.tier = 'tier1'
        `);
        const [tier2] = await db.execute(sql`
          SELECT COUNT(*) as count FROM user_profile_tier_answers upta
          JOIN profile_tier_questions ptq ON upta.questionId = ptq.id
          WHERE upta.userId = ${input.userId} AND ptq.tier = 'tier2'
        `);
        const [tier3] = await db.execute(sql`
          SELECT COUNT(*) as count FROM user_profile_tier_answers upta
          JOIN profile_tier_questions ptq ON upta.questionId = ptq.id
          WHERE upta.userId = ${input.userId} AND ptq.tier = 'tier3'
        `);
        const [kycRows] = await db.execute(sql`
          SELECT status FROM kyc_verifications WHERE userId = ${input.userId} ORDER BY submittedAt DESC LIMIT 1
        `);
        const [incomeRows] = await db.execute(sql`
          SELECT incomeRange FROM user_income_spi WHERE userId = ${input.userId}
        `);
        
        return {
          currentTier: user.profileTier,
          profileStrength: user.profileStrength,
          behavioralConsentEnabled: user.behavioralConsent === 1,
          marketingConsentEnabled: user.marketingConsent === 1,
          tier1: { completed: (tier1 as any)[0]?.count || 0, total: 8, isComplete: (tier1 as any)[0]?.count >= 8 },
          tier2: { completed: (tier2 as any)[0]?.count || 0, total: 10, isComplete: (tier2 as any)[0]?.count >= 10 },
          tier3: { completed: (tier3 as any)[0]?.count || 0, total: 10, isComplete: (tier3 as any)[0]?.count >= 10 },
          kyc: { status: (kycRows as any)[0]?.status || 'not_started', isComplete: (kycRows as any)[0]?.status === 'approved' },
          income: { provided: (incomeRows as any[]).length > 0 }
        };
      }),
  }),

  // ============================================
  // INCOME SPI APIs
  // ============================================
  incomeSpi: router({
    submit: publicProcedure
      .input(z.object({
        userId: z.number(),
        incomeRange: z.enum(['under_3000', '3000_5000', '5000_10000', '10000_20000', '20000_50000', 'over_50000', 'prefer_not_to_say']),
        spiConsentCheckboxes: z.object({
          dataUsageAcknowledged: z.boolean(),
          thirdPartyShareConsent: z.boolean(),
          retentionAcknowledged: z.boolean(),
        }),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        if (!input.spiConsentCheckboxes.dataUsageAcknowledged ||
            !input.spiConsentCheckboxes.thirdPartyShareConsent ||
            !input.spiConsentCheckboxes.retentionAcknowledged) {
          throw new Error('All consent checkboxes must be checked');
        }
        
        const ipAddress = ctx.req?.headers?.['x-forwarded-for']?.split(',')[0] || 'unknown';
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 3);
        
        await db.execute(sql`
          INSERT INTO user_income_spi (userId, incomeRange, spiConsentGiven, spiConsentTimestamp, spiConsentIp,
            dataUsageAcknowledged, thirdPartyShareConsent, retentionAcknowledged, expiresAt)
          VALUES (${input.userId}, ${input.incomeRange}, 1, NOW(), ${ipAddress}, 1, 1, 1, ${expiresAt.toISOString().split('T')[0]})
          ON DUPLICATE KEY UPDATE incomeRange = ${input.incomeRange}, spiConsentGiven = 1, spiConsentTimestamp = NOW()
        `);
        
        await db.execute(sql`
          INSERT INTO user_consent_audit (userId, consentType, previousValue, newValue, ipAddress, legalBasis)
          VALUES (${input.userId}, 'income_spi', 0, 1, ${ipAddress}, 'GDPR Article 9(2)(a) - Explicit consent for SPI')
        `);
        
        return { success: true, message: 'Income data saved (optional)' };
      }),
    
    get: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        const [rows] = await db.execute(sql`
          SELECT incomeRange, spiConsentGiven, spiConsentTimestamp, expiresAt
          FROM user_income_spi WHERE userId = ${input.userId}
        `);
        return (rows as any)[0] || null;
      }),
    
    delete: publicProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        const ipAddress = ctx.req?.headers?.['x-forwarded-for']?.split(',')[0] || 'unknown';
        await db.execute(sql`DELETE FROM user_income_spi WHERE userId = ${input.userId}`);
        await db.execute(sql`
          INSERT INTO user_consent_audit (userId, consentType, previousValue, newValue, ipAddress, legalBasis)
          VALUES (${input.userId}, 'income_spi', 1, 0, ${ipAddress}, 'User requested deletion')
        `);
        return { success: true };
      }),
  }),

  // ============================================
  // PRIVACY & DATA RIGHTS APIs
  // ============================================
  privacy: router({
    getMyData: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const [userRows] = await db.execute(sql`
          SELECT id, name, email, phone, gender, governorate, profileTier, profileStrength,
            behavioralConsent, marketingConsent, createdAt, lastSignedIn
          FROM users WHERE id = ${input.userId}
        `);
        const [profileRows] = await db.execute(sql`
          SELECT ptq.tier, ptq.questionKey, ptq.questionTextEn, upta.answerValue
          FROM user_profile_tier_answers upta
          JOIN profile_tier_questions ptq ON upta.questionId = ptq.id
          WHERE upta.userId = ${input.userId}
        `);
        const [incomeRows] = await db.execute(sql`
          SELECT incomeRange, spiConsentGiven FROM user_income_spi WHERE userId = ${input.userId}
        `);
        const [kycRows] = await db.execute(sql`
          SELECT status, nameVerified, ageVerified, addressVerified, verifiedAt
          FROM kyc_verifications WHERE userId = ${input.userId} ORDER BY submittedAt DESC LIMIT 1
        `);
        
        return {
          personalInfo: (userRows as any)[0] || null,
          profileData: {
            tier1Responses: (profileRows as any[]).filter(r => r.tier === 'tier1'),
            tier2Responses: (profileRows as any[]).filter(r => r.tier === 'tier2'),
            tier3Responses: (profileRows as any[]).filter(r => r.tier === 'tier3'),
          },
          incomeData: (incomeRows as any)[0] || null,
          kycData: (kycRows as any)[0] || null,
        };
      }),
    
    requestExport: publicProcedure
      .input(z.object({ userId: z.number(), format: z.enum(['json', 'csv']).default('json') }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const downloadToken = require('crypto').randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600 * 1000);
        
        await db.execute(sql`
          INSERT INTO data_export_requests (userId, exportFormat, status, downloadToken, expiresAt)
          VALUES (${input.userId}, ${input.format}, 'ready', ${downloadToken}, ${expiresAt.toISOString()})
        `);
        
        return { success: true, downloadUrl: `/api/v1/privacy/download/${downloadToken}`, expiresIn: 3600 };
      }),
    
    requestDeletion: publicProcedure
      .input(z.object({
        userId: z.number(),
        dataType: z.enum(['behavioral_only', 'income_only', 'full_account']),
        confirmationText: z.string(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        if (input.confirmationText !== 'DELETE') {
          throw new Error('Please type DELETE to confirm');
        }
        
        const ticketId = `DEL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        await db.execute(sql`
          INSERT INTO data_deletion_requests (userId, requestType, status, ticketId, retentionNote)
          VALUES (${input.userId}, ${input.dataType}, 'pending', ${ticketId},
            'KYC data retained 5-7 years per AML/CBE requirements')
        `);
        
        if (input.dataType === 'behavioral_only') {
          await db.execute(sql`DELETE FROM user_profile_tier_answers WHERE userId = ${input.userId}`);
          await db.execute(sql`DELETE FROM user_income_spi WHERE userId = ${input.userId}`);
          await db.execute(sql`
            UPDATE users SET behavioralConsent = 0, profileTier = 'bronze', profileStrength = 30
            WHERE id = ${input.userId}
          `);
          await db.execute(sql`
            UPDATE data_deletion_requests SET status = 'completed', completedAt = NOW()
            WHERE ticketId = ${ticketId}
          `);
        }
        
        return { success: true, ticketId, estimatedCompletion: '30 days', dpoContact: 'dpo@taskkash.com' };
      }),
  }),

  // ============================================
  // KYC VERIFICATION APIs
  // ============================================
  kyc: router({
    startVerification: publicProcedure
      .input(z.object({
        userId: z.number(),
        method: z.enum(['biometric_fast', 'id_only_standard']),
        biometricConsent: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        if (input.method === 'biometric_fast' && !input.biometricConsent) {
          throw new Error('Biometric consent required for fast verification');
        }
        
        const ipAddress = ctx.req?.headers?.['x-forwarded-for']?.split(',')[0] || 'unknown';
        
        const [result] = await db.execute(sql`
          INSERT INTO kyc_verifications (userId, verificationMethod, status, biometricConsentGiven, biometricConsentTimestamp)
          VALUES (${input.userId}, ${input.method}, 'pending', ${input.biometricConsent ? 1 : 0}, ${input.biometricConsent ? sql`NOW()` : null})
        `);
        
        if (input.biometricConsent) {
          await db.execute(sql`
            INSERT INTO user_consent_audit (userId, consentType, previousValue, newValue, ipAddress, legalBasis)
            VALUES (${input.userId}, 'kyc_biometric', 0, 1, ${ipAddress}, 'GDPR Article 9(2)(a) - Explicit consent for biometric')
          `);
        }
        
        return { success: true, verificationId: (result as any).insertId, nextStep: '/upload-id' };
      }),
    
    uploadId: publicProcedure
      .input(z.object({
        userId: z.number(),
        verificationId: z.number(),
        idFrontImage: z.string(),
        idBackImage: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        // Mock OCR - in production this would call Onfido or similar
        const mockOcrData = { name: 'User Name', dob: '1990-01-01', gender: 'male', address: 'Cairo, Egypt' };
        
        await db.execute(sql`
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
        
        const [verificationRows] = await db.execute(sql`
          SELECT verificationMethod FROM kyc_verifications WHERE id = ${input.verificationId}
        `);
        
        return {
          success: true,
          ocrData: mockOcrData,
          nextStep: (verificationRows as any)[0]?.verificationMethod === 'biometric_fast' ? '/upload-selfie' : null,
        };
      }),
    
    uploadSelfie: publicProcedure
      .input(z.object({
        userId: z.number(),
        verificationId: z.number(),
        selfieImage: z.string(),
        livenessData: z.object({ blink: z.boolean(), turnHead: z.boolean() }),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const scheduledDeletion = new Date(Date.now() + 24 * 60 * 60 * 1000);
        
        await db.execute(sql`
          UPDATE kyc_verifications SET
            selfieImagePath = ${`/secure/kyc/${input.userId}/selfie.jpg`},
            livenessCheckPassed = ${input.livenessData.blink && input.livenessData.turnHead ? 1 : 0},
            livenessData = ${JSON.stringify(input.livenessData)},
            biometricScheduledDeletion = ${scheduledDeletion.toISOString()},
            status = 'processing'
          WHERE id = ${input.verificationId}
        `);
        
        return { success: true, verificationStatus: 'processing' };
      }),
    
    getStatus: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const [rows] = await db.execute(sql`
          SELECT status, verificationMethod, nameVerified, ageVerified, addressVerified,
            verifiedAt, rejectionReason, biometricDeleted
          FROM kyc_verifications WHERE userId = ${input.userId}
          ORDER BY submittedAt DESC LIMIT 1
        `);
        
        const verification = (rows as any)[0];
        if (!verification) {
          return { status: 'not_started', profileStrength: 70, canWithdraw: false };
        }
        
        return {
          status: verification.status,
          verifiedAt: verification.verifiedAt,
          kycData: {
            nameVerified: verification.nameVerified === 1,
            ageVerified: verification.ageVerified === 1,
            addressVerified: verification.addressVerified === 1,
          },
          profileStrength: verification.status === 'approved' ? 100 : 70,
          canWithdraw: verification.status === 'approved',
          biometricDeleted: verification.biometricDeleted === 1,
        };
      }),
    
    // Approve KYC (admin only - for testing)
    approveVerification: publicProcedure
      .input(z.object({ verificationId: z.number(), userId: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const retentionExpires = new Date();
        retentionExpires.setFullYear(retentionExpires.getFullYear() + 7);
        
        await db.execute(sql`
          UPDATE kyc_verifications SET
            status = 'approved',
            nameVerified = 1,
            ageVerified = 1,
            addressVerified = 1,
            documentAuthentic = 1,
            verifiedAt = NOW(),
            retentionExpiresAt = ${retentionExpires.toISOString().split('T')[0]}
          WHERE id = ${input.verificationId}
        `);
        
        await db.execute(sql`
          UPDATE users SET profileTier = 'elite', profileStrength = 100
          WHERE id = ${input.userId}
        `);
        
        return { success: true };
      }),
  }),


  // =====================================================
  // SURVEY FRAMEWORK ROUTES
  // =====================================================

  surveyManagement: router({
    
    // Get pricing tiers
    getPricingTiers: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const result = await db.execute(sql`
        SELECT * FROM survey_pricing_tiers WHERE isActive = TRUE ORDER BY minPricePerComplete ASC
      `);
      
      return (result as any)[0] || [];
    }),

    // Create new survey
    createSurvey: publicProcedure
      .input(z.object({
        advertiserId: z.number(),
        title: z.string().min(3).max(255),
        titleAr: z.string().optional(),
        description: z.string().optional(),
        descriptionAr: z.string().optional(),
        serviceTier: z.enum(['basic', 'professional', 'enterprise', 'custom']),
        estimatedDuration: z.number().min(1).max(60).optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        await db.execute(sql`
          INSERT INTO surveys (advertiserId, title, titleAr, description, descriptionAr, serviceTier, estimatedDuration, status)
          VALUES (${input.advertiserId}, ${input.title}, ${input.titleAr || null}, ${input.description || null}, 
                  ${input.descriptionAr || null}, ${input.serviceTier}, ${input.estimatedDuration || 5}, 'draft')
        `);
        
        const newSurvey = await db.execute(sql`SELECT LAST_INSERT_ID() as id`);
        const surveyId = (newSurvey as any)[0][0].id;
        
        return { success: true, surveyId: surveyId, message: 'Survey created successfully' };
      }),

    // Get survey by ID
    getSurvey: publicProcedure
      .input(z.object({ surveyId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const survey = await db.execute(sql`
          SELECT s.*, (SELECT COUNT(*) FROM survey_questions_new WHERE surveyId = s.id) as questionCount
          FROM surveys s WHERE s.id = ${input.surveyId}
        `);
        
        if ((survey as any)[0]?.length === 0) throw new Error('Survey not found');
        
        const questions = await db.execute(sql`
          SELECT * FROM survey_questions_new WHERE surveyId = ${input.surveyId} ORDER BY questionOrder ASC
        `);
        
        return { survey: (survey as any)[0][0], questions: (questions as any)[0] || [] };
      }),

    // Get all surveys for advertiser
    getAdvertiserSurveys: publicProcedure
      .input(z.object({ advertiserId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const surveys = await db.execute(sql`
          SELECT s.*,
                 (SELECT COUNT(*) FROM survey_questions_new WHERE surveyId = s.id) as questionCount,
                 (SELECT COUNT(*) FROM survey_campaigns WHERE surveyId = s.id) as campaignCount,
                 (SELECT SUM(currentCompletions) FROM survey_campaigns WHERE surveyId = s.id) as totalCompletions
          FROM surveys s WHERE s.advertiserId = ${input.advertiserId} ORDER BY s.createdAt DESC
        `);
        
        return (surveys as any)[0] || [];
      }),

    // Add question to survey
    addQuestion: publicProcedure
      .input(z.object({
        surveyId: z.number(),
        questionText: z.string().min(5),
        questionTextAr: z.string().optional(),
        questionType: z.enum(['single_choice', 'multiple_choice', 'open_text', 'rating_scale', 'nps', 'matrix', 'ranking', 'slider']),
        options: z.array(z.object({ text: z.string(), value: z.string().optional() })).optional(),
        optionsAr: z.array(z.object({ text: z.string(), value: z.string().optional() })).optional(),
        isRequired: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const orderResult = await db.execute(sql`
          SELECT COALESCE(MAX(questionOrder), 0) + 1 as nextOrder FROM survey_questions_new WHERE surveyId = ${input.surveyId}
        `);
        const nextOrder = (orderResult as any)[0][0].nextOrder;
        
        await db.execute(sql`
          INSERT INTO survey_questions_new (surveyId, questionText, questionTextAr, questionType, options, optionsAr, questionOrder, isRequired)
          VALUES (${input.surveyId}, ${input.questionText}, ${input.questionTextAr || null}, ${input.questionType},
                  ${input.options ? JSON.stringify(input.options) : null}, ${input.optionsAr ? JSON.stringify(input.optionsAr) : null},
                  ${nextOrder}, ${input.isRequired !== false})
        `);
        
        await db.execute(sql`
          UPDATE surveys SET totalQuestions = (SELECT COUNT(*) FROM survey_questions_new WHERE surveyId = ${input.surveyId}) WHERE id = ${input.surveyId}
        `);
        
        return { success: true, message: 'Question added successfully' };
      }),

    // Delete question
    deleteQuestion: publicProcedure
      .input(z.object({ questionId: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const question = await db.execute(sql`SELECT surveyId FROM survey_questions_new WHERE id = ${input.questionId}`);
        const surveyId = (question as any)[0]?.[0]?.surveyId;
        
        await db.execute(sql`DELETE FROM survey_questions_new WHERE id = ${input.questionId}`);
        
        if (surveyId) {
          await db.execute(sql`
            UPDATE surveys SET totalQuestions = (SELECT COUNT(*) FROM survey_questions_new WHERE surveyId = ${surveyId}) WHERE id = ${surveyId}
          `);
        }
        
        return { success: true, message: 'Question deleted successfully' };
      }),

    // Create campaign
    createCampaign: publicProcedure
      .input(z.object({
        surveyId: z.number(),
        campaignName: z.string().min(3),
        serviceTier: z.enum(['basic', 'professional', 'enterprise', 'custom']),
        pricePerComplete: z.number().min(8),
        userReward: z.number().min(5),
        totalBudget: z.number().min(100),
        targetCompletions: z.number().min(10),
        targetAgeMin: z.number().optional(),
        targetAgeMax: z.number().optional(),
        targetGender: z.enum(['all', 'male', 'female']).optional(),
        targetLocations: z.array(z.string()).optional(),
        targetProfileTiers: z.array(z.string()).optional(),
        requireKycVerification: z.boolean().optional(),
        minCompletionTime: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        await db.execute(sql`
          INSERT INTO survey_campaigns (
            surveyId, campaignName, status, serviceTier, pricePerComplete, userReward, 
            totalBudget, targetCompletions, targetAgeMin, targetAgeMax, targetGender,
            targetLocations, targetProfileTiers, requireKycVerification, minCompletionTime,
            startDate, endDate
          ) VALUES (
            ${input.surveyId}, ${input.campaignName}, 'active', ${input.serviceTier},
            ${input.pricePerComplete}, ${input.userReward}, ${input.totalBudget}, ${input.targetCompletions},
            ${input.targetAgeMin || null}, ${input.targetAgeMax || null}, ${input.targetGender || 'all'},
            ${input.targetLocations ? JSON.stringify(input.targetLocations) : null},
            ${input.targetProfileTiers ? JSON.stringify(input.targetProfileTiers) : null},
            ${input.requireKycVerification || false}, ${input.minCompletionTime || 60},
            ${input.startDate || null}, ${input.endDate || null}
          )
        `);
        
        const newCampaign = await db.execute(sql`SELECT LAST_INSERT_ID() as id`);
        const campaignId = (newCampaign as any)[0][0].id;
        
        await db.execute(sql`UPDATE surveys SET status = 'active' WHERE id = ${input.surveyId}`);
        
        return { success: true, campaignId: campaignId, message: 'Campaign created and activated' };
      }),

    // Get campaign analytics
    getCampaignAnalytics: publicProcedure
      .input(z.object({ campaignId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const stats = await db.execute(sql`
          SELECT COUNT(*) as totalResponses,
                 SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedResponses,
                 AVG(timeSpentSeconds) as avgTimeSpent,
                 AVG(qualityScore) as avgQualityScore
          FROM survey_responses_new WHERE campaignId = ${input.campaignId}
        `);
        
        const dailyStats = await db.execute(sql`
          SELECT DATE(completedAt) as date, COUNT(*) as completions, AVG(timeSpentSeconds) as avgTime
          FROM survey_responses_new WHERE campaignId = ${input.campaignId} AND status = 'completed'
          GROUP BY DATE(completedAt) ORDER BY date DESC LIMIT 30
        `);
        
        return { overview: (stats as any)[0]?.[0] || {}, dailyStats: (dailyStats as any)[0] || [] };
      }),

    // Get survey results
    getSurveyResults: publicProcedure
      .input(z.object({ surveyId: z.number(), campaignId: z.number().optional() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const questions = await db.execute(sql`
          SELECT * FROM survey_questions_new WHERE surveyId = ${input.surveyId} ORDER BY questionOrder
        `);
        
        const results = [];
        for (const question of (questions as any)[0] || []) {
          let answerStats;
          
          if (question.questionType === 'single_choice' || question.questionType === 'multiple_choice') {
            answerStats = await db.execute(sql`
              SELECT JSON_UNQUOTE(answerValue) as answer, COUNT(*) as count
              FROM survey_answers sa JOIN survey_responses_new sr ON sa.responseId = sr.id
              WHERE sa.questionId = ${question.id} AND sr.status = 'completed'
              GROUP BY JSON_UNQUOTE(answerValue)
            `);
          } else if (question.questionType === 'rating_scale' || question.questionType === 'nps') {
            answerStats = await db.execute(sql`
              SELECT AVG(CAST(JSON_UNQUOTE(answerValue) AS DECIMAL)) as average, COUNT(*) as count
              FROM survey_answers sa JOIN survey_responses_new sr ON sa.responseId = sr.id
              WHERE sa.questionId = ${question.id} AND sr.status = 'completed'
            `);
          } else {
            answerStats = await db.execute(sql`
              SELECT JSON_UNQUOTE(answerValue) as answer FROM survey_answers sa
              JOIN survey_responses_new sr ON sa.responseId = sr.id
              WHERE sa.questionId = ${question.id} AND sr.status = 'completed'
              ORDER BY sa.answeredAt DESC LIMIT 50
            `);
          }
          
          results.push({ question: question, stats: (answerStats as any)[0] || [] });
        }
        
        return results;
      }),
  }),

// =====================================================
// USER SURVEY TAKING
// =====================================================

  userSurvey: router({
    
    // Get available surveys for user
    getAvailableSurveys: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const userProfile = await db.execute(sql`
          SELECT id, profileTier, gender, governorate, dateOfBirth FROM users WHERE id = ${input.userId}
        `);
        const user = (userProfile as any)[0]?.[0];
        if (!user) throw new Error('User not found');
        
        const surveys = await db.execute(sql`
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
        
        return (surveys as any)[0] || [];
      }),

    // Start survey
    startSurvey: publicProcedure
      .input(z.object({ userId: z.number(), surveyId: z.number(), campaignId: z.number(), deviceType: z.string().optional() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const existing = await db.execute(sql`
          SELECT id, status FROM survey_responses_new WHERE surveyId = ${input.surveyId} AND userId = ${input.userId}
        `);
        
        if ((existing as any)[0]?.length > 0) {
          const existingResponse = (existing as any)[0][0];
          if (existingResponse.status === 'completed') throw new Error('You have already completed this survey');
          return { responseId: existingResponse.id, resumed: true };
        }
        
        await db.execute(sql`
          INSERT INTO survey_responses_new (surveyId, userId, campaignId, status, deviceType)
          VALUES (${input.surveyId}, ${input.userId}, ${input.campaignId}, 'in_progress', ${input.deviceType || 'unknown'})
        `);
        
        const newResponse = await db.execute(sql`SELECT LAST_INSERT_ID() as id`);
        const responseId = (newResponse as any)[0][0].id;
        
        const questions = await db.execute(sql`
          SELECT id, questionText, questionTextAr, questionType, options, optionsAr, questionOrder, isRequired, mediaUrl
          FROM survey_questions_new WHERE surveyId = ${input.surveyId} ORDER BY questionOrder ASC
        `);
        
        return { responseId: responseId, resumed: false, questions: (questions as any)[0] || [] };
      }),

    // Submit answer
    submitAnswer: publicProcedure
      .input(z.object({
        responseId: z.number(),
        questionId: z.number(),
        answerValue: z.any(),
        timeSpentSeconds: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const existing = await db.execute(sql`
          SELECT id FROM survey_answers WHERE responseId = ${input.responseId} AND questionId = ${input.questionId}
        `);
        
        if ((existing as any)[0]?.length > 0) {
          await db.execute(sql`
            UPDATE survey_answers SET answerValue = ${JSON.stringify(input.answerValue)}, 
                   timeSpentSeconds = ${input.timeSpentSeconds || 0}, answeredAt = NOW()
            WHERE responseId = ${input.responseId} AND questionId = ${input.questionId}
          `);
        } else {
          await db.execute(sql`
            INSERT INTO survey_answers (responseId, questionId, answerValue, timeSpentSeconds)
            VALUES (${input.responseId}, ${input.questionId}, ${JSON.stringify(input.answerValue)}, ${input.timeSpentSeconds || 0})
          `);
        }
        
        return { success: true };
      }),

    // Complete survey
    completeSurvey: publicProcedure
      .input(z.object({ userId: z.number(), responseId: z.number(), totalTimeSeconds: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const response = await db.execute(sql`
          SELECT sr.*, c.userReward, c.minCompletionTime, c.id as campaignId
          FROM survey_responses_new sr JOIN survey_campaigns c ON sr.campaignId = c.id
          WHERE sr.id = ${input.responseId} AND sr.userId = ${input.userId}
        `);
        
        if ((response as any)[0]?.length === 0) throw new Error('Survey response not found');
        
        const resp = (response as any)[0][0];
        
        if (input.totalTimeSeconds < (resp.minCompletionTime || 60)) {
          await db.execute(sql`
            UPDATE survey_responses_new SET status = 'disqualified', completedAt = NOW(), timeSpentSeconds = ${input.totalTimeSeconds}
            WHERE id = ${input.responseId}
          `);
          await db.execute(sql`UPDATE survey_campaigns SET disqualifiedCount = disqualifiedCount + 1 WHERE id = ${resp.campaignId}`);
          throw new Error('Survey completed too quickly. Your response has been disqualified.');
        }
        
        const qualityScore = 0.85; // Simplified quality score
        
        await db.execute(sql`
          UPDATE survey_responses_new SET status = 'completed', completedAt = NOW(), 
                 timeSpentSeconds = ${input.totalTimeSeconds}, qualityScore = ${qualityScore}
          WHERE id = ${input.responseId}
        `);
        
        await db.execute(sql`UPDATE survey_campaigns SET currentCompletions = currentCompletions + 1 WHERE id = ${resp.campaignId}`);
        
        const userReward = resp.userReward;
        await db.execute(sql`UPDATE users SET balance = balance + ${userReward} WHERE id = ${input.userId}`);
        
        await db.execute(sql`
          INSERT INTO transactions (userId, type, amount, description, status)
          VALUES (${input.userId}, 'survey_reward', ${userReward}, 'Survey completion reward', 'completed')
        `);
        
        return { success: true, reward: userReward, qualityScore: qualityScore, message: 'Survey completed! You earned ' + userReward + ' EGP' };
      }),

    // Get survey history
    getSurveyHistory: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const history = await db.execute(sql`
          SELECT sr.id as responseId, sr.status, sr.startedAt, sr.completedAt, sr.timeSpentSeconds, sr.qualityScore,
                 s.title, s.titleAr, c.userReward
          FROM survey_responses_new sr
          JOIN surveys s ON sr.surveyId = s.id
          JOIN survey_campaigns c ON sr.campaignId = c.id
          WHERE sr.userId = ${input.userId}
          ORDER BY sr.startedAt DESC LIMIT 50
        `);
        
        return (history as any)[0] || [];
      }),
  }),

  // =====================================================
  // VOTE MANAGEMENT ROUTES (Advertiser)
  // =====================================================

  "voteManagement.getPricingTiers": protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const tiers = await db.execute(sql`
      SELECT id, tierName, displayName, displayNameAr, description, descriptionAr,
             minPricePerVote, maxPricePerVote, defaultUserReward,
             minQuestions, maxQuestions, minOptions, maxOptions, features
      FROM vote_pricing_tiers WHERE isActive = TRUE ORDER BY minPricePerVote ASC
    `);
    return (tiers as any)[0] || [];
  }),

  "voteManagement.createVote": protectedProcedure
    .input(z.object({
      pricingTierId: z.number(),
      title: z.string().min(1),
      titleAr: z.string().optional(),
      description: z.string().optional(),
      descriptionAr: z.string().optional(),
      category: z.string().optional(),
      estimatedDuration: z.number().default(2),
      successThreshold: z.number().default(60),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.execute(sql`
        INSERT INTO votes (advertiserId, pricingTierId, title, titleAr, description, descriptionAr, category, estimatedDuration, successThreshold)
        VALUES (${ctx.user.id}, ${input.pricingTierId}, ${input.title}, ${input.titleAr || null}, ${input.description || null}, ${input.descriptionAr || null}, ${input.category || null}, ${input.estimatedDuration}, ${input.successThreshold})
      `);
      return { voteId: (result as any)[0].insertId, message: "Vote created successfully" };
    }),

  "voteManagement.getVote": protectedProcedure
    .input(z.object({ voteId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const votes = await db.execute(sql`
        SELECT v.*, vpt.tierName, vpt.displayName as tierDisplayName, vpt.features
        FROM votes v JOIN vote_pricing_tiers vpt ON v.pricingTierId = vpt.id WHERE v.id = ${input.voteId}
      `);
      if (!(votes as any)[0]?.length) return null;
      const vote = (votes as any)[0][0];
      const questions = await db.execute(sql`SELECT * FROM vote_questions WHERE voteId = ${input.voteId} ORDER BY questionOrder ASC`);
      vote.questions = (questions as any)[0] || [];
      for (const q of vote.questions) {
        const options = await db.execute(sql`SELECT * FROM vote_options WHERE questionId = ${q.id} ORDER BY optionOrder ASC`);
        q.options = (options as any)[0] || [];
      }
      return vote;
    }),

  "voteManagement.getAdvertiserVotes": protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const votes = await db.execute(sql`
      SELECT v.*, vpt.displayName as tierDisplayName,
             (SELECT COUNT(*) FROM vote_campaigns WHERE voteId = v.id) as campaignCount,
             (SELECT COALESCE(SUM(completedVotes), 0) FROM vote_campaigns WHERE voteId = v.id) as totalVotes
      FROM votes v JOIN vote_pricing_tiers vpt ON v.pricingTierId = vpt.id
      WHERE v.advertiserId = ${ctx.user.id} ORDER BY v.createdAt DESC
    `);
    return (votes as any)[0] || [];
  }),

  "voteManagement.addQuestion": protectedProcedure
    .input(z.object({
      voteId: z.number(),
      questionType: z.enum(['single_choice', 'multiple_choice', 'ranking', 'slider']).default('single_choice'),
      questionText: z.string().min(1),
      questionTextAr: z.string().optional(),
      sectionTitle: z.string().optional(),
      sectionTitleAr: z.string().optional(),
      successThreshold: z.number().optional(),
      maxSelections: z.number().default(1),
      options: z.array(z.object({
        optionText: z.string().min(1),
        optionTextAr: z.string().optional(),
        imageUrl: z.string().optional(),
      })).min(2),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const countResult = await db.execute(sql`SELECT COUNT(*) as count FROM vote_questions WHERE voteId = ${input.voteId}`);
      const questionOrder = ((countResult as any)[0][0]?.count || 0) + 1;
      const questionResult = await db.execute(sql`
        INSERT INTO vote_questions (voteId, questionOrder, questionType, questionText, questionTextAr, sectionTitle, sectionTitleAr, successThreshold, maxSelections)
        VALUES (${input.voteId}, ${questionOrder}, ${input.questionType}, ${input.questionText}, ${input.questionTextAr || null}, ${input.sectionTitle || null}, ${input.sectionTitleAr || null}, ${input.successThreshold || null}, ${input.maxSelections})
      `);
      const questionId = (questionResult as any)[0].insertId;
      for (let i = 0; i < input.options.length; i++) {
        const opt = input.options[i];
        await db.execute(sql`
          INSERT INTO vote_options (questionId, optionOrder, optionText, optionTextAr, imageUrl)
          VALUES (${questionId}, ${i + 1}, ${opt.optionText}, ${opt.optionTextAr || null}, ${opt.imageUrl || null})
        `);
      }
      await db.execute(sql`UPDATE votes SET totalQuestions = totalQuestions + 1 WHERE id = ${input.voteId}`);
      return { questionId, message: "Question added successfully" };
    }),

  "voteManagement.updateOptionImage": protectedProcedure
    .input(z.object({ optionId: z.number(), imageUrl: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      await db.execute(sql`UPDATE vote_options SET imageUrl = ${input.imageUrl} WHERE id = ${input.optionId}`);
      return { message: "Option image updated successfully" };
    }),

  "voteManagement.deleteQuestion": protectedProcedure
    .input(z.object({ questionId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const questions = await db.execute(sql`SELECT voteId FROM vote_questions WHERE id = ${input.questionId}`);
      if ((questions as any)[0]?.length) {
        const voteId = (questions as any)[0][0].voteId;
        await db.execute(sql`DELETE FROM vote_questions WHERE id = ${input.questionId}`);
        await db.execute(sql`UPDATE votes SET totalQuestions = totalQuestions - 1 WHERE id = ${voteId}`);
      }
      return { message: "Question deleted successfully" };
    }),

  "voteManagement.createCampaign": protectedProcedure
    .input(z.object({
      voteId: z.number(),
      campaignName: z.string().min(1),
      totalBudget: z.number().min(1),
      pricePerVote: z.number().min(1),
      userReward: z.number().min(1),
      targetVotes: z.number().min(1),
      targetAgeMin: z.number().optional(),
      targetAgeMax: z.number().optional(),
      targetGender: z.enum(['all', 'male', 'female']).default('all'),
      requireKyc: z.boolean().default(false),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.execute(sql`
        INSERT INTO vote_campaigns (voteId, campaignName, totalBudget, pricePerVote, userReward, targetVotes,
                                   targetAgeMin, targetAgeMax, targetGender, requireKyc, status)
        VALUES (${input.voteId}, ${input.campaignName}, ${input.totalBudget}, ${input.pricePerVote}, ${input.userReward}, ${input.targetVotes},
                ${input.targetAgeMin || null}, ${input.targetAgeMax || null}, ${input.targetGender}, ${input.requireKyc}, 'active')
      `);
      await db.execute(sql`UPDATE votes SET status = 'active' WHERE id = ${input.voteId}`);
      return { campaignId: (result as any)[0].insertId, message: "Campaign created and launched successfully" };
    }),

  "voteManagement.getCampaignAnalytics": protectedProcedure
    .input(z.object({ campaignId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const campaigns = await db.execute(sql`
        SELECT vc.*, v.title, v.titleAr FROM vote_campaigns vc JOIN votes v ON vc.voteId = v.id WHERE vc.id = ${input.campaignId}
      `);
      if (!(campaigns as any)[0]?.length) return null;
      return (campaigns as any)[0][0];
    }),

  // =====================================================
  // USER VOTE ROUTES
  // =====================================================

  "userVote.getAvailableVotes": protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const userId = ctx.user.id;
    const votes = await db.execute(sql`
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
    return (votes as any)[0] || [];
  }),

  "userVote.startVote": protectedProcedure
    .input(z.object({ voteId: z.number(), campaignId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const userId = ctx.user.id;
      const existing = await db.execute(sql`SELECT id, status FROM vote_responses WHERE userId = ${userId} AND campaignId = ${input.campaignId}`);
      if ((existing as any)[0]?.length) {
        return { responseId: (existing as any)[0][0].id, resumed: true };
      }
      const campaigns = await db.execute(sql`SELECT userReward FROM vote_campaigns WHERE id = ${input.campaignId}`);
      const userReward = (campaigns as any)[0]?.[0]?.userReward || 0;
      const result = await db.execute(sql`
        INSERT INTO vote_responses (campaignId, voteId, userId, rewardAmount) VALUES (${input.campaignId}, ${input.voteId}, ${userId}, ${userReward})
      `);
      const questions = await db.execute(sql`SELECT * FROM vote_questions WHERE voteId = ${input.voteId} ORDER BY questionOrder ASC`);
      const questionList = (questions as any)[0] || [];
      for (const q of questionList) {
        const options = await db.execute(sql`SELECT * FROM vote_options WHERE questionId = ${q.id} ORDER BY optionOrder ASC`);
        q.options = (options as any)[0] || [];
      }
      return { responseId: (result as any)[0].insertId, resumed: false, questions: questionList, totalQuestions: questionList.length };
    }),

  "userVote.submitAnswer": protectedProcedure
    .input(z.object({
      responseId: z.number(),
      questionId: z.number(),
      selectedOptionIds: z.array(z.number()),
      timeSpentSeconds: z.number(),
      openFeedback: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const existing = await db.execute(sql`SELECT id FROM vote_answers WHERE responseId = ${input.responseId} AND questionId = ${input.questionId}`);
      const selectedJson = JSON.stringify(input.selectedOptionIds);
      if ((existing as any)[0]?.length) {
        await db.execute(sql`
          UPDATE vote_answers SET selectedOptionIds = ${selectedJson}, openFeedback = ${input.openFeedback || null}, timeSpentSeconds = ${input.timeSpentSeconds}, answeredAt = NOW() WHERE id = ${(existing as any)[0][0].id}
        `);
      } else {
        await db.execute(sql`
          INSERT INTO vote_answers (responseId, questionId, selectedOptionIds, openFeedback, timeSpentSeconds) VALUES (${input.responseId}, ${input.questionId}, ${selectedJson}, ${input.openFeedback || null}, ${input.timeSpentSeconds})
        `);
      }
      await db.execute(sql`UPDATE vote_responses SET status = 'in_progress' WHERE id = ${input.responseId} AND status = 'started'`);
      return { message: "Answer submitted successfully" };
    }),

  "userVote.completeVote": protectedProcedure
    .input(z.object({ responseId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const userId = ctx.user.id;
      const responses = await db.execute(sql`
        SELECT vr.*, vc.userReward, vc.id as campaignId FROM vote_responses vr JOIN vote_campaigns vc ON vr.campaignId = vc.id WHERE vr.id = ${input.responseId} AND vr.userId = ${userId}
      `);
      if (!(responses as any)[0]?.length) throw new Error("Vote response not found");
      const response = (responses as any)[0][0];
      const timeResult = await db.execute(sql`SELECT SUM(timeSpentSeconds) as totalTime FROM vote_answers WHERE responseId = ${input.responseId}`);
      const totalTime = (timeResult as any)[0]?.[0]?.totalTime || 0;
      await db.execute(sql`UPDATE vote_responses SET status = 'completed', completedAt = NOW(), totalTimeSeconds = ${totalTime} WHERE id = ${input.responseId}`);
      await db.execute(sql`UPDATE vote_campaigns SET completedVotes = completedVotes + 1 WHERE id = ${response.campaignId}`);
      await db.execute(sql`UPDATE users SET balance = balance + ${response.userReward} WHERE id = ${userId}`);
      await db.execute(sql`UPDATE vote_responses SET rewardPaid = TRUE WHERE id = ${input.responseId}`);
      await db.execute(sql`INSERT INTO transactions (userId, type, amount, description, status) VALUES (${userId}, 'vote_reward', ${response.userReward}, 'Vote completion reward', 'completed')`);
      return { message: "Vote completed successfully", reward: response.userReward, totalTime };
    }),

  "userVote.getVoteHistory": protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const history = await db.execute(sql`
      SELECT vr.id, vr.status, vr.completedAt, vr.rewardAmount, v.title, v.titleAr, v.category, vpt.displayName as tierDisplayName
      FROM vote_responses vr JOIN votes v ON vr.voteId = v.id JOIN vote_pricing_tiers vpt ON v.pricingTierId = vpt.id
      WHERE vr.userId = ${ctx.user.id} ORDER BY vr.startedAt DESC
    `);
    return (history as any)[0] || [];
  }),

});

export type AppRouter = typeof appRouter;
