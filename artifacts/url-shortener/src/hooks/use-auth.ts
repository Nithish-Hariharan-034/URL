import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";

export function useAuth() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("snip_token"));
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("snip_token"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = useCallback((newToken: string) => {
    localStorage.setItem("snip_token", newToken);
    setToken(newToken);
    setLocation("/dashboard");
  }, [setLocation]);

  const logout = useCallback(() => {
    localStorage.removeItem("snip_token");
    setToken(null);
    setLocation("/login");
  }, [setLocation]);

  return { token, isAuthenticated: !!token, login, logout };
}
