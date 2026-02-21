import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin Dashboard — DRID Internship",
  description: "Overview of application administration and management.",
};

export default function AdminDashboardPage() {
  const cards = [
    { href: "/admin/users", label: "Users", description: "Manage user accounts & approvals", icon: "👥" },
    { href: "/admin/cohorts", label: "Cohorts", description: "Create and manage cohorts", icon: "📋" },
    { href: "/admin/challenges/categories", label: "Categories", description: "Manage challenge categories", icon: "🏷️" },
    { href: "/admin/submissions", label: "Submissions", description: "Review challenge submissions", icon: "📄" },
  ];

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold" style={{ animation: "fadeIn 0.5s ease-out" }}>
        Admin <span className="gradient-text">Dashboard</span>
      </h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, i) => (
          <Link
            key={card.href}
            href={card.href}
            className="glass rounded-2xl p-6 transition-all duration-300 hover:scale-[1.03] group"
            style={{ animation: `slideUp 0.5s ease-out ${0.1 + i * 0.1}s both` }}
          >
            <p className="text-3xl">{card.icon}</p>
            <h2 className="mt-3 text-lg font-semibold group-hover:text-[var(--accent-start)] transition-colors">
              {card.label}
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              {card.description}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
