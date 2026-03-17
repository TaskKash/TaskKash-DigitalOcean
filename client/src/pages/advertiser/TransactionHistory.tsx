import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCurrency } from "@/contexts/CurrencyContext";
import { 
  Search, Download, Filter, ArrowUpCircle, ArrowDownCircle,
  Calendar, CreditCard, FileText
} from 'lucide-react';

// Transactions will be fetched from API

export default function TransactionHistory() {
  const { currency, symbol, formatAmount } = useCurrency();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [transactionsList, setTransactionsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetch('/api/advertiser/billing/transactions')
      .then(r => r.json())
      .then(data => {
        setTransactionsList(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const filteredTransactions = transactionsList.filter(txn => {
    const matchesSearch = 
      txn.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || txn.type === filterType;
    const matchesStatus = filterStatus === 'all' || txn.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalSpent = transactionsList
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalRefunded = transactionsList
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return <div className="min-h-screen bg-background p-8 text-center text-muted-foreground">جاري تحميل المعاملات...</div>;
  }

  const getStatusBadge = (status: string) => {
    if (status === 'completed') {
      return <Badge className="bg-green-100 text-green-800 border-0">مكتملة</Badge>;
    }
    if (status === 'pending') {
      return <Badge className="bg-yellow-100 text-yellow-800 border-0">قيد المعالجة</Badge>;
    }
    return <Badge className="bg-red-100 text-red-800 border-0">فشلت</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">سجل المعاملات</h1>
              <p className="text-sm text-muted-foreground">
                {filteredTransactions.length} معاملة
              </p>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 ml-2" />
              تصدير
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="ابحث عن معاملة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <select
              title="Filter by Type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white"
            >
              <option value="all">جميع الأنواع</option>
              <option value="payment">دفع</option>
              <option value="payout">دفع للمستخدمين</option>
              <option value="deposit">شحن رصيد</option>
              <option value="refund">استرداد</option>
            </select>
            <select
              title="Filter by Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white"
            >
              <option value="all">جميع الحالات</option>
              <option value="completed">مكتملة</option>
              <option value="pending">قيد المعالجة</option>
              <option value="failed">فشلت</option>
            </select>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <ArrowDownCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {totalSpent.toLocaleString()} {symbol}
                </p>
                <p className="text-sm text-muted-foreground">إجمالي المصروفات</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <ArrowUpCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {totalRefunded.toLocaleString()} {symbol}
                </p>
                <p className="text-sm text-muted-foreground">إجمالي الاستردادات</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {transactionsList.length}
                </p>
                <p className="text-sm text-muted-foreground">إجمالي المعاملات</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Transactions List */}
        <div className="space-y-3">
          {filteredTransactions.map((txn) => (
            <Card key={txn.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    txn.amount < 0 ? 'bg-red-100' : 'bg-green-100'
                  }`}>
                    {txn.amount < 0 ? (
                      <ArrowDownCircle className="w-6 h-6 text-red-600" />
                    ) : (
                      <ArrowUpCircle className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{txn.description}</h3>
                      {getStatusBadge(txn.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {txn.date}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-4 h-4" />
                        {txn.method}
                      </span>
                      <span>•</span>
                      <span>{txn.reference}</span>
                    </div>
                  </div>
                </div>
                <div className="text-left">
                  <p className={`text-2xl font-bold ${
                    txn.amount < 0 ? 'text-red-600' : 'text-primary'
                  }`}>
                    {txn.amount > 0 ? '+' : ''}{txn.amount.toLocaleString()} {symbol}
                  </p>
                  <Button variant="ghost" size="sm" className="mt-2">
                    <FileText className="w-4 h-4 ml-1" />
                    الفاتورة
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredTransactions.length === 0 && (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-semibold mb-2">لا توجد معاملات</p>
            <p className="text-muted-foreground">
              لم يتم العثور على معاملات مطابقة للبحث
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

