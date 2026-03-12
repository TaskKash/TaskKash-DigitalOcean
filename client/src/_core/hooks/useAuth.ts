import { useCallback, useEffect, useState } from "react";
import { authApi } from "@/lib/authApi";

export const TK_USER_KEY = "tk_user_info";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath } = options ?? {};
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        
        // If demo mode is active, hydrate from local storage instead of backend validation
        if (localStorage.getItem('demo-mode') === 'true') {
          const demoUser = localStorage.getItem(TK_USER_KEY);
          if (demoUser) {
            setUser(JSON.parse(demoUser));
            setLoading(false);
            return;
          }
        }
        
        const result = await authApi.me();
        
        if (result.success && result.user) {
          setUser(result.user);
          localStorage.setItem(TK_USER_KEY, JSON.stringify(result.user));
        } else {
          setUser(null);
          localStorage.removeItem(TK_USER_KEY);
        }
      } catch (err) {
        console.error("[useAuth] Error fetching user:", err);
        setError(err as Error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("[useAuth] Logout error:", error);
    } finally {
      setUser(null);
      localStorage.removeItem(TK_USER_KEY);
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('demo-mode');
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      
      // If demo mode is active, hydrate from local storage instead of backend validation
      if (localStorage.getItem('demo-mode') === 'true') {
        const demoUser = localStorage.getItem(TK_USER_KEY);
        if (demoUser) {
          setUser(JSON.parse(demoUser));
          setLoading(false);
          return;
        }
      }
      
      const result = await authApi.me();
      
      if (result.success && result.user) {
        setUser(result.user);
        localStorage.setItem(TK_USER_KEY, JSON.stringify(result.user));
      } else {
        setUser(null);
        localStorage.removeItem(TK_USER_KEY);
      }
    } catch (err) {
      console.error("[useAuth] Error refreshing user:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (loading) return;
    if (user) return;
    if (typeof window === "undefined") return;
    
    const finalRedirectPath = redirectPath || "/login";
    if (window.location.pathname === finalRedirectPath) return;

    window.location.href = finalRedirectPath;
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    loading,
    user,
  ]);

  return {
    user,
    loading,
    error,
    isAuthenticated: Boolean(user),
    refresh,
    logout,
  };
}

