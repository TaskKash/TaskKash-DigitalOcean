// Simple REST API client for authentication
// Replaces tRPC for auth endpoints

const API_BASE = "/api/auth";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: any;
  error?: string;
}

export interface LogoutResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface MeResponse {
  success: boolean;
  user?: any;
  error?: string;
}

export const authApi = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include", // Important: send cookies
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("[Auth API] Login error:", error);
      return {
        success: false,
        error: "Network error",
      };
    }
  },

  async logout(): Promise<LogoutResponse> {
    try {
      const response = await fetch(`${API_BASE}/logout`, {
        method: "POST",
        credentials: "include",
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("[Auth API] Logout error:", error);
      return {
        success: false,
        error: "Network error",
      };
    }
  },

  async me(): Promise<MeResponse> {
    try {
      const response = await fetch(`${API_BASE}/me`, {
        method: "GET",
        credentials: "include",
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("[Auth API] Me error:", error);
      return {
        success: false,
        error: "Network error",
      };
    }
  },
};
