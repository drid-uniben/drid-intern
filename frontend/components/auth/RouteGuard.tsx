"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
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
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const userRole = localStorage.getItem("userRole") as UserRole | null;

    if (!accessToken || !isTokenValid(accessToken)) {
      clearAuthStorage();
      setIsAuthorized(false);
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (allowedRoles && (!userRole || !allowedRoles.includes(userRole))) {
      setIsAuthorized(false);
      router.replace("/403");
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAuthorized(true);
  }, [allowedRoles, pathname, router]);

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
