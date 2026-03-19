import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';
import {
  Users, Building2, Target, DollarSign, TrendingUp,
  Activity, Wallet, AlertTriangle, Clock, CheckCircle2,
  Loader2, ArrowUpRight, BarChart3
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalAdvertisers: number;
  verifiedUsers: number;
  pendingCampaigns: number;
}

interface AnalyticsData {
  totalUsers: number;
  totalAdvertisers: number;
  activeCampaigns: number;
  totalPaidOut: number;
  currentEscrow: number;
  netRevenue: number;
  dailyCompletions: { date: string; completions: number }[];
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [analytics, setAnalytics] = React.useState<AnalyticsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [statsRes, analyticsRes] = await Promise.all([
          fetch('/api/admin/stats', { credentials: 'include' }),
          fetch('/api/admin/analytics', { credentials: 'include' })
        ]);

        if (!statsRes.ok || !analyticsRes.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const statsJson = await statsRes.json();
        const analyticsJson = await analyticsRes.json();

        if (!cancelled) {
          setStats(statsJson.stats);
          setAnalytics(analyticsJson.data);
          setError(null);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Failed to load data');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="p-8 text-center max-w-md">
            <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Error Loading Dashboard</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const kpiCards = [
    {
      label: 'Total Users',
      value: (stats?.totalUsers ?? analytics?.totalUsers ?? 0).toLocaleString(),
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      href: '/admin/users'
    },
    {
      label: 'Advertisers',
      value: (stats?.totalAdvertisers ?? analytics?.totalAdvertisers ?? 0).toLocaleString(),
      icon: Building2,
      color: 'text-purple-600',
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      href: '/admin/advertisers'
    },
    {
      label: 'Active Campaigns',
      value: (analytics?.activeCampaigns ?? 0).toLocaleString(),
      icon: Target,
      color: 'text-indigo-600',
      bg: 'bg-indigo-100 dark:bg-indigo-900/30',
      href: '/admin/campaign-review'
    },
    {
      label: 'Pending Reviews',
      value: (stats?.pendingCampaigns ?? 0).toLocaleString(),
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      href: '/admin/campaign-review'
    },
    {
      label: 'Verified Users',
      value: (stats?.verifiedUsers ?? 0).toLocaleString(),
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      href: '/admin/users'
    },
    {
      label: 'Platform Revenue',
      value: `$${(analytics?.netRevenue ?? 0).toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-100 dark:bg-green-900/30',
      href: '/admin/analytics'
    },
  ];

  const financialCards = [
    {
      label: 'Net Revenue',
      value: `$${(analytics?.netRevenue ?? 0).toFixed(2)}`,
      sub: 'From Escrow Commissions',
      icon: TrendingUp,
      color: 'text-green-700',
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800'
    },
    {
      label: 'Escrow Balance',
      value: `$${(analytics?.currentEscrow ?? 0).toFixed(2)}`,
      sub: 'Held for active tasks',
      icon: Wallet,
      color: 'text-amber-700',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800'
    },
    {
      label: 'Paid to Users',
      value: `$${(analytics?.totalPaidOut ?? 0).toFixed(2)}`,
      sub: 'Successfully withdrawn',
      icon: DollarSign,
      color: 'text-red-700',
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800'
    }
  ];

  const dailyCompletions = analytics?.dailyCompletions ?? [];
  const maxCompletions = Math.max(...dailyCompletions.map(d => d.completions), 1);

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">TASKKASH Platform Overview — Real-Time Data</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpiCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.label}
                className="p-5 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => setLocation(card.href)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                    <h3 className="text-3xl font-bold mt-1">{card.value}</h3>
                  </div>
                  <div className={`p-3 rounded-lg ${card.bg}`}>
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
                <div className="mt-3 flex items-center text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="h-3 w-3 mr-1" /> View details
                </div>
              </Card>
            );
          })}
        </div>

        {/* Financial Ledger */}
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-muted-foreground" /> Financial Ledger
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {financialCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card key={card.label} className={`${card.border} border`}>
                  <div className={`p-5 ${card.bg} rounded-lg`}>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/80 dark:bg-gray-800/80 rounded-lg">
                        <Icon className={`w-5 h-5 ${card.color}`} />
                      </div>
                      <div>
                        <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
                        <div className="text-sm font-medium">{card.label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{card.sub}</div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Completions Chart */}
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-muted-foreground" /> Completions — Last 7 Days
          </h2>
          <Card className="p-6">
            {dailyCompletions.length > 0 ? (
              <div className="h-52 flex items-end gap-3 overflow-x-auto pb-2">
                {dailyCompletions.map((day, i) => {
                  const pct = (day.completions / maxCompletions) * 100;
                  return (
                    <div key={i} className="flex flex-col items-center flex-1 min-w-[56px]">
                      <div className="w-full flex-grow flex items-end mb-2 group relative" style={{ height: '160px' }}>
                        <div
                          className="w-full bg-primary/80 rounded-t-md transition-all duration-300 hover:bg-primary"
                          style={{ height: pct > 0 ? `${pct}%` : '2px', minHeight: '2px' }}
                        >
                          <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded pointer-events-none transition-opacity whitespace-nowrap">
                            {day.completions} completions
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground font-medium text-center">{day.date}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No task completions in the last 7 days.</p>
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" onClick={() => setLocation('/admin/users')}>
              <Users className="w-4 h-4 mr-2" /> Manage Users
            </Button>
            <Button variant="outline" onClick={() => setLocation('/admin/advertisers')}>
              <Building2 className="w-4 h-4 mr-2" /> Manage Advertisers
            </Button>
            <Button variant="outline" onClick={() => setLocation('/admin/campaign-review')}>
              <Target className="w-4 h-4 mr-2" /> Campaign Reviews
            </Button>
            <Button variant="outline" onClick={() => setLocation('/admin/withdrawals')}>
              <Wallet className="w-4 h-4 mr-2" /> Withdrawals
            </Button>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
