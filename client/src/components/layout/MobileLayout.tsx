import React, { ReactNode } from 'react';
import BottomNav from './BottomNav';
import Header from './Header';
import { Link } from 'wouter';

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

      {/* Privacy compliance footer — visible on every page */}
      <footer className={`text-center py-2 ${showBottomNav ? 'mb-16' : ''}`}>
        <Link href="/privacy">
          <a className="text-[10px] text-muted-foreground underline-offset-2 hover:underline">
            Privacy & Data Rights
          </a>
        </Link>
        <span className="text-[10px] text-muted-foreground mx-1">·</span>
        <span className="text-[10px] text-muted-foreground">GDPR · CCPA · Egypt Law 2023/82</span>
      </footer>

      {showBottomNav && <BottomNav />}
    </div>
  );
}
