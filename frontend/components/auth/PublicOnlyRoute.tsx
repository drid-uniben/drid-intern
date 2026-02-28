"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionValidity } from "@/hooks/useSessionValidity";

export function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { authInitialized, hasValidSession } = useSessionValidity();

  useEffect(() => {
    if (!authInitialized) {
      return;
    }

    if (hasValidSession) {
      router.replace("/dashboard");
    }
  }, [authInitialized, hasValidSession, router]);

  if (!authInitialized || hasValidSession) {
    return null;
  }

  return <>{children}</>;
}
