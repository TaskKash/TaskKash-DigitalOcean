import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowUpRight, ArrowDownLeft, Gift, RefreshCw, Wallet as WalletIcon } from 'lucide-react';
import { toast } from 'sonner';
import WithdrawDialog from '@/components/WithdrawDialog';

interface Transaction {
  id: string;
  type: 'earn' | 'withdraw' | 'bonus' | 'refund';
  amount: number | string;
  description: string;
  date: string;
  status: string;
}

const transactionIcons: Record<string, any> = {
  earn: ArrowDownLeft,
  withdraw: ArrowUpRight,
  bonus: Gift,
  refund: RefreshCw
};

const transactionColors: Record<string, string> = {
  earn: 'text-primary',
  withdraw: 'text-red-600',
  bonus: 'text-blue-600',
  refund: 'text-secondary'
};

// Updated: 2025-12-21 - Fixed transactions loading
export default function Wallet() {
  const { t } = useTranslation();
  const { user, transactions, updateBalance, refreshUser, refreshTransactions } = useApp();
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);

  // Fetch freshest transactions on mount
  useEffect(() => {
    const fetchLatest = async () => {
      setIsLoadingTransactions(true);
      await refreshTransactions();
      setIsLoadingTransactions(false);
    };
    fetchLatest();
  }, [user?.id, refreshTransactions]);

  const getTransactionName = (type: string) => {
    const typeMap: Record<string, string> = {
      earn: t('wallet.transactionTypes.earn'),
      withdraw: t('wallet.transactionTypes.withdraw'),
      bonus: t('wallet.transactionTypes.bonus'),
      refund: t('wallet.transactionTypes.refund')
    };
    return typeMap[type] || type;
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      completed: t('wallet.status.completed'),
      pending: t('wallet.status.pending'),
      failed: t('wallet.status.failed')
    };
    return statusMap[status] || status;
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error(t('wallet.errors.invalidAmount'));
      return;
    }
    if (amount > user.balance) {
      toast.error(t('wallet.errors.insufficientBalance'));
      return;
    }
    if (amount < 50) {
      toast.error(t('wallet.errors.minimumAmount'));
      return;
    }

    setIsWithdrawing(true);
    setTimeout(() => {
      toast.success(t('wallet.success.withdrawRequest'));
      setIsWithdrawing(false);
      setWithdrawAmount('');
    }, 1500);
  };

  const earnTransactions = transactions.filter(t => t.type === 'earn');
  const withdrawTransactions = transactions.filter(t => t.type === 'withdraw');
  const bonusTransactions = transactions.filter(t => t.type === 'bonus' || t.type === 'refund');
  
  // Use totalEarnings from user data (database)
  const totalEarnings = user.totalEarnings || 0;

  const TransactionCard = ({ transaction }: { transaction: Transaction }) => {
    const Icon = transactionIcons[transaction.type] || WalletIcon;
    const color = transactionColors[transaction.type] || 'text-muted-foreground';
    const amount = parseFloat(transaction.amount as any) || 0;
    const isPositive = amount >= 0;

    return (
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">{transaction.description}</p>
            <p className="text-xs text-muted-foreground">{transaction.date}</p>
          </div>
          
          <div className="text-left">
            <p className={`font-bold ${isPositive ? 'text-primary' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{amount.toFixed(2)} {t('currency')}
            </p>
            <Badge 
              variant={transaction.status === 'completed' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {getStatusLabel(transaction.status)}
            </Badge>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <MobileLayout title={t('wallet.title')}>
      <div className="p-4 space-y-6">
        {/* Balance Card */}
        <Card className="bg-gradient-to-br from-primary to-secondary p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <WalletIcon className="w-5 h-5" />
            <p className="text-sm opacity-90">{t('home.currentBalance')}</p>
          </div>
          
          <div className="flex items-baseline gap-2 mb-6">
            <h1 className="text-4xl font-bold">{user.balance.toFixed(2)}</h1>
            <span className="text-xl">{t('currency')}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button 
              className="bg-white text-primary hover:bg-gray-100"
              onClick={() => setIsDialogOpen(true)}
            >
              {t('wallet.withdrawBalance')}
            </Button>
            
            <WithdrawDialog
              isOpen={isDialogOpen}
              onClose={() => setIsDialogOpen(false)}
              userBalance={user.balance}
              onSuccess={async () => {
                // Refresh data via API contexts instead of a hard reload
                await refreshUser();
                await refreshTransactions();
              }}
            />


          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">{t('home.stats.totalEarnings')}</p>
            <p className="text-lg font-bold text-primary">{totalEarnings.toFixed(0)}</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">{t('wallet.stats.withdrawals')}</p>
            <p className="text-lg font-bold text-red-600">
              {Math.abs(withdrawTransactions.reduce((sum, t) => sum + (parseFloat(t.amount as any) || 0), 0)).toFixed(0)}
            </p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">{t('wallet.stats.bonuses')}</p>
            <p className="text-lg font-bold text-blue-600">
              {bonusTransactions.reduce((sum, t) => sum + (parseFloat(t.amount as any) || 0), 0).toFixed(0)}
            </p>
          </Card>
        </div>

        {/* Transactions */}
        <div>
          <h3 className="text-lg font-semibold mb-4">{t('wallet.transactions')}</h3>
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full grid grid-cols-4 mb-4">
              <TabsTrigger value="all">{t('all')}</TabsTrigger>
              <TabsTrigger value="earn">{t('wallet.tabs.earnings')}</TabsTrigger>
              <TabsTrigger value="withdraw">{t('wallet.tabs.withdrawals')}</TabsTrigger>
              <TabsTrigger value="bonus">{t('wallet.tabs.bonuses')}</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3">
              {isLoadingTransactions ? (
                <Card className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                  <p className="text-muted-foreground">Loading transactions...</p>
                </Card>
              ) : transactions.length === 0 ? (
                <Card className="p-10 text-center border-dashed border-2 bg-muted/30">
                  <WalletIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-40" />
                  <p className="font-medium text-foreground mb-1">{t('wallet.empty.all')}</p>
                  <p className="text-sm text-muted-foreground">{t('wallet.empty.startEarning')}</p>
                </Card>
              ) : (
                transactions.map(transaction => (
                  <TransactionCard key={transaction.id} transaction={transaction} />
                ))
              )}
            </TabsContent>

            <TabsContent value="earn" className="space-y-3">
              {earnTransactions.length === 0 ? (
                <Card className="p-10 text-center border-dashed border-2 bg-muted/30">
                  <ArrowDownLeft className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-40" />
                  <p className="font-medium text-foreground">{t('wallet.empty.earnings')}</p>
                </Card>
              ) : (
                earnTransactions.map(transaction => (
                  <TransactionCard key={transaction.id} transaction={transaction} />
                ))
              )}
            </TabsContent>

            <TabsContent value="withdraw" className="space-y-3">
              {withdrawTransactions.length === 0 ? (
                <Card className="p-10 text-center border-dashed border-2 bg-muted/30">
                  <ArrowUpRight className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-40" />
                  <p className="font-medium text-foreground">{t('wallet.empty.withdrawals')}</p>
                </Card>
              ) : (
                withdrawTransactions.map(transaction => (
                  <TransactionCard key={transaction.id} transaction={transaction} />
                ))
              )}
            </TabsContent>

            <TabsContent value="bonus" className="space-y-3">
              {bonusTransactions.length === 0 ? (
                <Card className="p-10 text-center border-dashed border-2 bg-muted/30">
                  <Gift className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-40" />
                  <p className="font-medium text-foreground">{t('wallet.empty.bonuses')}</p>
                </Card>
              ) : (
                bonusTransactions.map(transaction => (
                  <TransactionCard key={transaction.id} transaction={transaction} />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MobileLayout>
  );
}
