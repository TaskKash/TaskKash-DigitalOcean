import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Wallet, ArrowDownToLine, CheckCircle2, XCircle, Clock, DollarSign,
  Users, TrendingUp, AlertCircle, Search, RefreshCw, ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';

type WithdrawalStatus = 'pending' | 'approved' | 'rejected';

interface Withdrawal {
  id: string;
  userId: string;
  userName: string;
  userTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  amount: number;
  amountEGP: number;
  method: 'bank' | 'ewallet' | 'paypal';
  accountDetails: string;
  requestedAt: string;
  status: WithdrawalStatus;
  rejectionReason?: string;
}

const TIER_COLORS = {
  bronze: 'bg-amber-100 text-amber-800',
  silver: 'bg-gray-100 text-gray-700',
  gold: 'bg-yellow-100 text-yellow-800',
  platinum: 'bg-purple-100 text-purple-700',
};

const METHOD_LABELS = {
  bank: '🏦 Bank Transfer',
  ewallet: '📱 E-Wallet',
  paypal: '💳 PayPal',
};

// Generate mock withdrawal queue
function generateWithdrawals(): Withdrawal[] {
  const names = ['Ahmed Hassan', 'Sara Mohamed', 'Omar Khaled', 'Fatima Ali', 'Youssef Nasser', 'Nour Ibrahim', 'Karim Saad', 'Layla Mahmoud'];
  const methods: ('bank' | 'ewallet' | 'paypal')[] = ['bank', 'ewallet', 'bank', 'ewallet', 'bank', 'ewallet', 'paypal', 'bank'];
  const tiers: ('bronze' | 'silver' | 'gold' | 'platinum')[] = ['silver', 'gold', 'bronze', 'platinum', 'silver', 'gold', 'bronze', 'platinum'];
  const statuses: WithdrawalStatus[] = ['pending', 'pending', 'pending', 'approved', 'rejected', 'pending', 'approved', 'pending'];

  return names.map((name, i) => {
    const amount = 20 + i * 15;
    return {
      id: `WD-${1001 + i}`,
      userId: `USR-${2000 + i}`,
      userName: name,
      userTier: tiers[i],
      amount,
      amountEGP: amount * 31.5,
      method: methods[i],
      accountDetails: methods[i] === 'bank' ? `CIB ****${3000 + i}` : methods[i] === 'ewallet' ? `+2010${i}1234567` : `${name.toLowerCase().replace(' ', '.')}@gmail.com`,
      requestedAt: new Date(Date.now() - i * 3600000 * 4).toISOString(),
      status: statuses[i],
      rejectionReason: statuses[i] === 'rejected' ? 'Account verification incomplete' : undefined,
    };
  });
}

