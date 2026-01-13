import { useEffect, useCallback } from 'react';

/**
 * Custom hook to warn users when navigating away during an active task
 * @param isActive - Whether the warning should be active
 * @param message - Custom warning message (optional)
 */
export function useNavigationWarning(isActive: boolean, message?: string) {
  const warningMessage = message || 'You have unsaved progress. Are you sure you want to leave?';

  // Handle browser back/forward/refresh
  useEffect(() => {
    if (!isActive) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = warningMessage;
      return warningMessage;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isActive, warningMessage]);

  // Function to confirm navigation programmatically
  const confirmNavigation = useCallback((callback: () => void) => {
    if (!isActive) {
      callback();
      return;
    }

    const confirmed = window.confirm(warningMessage);
    if (confirmed) {
      callback();
    }
  }, [isActive, warningMessage]);

  return { confirmNavigation };
}

export default useNavigationWarning;
