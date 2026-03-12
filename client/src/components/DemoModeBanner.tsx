import { useState } from 'react';
import { useLocation } from 'wouter';
import { FlaskConical, X } from 'lucide-react';

/**
 * DemoModeBanner — shown at top of every screen when demo mode is active.
 * Provides a visual indicator that the user is in a test session,
 * plus a button to exit demo mode.
 * Remove this component (and its usage in App.tsx) once a hosted DB is live.
 */
export default function DemoModeBanner() {
  const isDemo = localStorage.getItem('demo-mode') === 'true';
  const [dismissed, setDismissed] = useState(false);
  const [, setLocation] = useLocation();

  if (!isDemo || dismissed) return null;

  const exitDemo = () => {
    localStorage.removeItem('demo-mode');
    localStorage.removeItem('tk_user_info');
    localStorage.removeItem('isLoggedIn');
    setLocation('/login');
    window.location.reload();
  };

  return (
    <div
      role="status"
      aria-label="Demo mode active"
      className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-between gap-2 px-4 pb-2 pt-[calc(env(safe-area-inset-top,0px)+0.5rem)] bg-amber-500 text-white text-sm font-medium shadow-lg"
    >
      <div className="flex items-center gap-2">
        <FlaskConical className="w-4 h-4 flex-shrink-0" />
        <span>🚧 Demo Mode — No real data. Not connected to a database.</span>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <button
          onClick={exitDemo}
          className="underline text-white/90 hover:text-white text-xs"
        >
          Exit Demo
        </button>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss demo banner"
          className="text-white/80 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
