import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';

export default function AdvertiserForgotPassword() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'email' | 'reset' | 'success'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/advertiser/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (data.success) {
        setStep('reset');
      } else {
        setError(data.error || 'Email not found');
      }
    } catch (err) {
      setStep('reset');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/advertiser/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await response.json();
      
      if (data.success) {
        setStep('success');
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation('/advertiser/login')}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
          <p className="text-gray-600 mt-2">
            {step === 'email' && 'Enter your advertiser email to reset password'}
            {step === 'reset' && 'Enter your new password'}
            {step === 'success' && 'Password reset successful!'}
          </p>
        </div>

        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Advertiser Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="advertiser@company.com"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={loading}>
              <Mail className="w-4 h-4 mr-2" />
              {loading ? 'Sending...' : 'Continue'}
            </Button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="bg-purple-50 text-purple-700 p-3 rounded-md text-sm mb-4">
              Resetting password for: <strong>{email}</strong>
            </div>

            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                required
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        )}

        {step === 'success' && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <p className="text-gray-600">
              Your password has been reset successfully!
            </p>
            <Button onClick={() => setLocation('/advertiser/login')} className="w-full bg-purple-600 hover:bg-purple-700">
              Go to Login
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
