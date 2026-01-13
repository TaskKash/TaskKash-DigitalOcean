/**
 * Analytics Router
 * Add this to the main routers.ts file
 */

import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getUserDashboardStats,
  getAdvertiserDashboardStats,
  getAdminDashboardStats,
  getTaskPerformanceReport,
  getRevenueReport,
} from "./services/analytics.service";

export const analyticsRouter = router({
  // User dashboard
  getUserDashboard: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      return await getUserDashboardStats(input.userId);
    }),

  // Advertiser dashboard
  getAdvertiserDashboard: publicProcedure
    .input(z.object({ advertiserId: z.number() }))
    .query(async ({ input }) => {
      return await getAdvertiserDashboardStats(input.advertiserId);
    }),

  // Admin dashboard
  getAdminDashboard: publicProcedure.query(async ({ ctx }) => {
    // Check if user is admin
    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }
    return await getAdminDashboardStats();
  }),

  // Task performance report
  getTaskPerformance: publicProcedure
    .input(z.object({ taskId: z.number() }))
    .query(async ({ input }) => {
      return await getTaskPerformanceReport(input.taskId);
    }),

  // Revenue report
  getRevenueReport: publicProcedure
    .input(z.object({
      startDate: z.date(),
      endDate: z.date(),
    }))
    .query(async ({ ctx, input }) => {
      // Check if user is admin
      if (!ctx.user || ctx.user.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }
      return await getRevenueReport(input.startDate, input.endDate);
    }),
});

// Add this to your main appRouter:
// analytics: analyticsRouter,
