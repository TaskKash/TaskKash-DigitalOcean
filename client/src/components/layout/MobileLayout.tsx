import React, { ReactNode } from 'react';
import BottomNav from './BottomNav';
import Header from './Header';

interface MobileLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
  showHeader?: boolean;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export default function MobileLayout({
  children,
  showBottomNav = true,
  showHeader = true,
  title,
  showBack = false,
  onBack
}: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">
      {showHeader && <Header title={title} showBack={showBack} onBack={onBack} />}
      
      <main className={`flex-1 overflow-y-auto ${showBottomNav ? 'pb-20' : ''} ${showHeader ? 'pt-16' : ''}`}>
        {children}
      </main>
      
      {showBottomNav && <BottomNav />}
    </div>
  );
}

