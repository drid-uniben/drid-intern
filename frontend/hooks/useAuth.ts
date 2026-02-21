"use client";

export function useAuthToken() {
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem("accessToken") ?? undefined;
}
