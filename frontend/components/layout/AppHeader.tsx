"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";

const navClass = (active: boolean): string =>
  `rounded px-3 py-2 text-sm font-medium ${active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-200"}`;

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const role = typeof window !== "undefined" ? localStorage.getItem("userRole") : null;
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const logout = async () => {
    if (token) {
      await apiPost("/auth/logout", {}, token);
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-slate-900">DRID Internship</Link>
        <nav className="flex flex-wrap items-center gap-2">
          <Link href="/cohort/current" className={navClass(pathname.startsWith("/cohort/current"))}>Cohort</Link>
          <Link href="/cohort/current/challenges" className={navClass(pathname.startsWith("/cohort/current/challenges"))}>Challenges</Link>
          {token ? <Link href="/dashboard" className={navClass(pathname.startsWith("/dashboard"))}>Dashboard</Link> : null}
          {role === "ADMIN" ? <Link href="/admin" className={navClass(pathname.startsWith("/admin"))}>Admin</Link> : null}
          {role === "REVIEWER" ? <Link href="/reviewer" className={navClass(pathname.startsWith("/reviewer"))}>Reviewer</Link> : null}
          {role === "INTERN" ? <Link href="/intern" className={navClass(pathname.startsWith("/intern"))}>Intern</Link> : null}
          {token ? (
            <button className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white" onClick={logout} type="button">Logout</button>
          ) : (
            <Link href="/login" className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white">Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
