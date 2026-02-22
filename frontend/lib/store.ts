import { create } from "zustand";
import { UserRole } from "@/types/domain";
import { clearSessionCookies, readSessionCookies, saveSessionCookies, saveTokenCookies } from "@/lib/authCookies";

type Theme = "light" | "dark";

interface AppState {
  accessToken: string | null;
  refreshToken: string | null;
  userRole: UserRole | null;
  authInitialized: boolean;
  theme: Theme;
  setSession: (session: { accessToken: string; refreshToken: string; userRole: UserRole }) => void;
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
  clearSession: () => void;
  initializeAuth: () => void;
  toggleTheme: () => void;
}

const resolveInitialTheme = (): Theme => {
  return "light";
};

const resolveSystemTheme = (): Theme => {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const applyTheme = (theme: Theme): void => {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.setAttribute("data-theme", theme);
};

export const useAppStore = create<AppState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  userRole: null,
  authInitialized: false,
  theme: resolveInitialTheme(),
  setSession: ({ accessToken, refreshToken, userRole }) => {
    saveSessionCookies({ accessToken, refreshToken, userRole });
    set({ accessToken, refreshToken, userRole });
  },
  setTokens: ({ accessToken, refreshToken }) => {
    saveTokenCookies({ accessToken, refreshToken });
    set({ accessToken, refreshToken });
  },
  clearSession: () => {
    clearSessionCookies();
    set({ accessToken: null, refreshToken: null, userRole: null });
  },
  initializeAuth: () => {
    const session = readSessionCookies();
    set({
      accessToken: session?.accessToken ?? null,
      refreshToken: session?.refreshToken ?? null,
      userRole: session?.userRole ?? null,
      authInitialized: true,
    });
  },
  toggleTheme: () => {
    const nextTheme = get().theme === "light" ? "dark" : "light";
    set({ theme: nextTheme });
    applyTheme(nextTheme);
  },
}));

export const initializeTheme = (): void => {
  const systemTheme = resolveSystemTheme();
  useAppStore.setState((state) => (state.theme === systemTheme ? state : { ...state, theme: systemTheme }));
  applyTheme(systemTheme);
};

export const initializeAuth = (): void => {
  useAppStore.getState().initializeAuth();
};