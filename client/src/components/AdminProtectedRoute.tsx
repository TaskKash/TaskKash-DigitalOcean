import { useEffect, useState } from "react";
import { Redirect } from "wouter";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * AdminProtectedRoute
 * Wraps admin pages to verify the session cookie contains a valid admin identity.
 * Redirects unauthenticated visitors to /admin/login.
 */
export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    fetch("/api/auth/admin/me", { credentials: "include" })
      .then(res => {
        if (res.ok) {
          setStatus("authenticated");
        } else {
          setStatus("unauthenticated");
        }
      })
      .catch(() => setStatus("unauthenticated"));
  }, []);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Redirect to="/admin/login" />;
  }

  return <>{children}</>;
}
