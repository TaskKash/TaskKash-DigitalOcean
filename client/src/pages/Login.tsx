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
