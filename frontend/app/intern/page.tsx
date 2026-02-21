import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Intern Dashboard — DRID Internship",
  description: "Your cohort workspace and assigned updates.",
};

export default function InternDashboardPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="glass rounded-3xl p-8" style={{ animation: "slideUp 0.5s ease-out" }}>
        <h1 className="text-3xl font-bold gradient-text">Intern Dashboard</h1>
        <p className="mt-3" style={{ color: "var(--text-secondary)" }}>
          Welcome to your cohort workspace. Notifications and assigned updates appear here.
        </p>
      </div>
    </main>
  );
}
