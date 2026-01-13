import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useLocation } from 'wouter';
import { useApp } from '@/contexts/AppContext';
import { User, Mail, Lock, Phone, Eye, EyeOff } from 'lucide-react';
import { APP_LOGO, APP_TITLE } from '@/const';
import { toast } from 'sonner';

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

    setIsLoading(true);
    
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
              <div className="relative">
                <Phone className="absolute right-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+20 1234567890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="pr-10"
                  disabled={isLoading}
                />
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
              {isLoading ? t('register.creating') : t('register.createAccount')}
            </Button>
          </form>

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
