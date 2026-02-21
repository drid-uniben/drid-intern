import Link from "next/link";
import { apiGet } from "@/lib/api";
import { Cohort } from "@/types/domain";

export default async function CurrentCohortPage() {
  const result = await apiGet<Cohort>("/public/cohort");

  if (!result.success || !result.data) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12" style={{ animation: "slideUp 0.5s ease-out" }}>
        <div className="glass rounded-2xl p-8 text-center">
          <h1 className="text-3xl font-bold gradient-text">No active cohort</h1>
          <p className="mt-3" style={{ color: "var(--text-secondary)" }}>
            Applications are currently closed. Stay tuned for the next cohort.
          </p>
        </div>
      </main>
    );
  }

  const cohort = result.data;
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-12">
      <div className="glass rounded-3xl p-8" style={{ animation: "slideUp 0.5s ease-out" }}>
        <p className="badge badge-accent text-xs">ACTIVE COHORT</p>
        <h1 className="mt-3 text-3xl font-bold">
          DRID Internship {cohort.year} Cohort {cohort.cohortNumber}
        </h1>
        <div className="mt-4 space-y-2" style={{ color: "var(--text-secondary)" }}>
          <p>Status: <span className="badge badge-success ml-1">{cohort.status}</span></p>
          <p>Submission deadline: {new Date(cohort.deadlineAt).toLocaleString()}</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="btn-glass" href="/cohort/current/countdown">View countdown</Link>
          <Link className="btn-gradient" href="/cohort/current/challenges">View challenges</Link>
        </div>
      </div>
    </main>
  );
}
