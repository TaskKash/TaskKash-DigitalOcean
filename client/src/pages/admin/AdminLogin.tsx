import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Lock, Shield } from 'lucide-react';
import { APP_LOGO, APP_TITLE } from '@/const';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Manual validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success && data.admin) {
        // Store admin info
        localStorage.setItem('admin-info', JSON.stringify(data.admin));
        localStorage.setItem('isAdminLoggedIn', 'true');
        
        // Redirect to admin dashboard
        setTimeout(() => {
          window.location.href = '/admin/dashboard';
        }, 500);
      } else {
        setError(data.error || 'Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex flex-col max-w-md mx-auto p-6">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>     <div className="flex-1 flex flex-col justify-center py-8">
        {/* Logo */}
        <div className="text-center mb-6">
          <img 
            src={APP_LOGO} 
            alt={APP_TITLE} 
            className="w-20 h-20 mx-auto mb-4 drop-shadow-lg cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setLocation('/welcome')}
          />
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-6 h-6 text-yellow-400" />
            <h1 className="text-2xl font-bold text-white">Admin Login</h1>
          </div>
          <p className="text-white/80 text-sm">Access the admin control panel</p>
        </div>

        {/* Login Form */}
        <Card className="p-6 bg-white/95 backdrop-blur">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email */}
            <div>
              <Label htmlFor="email">Admin Email</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@taskkash.com"
                  className="pr-10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">Password</Label>
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

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm cursor-pointer">
                  Remember me
                </Label>
              </div>
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
              className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Logging in...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Admin Login</span>
                </div>
              )}
            </Button>
          </form>

          {/* Security Notice */}
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800 text-center">
              🔒 This is a secure admin area. All actions are logged.
            </p>
          </div>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-4">
          <button
            onClick={() => setLocation('/welcome')}
            className="text-sm text-white/80 hover:text-white"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
