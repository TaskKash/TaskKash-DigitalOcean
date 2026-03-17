import React, { useState } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Gift, Copy, Share2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCurrency } from "@/contexts/CurrencyContext";

const referralData = {
  code: 'AHMED2024',
  totalReferrals: 12,
  activeReferrals: 8,
  totalEarnings: 360,
  pendingEarnings: 90,
  referralBonus: 30
};

const referralHistory = [
  { name: 'محمد أحمد', date: '2025-10-20', status: 'active', earned: 30 },
  { name: 'فاطمة علي', date: '2025-10-18', status: 'active', earned: 30 },
  { name: 'خالد سعيد', date: '2025-10-15', status: 'pending', earned: 0 },
  { name: 'نورة محمد', date: '2025-10-12', status: 'active', earned: 30 },
  { name: 'عبدالله يوسف', date: '2025-10-10', status: 'active', earned: 30 }
];

export default function Referral() {
  const { currency, symbol, formatAmount } = useCurrency();
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralData.code);
    setCopied(true);
    toast.success('تم نسخ الكود!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const text = `انضم إلى TASKKASH واربح المال من هاتفك! استخدم كود الإحالة: ${referralData.code}`;
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('تم نسخ رابط الدعوة!');
    }
  };

  return (
    <MobileLayout title="دعوة الأصدقاء" showBack>
      <div className="p-4 space-y-6">
        {/* Hero Card */}
        <Card className="bg-gradient-to-br from-primary to-secondary p-6 text-white">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold mb-2">اربح 30 {symbol}</h2>
            <p className="opacity-90">عن كل صديق تدعوه</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
            <p className="text-sm opacity-90 mb-2">كود الإحالة الخاص بك:</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white/20 rounded-lg px-4 py-3 font-mono text-xl font-bold">
                {referralData.code}
              </div>
              <Button
                onClick={handleCopyCode}
                className="bg-white text-primary hover:bg-gray-100"
              >
                {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          <Button
            onClick={handleShare}
            className="w-full bg-white text-primary hover:bg-gray-100"
          >
            <Share2 className="w-5 h-5 ml-2" />
            مشاركة الدعوة
          </Button>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 text-center">
            <Users className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{referralData.totalReferrals}</p>
            <p className="text-sm text-muted-foreground">إجمالي الدعوات</p>
          </Card>
          <Card className="p-4 text-center">
            <Gift className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-primary">{referralData.totalEarnings}</p>
            <p className="text-sm text-muted-foreground">إجمالي الأرباح</p>
          </Card>
        </div>

        {/* How it Works */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">كيف يعمل البرنامج؟</h3>
          <div className="space-y-4">
            {[
              { step: '1', title: 'شارك كود الإحالة', desc: 'أرسل كودك لأصدقائك' },
              { step: '2', title: 'صديقك يسجل', desc: 'يستخدم الكود عند التسجيل' },
              { step: '3', title: 'صديقك يكمل مهمة', desc: 'يكمل أول مهمة بنجاح' },
              { step: '4', title: 'تحصل على 30 {symbol}', desc: 'تضاف فوراً لمحفظتك' }
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 font-bold">
                  {item.step}
                </div>
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Referral History */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">الأصدقاء المدعوون</h3>
            <Badge variant="secondary">{referralData.activeReferrals} نشط</Badge>
          </div>
          
          <Card className="divide-y">
            {referralHistory.map((referral, index) => (
              <div key={index} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{referral.name}</p>
                    <p className="text-sm text-muted-foreground">{referral.date}</p>
                  </div>
                </div>
                <div className="text-left">
                  {referral.status === 'active' ? (
                    <>
                      <p className="font-bold text-primary">+{referral.earned} {symbol}</p>
                      <Badge className="bg-green-100 text-green-800 border-0 text-xs">
                        نشط
                      </Badge>
                    </>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      قيد الانتظار
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* Terms */}
        <Card className="p-4 bg-muted">
          <p className="text-sm text-muted-foreground">
            <strong>ملاحظة:</strong> يجب على الصديق المدعو إكمال أول مهمة بنجاح للحصول على المكافأة. 
            الحد الأقصى للإحالات: 100 صديق شهرياً.
          </p>
        </Card>
      </div>
    </MobileLayout>
  );
}

