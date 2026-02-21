"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { apiPost } from "@/lib/api";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const navItems = (role: string | null, token: string | null) => {
  const items: { href: string; label: string; match: string; exact?: boolean }[] = [
    { href: "/cohort/current", label: "Cohort", match: "/cohort/current", exact: true },
    { href: "/cohort/current/challenges", label: "Challenges", match: "/cohort/current/challenges" },
  ];

  if (token) {
    items.push({ href: "/dashboard", label: "Dashboard", match: "/dashboard" });
  }

  return items;
};

const isActivePath = (pathname: string, match: string, exact?: boolean): boolean => {
  if (exact) {
    return pathname === match;
  }

  return pathname === match || pathname.startsWith(`${match}/`);
};

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authState, setAuthState] = useState<{ role: string | null; token: string | null }>({ role: null, token: null });
  const role = authState.role;
  const token = authState.token;
  const items = navItems(role, token);

  useEffect(() => {
    setAuthState({
      role: localStorage.getItem("userRole"),
      token: localStorage.getItem("accessToken"),
    });
  }, []);

  const logout = async () => {
    if (token) {
      await apiPost("/auth/logout", {}, token);
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");
    setAuthState({ role: null, token: null });
    router.push("/login");
  };

  return (
    <header className="glass-strong sticky top-0 z-50" style={{ borderBottom: "1px solid var(--glass-border)" }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="gradient-text text-xl font-bold tracking-tight">
          DRID Internship
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {items.map((item) => {
            const isActive = isActivePath(pathname, item.match, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                style={{ color: isActive ? "var(--accent-start)" : "var(--text-secondary)" }}
              >
                {item.label}
                {isActive && (
                  <m.div
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ background: "linear-gradient(90deg, var(--accent-start), var(--accent-end))" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
          <div className="ml-2 flex items-center gap-2">
            <ThemeToggle />
            {token ? (
              <button
                className="btn-gradient !py-1.5 !px-3 !text-sm !rounded-lg"
                onClick={logout}
                type="button"
              >
                Logout
              </button>
            ) : (
              <Link href="/login" className="btn-gradient !py-1.5 !px-3 !text-sm !rounded-lg">
                Login
              </Link>
            )}
          </div>
        </nav>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            className="btn-glass !p-2 !rounded-lg"
            onClick={() => setMobileOpen((p) => !p)}
            type="button"
            aria-label="Toggle menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {mobileOpen ? (
                <>
                  <line x1="4" y1="4" x2="16" y2="16" />
                  <line x1="16" y1="4" x2="4" y2="16" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="17" y2="6" />
                  <line x1="3" y1="10" x2="17" y2="10" />
                  <line x1="3" y1="14" x2="17" y2="14" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Nav Panel */}
      <AnimatePresence>
        {mobileOpen && (
          <m.nav
            className="glass-strong md:hidden border-t"
            style={{ borderColor: "var(--glass-border)" }}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex flex-col gap-1 p-4">
              {items.map((item) => {
                const isActive = isActivePath(pathname, item.match, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                    style={{
                      color: isActive ? "var(--accent-start)" : "var(--text-secondary)",
                      background: isActive ? "var(--badge-bg)" : "transparent",
                    }}
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
              {token ? (
                <button
                  className="btn-gradient !text-sm mt-2"
                  onClick={() => {
                    setMobileOpen(false);
                    void logout();
                  }}
                  type="button"
                >
                  Logout
                </button>
              ) : (
                <Link
                  href="/login"
                  className="btn-gradient !text-sm mt-2 text-center"
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </m.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
