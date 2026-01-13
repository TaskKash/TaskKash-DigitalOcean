import { useCallback, useEffect, useState } from "react";
import { authApi } from "@/lib/authApi";

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
        const result = await authApi.me();
        
        if (result.success && result.user) {
          setUser(result.user);
          // Cache user data
          localStorage.setItem("manus-runtime-user-info", JSON.stringify(result.user));
        } else {
          setUser(null);
          localStorage.removeItem("manus-runtime-user-info");
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
      localStorage.removeItem('manus-runtime-user-info');
      localStorage.removeItem('isLoggedIn');
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const result = await authApi.me();
      
      if (result.success && result.user) {
        setUser(result.user);
        localStorage.setItem("manus-runtime-user-info", JSON.stringify(result.user));
      } else {
        setUser(null);
        localStorage.removeItem("manus-runtime-user-info");
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
    
    // Use provided redirectPath or default to /login
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
