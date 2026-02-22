"use client";

import { FormEvent, useReducer, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { apiPost } from "@/lib/api";
import { useAppStore } from "@/lib/store";

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    role: "ADMIN" | "REVIEWER" | "INTERN";
  };
}

interface State {
  email: string;
  password: string;
  error: string | null;
  loading: boolean;
}

type Action =
  | { type: "SET_FIELD"; field: "email" | "password"; value: string }
  | { type: "SUBMIT" }
  | { type: "ERROR"; error: string }
  | { type: "RESET_LOADING" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SUBMIT":
      return { ...state, loading: true, error: null };
    case "ERROR":
      return { ...state, loading: false, error: action.error };
    case "RESET_LOADING":
      return { ...state, loading: false };
    default:
      return state;
  }
}

export function LoginForm() {
  const router = useRouter();
  const setSession = useAppStore((state) => state.setSession);
  const [showPassword, setShowPassword] = useState(false);
  const [state, dispatch] = useReducer(reducer, {
    email: "",
    password: "",
    error: null,
    loading: false,
  });

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch({ type: "SUBMIT" });

    const result = await apiPost<LoginResponse>("/auth/login", {
      email: state.email,
      password: state.password,
    });

    if (!result.success || !result.data) {
      dispatch({ type: "ERROR", error: result.error ?? "Login failed" });
      return;
    }

    dispatch({ type: "RESET_LOADING" });
    setSession({
      accessToken: result.data.accessToken,
      refreshToken: result.data.refreshToken,
      userRole: result.data.user.role,
    });
    router.push("/dashboard");
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <label htmlFor="login-email" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
          Email
        </label>
        <input
          id="login-email"
          className="input-glass"
          placeholder="you@example.com"
          type="email"
          value={state.email}
          onChange={(e) => dispatch({ type: "SET_FIELD", field: "email", value: e.target.value })}
          required
        />
      </div>
      <div>
        <label htmlFor="login-password" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
          Password
        </label>
        <div className="relative">
          <input
            id="login-password"
            className="input-glass pr-10"
            placeholder="••••••••"
            type={showPassword ? "text" : "password"}
            value={state.password}
            onChange={(e) => dispatch({ type: "SET_FIELD", field: "password", value: e.target.value })}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-secondary)" }}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {state.error && (
          <m.p
            className="text-sm rounded-lg p-3"
            style={{ background: "rgba(239,68,68,0.1)", color: "var(--error-color)" }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {state.error}
          </m.p>
        )}
      </AnimatePresence>

      <button className="btn-gradient w-full" disabled={state.loading} type="submit">
        {state.loading ? (
          <span className="flex items-center justify-center gap-2">
            <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.6s linear infinite" }} />
            Signing in...
          </span>
        ) : (
          "Sign in"
        )}
      </button>
    </form>
  );
}
