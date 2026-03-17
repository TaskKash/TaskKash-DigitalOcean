import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCurrency } from "@/contexts/CurrencyContext";

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  processingTime: string;
  fee: number;
  isInstant: boolean;
  description: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "vodafone-cash",
    name: "Vodafone Cash",
    icon: "📱",
    processingTime: "فوري",
    fee: 0,
    isInstant: true,
    description: "سحب فوري بدون رسوم",
  },
  {
    id: "fawry",
    name: "Fawry",
    icon: "🏪",
    processingTime: "فوري",
    fee: 2,
    isInstant: true,
    description: "رسوم 2 {symbol}",
  },
  {
    id: "instapay",
    name: "InstaPay",
    icon: "⚡",
    processingTime: "فوري",
    fee: 0,
    isInstant: true,
    description: "سحب فوري بدون رسوم",
  },
  {
    id: "bank-transfer",
    name: "تحويل بنكي",
    icon: "🏦",
    processingTime: "1-3 أيام",
    fee: 0,
    isInstant: false,
    description: "بدون رسوم",
  },
];

interface PaymentMethodsProps {
  balance: number;
  isVerified: boolean;
  tier: string;
  onClose: () => void;
  onWithdrawSuccess?: (amount: number) => void;
}

export default function PaymentMethods({
  balance,
  isVerified,
  tier,
  onClose,
  onWithdrawSuccess,
}: PaymentMethodsProps) {
  const { currency, symbol, formatAmount } = useCurrency();
  const [selectedMethod, setSelectedMethod] = useState<string>("vodafone-cash");
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");

  const currentMethod = paymentMethods.find((m) => m.id === selectedMethod);
  const withdrawAmount = parseFloat(amount) || 0;
  const fee = currentMethod?.fee || 0;
  const netAmount = withdrawAmount - fee;

  // Allow all users to use all payment methods
  const canUseInstant = true;

  const handleWithdraw = () => {
    if (!accountNumber) {
      toast.error("يرجى إدخال رقم الحساب");
      return;
    }

    if (withdrawAmount < 50) {
      toast.error("الحد الأدنى للسحب هو 50 {symbol}");
      return;
    }

    if (withdrawAmount > balance) {
      toast.error("الرصيد غير كافٍ");
      return;
    }

    // Call the callback to update balance
    if (onWithdrawSuccess) {
      onWithdrawSuccess(withdrawAmount);
    }
    
    toast.success(`تم طلب السحب بنجاح! ستستلم ${netAmount} {symbol}`);
    onClose();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold mb-2">اختر طريقة الدفع</h3>
        {canUseInstant && (
          <Badge className="bg-green-600 text-white mb-4">
            <Zap className="w-3 h-3 ml-1" />
            سحب فوري متاح
          </Badge>
        )}
      </div>

      <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
        <div className="space-y-3">
          {paymentMethods.map((method) => {
            const isDisabled = method.isInstant && !canUseInstant;
            
            return (
              <Card
                key={method.id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedMethod === method.id
                    ? "border-primary border-2"
                    : "hover:border-primary/50"
                } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => !isDisabled && setSelectedMethod(method.id)}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem
                    value={method.id}
                    id={method.id}
                    disabled={isDisabled}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{method.icon}</span>
                      <Label
                        htmlFor={method.id}
                        className="font-semibold cursor-pointer"
                      >
                        {method.name}
                      </Label>
                      {method.isInstant && (
                        <Badge variant="secondary" className="text-xs">
                          <Zap className="w-3 h-3 ml-1" />
                          فوري
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {method.processingTime}
                      </span>
                      <span>{method.description}</span>
                    </div>
                    {isDisabled && (
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                        ⚠️ السحب الفوري متاح للمستخدمين الموثوقين فقط
                      </p>
                    )}
                  </div>
                  {selectedMethod === method.id && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </RadioGroup>

      <div className="space-y-4">
        <div>
          <Label htmlFor="account">
            {selectedMethod === "bank-transfer"
              ? "رقم الحساب البنكي (IBAN)"
              : "رقم الحساب"}
          </Label>
          <Input
            id="account"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder={
              selectedMethod === "vodafone-cash"
                ? "01xxxxxxxxx"
                : selectedMethod === "bank-transfer"
                ? "EG38XXXXXXXXXXXXXXXXXXXX"
                : "رقم الحساب"
            }
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="amount">المبلغ (ج.م)</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="50"
            min="50"
            max={balance}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            الحد الأدنى: 50 {symbol} | الرصيد المتاح: {balance} {symbol}
          </p>
        </div>

        {withdrawAmount > 0 && (
          <Card className="p-4 bg-accent">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>المبلغ:</span>
                <span className="font-semibold">{withdrawAmount} {symbol}</span>
              </div>
              {fee > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>الرسوم:</span>
                  <span>-{fee} {symbol}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>المبلغ الصافي:</span>
                <span className="text-primary">{netAmount} {symbol}</span>
              </div>
            </div>
          </Card>
        )}
      </div>

      <div className="flex gap-2">
        <Button onClick={handleWithdraw} className="flex-1">
          تأكيد السحب
        </Button>
        <Button variant="outline" onClick={onClose}>
          إلغاء
        </Button>
      </div>
    </div>
  );
}
