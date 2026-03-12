import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowUpRight, Loader2 } from 'lucide-react';

interface WithdrawMethod {
  id: string;
  nameEn: string;
  nameAr: string;
  minAmount: number;
  maxAmount: number;
  fee: number;
  feePercentage: number;
  processingTime: string;
  icon: string;
  fields: Array<{
    name: string;
    label: string;
    labelAr: string;
    type: string;
    required: boolean;
    placeholder?: string;
  }>;
}

interface WithdrawDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userBalance: number;
  onSuccess: () => void;
}

export default function WithdrawDialog({ isOpen, onClose, userBalance, onSuccess }: WithdrawDialogProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [methods, setMethods] = useState<WithdrawMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [accountDetails, setAccountDetails] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMethods, setIsFetchingMethods] = useState(true);

  // Fetch withdrawal methods
  useEffect(() => {
    if (isOpen) {
      fetchMethods();
    }
  }, [isOpen]);

  const fetchMethods = async () => {
    setIsLoading(true);
    try {
      setIsFetchingMethods(true);
      const response = await fetch('/api/withdrawals/methods');
      const data = await response.json();
      setMethods(data.methods || []);
    } catch (error) {
      console.error('Error fetching withdrawal methods:', error);
      toast.error('Failed to load withdrawal methods');
    } finally {
      setIsFetchingMethods(false);
    }
  };

  const selectedMethodConfig = methods.find(m => m.id === selectedMethod);

  const handleAmountChange = (value: string) => {
    // Allow only numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setAccountDetails(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const validateForm = (): boolean => {
    const amountNum = parseFloat(amount);

    if (!selectedMethod) {
      toast.error(isRTL ? 'يرجى اختيار طريقة السحب' : 'Please select a withdrawal method');
      return false;
    }

    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      toast.error(isRTL ? 'يرجى إدخال مبلغ صحيح' : 'Please enter a valid amount');
      return false;
    }

    if (!selectedMethodConfig) return false;

    if (amountNum < selectedMethodConfig.minAmount) {
      toast.error(
        isRTL 
          ? `الحد الأدنى للسحب هو ${selectedMethodConfig.minAmount} جنيه`
          : `Minimum withdrawal is ${selectedMethodConfig.minAmount} EGP`
      );
      return false;
    }

    if (amountNum > selectedMethodConfig.maxAmount) {
      toast.error(
        isRTL
          ? `الحد الأقصى للسحب هو ${selectedMethodConfig.maxAmount} جنيه`
          : `Maximum withdrawal is ${selectedMethodConfig.maxAmount} EGP`
      );
      return false;
    }

    if (amountNum > userBalance) {
      toast.error(isRTL ? 'رصيدك غير كافٍ' : 'Insufficient balance');
      return false;
    }

    // Validate required fields
    for (const field of selectedMethodConfig.fields) {
      if (field.required && !accountDetails[field.name]) {
        toast.error(
          isRTL
            ? `يرجى إدخال ${field.labelAr}`
            : `Please enter ${field.label}`
        );
        return false;
      }
    }

    return true;
  };

  // Get CSRF token before making request
  const getCsrfToken = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/csrf-token");
      const data = await response.json();
      return data.csrfToken;
    } catch (error) {
      console.error("Error getting CSRF token:", error);
      return null;
    }
  };
  const handleSubmit = async () => {
    if (!validateForm()) return;
    const csrfToken = await getCsrfToken();
    if (!csrfToken) {
      toast.error(isRTL ? "فشل في الحصول على رمز الأمان" : "Failed to get security token");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('/api/withdrawals/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          method: selectedMethod,
          accountDetails
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          isRTL
            ? 'تم إرسال طلب السحب بنجاح!'
            : 'Withdrawal request submitted successfully!'
        );
        onSuccess();
        handleClose();
      } else {
        toast.error(data.error || 'Failed to submit withdrawal request');
      }
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      toast.error(isRTL ? 'حدث خطأ أثناء إرسال الطلب' : 'Error submitting request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    setSelectedMethod('');
    setAccountDetails({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5" />
            {isRTL ? 'سحب الأموال' : 'Withdraw Funds'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Current Balance */}
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">
              {isRTL ? 'رصيدك الحالي' : 'Current Balance'}
            </p>
            <p className="text-2xl font-bold text-primary">
              {userBalance.toFixed(2)} {isRTL ? 'جنيه' : 'EGP'}
            </p>
          </div>

          {/* Withdrawal Method */}
          <div className="space-y-2">
            <Label>{isRTL ? 'طريقة السحب' : 'Withdrawal Method'}</Label>
            {isFetchingMethods ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                <SelectTrigger>
                  <SelectValue placeholder={isRTL ? 'اختر طريقة السحب' : 'Select method'} />
                </SelectTrigger>
                <SelectContent>
                  {methods.map(method => (
                    <SelectItem key={method.id} value={method.id}>
                      <div className="flex items-center gap-2">
                        <span>{method.icon}</span>
                        <span>{isRTL ? method.nameAr : method.nameEn}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {selectedMethodConfig && (
              <div className="bg-primary/5 p-3 rounded-md border border-primary/20 mt-2">
                <p className="text-sm font-medium text-primary flex items-center gap-2">
                  <span>{isRTL ? 'الحد الأدنى للسحب:' : 'Minimum Withdrawal:'}</span>
                  <strong>{selectedMethodConfig.minAmount} EGP</strong>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isRTL ? 'الحد الأقصى:' : 'Max:'} {selectedMethodConfig.maxAmount} EGP • 
                  {isRTL ? ' وقت المعالجة:' : ' Processing:'} {selectedMethodConfig.processingTime}
                </p>
              </div>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label>{isRTL ? 'المبلغ (جنيه)' : 'Amount (EGP)'}</Label>
            <Input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder={isRTL ? 'أدخل المبلغ' : 'Enter amount'}
              disabled={!selectedMethod}
              className={selectedMethodConfig && amount && parseFloat(amount) < selectedMethodConfig.minAmount ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {selectedMethodConfig && amount && parseFloat(amount) < selectedMethodConfig.minAmount && (
              <p className="text-xs text-red-500 mt-1">
                {isRTL ? `يجب أن يكون المبلغ ${selectedMethodConfig.minAmount} جنيه على الأقل` : `Amount must be at least ${selectedMethodConfig.minAmount} EGP`}
              </p>
            )}
          </div>

          {/* Dynamic Account Details Fields */}
          {selectedMethodConfig && selectedMethodConfig.fields.map(field => (
            <div key={field.name} className="space-y-2">
              <Label>
                {isRTL ? field.labelAr : field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Input
                type={field.type}
                value={accountDetails[field.name] || ''}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                placeholder={field.placeholder || ''}
                required={field.required}
              />
            </div>
          ))}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !selectedMethod}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isRTL ? 'جاري الإرسال...' : 'Submitting...'}
              </>
            ) : (
              <>
                <ArrowUpRight className="w-4 h-4 mr-2" />
                {isRTL ? 'تأكيد السحب' : 'Confirm Withdrawal'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
