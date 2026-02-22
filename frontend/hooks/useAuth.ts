"use client";

import { useAppStore } from "@/lib/store";

export function useAuthToken() {
  return useAppStore((state) => state.accessToken ?? undefined);
}
