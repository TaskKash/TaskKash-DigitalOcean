import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Download, DollarSign, Calendar, CheckCircle2 } from 'lucide-react';
import { useCurrency } from "@/contexts/CurrencyContext";

// Invoices will be fetched from API

const paymentMethods = [
  {
    id: '1',
    type: 'visa',
    last4: '4242',
    expiry: '12/26',
    isDefault: true
  },
  {
    id: '2',
    type: 'mastercard',
    last4: '8888',
    expiry: '09/27',
    isDefault: false
  }
];

export default function Billing() {
  const { currency, symbol, formatAmount } = useCurrency();
  const [balanceData, setBalanceData] = React.useState({ balance: 0, totalSpent: 0, totalBudget: 0 });
  const [invoicesList, setInvoicesList] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([
      fetch('/api/advertiser/billing/balance').then(r => r.json()),
      fetch('/api/advertiser/billing/invoices').then(r => r.json())
    ]).then(([bData, iData]) => {
      setBalanceData(bData);
      setInvoicesList(iData);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const totalSpent = balanceData.totalSpent;
  const currentBalance = balanceData.balance;

  if (loading) {
    return <div className="min-h-screen bg-background p-8 text-center text-muted-foreground">جاري تحميل بيانات الفواتير...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">الفواتير والمدفوعات</h1>
          <p className="text-sm text-muted-foreground">إدارة الفواتير وطرق الدفع</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Balance Card */}
        <Card className="bg-gradient-to-br from-primary to-secondary p-6 text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="opacity-90 mb-1">الرصيد الحالي</p>
              <h2 className="text-4xl font-bold">{currentBalance.toLocaleString()} {symbol}</h2>
            </div>
            <DollarSign className="w-16 h-16 opacity-20" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-sm opacity-90">إجمالي المصروفات</p>
              <p className="text-xl font-bold">{totalSpent.toLocaleString()} {symbol}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-sm opacity-90">عدد الفواتير</p>
              <p className="text-xl font-bold">{invoicesList.length}</p>
            </div>
          </div>
          <Button className="w-full mt-4 bg-white text-primary hover:bg-gray-100">
            إضافة رصيد
          </Button>
        </Card>

        {/* Payment Methods */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">طرق الدفع</h2>
            <Button variant="outline" size="sm">
              إضافة بطاقة جديدة
            </Button>
          </div>

          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">
                        {method.type === 'visa' ? 'Visa' : 'Mastercard'} •••• {method.last4}
                      </p>
                      {method.isDefault && (
                        <Badge className="bg-primary text-white border-0 text-xs">
                          افتراضي
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      تنتهي في {method.expiry}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  تعديل
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Invoices */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">الفواتير</h2>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 ml-2" />
              تحميل الكل
            </Button>
          </div>

          <div className="space-y-3">
            {invoicesList.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{invoice.id}</p>
                      <Badge className="bg-green-100 text-green-800 border-0 text-xs">
                        مدفوعة
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {invoice.campaign}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        تاريخ الإصدار: {invoice.date}
                      </span>
                      <span>•</span>
                      <span>دُفعت في: {invoice.paidDate}</span>
                    </div>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-xl font-bold mb-1">
                    {invoice.amount.toLocaleString()} {symbol}
                  </p>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 ml-2" />
                    تحميل
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Billing Info */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">معلومات الفوترة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">اسم الشركة</p>
              <p className="font-semibold">شركة التسويق الرقمي</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">الرقم الضريبي</p>
              <p className="font-semibold">300012345600003</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">العنوان</p>
              <p className="font-semibold">الرياض، المملكة العربية السعودية</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">البريد الإلكتروني</p>
              <p className="font-semibold">billing@company.com</p>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-4">
            تعديل معلومات الفوترة
          </Button>
        </Card>
      </div>
    </div>
  );
}

