import React, { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Building2, Target, DollarSign, Wallet, TrendingUp, Clock, Zap, CalendarDays, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminAnalyticsDashboard() {
  const queryClient = useQueryClient();

  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const response = await fetch('/api/admin/analytics', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const json = await response.json();
      return json.data;
    }
  });

  const { data: batches, isLoading: batchesLoading } = useQuery({
    queryKey: ['admin-withdrawal-batches'],
    queryFn: async () => {
      const response = await fetch('/api/admin/withdrawal-batches', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch batches');
      const json = await response.json();
      return json.batches;
    }
  });

  const processMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await fetch('/api/admin/withdrawal-batches/process', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      if (!response.ok) throw new Error('Failed to process batch');
      return response.json();
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawal-batches'] });
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
    },
    onError: (err: Error) => toast.error(err.message)
  });

  const handleProcessBatch = (items: any[]) => {
    if (items.length === 0) return;
    const ids = items.map((i: any) => i.id);
    processMutation.mutate(ids);
  };

  return (
    <AdminLayout title="Analytics & Financial Ledger">
      <div className="space-y-6">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500 animate-pulse">Loading analytics...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">Failed to load analytics: {(error as Error).message}</div>
        ) : analytics ? (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Users className="w-6 h-6" /></div>
                  <div>
                    <div className="text-2xl font-bold">{analytics.totalUsers}</div>
                    <div className="text-sm text-gray-500 font-medium">Total Users</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><Building2 className="w-6 h-6" /></div>
                  <div>
                    <div className="text-2xl font-bold">{analytics.totalAdvertisers}</div>
                    <div className="text-sm text-gray-500 font-medium">Advertisers</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg"><Target className="w-6 h-6" /></div>
                  <div>
                    <div className="text-2xl font-bold">{analytics.activeCampaigns}</div>
                    <div className="text-sm text-gray-500 font-medium">Active Campaigns</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Financial Ledger */}
            <h3 className="text-lg font-bold mt-10 mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-gray-500"/> Financial Ledger
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-green-200">
                <CardContent className="p-6 flex items-center gap-4 bg-green-50/50">
                  <div className="p-3 bg-green-100 text-green-600 rounded-lg"><TrendingUp className="w-6 h-6" /></div>
                  <div>
                    <div className="text-2xl font-bold text-green-700">${analytics.netRevenue.toFixed(2)}</div>
                    <div className="text-sm text-green-600 font-medium">Platform Net Revenue</div>
                    <div className="text-xs text-gray-500 mt-1">From Escrow Commissions</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-amber-100 text-amber-600 rounded-lg"><Wallet className="w-6 h-6" /></div>
                  <div>
                    <div className="text-2xl font-bold">${analytics.currentEscrow.toFixed(2)}</div>
                    <div className="text-sm text-gray-500 font-medium">Current Escrow Balance</div>
                    <div className="text-xs text-gray-500 mt-1">Held for active tasks</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-red-100 text-red-600 rounded-lg"><DollarSign className="w-6 h-6" /></div>
                  <div>
                    <div className="text-2xl font-bold">${analytics.totalPaidOut.toFixed(2)}</div>
                    <div className="text-sm text-gray-500 font-medium">Total Paid to Users</div>
                    <div className="text-xs text-gray-500 mt-1">Successfully withdrawn</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Completions Chart */}
            <h3 className="text-lg font-bold mt-10 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gray-500"/> Completions (Last 7 Days)
            </h3>
            <Card>
              <CardContent className="p-6">
                {analytics.dailyCompletions && analytics.dailyCompletions.length > 0 ? (
                  <div className="h-64 flex items-end gap-4 overflow-x-auto pb-4 px-2">
                    {analytics.dailyCompletions.map((day: any, i: number) => {
                      const max = Math.max(...analytics.dailyCompletions.map((d: any) => d.completions)) || 1;
                      const pct = (day.completions / max) * 100;
                      return (
                        <div key={i} className="flex flex-col items-center flex-1 min-w-[60px]">
                          <div className="w-full flex-grow flex items-end mb-2 group relative">
                            {/* eslint-disable-next-line react/forbid-dom-props */}
                            <div className="w-full bg-blue-500 rounded-t-sm transition-all duration-300 hover:bg-blue-600 h-[var(--bar-h)]" style={{ '--bar-h': pct > 0 ? `${pct}%` : '2px' } as React.CSSProperties}>
                              <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded pointer-events-none transition-opacity">
                                {day.completions}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 font-medium text-center">{day.date}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-10">No task completions in the last 7 days.</div>
                )}
              </CardContent>
            </Card>

            {/* Withdrawal Batch Processing */}
            <h3 className="text-lg font-bold mt-10 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500"/> Withdrawal Batch Queues
            </h3>

            {batchesLoading ? (
              <div className="p-8 text-center text-gray-500 animate-pulse">Loading withdrawal batches...</div>
            ) : batches ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 3-Hour Queue */}
                <Card className="border-t-4 border-t-yellow-400">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      <h4 className="font-bold">{batches.threeHour.label}</h4>
                    </div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-3xl font-bold">{batches.threeHour.count}</span>
                      <span className="text-sm text-gray-500">pending</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                      Total: <span className="font-semibold">${batches.threeHour.totalAmount.toFixed(2)}</span>
                    </div>
                    <Button
                      className="w-full"
                      disabled={batches.threeHour.count === 0 || processMutation.isPending}
                      onClick={() => handleProcessBatch(batches.threeHour.items)}
                    >
                      {processMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                      Process Batch
                    </Button>
                  </CardContent>
                </Card>

                {/* Weekly Queue */}
                <Card className="border-t-4 border-t-blue-400">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CalendarDays className="w-5 h-5 text-blue-500" />
                      <h4 className="font-bold">{batches.weekly.label}</h4>
                    </div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-3xl font-bold">{batches.weekly.count}</span>
                      <span className="text-sm text-gray-500">pending</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                      Total: <span className="font-semibold">${batches.weekly.totalAmount.toFixed(2)}</span>
                    </div>
                    <Button
                      className="w-full"
                      variant="outline"
                      disabled={batches.weekly.count === 0 || processMutation.isPending}
                      onClick={() => handleProcessBatch(batches.weekly.items)}
                    >
                      {processMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                      Process Batch
                    </Button>
                  </CardContent>
                </Card>

                {/* Monthly Queue */}
                <Card className="border-t-4 border-t-gray-400">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CalendarDays className="w-5 h-5 text-gray-500" />
                      <h4 className="font-bold">{batches.monthly.label}</h4>
                    </div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-3xl font-bold">{batches.monthly.count}</span>
                      <span className="text-sm text-gray-500">pending</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                      Total: <span className="font-semibold">${batches.monthly.totalAmount.toFixed(2)}</span>
                    </div>
                    <Button
                      className="w-full"
                      variant="outline"
                      disabled={batches.monthly.count === 0 || processMutation.isPending}
                      onClick={() => handleProcessBatch(batches.monthly.items)}
                    >
                      {processMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                      Process Batch
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}
