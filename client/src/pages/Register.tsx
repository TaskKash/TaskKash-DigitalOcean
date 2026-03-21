import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useLocation } from 'wouter';
import { useApp } from '@/contexts/AppContext';
import { User, Mail, Lock, Phone, Eye, EyeOff, Loader2, Globe } from 'lucide-react';
import { APP_LOGO, APP_TITLE } from '@/const';
import { toast } from 'sonner';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

export default function Register() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { refreshUser } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countries, setCountries] = useState<any[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/countries')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.countries) {
          setCountries(data.countries);
          // Default to Egypt
          const egypt = data.countries.find((c: any) => c.code === 'EG');
          if (egypt) setSelectedCountryId(egypt.id);
          else if (data.countries.length > 0) setSelectedCountryId(data.countries[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const handleCountryChange = (countryCode: string | undefined) => {
    if (countryCode && countries.length > 0) {
      const country = countries.find(c => c.code === countryCode);
      if (country) {
        setSelectedCountryId(country.id);
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      toast.error(t('register.errors.fillAll'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error(t('register.errors.passwordMismatch'));
      return;
    }

    if (!agreedToTerms) {
      toast.error(t('register.errors.agreeTerms'));
      return;
    }

    const registerTimeout = setTimeout(() => {
      if (isLoading) {
        toast.info('جاري معالجة طلبك، يرجى الانتظار...');
      }
    }, 8000);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          countryId: selectedCountryId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(t('register.success'));
        // Auto-login successful, refresh user and redirect to home
        await refreshUser();
        setTimeout(() => {
          setLocation('/home');
        }, 1000);
      } else {
        toast.error(data.error || t('register.errors.failed'));
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(t('register.errors.failed'));
      setIsLoading(false);
    } finally {
      clearTimeout(registerTimeout);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex flex-col max-w-md mx-auto p-6">
      <div className="flex-1 flex flex-col justify-center py-8">
        {/* Logo */}
        <div className="text-center mb-6">
          <img 
            src={APP_LOGO} 
            alt={APP_TITLE} 
            className="w-20 h-20 mx-auto mb-4 drop-shadow-lg"
          />
          <h1 className="text-2xl font-bold text-white mb-1">{t('register.title')}</h1>
          <p className="text-white/80 text-sm">{t('register.subtitle')}</p>
        </div>

        {/* Register Form */}
        <Card className="p-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label htmlFor="name">{t('register.fullName')}</Label>
              <div className="relative">
                <User className="absolute right-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder={t('register.namePlaceholder')}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pr-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">{t('login.email')}</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pr-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">{t('register.phone')}</Label>
              <div className="mt-2" dir="ltr">
                <PhoneInput
                  international
                  defaultCountry="EG"
                  value={formData.phone}
                  onChange={(value) => setFormData({ ...formData, phone: value || '' })}
                  onCountryChange={handleCountryChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isLoading}
                  style={{ direction: 'ltr' }}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="country">{t('register.country') || 'Country'}</Label>
              <div className="relative">
                <Globe className="absolute right-3 top-3 w-5 h-5 text-muted-foreground" />
                <select
                  id="country"
                  title="Country"
                  value={selectedCountryId || ''}
                  onChange={(e) => setSelectedCountryId(Number(e.target.value))}
                  className="w-full h-10 px-3 pr-10 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary"
                  disabled={isLoading}
                >
                  {countries.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {t('language') === 'ar' ? c.nameAr : c.nameEn} ({c.currency})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="password">{t('login.password')}</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pr-10 pl-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3 text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">{t('register.confirmPassword')}</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="pr-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Checkbox 
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                disabled={isLoading}
              />
              <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                {t('register.agreeToTerms')}{' '}
                <Button variant="link" className="p-0 h-auto text-sm">
                  {t('register.termsLink')}
                </Button>
                {' '}{t('register.and')}{' '}
                <Button variant="link" className="p-0 h-auto text-sm">
                  {t('register.privacyLink')}
                </Button>
              </Label>
            </div>

            <Button 
              type="submit"
              className="w-full h-12"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('register.creating') || 'جاري إنشاء الحساب...'}
                </>
              ) : (
                t('register.createAccount')
              )}
            </Button>
          </form>

          {/* Social Logins */}
          <div className="mt-6 flex flex-col gap-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  {t('login.continueWith') || 'Or continue with'}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" type="button" className="w-full bg-white hover:bg-gray-100 border-gray-200 shadow-sm transition-colors group">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#1877F2]">
                  <path d="M24 12.073C24 5.405 18.627 0 12 0C5.373 0 0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24V15.562H7.078V12.073H10.125V9.413C10.125 6.405 11.916 4.75 14.657 4.75C15.97 4.75 17.344 4.984 17.344 4.984V7.939H15.83C14.34 7.939 13.875 8.864 13.875 9.815V12.073H17.202L16.669 15.562H13.875V24C19.612 23.094 24 18.1 24 12.073Z" fill="currentColor"/>
                </svg>
              </Button>
              <Button variant="outline" type="button" className="w-full bg-white hover:bg-gray-100 border-gray-200 shadow-sm transition-colors group">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </Button>
              <Button variant="outline" type="button" className="w-full bg-white hover:bg-gray-100 border-gray-200 shadow-sm transition-colors group">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#0A66C2]">
                  <path d="M20.447 20.452H16.89V14.881C16.89 13.553 16.864 11.841 15.042 11.841C13.193 11.841 12.909 13.283 12.909 14.787V20.452H9.351V9H12.766V10.563H12.815C13.29 9.664 14.451 8.716 16.182 8.716C19.782 8.716 20.447 11.085 20.447 14.167V20.452ZM5.337 7.433C4.195 7.433 3.274 6.51 3.274 5.371C3.274 4.232 4.195 3.309 5.337 3.309C6.474 3.309 7.4 4.232 7.4 5.371C7.4 6.51 6.474 7.433 5.337 7.433ZM7.119 20.452H3.553V9H7.119V20.452ZM22.225 0H1.771C0.792 0 0 0.774 0 1.729V22.271C0 23.227 0.792 24 1.771 24H22.222C23.2 24 24 23.227 24 22.271V1.729C24 0.774 23.2 0 22.222 0H22.225Z" fill="currentColor"/>
                </svg>
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {t('register.haveAccount')}{' '}
              <Button
                variant="link"
                className="p-0 h-auto text-primary"
                onClick={() => setLocation('/login')}
                disabled={isLoading}
              >
                {t('register.loginLink')}
              </Button>
            </p>
          </div>


        </Card>
      </div>
    </div>
  );
}
