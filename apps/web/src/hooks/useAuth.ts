"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserRole, getUsername, isTokenExpired } from "@/lib/auth";

export function useAuth() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (!stored || isTokenExpired()) {
      localStorage.removeItem("token");
      router.push("/login");
      return;
    }
    setToken(stored);
    setRole(getUserRole());
    setUsername(getUsername());
    setIsLoading(false);
  }, [router]);

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return { token, role, username, logout, isAuthenticated: !!token, isLoading };
}
