import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
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
      // In a real app, this would send a reset email
      // For demo purposes, we'll just move to the reset step
      const response = await fetch('/api/auth/forgot-password', {
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
      // For demo, just proceed to reset step
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
      const response = await fetch('/api/auth/reset-password', {
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation('/login')}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
          <p className="text-gray-600 mt-2">
            {step === 'email' && 'Enter your email to reset your password'}
            {step === 'reset' && 'Enter your new password'}
            {step === 'success' && 'Password reset successful!'}
          </p>
        </div>

        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              <Mail className="w-4 h-4 mr-2" />
              {loading ? 'Sending...' : 'Continue'}
            </Button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="bg-blue-50 text-blue-700 p-3 rounded-md text-sm mb-4">
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

            <Button type="submit" className="w-full" disabled={loading}>
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
            <Button onClick={() => setLocation('/login')} className="w-full">
              Go to Login
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
