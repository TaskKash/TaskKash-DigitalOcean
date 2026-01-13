import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Phone, ArrowRight, Shield, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';

export default function PhoneLogin() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [mockCode, setMockCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendOTPMutation = trpc.auth.sendOTP.useMutation();
  const verifyOTPMutation = trpc.auth.verifyOTP.useMutation();

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      setError(t('phoneLogin.invalidPhone'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await sendOTPMutation.mutateAsync({ phone });
      if (result.success) {
        setMockCode(result.mockCode || '');
        setStep('otp');
      }
    } catch (err: any) {
      setError(err.message || t('phoneLogin.sendError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError(t('phoneLogin.invalidOTP'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await verifyOTPMutation.mutateAsync({
        phone,
        code: otp,
        deviceInfo: {
          deviceBrand: navigator.userAgent.includes('iPhone') ? 'Apple' : 'Android',
          osName: navigator.userAgent.includes('iPhone') ? 'iOS' : 'Android',
        },
      });

      if (result.success) {
        if (result.isNewUser) {
          // New user - go to profile completion
          setLocation('/profile/complete');
        } else {
          // Existing user - go to home
          setLocation('/home');
        }
      }
    } catch (err: any) {
      setError(err.message || t('phoneLogin.verifyError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-6 pt-12">
        <div className="flex justify-center mb-8">
          <img src="/logo.png" alt="TASKKASH" className="h-16 w-auto" />
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          {step === 'phone' ? t('phoneLogin.title') : t('phoneLogin.verifyTitle')}
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
          {step === 'phone' ? t('phoneLogin.subtitle') : t('phoneLogin.verifySubtitle')}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 px-6">
        {step === 'phone' ? (
          <div className="space-y-6">
            {/* Phone Input */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{t('phoneLogin.phoneNumber')}</h3>
                  <p className="text-sm text-gray-500">{t('phoneLogin.phoneHint')}</p>
                </div>
              </div>
              <Input
                type="tel"
                placeholder="+20 1XX XXX XXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="text-lg h-14 text-center"
                dir="ltr"
              />
            </div>

            {/* Security Note */}
            <div className="flex items-start gap-3 px-2">
              <Shield className="w-5 h-5 text-green-600 mt-0.5" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('phoneLogin.securityNote')}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-center">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              onClick={handleSendOTP}
              disabled={isLoading || !phone}
              className="w-full h-14 text-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              {isLoading ? t('common.loading') : t('phoneLogin.sendOTP')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* OTP Input */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{t('phoneLogin.enterOTP')}</h3>
                  <p className="text-sm text-gray-500">{t('phoneLogin.otpSentTo')} {phone}</p>
                </div>
              </div>
              <Input
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-2xl h-16 text-center tracking-[0.5em] font-mono"
                dir="ltr"
                maxLength={6}
              />
              
              {/* Mock Code Display (for testing) */}
              {mockCode && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 text-center">
                    <strong>{t('phoneLogin.testCode')}:</strong> {mockCode}
                  </p>
                </div>
              )}
            </div>

            {/* Resend OTP */}
            <button
              onClick={handleSendOTP}
              disabled={isLoading}
              className="w-full text-center text-green-600 hover:text-green-700 font-medium"
            >
              {t('phoneLogin.resendOTP')}
            </button>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-center">
                {error}
              </div>
            )}

            {/* Verify Button */}
            <Button
              onClick={handleVerifyOTP}
              disabled={isLoading || otp.length !== 6}
              className="w-full h-14 text-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              {isLoading ? t('common.loading') : t('phoneLogin.verify')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            {/* Back Button */}
            <button
              onClick={() => setStep('phone')}
              className="w-full text-center text-gray-500 hover:text-gray-700"
            >
              {t('common.back')}
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 text-center">
        <p className="text-sm text-gray-500">
          {t('phoneLogin.termsText')}{' '}
          <a href="/terms" className="text-green-600 hover:underline">{t('phoneLogin.terms')}</a>
          {' '}{t('phoneLogin.and')}{' '}
          <a href="/privacy" className="text-green-600 hover:underline">{t('phoneLogin.privacy')}</a>
        </p>
      </div>
    </div>
  );
}
