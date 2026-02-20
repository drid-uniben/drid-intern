import Link from "next/link";
import { apiGet } from "@/lib/api";
import { Cohort } from "@/types/domain";

export default async function CurrentCohortPage() {
  const result = await apiGet<Cohort>("/public/cohort");

  if (!result.success || !result.data) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold">No active cohort</h1>
        <p className="mt-2 text-slate-600">Applications are currently closed. Stay tuned for the next cohort.</p>
      </main>
    );
  }

  const cohort = result.data;
  return (
    <main className="mx-auto max-w-3xl space-y-4 px-6 py-12">
      <h1 className="text-3xl font-bold">DRID Internship {cohort.year} Cohort {cohort.cohortNumber}</h1>
      <p>Status: {cohort.status}</p>
      <p>Submission deadline: {new Date(cohort.deadlineAt).toLocaleString()}</p>
      <div className="flex gap-3">
        <Link className="rounded border border-slate-300 px-3 py-2" href="/cohort/current/countdown">View countdown</Link>
        <Link className="rounded bg-slate-900 px-3 py-2 text-white" href="/cohort/current/challenges">View challenges</Link>
      </div>
    </main>
  );
}
