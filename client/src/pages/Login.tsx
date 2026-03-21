import { useState } from 'react';
import { useLocation } from 'wouter';
import { BrandName } from '@/components/BrandName';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Lock, FlaskConical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { APP_LOGO, APP_TITLE } from '@/const';
import { TK_USER_KEY } from '@/_core/hooks/useAuth';

// ─── Demo Mode ──────────────────────────────────────────────────────────────
// This creates a full mock user session stored entirely in localStorage.
// No database or backend needed. Remove this section once a hosted DB is live.
const DEMO_USER = {
  id: 9999,
  name: 'Demo User',
  email: 'demo@taskkash.com',
  phone: '+201000000000',
  tier: 1,
  balance: 150.00,
  totalEarnings: 340.50,
  profileStrength: 45,
  profilePicture: null,
  isVerified: false,
  referralCode: 'DEMO2026',
  joinDate: new Date().toISOString(),
  isDemo: true, // flag to identify demo sessions
};

function activateDemoMode(setLocation: (path: string) => void) {
  localStorage.setItem(TK_USER_KEY, JSON.stringify(DEMO_USER));
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('demo-mode', 'true');
  window.location.href = '/home';
}
// ────────────────────────────────────────────────────────────────────────────

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
        localStorage.setItem(TK_USER_KEY, JSON.stringify(data.user));
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
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email or Phone Number"
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

        {/* ── Demo Mode Banner ─────────────────────────────────────────────── */}
        {/* Remove this entire section once a hosted database is available */}
        <div className="mt-4 rounded-2xl border-2 border-dashed border-white/40 bg-white/10 p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <FlaskConical className="w-4 h-4 text-yellow-300" />
            <span className="text-xs font-semibold text-yellow-300 uppercase tracking-wider">
              Testing Mode
            </span>
          </div>
          <p className="text-white/80 text-xs mb-3">
            No database yet? Explore all features with a pre-loaded demo account.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => activateDemoMode(setLocation)}
            className="w-full border-white/60 text-white hover:bg-white/20 hover:text-white bg-white/10 font-semibold"
          >
            🚀 Enter Demo Mode — Explore App
          </Button>
        </div>
        {/* ──────────────────────────────────────────────────────────────────── */}

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
