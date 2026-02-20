const resolveApiBase = (): string => {
  const raw = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_BASE ?? "http://localhost:3000/api/v1";

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw.replace(/\/$/, "");
  }

  if (raw.startsWith("/")) {
    return `http://localhost:3000${raw}`.replace(/\/$/, "");
  }

  return `http://${raw}`.replace(/\/$/, "");
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
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("accessToken");
};

const readRefreshToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("refreshToken");
};

const saveTokens = (tokens: RefreshResponse): void => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem("accessToken", tokens.accessToken);
  localStorage.setItem("refreshToken", tokens.refreshToken);
};

const clearTokens = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userRole");
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
