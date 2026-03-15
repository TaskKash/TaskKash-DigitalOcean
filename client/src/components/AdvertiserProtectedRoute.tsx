import { useEffect, useState } from "react";
import { Redirect } from "wouter";

interface AdvertiserProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * AdvertiserProtectedRoute
 * Wraps advertiser pages to verify the session cookie contains a valid advertiser identity.
 * Redirects unauthenticated visitors to /advertiser/login.
 */
export function AdvertiserProtectedRoute({ children }: AdvertiserProtectedRouteProps) {
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    fetch("/api/auth/advertiser/me", { credentials: "include" })
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Redirect to="/advertiser/login" />;
  }

  return <>{children}</>;
}
