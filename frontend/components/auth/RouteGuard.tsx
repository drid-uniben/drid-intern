"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { UserRole } from "@/types/domain";
import { useAppStore } from "@/lib/store";

interface RouteGuardProps {
  allowedRoles?: UserRole[];
  children: React.ReactNode;
}

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
  const authInitialized = useAppStore((state) => state.authInitialized);
  const accessToken = useAppStore((state) => state.accessToken);
  const userRole = useAppStore((state) => state.userRole);
  const clearSession = useAppStore((state) => state.clearSession);
  const hasValidSession = !!accessToken && isTokenValid(accessToken);
  const hasAllowedRole = !allowedRoles || (!!userRole && allowedRoles.includes(userRole));

  useEffect(() => {
    if (!authInitialized) {
      return;
    }

    if (!hasValidSession) {
      clearSession();
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!hasAllowedRole) {
      router.replace("/403");
      return;
    }
  }, [authInitialized, clearSession, hasAllowedRole, hasValidSession, pathname, router]);

  if (!authInitialized || !hasValidSession || !hasAllowedRole) {
    return null;
  }

  return <>{children}</>;
}
