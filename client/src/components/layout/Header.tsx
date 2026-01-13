import React from 'react';
import { ArrowLeft, Bell } from 'lucide-react';
import { useLocation } from 'wouter';
import { useApp } from '@/contexts/AppContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export default function Header({ title, showBack = false, onBack }: HeaderProps) {
  const [, setLocation] = useLocation();
  const { notifications } = useApp();
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-background border-b border-border z-50 max-w-md mx-auto shadow-sm">
      <div className="flex items-center justify-between px-4 h-16">
        <div className="flex items-center gap-3">
          {showBack && (
            <button onClick={handleBack} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          {!showBack && (
            <button 
              onClick={() => setLocation('/home')} 
              className="hover:opacity-80 transition-opacity cursor-pointer"
              aria-label="Go to homepage"
            >
              <img src="/logo.png" alt="TASKKASH" className="h-10 w-auto object-contain" />
            </button>
          )}
          {title && <h1 className="text-lg font-semibold">{title}</h1>}
        </div>
        
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <button 
            onClick={() => setLocation('/notifications')}
            className="relative p-2 hover:bg-muted rounded-lg"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
