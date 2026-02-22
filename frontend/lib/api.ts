import { useAppStore } from "@/lib/store";

const resolveApiBase = (): string => {
  const raw = process.env.NEXT_PUBLIC_API_URL;

  if (!raw || raw.trim().length === 0) {
    throw new Error("Missing required env: NEXT_PUBLIC_API_URL");
  }

  const normalized = raw.trim();

  if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
    throw new Error("Invalid NEXT_PUBLIC_API_URL: must start with http:// or https://");
  }

  return normalized.replace(/\/$/, "");
};

const API_BASE = resolveApiBase();

interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const parseJson = async <T>(response: Response): Promise<ApiResult<T>> => {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const text = await response.text();
    return {
      success: false,
      error: response.ok ? "Unexpected non-JSON response" : `Request failed (${response.status}): ${text.slice(0, 120)}`,
    };
  }

  const body = (await response.json()) as ApiResult<T>;
  if (!response.ok || !body.success) {
    return { success: false, error: body.error ?? "Request failed" };
  }

  return body;
};

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

const readAccessToken = (): string | null => {
  return useAppStore.getState().accessToken;
};

const readRefreshToken = (): string | null => {
  return useAppStore.getState().refreshToken;
};

const saveTokens = (tokens: RefreshResponse): void => {
  useAppStore.getState().setTokens(tokens);
};

const clearTokens = (): void => {
  useAppStore.getState().clearSession();
};

const refreshSession = async (): Promise<boolean> => {
  const refreshToken = readRefreshToken();
  if (!refreshToken) {
    return false;
  }

  const response = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  const result = await parseJson<RefreshResponse>(response);
  if (!result.success || !result.data) {
    clearTokens();
    if (typeof window !== "undefined") {
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
    }
    return false;
  }

  saveTokens(result.data);
  return true;
};

const request = async <T>(
  path: string,
  options: RequestInit,
  retryOnUnauthorized: boolean,
): Promise<ApiResult<T>> => {
  const token = readAccessToken();
  const headers = {
    ...(options.headers ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (response.status === 401 && retryOnUnauthorized) {
    const refreshed = await refreshSession();
    if (refreshed) {
      return request<T>(path, options, false);
    }
  }

  return parseJson<T>(response);
};

export const apiGet = async <T>(path: string, token?: string): Promise<ApiResult<T>> => {
  if (token) {
    const response = await fetch(`${API_BASE}${path}`, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
    });
    return parseJson<T>(response);
  }

  return request<T>(path, { method: "GET" }, true);
};

export const apiPost = async <T>(path: string, payload: unknown, token?: string): Promise<ApiResult<T>> => {
  if (token) {
    const response = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 401 && typeof window !== "undefined") {
      clearTokens();
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
    }

    return parseJson<T>(response);
  }

  return request<T>(
    path,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    true,
  );
};

export const apiPatch = async <T>(path: string, payload: unknown, token?: string): Promise<ApiResult<T>> => {
  if (token) {
    const response = await fetch(`${API_BASE}${path}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 401 && typeof window !== "undefined") {
      clearTokens();
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
    }

    return parseJson<T>(response);
  }

  return request<T>(
    path,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    true,
  );
};
