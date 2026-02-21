"use client";

import { RoleRedirect } from "@/components/dashboard/RoleRedirect";

export default function DashboardPage() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="glass rounded-3xl p-10 text-center" style={{ animation: "slideUp 0.5s ease-out" }}>
        <div
          className="inline-block"
          style={{ width: 32, height: 32, border: "3px solid var(--glass-border)", borderTopColor: "var(--accent-start)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}
        />
        <h1 className="mt-4 text-2xl font-bold gradient-text">Redirecting...</h1>
        <p className="mt-2" style={{ color: "var(--text-secondary)" }}>Taking you to your dashboard</p>
        <RoleRedirect />
      </div>
    </main>
  );
}
