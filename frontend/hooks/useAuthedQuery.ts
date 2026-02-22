"use client";

import { QueryKey, UseQueryOptions, UseQueryResult, useQuery } from "@tanstack/react-query";
import { useAuthToken } from "@/hooks/useAuth";
import { useAppStore } from "@/lib/store";

interface UseAuthedQueryOptions<TData, TError = Error> {
  queryKey: QueryKey;
  queryFn: (token: string) => Promise<TData>;
  enabled?: boolean;
  staleTime?: UseQueryOptions<TData, TError>["staleTime"];
  gcTime?: UseQueryOptions<TData, TError>["gcTime"];
}

export function useAuthedQuery<TData, TError = Error>(
  options: UseAuthedQueryOptions<TData, TError>,
): UseQueryResult<TData, TError> {
  const token = useAuthToken();
  const authInitialized = useAppStore((state) => state.authInitialized);

  return useQuery<TData, TError>({
    queryKey: options.queryKey,
    queryFn: () => options.queryFn(token as string),
    enabled: authInitialized && !!token && (options.enabled ?? true),
    staleTime: options.staleTime,
    gcTime: options.gcTime,
  });
}
