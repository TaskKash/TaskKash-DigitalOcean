import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, Plus, Trash2, Check, Building2,
  Wallet, Star
} from 'lucide-react';
import { toast } from 'sonner';

const paymentMethods = [
  {
    id: '1',
    type: 'card',
    brand: 'Visa',
    last4: '4242',
    expiryMonth: '12',
    expiryYear: '2025',
    holderName: 'أحمد محمد',
    isDefault: true
  },
  {
    id: '2',
    type: 'card',
    brand: 'Mastercard',
    last4: '8888',
    expiryMonth: '06',
    expiryYear: '2026',
    holderName: 'أحمد محمد',
    isDefault: false
  },
  {
    id: '3',
    type: 'bank',
    bankName: 'البنك الأهلي السعودي',
    accountNumber: '****1234',
    accountHolder: 'أحمد محمد',
    isDefault: false
  }
];

export default function PaymentMethods() {
  const [methods, setMethods] = useState(paymentMethods);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSetDefault = (id: string) => {
    setMethods(methods.map(method => ({
      ...method,
      isDefault: method.id === id
    })));
    toast.success('تم تعيين طريقة الدفع الافتراضية');
  };

  const handleDelete = (id: string) => {
    const method = methods.find(m => m.id === id);
    if (method?.isDefault) {
      toast.error('لا يمكن حذف طريقة الدفع الافتراضية');
      return;
    }
    setMethods(methods.filter(m => m.id !== id));
    toast.success('تم حذف طريقة الدفع');
  };

  const getCardIcon = (brand: string) => {
    return <CreditCard className="w-8 h-8" />;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">طرق الدفع</h1>
              <p className="text-sm text-muted-foreground">إدارة طرق الدفع الخاصة بك</p>
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="w-5 h-5 ml-2" />
              إضافة طريقة دفع
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Add Payment Form */}
        {showAddForm && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">إضافة بطاقة جديدة</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">رقم البطاقة</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">اسم حامل البطاقة</label>
                  <input
                    type="text"
                    placeholder="الاسم كما يظهر على البطاقة"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">الشهر</label>
                  <select className="w-full px-4 py-2 border rounded-lg">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month.toString().padStart(2, '0')}>
                        {month.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">السنة</label>
                  <select className="w-full px-4 py-2 border rounded-lg">
                    {Array.from({ length: 10 }, (_, i) => 2024 + i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    maxLength={3}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1">حفظ البطاقة</Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  إلغاء
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Payment Methods List */}
        <div className="space-y-4">
          {methods.map((method) => (
            <Card key={method.id} className="p-6">
              {method.type === 'card' ? (
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white">
                      {getCardIcon(method.brand || 'Visa')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{method.brand}</h3>
                        {method.isDefault && (
                          <Badge className="bg-green-100 text-green-800 border-0">
                            <Star className="w-3 h-3 ml-1 fill-current" />
                            افتراضي
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        •••• •••• •••• {method.last4}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        تنتهي في {method.expiryMonth}/{method.expiryYear}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {method.holderName}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!method.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(method.id)}
                      >
                        <Check className="w-4 h-4 ml-1" />
                        تعيين كافتراضي
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => method.id && handleDelete(method.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-green-600 to-teal-600 flex items-center justify-center text-white">
                      <Building2 className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{method.bankName}</h3>
                        {method.isDefault && (
                          <Badge className="bg-green-100 text-green-800 border-0">
                            <Star className="w-3 h-3 ml-1 fill-current" />
                            افتراضي
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        حساب بنكي {method.accountNumber}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {method.accountHolder}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!method.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(method.id)}
                      >
                        <Check className="w-4 h-4 ml-1" />
                        تعيين كافتراضي
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => method.id && handleDelete(method.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex gap-3">
            <Wallet className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">معلومات مهمة</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• جميع المعاملات آمنة ومشفرة</li>
                <li>• لن يتم خصم أي مبلغ بدون موافقتك</li>
                <li>• يمكنك تغيير طريقة الدفع الافتراضية في أي وقت</li>
                <li>• سيتم استخدام طريقة الدفع الافتراضية للحملات الجديدة</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

