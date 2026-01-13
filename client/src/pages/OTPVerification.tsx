import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function OTPVerification() {
  const [, setLocation] = useLocation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('');
    setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')]);
    inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      toast.error('الرجاء إدخال الرمز كاملاً');
      return;
    }

    // Simulate verification
    toast.success('تم التحقق بنجاح!');
    
    // Request permissions
    try {
      // Request location permission
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          () => toast.success('تم السماح بالوصول للموقع'),
          () => toast.info('يمكنك تفعيل الموقع لاحقاً')
        );
      }
      
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    } catch (error) {
      console.log('Permission request failed:', error);
    }
    
    // Mark as logged in with Profile Strength 30%
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('profileStrength', '30');
    
    setTimeout(() => {
      setLocation('/home');
    }, 1500);
  };

  const handleResend = () => {
    if (!canResend) return;
    setTimer(60);
    setCanResend(false);
    toast.success('تم إرسال رمز جديد');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center text-white">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">التحقق من الهاتف</h1>
          <p className="opacity-90">
            أدخل الرمز المرسل إلى<br />
            <span className="font-semibold">+966 50 123 4567</span>
          </p>
        </div>

        {/* OTP Input */}
        <Card className="p-8">
          <div className="flex justify-center gap-3 mb-6" dir="ltr">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-14 text-center text-2xl font-bold"
              />
            ))}
          </div>

          <Button
            onClick={handleVerify}
            disabled={otp.join('').length !== 6}
            className="w-full h-12 mb-4"
          >
            تحقق
            <ArrowRight className="w-5 h-5 mr-2" />
          </Button>

          {/* Resend */}
          <div className="text-center">
            {canResend ? (
              <button
                onClick={handleResend}
                className="text-primary font-semibold hover:underline"
              >
                إعادة إرسال الرمز
              </button>
            ) : (
              <p className="text-sm text-muted-foreground">
                يمكنك إعادة الإرسال بعد{' '}
                <span className="font-semibold text-primary">{timer}</span> ثانية
              </p>
            )}
          </div>
        </Card>

        {/* Help */}
        <Card className="p-4 bg-white/95">
          <p className="text-sm text-center text-muted-foreground">
            لم يصلك الرمز؟{' '}
            <button className="text-primary font-semibold hover:underline">
              تواصل مع الدعم
            </button>
          </p>
        </Card>
      </div>
    </div>
  );
}

