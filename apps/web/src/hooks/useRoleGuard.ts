"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserRole, isTokenExpired } from "@/lib/auth";

/**
 * Hook that checks if the current user has the required role.
 * Decodes role directly from JWT — no API call needed.
 * Redirects to "/" if not authorized.
 */
export function useRoleGuard(allowedRoles: string[]) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || isTokenExpired()) {
      router.push("/login");
      return;
    }

    const role = getUserRole();
    setUserRole(role);

    if (!role || !allowedRoles.includes(role)) {
      router.push("/");
      return;
    }

    setIsAuthorized(true);
    setIsLoading(false);
  }, [allowedRoles, router]);

  return { isAuthorized, isLoading, userRole };
}
