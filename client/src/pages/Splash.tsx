import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { BrandName } from '@/components/BrandName';

export default function Splash() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      // Check if user has a valid session cookie
      const cookies = document.cookie.split(';');
      const hasSessionCookie = cookies.some(cookie => 
        cookie.trim().startsWith('manus_session=')
      );
      
      if (hasSessionCookie) {
        // If has valid session, go to home
        setLocation('/home');
      } else {
        // No valid session, clear any stale localStorage and go to welcome
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('tk_user_info');
        setLocation('/welcome');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
      <div className="text-center animate-fade-in">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto mb-6 animate-bounce cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setLocation('/welcome')}>
            <img src="/logo.png" alt="TASKKASH" className="w-full h-full object-contain drop-shadow-2xl" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-2">
            <BrandName size="3xl" />
          </h1>
          <p className="text-white/90 text-lg">Earn Money from Your Phone</p>
        </div>

        {/* Loading Animation */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>

        {/* Version */}
        <p className="text-white/60 text-sm mt-8">Version 1.0.0</p>
      </div>
    </div>
  );
}

