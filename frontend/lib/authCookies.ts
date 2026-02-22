import { UserRole } from "@/types/domain";

interface SessionCookies {
  accessToken: string;
  refreshToken: string;
  userRole: UserRole;
}

const ACCESS_TOKEN_COOKIE = "drid_access_token";
const REFRESH_TOKEN_COOKIE = "drid_refresh_token";
const USER_ROLE_COOKIE = "drid_user_role";

const getCookieValue = (name: string): string | null => {
  if (typeof document === "undefined") {
    return null;
  }

  const encodedName = `${encodeURIComponent(name)}=`;
  const parts = document.cookie.split(";");

  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.startsWith(encodedName)) {
      return decodeURIComponent(trimmed.slice(encodedName.length));
    }
  }

  return null;
};

const cookieAttributes = (): string => {
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  return `; Path=/; SameSite=Lax${secure}`;
};

const setCookie = (name: string, value: string, maxAgeSeconds: number): void => {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Max-Age=${maxAgeSeconds}${cookieAttributes()}`;
};

const removeCookie = (name: string): void => {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${encodeURIComponent(name)}=; Max-Age=0${cookieAttributes()}`;
};

export const saveSessionCookies = (session: SessionCookies): void => {
  setCookie(ACCESS_TOKEN_COOKIE, session.accessToken, 60 * 60 * 24 * 7);
  setCookie(REFRESH_TOKEN_COOKIE, session.refreshToken, 60 * 60 * 24 * 30);
  setCookie(USER_ROLE_COOKIE, session.userRole, 60 * 60 * 24 * 30);
};

export const saveTokenCookies = (tokens: { accessToken: string; refreshToken: string }): void => {
  setCookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, 60 * 60 * 24 * 7);
  setCookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, 60 * 60 * 24 * 30);
};

export const readSessionCookies = (): SessionCookies | null => {
  const accessToken = getCookieValue(ACCESS_TOKEN_COOKIE);
  const refreshToken = getCookieValue(REFRESH_TOKEN_COOKIE);
  const userRole = getCookieValue(USER_ROLE_COOKIE) as UserRole | null;

  if (!accessToken || !refreshToken || !userRole) {
    return null;
  }

  return { accessToken, refreshToken, userRole };
};

export const clearSessionCookies = (): void => {
  removeCookie(ACCESS_TOKEN_COOKIE);
  removeCookie(REFRESH_TOKEN_COOKIE);
  removeCookie(USER_ROLE_COOKIE);
};