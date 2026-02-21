"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { apiPost } from "@/lib/api";

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    role: "ADMIN" | "REVIEWER" | "INTERN";
  };
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await apiPost<LoginResponse>("/auth/login", { email, password });
    setLoading(false);

    if (!result.success || !result.data) {
      setError(result.error ?? "Login failed");
      return;
    }

    localStorage.setItem("accessToken", result.data.accessToken);
    localStorage.setItem("refreshToken", result.data.refreshToken);
    localStorage.setItem("userRole", result.data.user.role);
    router.push("/dashboard");
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
          Email
        </label>
        <input
          className="input-glass"
          placeholder="you@example.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
          Password
        </label>
        <input
          className="input-glass"
          placeholder="••••••••"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            className="text-sm rounded-lg p-3"
            style={{ background: "rgba(239,68,68,0.1)", color: "var(--error-color)" }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <button className="btn-gradient w-full" disabled={loading} type="submit">
        {loading ? (
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
