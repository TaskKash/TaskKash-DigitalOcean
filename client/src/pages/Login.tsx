import { useState } from 'react';
import { useLocation } from 'wouter';
import { BrandName } from '@/components/BrandName';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { APP_LOGO, APP_TITLE } from '@/const';

export default function Login() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success && data.user) {
        // Store user info
        localStorage.setItem('manus-runtime-user-info', JSON.stringify(data.user));
        localStorage.setItem('isLoggedIn', 'true');
        
        // Redirect to home
        setTimeout(() => {
          window.location.href = '/home';
        }, 500);
      } else {
        setError(data.error || t('login.invalidCredentials') || 'Invalid email or password');
      }
    } catch (err) {
      setError(t('login.error') || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
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
            className="w-20 h-20 mx-auto mb-4 drop-shadow-lg cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setLocation('/welcome')}
          />
          <h1 className="text-2xl font-bold text-white mb-1">
            {t('login.title') || 'User Login'}
          </h1>
          <p className="text-white/80 text-sm">
            {t('login.subtitle') || 'Access your account'}
          </p>
        </div>

        {/* Login Form */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <Label htmlFor="email">{t('login.email') || 'Email Address'}</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="pr-10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">{t('login.password') || 'Password'}</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pr-10"
                  required
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm cursor-pointer">
                  {t('login.rememberMe') || 'Remember me'}
                </Label>
              </div>
              <button
                type="button"
                onClick={() => setLocation('/forgot-password')}
                className="text-sm text-primary hover:underline"
              >
                {t('login.forgotPassword') || 'Forgot Password?'}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t('login.loggingIn') || 'Logging in...'}</span>
                </div>
              ) : (
                t('login.submit') || 'Login'
              )}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-4 text-center text-sm">
            {t('login.noAccount') || "Don't have an account?"}{' '}
            <button
              onClick={() => setLocation('/register')}
              className="text-primary hover:underline font-medium"
            >
              {t('login.registerNow') || 'Register Now'}
            </button>
          </div>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-4">
          <button
            onClick={() => setLocation('/welcome')}
            className="text-sm text-white/80 hover:text-white"
          >
            ← {t('login.backToHome') || 'Back to Home'}
          </button>
        </div>
      </div>
    </div>
  );
}
