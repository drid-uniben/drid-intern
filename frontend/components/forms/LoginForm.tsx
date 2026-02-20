"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
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
    <form className="space-y-3" onSubmit={onSubmit}>
      <input className="w-full rounded border border-slate-300 p-2" placeholder="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      <input className="w-full rounded border border-slate-300 p-2" placeholder="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button className="rounded bg-slate-900 px-4 py-2 text-white" disabled={loading} type="submit">{loading ? "Signing in..." : "Sign in"}</button>
    </form>
  );
}
