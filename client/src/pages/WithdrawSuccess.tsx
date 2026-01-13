import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Download, Share2 } from 'lucide-react';

export default function WithdrawSuccess() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Confetti animation or celebration effect could go here
  }, []);

  const withdrawalDetails = {
    amount: 250,
    method: 'STC Pay',
    date: new Date().toLocaleDateString('ar-SA'),
    time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    reference: 'WD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    estimatedArrival: '1-2 ساعة'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 animate-fade-in">
        {/* Success Icon */}
        <div className="text-center">
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle2 className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-green-800 mb-2">
            تم السحب بنجاح!
          </h1>
          <p className="text-muted-foreground">
            سيصل المبلغ إلى حسابك قريباً
          </p>
        </div>

        {/* Amount Card */}
        <Card className="bg-gradient-to-br from-green-500 to-green-600 p-8 text-white text-center">
          <p className="opacity-90 mb-2">المبلغ المسحوب</p>
          <h2 className="text-5xl font-bold mb-1">{withdrawalDetails.amount}</h2>
          <p className="text-2xl">ريال سعودي</p>
        </Card>

        {/* Details Card */}
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-lg mb-4">تفاصيل العملية</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">طريقة السحب</span>
              <span className="font-semibold">{withdrawalDetails.method}</span>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">التاريخ</span>
              <span className="font-semibold">{withdrawalDetails.date}</span>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">الوقت</span>
              <span className="font-semibold">{withdrawalDetails.time}</span>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">رقم المرجع</span>
              <span className="font-mono font-semibold text-sm">{withdrawalDetails.reference}</span>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">الوصول المتوقع</span>
              <span className="font-semibold text-primary">{withdrawalDetails.estimatedArrival}</span>
            </div>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-800">
            💡 <strong>ملاحظة:</strong> سيتم إرسال إشعار لك فور وصول المبلغ إلى حسابك. 
            يمكنك متابعة حالة السحب من صفحة المحفظة.
          </p>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="w-full">
              <Download className="w-5 h-5 ml-2" />
              تحميل الإيصال
            </Button>
            <Button variant="outline" className="w-full">
              <Share2 className="w-5 h-5 ml-2" />
              مشاركة
            </Button>
          </div>
          
          <Button 
            onClick={() => setLocation('/wallet')}
            className="w-full h-12"
          >
            العودة إلى المحفظة
          </Button>
          
          <Button 
            onClick={() => setLocation('/')}
            variant="ghost"
            className="w-full"
          >
            الذهاب إلى الصفحة الرئيسية
          </Button>
        </div>
      </div>
    </div>
  );
}

