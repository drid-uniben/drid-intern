"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { UserRole } from "@/types/domain";

interface RouteGuardProps {
  allowedRoles?: UserRole[];
  children: React.ReactNode;
}

export function RouteGuard({ allowedRoles, children }: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const userRole = localStorage.getItem("userRole") as UserRole | null;

    if (!accessToken) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (allowedRoles && (!userRole || !allowedRoles.includes(userRole))) {
      router.replace("/403");
      return;
    }

    setIsAuthorized(true);
  }, [allowedRoles, pathname, router]);

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
