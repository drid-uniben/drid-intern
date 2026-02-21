"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { UserRole } from "@/types/domain";

interface RouteGuardProps {
  allowedRoles?: UserRole[];
  children: React.ReactNode;
}

const clearAuthStorage = (): void => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userRole");
};

const isTokenValid = (token: string): boolean => {
  const tokenParts = token.split(".");
  if (tokenParts.length !== 3) {
    return false;
  }

  try {
    const payloadSegment = tokenParts[1];
    const normalizedPayload = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, "=");
    const payload = JSON.parse(atob(paddedPayload)) as { exp?: number };

    if (typeof payload.exp !== "number") {
      return false;
    }

    const currentTimeSeconds = Math.floor(Date.now() / 1000);
    return payload.exp > currentTimeSeconds;
  } catch {
    return false;
  }
};

export function RouteGuard({ allowedRoles, children }: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const userRole = localStorage.getItem("userRole") as UserRole | null;
    const hasValidSession = !!accessToken && isTokenValid(accessToken);
    const hasAllowedRole = !allowedRoles || (!!userRole && allowedRoles.includes(userRole));

    if (!hasValidSession) {
      clearAuthStorage();
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      setIsAuthorized(false);
      setIsCheckingAuth(false);
      return;
    }

    if (!hasAllowedRole) {
      router.replace("/403");
      setIsAuthorized(false);
      setIsCheckingAuth(false);
      return;
    }

    setIsAuthorized(true);
    setIsCheckingAuth(false);
  }, [allowedRoles, pathname, router]);

  if (isCheckingAuth || !isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
