"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { jwtDecode } from "jwt-decode";

interface AuthContextType {
  token: string | null;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAuthToken = useCallback(async () => {
    if (!refreshToken) {
      return;
    }
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.access_token);
        setRefreshToken(data.refresh_token);
        localStorage.setItem("authToken", data.access_token);
        localStorage.setItem("refreshToken", data.refresh_token);
      } else {
        // If refresh fails, log out the user
        logout();
      }
    } catch (error) {
      console.error("Token refresh failed", error);
      logout();
    }
  }, [refreshToken]);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("authToken");
      const storedRefreshToken = localStorage.getItem("refreshToken");
      if (storedToken && storedRefreshToken) {
        setToken(storedToken);
        setRefreshToken(storedRefreshToken);
      }
    } catch (e) {
      console.error("Failed to read auth token from local storage", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }

    const interval = setInterval(() => {
      const decodedToken: { exp: number } = jwtDecode(token);
      const buffer = 5 * 60; // 5 minutes buffer
      const isTokenExpiring =
        decodedToken.exp * 1000 < Date.now() + buffer * 1000;

      if (isTokenExpiring) {
        refreshAuthToken();
      }
    }, 60 * 5000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [token, refreshAuthToken]);

  const login = (newAccessToken: string, newRefreshToken: string) => {
    setToken(newAccessToken);
    setRefreshToken(newRefreshToken);
    localStorage.setItem("authToken", newAccessToken);
    localStorage.setItem("refreshToken", newRefreshToken);
  };

  const logout = () => {
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
