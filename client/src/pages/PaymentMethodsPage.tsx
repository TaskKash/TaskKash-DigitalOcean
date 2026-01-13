import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useApp } from '@/contexts/AppContext';
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  Wallet, 
  Plus, 
  Trash2, 
  Check,
  Edit2,
  Save,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface PaymentMethod {
  id: string;
  type: 'vodafone-cash' | 'instapay' | 'bank-transfer' | 'wallet';
  name: string;
  accountNumber: string;
  isDefault: boolean;
  icon: string;
}

export default function PaymentMethodsPage() {
  const { t, i18n } = useTranslation();
  const { user } = useApp();
  const isArabic = i18n.language === 'ar';
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state for adding/editing
  const [formData, setFormData] = useState({
    type: 'vodafone-cash' as PaymentMethod['type'],
    name: '',
    accountNumber: ''
  });

  const methodTypes = [
    { 
      id: 'vodafone-cash', 
      name: isArabic ? 'فودافون كاش' : 'Vodafone Cash', 
      icon: '📱',
      placeholder: '01xxxxxxxxx'
    },
    { 
      id: 'instapay', 
      name: isArabic ? 'انستاباي' : 'InstaPay', 
      icon: '⚡',
      placeholder: isArabic ? 'رقم الهاتف أو الحساب' : 'Phone or account number'
    },
    { 
      id: 'bank-transfer', 
      name: isArabic ? 'تحويل بنكي' : 'Bank Transfer', 
      icon: '🏦',
      placeholder: 'EG38XXXXXXXXXXXXXXXXXXXX'
    },
    { 
      id: 'wallet', 
      name: isArabic ? 'محفظة إلكترونية' : 'E-Wallet', 
      icon: '💳',
      placeholder: isArabic ? 'رقم المحفظة' : 'Wallet number'
    }
  ];

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('/api/payment-methods', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data.methods || []);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      // Use mock data for now
      setPaymentMethods([
        {
          id: '1',
          type: 'vodafone-cash',
          name: isArabic ? 'فودافون كاش الأساسي' : 'Primary Vodafone Cash',
          accountNumber: '01012345678',
          isDefault: true,
          icon: '📱'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMethod = async () => {
    if (!formData.accountNumber.trim()) {
      toast.error(isArabic ? 'يرجى إدخال رقم الحساب' : 'Please enter account number');
      return;
    }

    try {
      const response = await fetch('/api/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: formData.type,
          name: formData.name || methodTypes.find(m => m.id === formData.type)?.name,
          accountNumber: formData.accountNumber,
          isDefault: paymentMethods.length === 0
        })
      });

      if (response.ok) {
        toast.success(isArabic ? 'تم إضافة طريقة الدفع بنجاح' : 'Payment method added successfully');
        fetchPaymentMethods();
        setIsAdding(false);
        setFormData({ type: 'vodafone-cash', name: '', accountNumber: '' });
      } else {
        throw new Error('Failed to add payment method');
      }
    } catch (error) {
      // For now, add locally since API might not exist yet
      const newMethod: PaymentMethod = {
        id: Date.now().toString(),
        type: formData.type,
        name: formData.name || methodTypes.find(m => m.id === formData.type)?.name || '',
        accountNumber: formData.accountNumber,
        isDefault: paymentMethods.length === 0,
        icon: methodTypes.find(m => m.id === formData.type)?.icon || '💳'
      };
      setPaymentMethods([...paymentMethods, newMethod]);
      toast.success(isArabic ? 'تم إضافة طريقة الدفع بنجاح' : 'Payment method added successfully');
      setIsAdding(false);
      setFormData({ type: 'vodafone-cash', name: '', accountNumber: '' });
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await fetch(`/api/payment-methods/${id}/default`, {
        method: 'PUT',
        credentials: 'include'
      });
    } catch (error) {
      // Update locally
    }
    
    setPaymentMethods(methods => 
      methods.map(m => ({ ...m, isDefault: m.id === id }))
    );
    toast.success(isArabic ? 'تم تعيين طريقة الدفع الافتراضية' : 'Default payment method updated');
  };

  const handleDelete = async (id: string) => {
    const method = paymentMethods.find(m => m.id === id);
    if (method?.isDefault && paymentMethods.length > 1) {
      toast.error(isArabic ? 'لا يمكن حذف طريقة الدفع الافتراضية' : 'Cannot delete default payment method');
      return;
    }

    try {
      await fetch(`/api/payment-methods/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
    } catch (error) {
      // Delete locally
    }
    
    setPaymentMethods(methods => methods.filter(m => m.id !== id));
    toast.success(isArabic ? 'تم حذف طريقة الدفع' : 'Payment method deleted');
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'vodafone-cash': return <Smartphone className="w-5 h-5" />;
      case 'instapay': return <Wallet className="w-5 h-5" />;
      case 'bank-transfer': return <Building2 className="w-5 h-5" />;
      default: return <CreditCard className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <MobileLayout title={isArabic ? 'طرق الدفع' : 'Payment Methods'} showBack>
        <div className="p-4 space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-16 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title={isArabic ? 'طرق الدفع' : 'Payment Methods'} showBack>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">
            {isArabic ? 'إدارة طرق الدفع' : 'Manage Payment Methods'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isArabic 
              ? 'أضف وأدر طرق الدفع الخاصة بك للسحب السريع'
              : 'Add and manage your payment methods for quick withdrawals'}
          </p>
        </div>

        {/* Existing Payment Methods */}
        {paymentMethods.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">
              {isArabic ? 'طرق الدفع المحفوظة' : 'Saved Payment Methods'}
            </h3>
            {paymentMethods.map(method => (
              <Card key={method.id} className={`p-4 ${method.isDefault ? 'border-primary border-2' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      {getMethodIcon(method.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{method.name}</span>
                        {method.isDefault && (
                          <Badge variant="secondary" className="text-xs">
                            {isArabic ? 'افتراضي' : 'Default'}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {method.accountNumber.replace(/(.{4})/g, '$1 ').trim()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!method.isDefault && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleSetDefault(method.id)}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleDelete(method.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Add New Payment Method */}
        {isAdding ? (
          <Card className="p-4 space-y-4">
            <h3 className="font-semibold">
              {isArabic ? 'إضافة طريقة دفع جديدة' : 'Add New Payment Method'}
            </h3>
            
            <div>
              <Label>{isArabic ? 'نوع طريقة الدفع' : 'Payment Method Type'}</Label>
              <RadioGroup 
                value={formData.type} 
                onValueChange={(value) => setFormData({ ...formData, type: value as PaymentMethod['type'] })}
                className="mt-2"
              >
                <div className="grid grid-cols-2 gap-2">
                  {methodTypes.map(type => (
                    <Card 
                      key={type.id}
                      className={`p-3 cursor-pointer ${formData.type === type.id ? 'border-primary border-2' : ''}`}
                      onClick={() => setFormData({ ...formData, type: type.id as PaymentMethod['type'] })}
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value={type.id} id={type.id} />
                        <span className="text-lg">{type.icon}</span>
                        <Label htmlFor={type.id} className="text-sm cursor-pointer">
                          {type.name}
                        </Label>
                      </div>
                    </Card>
                  ))}
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="name">
                {isArabic ? 'اسم مخصص (اختياري)' : 'Custom Name (Optional)'}
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={isArabic ? 'مثال: حسابي الشخصي' : 'e.g., My Personal Account'}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="accountNumber">
                {isArabic ? 'رقم الحساب' : 'Account Number'}
              </Label>
              <Input
                id="accountNumber"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                placeholder={methodTypes.find(m => m.id === formData.type)?.placeholder}
                className="mt-2"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddMethod} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                {isArabic ? 'حفظ' : 'Save'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAdding(false);
                  setFormData({ type: 'vodafone-cash', name: '', accountNumber: '' });
                }}
              >
                <X className="w-4 h-4 mr-2" />
                {isArabic ? 'إلغاء' : 'Cancel'}
              </Button>
            </div>
          </Card>
        ) : (
          <Button 
            onClick={() => setIsAdding(true)} 
            className="w-full"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isArabic ? 'إضافة طريقة دفع جديدة' : 'Add New Payment Method'}
          </Button>
        )}

        {/* Info Card */}
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200">
          <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
            {isArabic ? 'معلومات مهمة' : 'Important Information'}
          </h4>
          <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
            <li>• {isArabic ? 'تأكد من صحة بيانات الحساب قبل الحفظ' : 'Verify account details before saving'}</li>
            <li>• {isArabic ? 'يمكنك تعيين طريقة دفع افتراضية للسحب السريع' : 'Set a default method for quick withdrawals'}</li>
            <li>• {isArabic ? 'الحد الأدنى للسحب: 50 ج.م' : 'Minimum withdrawal: 50 EGP'}</li>
          </ul>
        </Card>
      </div>
    </MobileLayout>
  );
}
