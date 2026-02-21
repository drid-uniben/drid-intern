import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Reviewer Dashboard — DRID Internship",
  description: "Review and rate intern submissions.",
};

export default function ReviewerDashboardPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="glass rounded-3xl p-8" style={{ animation: "slideUp 0.5s ease-out" }}>
        <h1 className="text-3xl font-bold gradient-text">Reviewer Dashboard</h1>
        <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
          Review and rate intern submissions assigned to you.
        </p>
        <Link className="btn-gradient mt-6 inline-flex" href="/reviewer/submissions">
          Open review queue →
        </Link>
      </div>
    </main>
  );
}
