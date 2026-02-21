"use client";

import { FormEvent, useReducer } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { apiPost } from "@/lib/api";

interface State {
  fullName: string;
  email: string;
  password: string;
  error: string | null;
  loading: boolean;
}

type Action =
  | { type: "SET_FIELD"; field: "fullName" | "email" | "password"; value: string }
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

export function SignupForm() {
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, {
    fullName: "",
    email: "",
    password: "",
    error: null,
    loading: false,
  });

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch({ type: "SUBMIT" });

    const result = await apiPost("/auth/signup", {
      fullName: state.fullName,
      email: state.email,
      password: state.password,
    });

    if (!result.success) {
      dispatch({ type: "ERROR", error: result.error ?? "Signup failed" });
      return;
    }

    dispatch({ type: "RESET_LOADING" });
    router.push("/signup/pending");
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <label htmlFor="signup-name" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
          Full name
        </label>
        <input
          id="signup-name"
          className="input-glass"
          placeholder="John Doe"
          value={state.fullName}
          onChange={(e) => dispatch({ type: "SET_FIELD", field: "fullName", value: e.target.value })}
          required
        />
      </div>
      <div>
        <label htmlFor="signup-email" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
          Email
        </label>
        <input
          id="signup-email"
          className="input-glass"
          placeholder="you@example.com"
          type="email"
          value={state.email}
          onChange={(e) => dispatch({ type: "SET_FIELD", field: "email", value: e.target.value })}
          required
        />
      </div>
      <div>
        <label htmlFor="signup-password" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
          Password
        </label>
        <input
          id="signup-password"
          className="input-glass"
          placeholder="••••••••"
          type="password"
          value={state.password}
          onChange={(e) => dispatch({ type: "SET_FIELD", field: "password", value: e.target.value })}
          required
        />
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
            Creating account...
          </span>
        ) : (
          "Create account"
        )}
      </button>
    </form>
  );
}
