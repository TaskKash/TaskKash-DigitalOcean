import React from 'react';
import { Home, ListTodo, Wallet, User } from 'lucide-react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';



export default function BottomNav() {
  const [location, setLocation] = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { icon: Home, label: t('home'), path: '/home' },
    { icon: ListTodo, label: t('tasks'), path: '/tasks' },
    { icon: Wallet, label: t('wallet'), path: '/wallet' },
    { icon: User, label: t('profile'), path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 max-w-md mx-auto pb-[env(safe-area-inset-bottom,0px)]">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location === path;
          return (
            <button
              key={path}
              onClick={() => setLocation(path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'fill-primary' : ''}`} />
              <span className="text-xs mt-1">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

