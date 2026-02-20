import Link from "next/link";
import { apiGet } from "@/lib/api";
import { Challenge, Cohort } from "@/types/domain";

export default async function Home() {
  const cohortResult = await apiGet<Cohort>("/public/cohort");
  const challengeResult = await apiGet<Challenge[]>("/public/challenges");
  const cohort = cohortResult.success ? cohortResult.data : undefined;
  const challenges = challengeResult.success && challengeResult.data ? challengeResult.data : [];

  return (
    <main className="mx-auto max-w-6xl space-y-10 px-6 py-10">
      <section className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white">
        <p className="text-sm uppercase tracking-wider text-slate-200">DRID Internship Applications</p>
        <h1 className="mt-2 text-4xl font-bold">Build, design, and ship with the DRID engineering team</h1>
        <p className="mt-3 max-w-3xl text-slate-200">
          This platform hosts cohort-based challenge submissions for frontend, backend, fullstack, and design internship applicants.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="rounded bg-white px-4 py-2 font-medium text-slate-900" href="/cohort/current">View active cohort</Link>
          <Link className="rounded border border-white/40 px-4 py-2 font-medium" href="/cohort/current/challenges">Browse challenges</Link>
          <Link className="rounded border border-white/40 px-4 py-2 font-medium" href="/login">Staff login</Link>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-2xl font-semibold">Current Cohort</h2>
        {cohort ? (
          <div className="mt-3 space-y-1 text-slate-700">
            <p className="font-medium">DRID Internship {cohort.year} Cohort {cohort.cohortNumber}</p>
            <p>Status: {cohort.status}</p>
            <p>Deadline: {new Date(cohort.deadlineAt).toLocaleString()}</p>
            <Link className="mt-2 inline-block text-sm font-medium text-slate-900 underline" href="/cohort/current/countdown">Open countdown</Link>
          </div>
        ) : (
          <p className="mt-3 text-slate-600">No active cohort right now. Stay tuned for the next application window.</p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Challenge Tracks</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {challenges.length > 0 ? challenges.map((challenge) => (
            <Link key={challenge.id} href={`/cohort/current/challenges/${challenge.category}`} className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-400">
              <p className="text-xs uppercase tracking-wide text-slate-500">{challenge.category}</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">{challenge.title}</h3>
              <p className="mt-2 text-sm text-slate-600">Open challenge details and submission instructions.</p>
            </Link>
          )) : (
            <p className="text-slate-600">Challenge content will appear when the cohort challenges are published.</p>
          )}
        </div>
      </section>
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-semibold">Already invited?</h2>
        <p className="mt-1 text-slate-600">Use your invitation link to open the submission form directly.</p>
      </div>
    </main>
  );
}