export default function WalletDashboard() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(generateWithdrawals());
  const [filter, setFilter] = useState<'all' | WithdrawalStatus>('all');
  const [search, setSearch] = useState('');
  const [egpRate, setEgpRate] = useState(31.5);
  const [rateInput, setRateInput] = useState('31.5');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const pending = withdrawals.filter(w => w.status === 'pending');
  const approved = withdrawals.filter(w => w.status === 'approved');
  const totalPendingUSD = pending.reduce((s, w) => s + w.amount, 0);
  const totalApprovedUSD = approved.reduce((s, w) => s + w.amount, 0);
  const totalWalletBalance = withdrawals.reduce((s, w) => s + w.amount, 0) + 1240; // platform float

  const filtered = withdrawals.filter(w => {
    const matchStatus = filter === 'all' || w.status === filter;
    const matchSearch = !search || w.userName.toLowerCase().includes(search.toLowerCase()) || w.id.includes(search);
    return matchStatus && matchSearch;
  });

  const handleAction = (id: string, action: 'approve' | 'reject') => {
    setProcessingId(id);
    setTimeout(() => {
      setWithdrawals(prev => prev.map(w => w.id === id ? {
        ...w,
        status: action === 'approve' ? 'approved' : 'rejected',
        rejectionReason: action === 'reject' ? 'Rejected by admin' : undefined,
      } : w));
      toast.success(action === 'approve' ? 'Withdrawal approved and queued for payment' : 'Withdrawal rejected. User notified.');
      setProcessingId(null);
    }, 800);
  };

  const updateRate = () => {
    const rate = parseFloat(rateInput);
    if (isNaN(rate) || rate <= 0) { toast.error('Invalid rate'); return; }
    setEgpRate(rate);
    setWithdrawals(prev => prev.map(w => ({ ...w, amountEGP: w.amount * rate })));
    toast.success(`EGP rate updated to ${rate}`);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Wallet Hub</h1>
          <p className="text-sm text-muted-foreground">Manage user withdrawals, wallet balances & EGP exchange rate</p>
        </div>
        <Badge variant="outline" className="gap-1 px-3 py-1.5">
          <ShieldCheck className="w-4 h-4 text-green-500" /> Admin Control
        </Badge>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Platform Balance', value: `$${totalWalletBalance.toLocaleString()}`, icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pending Withdrawals', value: `$${totalPendingUSD.toFixed(2)}`, sub: `${pending.length} requests`, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Approved (This Month)', value: `$${totalApprovedUSD.toFixed(2)}`, sub: `${approved.length} payouts`, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'EGP Rate (1 USD)', value: `EGP ${egpRate}`, sub: 'Manual override', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(({ label, value, sub, icon: Icon, color, bg }) => (
          <Card key={label} className="border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className={`text-xl font-bold mt-1 ${color}`}>{value}</p>
                  {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
                </div>
                <div className={`p-2 rounded-lg ${bg}`}><Icon className={`w-5 h-5 ${color}`} /></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* EGP Rate Override */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" /> EGP Exchange Rate Override
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3">
            <div className="flex-1 max-w-xs">
              <Label className="text-xs mb-1 block">1 USD = ? EGP</Label>
              <Input type="number" step="0.01" value={rateInput} onChange={e => setRateInput(e.target.value)} placeholder="31.50" />
            </div>
            <Button onClick={updateRate} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" /> Update Rate
            </Button>
            <p className="text-xs text-gray-400 pb-1">Last updated: just now<br />All EGP amounts will recalculate.</p>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawal Queue */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <ArrowDownToLine className="w-4 h-4 text-primary" /> Withdrawal Queue
            {pending.length > 0 && <Badge className="bg-amber-500">{pending.length} pending</Badge>}
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 w-3.5 h-3.5 text-gray-400" />
              <Input placeholder="Search user or ID..." className="pl-7 h-8 text-xs w-48" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
              <SelectTrigger className="h-8 text-xs w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <div className="p-8 text-center text-gray-400">
                <Wallet className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No withdrawals match your filter</p>
              </div>
            )}
            {filtered.map(w => (
              <div key={w.id} className={`p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors ${w.status === 'pending' ? 'bg-amber-50/30' : ''}`}>
                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{w.userName}</span>
                    <Badge variant="outline" className={`text-xs capitalize ${TIER_COLORS[w.userTier]}`}>{w.userTier}</Badge>
                    <span className="text-xs text-gray-400">{w.id}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span>{METHOD_LABELS[w.method]}</span>
                    <span className="font-mono">{w.accountDetails}</span>
                    <span>{new Date(w.requestedAt).toLocaleString()}</span>
                  </div>
                  {w.rejectionReason && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {w.rejectionReason}
                    </p>
                  )}
                </div>

                {/* Amount */}
                <div className="text-right shrink-0">
                  <p className="font-bold text-gray-900">${w.amount.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">EGP {w.amountEGP.toFixed(0)}</p>
                </div>

                {/* Status / Actions */}
                <div className="shrink-0 flex flex-col items-end gap-2">
                  {w.status === 'pending' ? (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleAction(w.id, 'approve')}
                        disabled={processingId === w.id}
                        className="bg-green-600 hover:bg-green-700 h-8 text-xs px-3">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleAction(w.id, 'reject')}
                        disabled={processingId === w.id}
                        className="h-8 text-xs px-3">
                        <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                      </Button>
                    </div>
                  ) : (
                    <Badge variant={w.status === 'approved' ? 'default' : 'destructive'} className={`text-xs ${w.status === 'approved' ? 'bg-green-100 text-green-800' : ''}`}>
                      {w.status === 'approved' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                      {w.status}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
