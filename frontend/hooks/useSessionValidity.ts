"use client";

import { useEffect, useMemo, useState } from "react";
import { getAccessTokenExpiryMs, isAccessTokenValid } from "@/lib/authSession";
import { useAppStore } from "@/lib/store";

export function useSessionValidity() {
  const authInitialized = useAppStore((state) => state.authInitialized);
  const accessToken = useAppStore((state) => state.accessToken);
  const [checkpoint, setCheckpoint] = useState(() => Date.now());

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const expiry = getAccessTokenExpiryMs(accessToken);
    if (!expiry) {
      return;
    }

    const delayMs = expiry - Date.now();
    if (delayMs <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setCheckpoint(Date.now());
    }, delayMs + 50);

    return () => {
      window.clearTimeout(timer);
    };
  }, [accessToken]);

  const hasValidSession = useMemo(() => {
    if (!authInitialized || !accessToken) {
      return false;
    }

    return isAccessTokenValid(accessToken, checkpoint);
  }, [accessToken, authInitialized, checkpoint]);

  return { authInitialized, accessToken, hasValidSession };
}
