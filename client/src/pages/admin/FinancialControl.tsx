import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Building2, Users, Receipt, TrendingUp, AlertTriangle, 
  Search, Filter, CheckCircle, XCircle, DollarSign, ArrowUpRight, ArrowDownRight, CreditCard
} from 'lucide-react';
import { useLocation } from 'wouter';

const platformLedger = {
  totalDeposits: 5840000,
  totalPayouts: 3200000,
  platformProfit: 1250000,
  pendingWithdrawals: 145000,
  activeEscrow: 850000
};

const withdrawalRequests = [
  { id: 'WD-8492', user: 'ahmed.m@example.com', amount: 4500, tier: 'platinum', method: 'InstaPay', status: 'pending', date: '10 mins ago', flagged: false },
  { id: 'WD-8491', user: 'sara.k@gmail.com', amount: 1500, tier: 'gold', method: 'Vodafone Cash', status: 'pending', date: '2 hours ago', flagged: false },
  { id: 'WD-8490', user: 'mohammed.a@yahoo.com', amount: 12000, tier: 'silver', method: 'Bank Transfer', status: 'pending', date: '1 day ago', flagged: true },
  { id: 'WD-8489', user: 'fatma.n@example.com', amount: 300, tier: 'bronze', method: 'Vodafone Cash', status: 'pending', date: '2 days ago', flagged: false },
  { id: 'WD-8488', user: 'omar.h@gmail.com', amount: 25000, tier: 'platinum', method: 'Bank Transfer', status: 'processing', date: '1 min ago', flagged: false },
];

export default function FinancialControl() {
  const [, setLocation] = useLocation();
  const [filterTier, setFilterTier] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredWithdrawals = withdrawalRequests.filter(req => {
    const matchesTier = filterTier === 'all' || req.tier === filterTier;
    const matchesSearch = req.user.toLowerCase().includes(searchQuery.toLowerCase()) || req.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTier && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">Financial Control & Treasury</h1>
          <p className="text-muted-foreground mt-1">Manage platform cash flow, ledgers, and batched payouts.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>Export Report</Button>
          <Button className="bg-blue-600 hover:bg-blue-700">Process Batched Payouts</Button>
        </div>
      </div>

      {/* The Ledger */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 flex items-center justify-between">
              Total Deposits (Inflow)
              <ArrowDownRight className="w-4 h-4 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{platformLedger.totalDeposits.toLocaleString()} EGP</div>
            <p className="text-xs text-blue-600 mt-1">From Advertiser Wallets</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-red-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-800 flex items-center justify-between">
              Total Payouts (Outflow)
              <ArrowUpRight className="w-4 h-4 text-red-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-900">{platformLedger.totalPayouts.toLocaleString()} EGP</div>
            <p className="text-xs text-red-600 mt-1">To User Wallets</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-green-100 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10">
            <TrendingUp className="w-32 h-32 -mr-8 -mt-8 text-green-600" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-800 flex items-center justify-between relative z-10">
              Platform Gross Profit
              <DollarSign className="w-4 h-4 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-green-900">{platformLedger.platformProfit.toLocaleString()} EGP</div>
            <p className="text-xs text-green-700 mt-1">Retained commission across all tasks</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Campaign Escrow</p>
              <h3 className="text-2xl font-bold mt-1">{platformLedger.activeEscrow.toLocaleString()} EGP</h3>
              <p className="text-xs text-muted-foreground mt-1">Locked funds for running campaigns</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Withdrawal Volume</p>
              <h3 className="text-2xl font-bold mt-1 text-orange-600">{platformLedger.pendingWithdrawals.toLocaleString()} EGP</h3>
              <p className="text-xs text-muted-foreground mt-1">Across 42 active requests</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal Queue */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
          <div>
            <CardTitle className="text-xl">Withdrawal Queue</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Manage payout timings based on user tiers.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search user or ID..."
                className="pl-8 w-[200px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1 bg-muted p-1 rounded-md border">
              <Filter className="w-4 h-4 text-muted-foreground ml-2" />
              <select 
                className="bg-transparent border-none text-sm outline-none px-2 py-1 pr-6 cursor-pointer"
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                title="Filter by user tier"
              >
                <option value="all">All Tiers</option>
                <option value="platinum">Platinum (Instant)</option>
                <option value="gold">Gold (3 Hrs)</option>
                <option value="silver">Silver (Weekly)</option>
                <option value="bronze">Bronze (Monthly)</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-b">
              <tr>
                <th className="px-6 py-3 font-medium">Req ID</th>
                <th className="px-6 py-3 font-medium">User & Tier</th>
                <th className="px-6 py-3 font-medium">Amount & Method</th>
                <th className="px-6 py-3 font-medium">Requested</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredWithdrawals.map((req) => (
                <tr key={req.id} className={`hover:bg-muted/50 ${req.flagged ? 'bg-red-50/50' : ''}`}>
                  <td className="px-6 py-4 font-medium">
                    {req.id}
                    {req.flagged && <span title="Flagged for unusually large amount"><AlertTriangle className="w-4 h-4 text-red-500 inline ml-2" /></span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{req.user}</div>
                    <Badge variant="outline" className={`mt-1 text-[10px] uppercase font-bold tracking-wider ${
                      req.tier === 'platinum' ? 'bg-slate-200 text-slate-800' :
                      req.tier === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                      req.tier === 'silver' ? 'bg-gray-100 text-gray-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {req.tier}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 dark:text-gray-100">{req.amount.toLocaleString()} EGP</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <CreditCard className="w-3 h-3" />
                      {req.method}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-muted-foreground">{req.date}</div>
                    <Badge className={`mt-1 text-[10px] ${
                      req.status === 'processing' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                    }`} variant="secondary">
                      {req.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 rtl:space-x-reverse">
                    <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700 hover:bg-green-50" title="Approve">
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50" title="Reject">
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredWithdrawals.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <Receipt className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    No withdrawal requests matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
