import type { Metadata } from "next";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { Challenge, Cohort } from "@/types/domain";

export const metadata: Metadata = {
  title: "DRID Internship Platform",
  description: "Apply for DRID cohort-based internship challenges in frontend, backend, fullstack, and design.",
};

export default async function Home() {
  const cohortResult = await apiGet<Cohort>("/public/cohort");
  const challengeResult = await apiGet<Challenge[]>("/public/challenges");
  const cohort = cohortResult.success ? cohortResult.data : undefined;
  const challenges = challengeResult.success && challengeResult.data ? challengeResult.data : [];

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="orb" style={{ width: 400, height: 400, background: "var(--accent-start)", opacity: 0.12, top: -100, right: -100 }} />
      <div className="orb" style={{ width: 300, height: 300, background: "var(--accent-end)", opacity: 0.1, bottom: 100, left: -80, animationDelay: "3s" }} />

      <div className="mx-auto max-w-6xl space-y-10 px-6 py-12 relative z-10">
        {/* Hero Section */}
        <section
          className="glass rounded-3xl p-10 md:p-14 relative overflow-hidden"
          style={{ animation: "slideUp 0.6s ease-out" }}
        >
          <div className="orb" style={{ width: 200, height: 200, background: "var(--accent-mid)", opacity: 0.15, top: -60, right: -40 }} />
          <p
            className="badge badge-accent text-xs"
            style={{ animation: "fadeIn 0.6s ease-out 0.2s both" }}
          >
            DRID Internship Applications
          </p>
          <h1
            className="mt-4 text-4xl md:text-5xl font-bold leading-tight"
            style={{ animation: "fadeIn 0.6s ease-out 0.3s both" }}
          >
            Build, design, and ship with the{" "}
            <span className="gradient-text">DRID engineering team</span>
          </h1>
          <p
            className="mt-4 max-w-3xl text-lg"
            style={{ color: "var(--text-secondary)", animation: "fadeIn 0.6s ease-out 0.4s both" }}
          >
            This platform hosts cohort-based challenge submissions for frontend, backend, fullstack, and design internship applicants.
          </p>
          <div
            className="mt-8 flex flex-wrap gap-3"
            style={{ animation: "fadeIn 0.6s ease-out 0.5s both" }}
          >
            <Link className="btn-gradient" href="/cohort/current">View active cohort</Link>
            <Link className="btn-glass" href="/cohort/current/challenges">Browse challenges</Link>
          </div>
        </section>

        {/* Current Cohort */}
        <section
          className="glass rounded-2xl p-6"
          style={{ animation: "slideUp 0.6s ease-out 0.3s both" }}
        >
          <h2 className="text-2xl font-semibold">Current Cohort</h2>
          {cohort ? (
            <div className="mt-3 space-y-1" style={{ color: "var(--text-secondary)" }}>
              <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                DRID Internship {cohort.year} Cohort {cohort.cohortNumber}
              </p>
              <p>Status: <span className="badge badge-accent ml-1">{cohort.status}</span></p>
              <p>Deadline: {new Date(cohort.deadlineAt).toLocaleString()}</p>
              <Link
                className="mt-2 inline-block text-sm font-medium gradient-text"
                href="/cohort/current/countdown"
              >
                Open countdown →
              </Link>
            </div>
          ) : (
            <p className="mt-3" style={{ color: "var(--text-secondary)" }}>
              No active cohort right now. Stay tuned for the next application window.
            </p>
          )}
        </section>

        {/* Challenge Tracks */}
        <section className="space-y-4" style={{ animation: "slideUp 0.6s ease-out 0.5s both" }}>
          <h2 className="text-2xl font-semibold">Challenge Tracks</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {challenges.length > 0 ? challenges.map((challenge, i) => (
              <div
                key={challenge.id}
                className="glass rounded-2xl p-5"
                style={{ animation: `slideUp 0.5s ease-out ${0.6 + i * 0.1}s both` }}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="badge badge-accent text-xs">{challenge.category}</p>
                  <Link
                    className="btn-glass !py-1.5 !px-3 !text-sm !rounded-lg"
                    href={`/cohort/current/challenges/${challenge.category}/submit`}
                    aria-label={`Submit ${challenge.category} challenge`}
                  >
                    Submit
                  </Link>
                </div>
                <h3 className="mt-2 text-lg font-semibold">{challenge.title}</h3>
                <div className="mt-3 flex gap-3 text-sm">
                  <Link className="gradient-text font-medium" href={`/cohort/current/challenges/${challenge.category}`}>
                    View details →
                  </Link>
                </div>
              </div>
            )) : (
              <p style={{ color: "var(--text-secondary)" }}>
                Challenge content will appear when the cohort challenges are published.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
