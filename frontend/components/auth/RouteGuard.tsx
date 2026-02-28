"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { UserRole } from "@/types/domain";
import { useAppStore } from "@/lib/store";
import { useSessionValidity } from "@/hooks/useSessionValidity";

interface RouteGuardProps {
  allowedRoles?: UserRole[];
  children: React.ReactNode;
}

export function RouteGuard({ allowedRoles, children }: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { authInitialized, hasValidSession } = useSessionValidity();
  const userRole = useAppStore((state) => state.userRole);
  const clearSession = useAppStore((state) => state.clearSession);
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
