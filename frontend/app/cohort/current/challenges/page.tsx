import type { Metadata } from "next";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { Challenge } from "@/types/domain";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Challenge Tracks — DRID Internship",
  description: "Browse the available challenge tracks for the current cohort.",
};

export default async function ChallengeListPage() {
  const result = await apiGet<Challenge[]>("/public/challenges");
  const challenges = result.success && result.data ? result.data : [];

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold" style={{ animation: "fadeIn 0.5s ease-out" }}>
        Current Cohort <span className="gradient-text">Challenges</span>
      </h1>
      <div className="mt-6 space-y-4">
        {challenges.map((challenge, i) => (
          <div
            key={challenge.id}
            className="glass rounded-2xl p-5"
            style={{ animation: `slideUp 0.5s ease-out ${0.1 + i * 0.1}s both` }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="badge badge-accent">{challenge.category}</span>
              </div>
              <Link
                href={`/cohort/current/challenges/${challenge.category}/submit`}
                className="btn-glass !py-1.5 !px-3 !text-sm !rounded-lg"
                aria-label={`Submit ${challenge.category} challenge`}
                title="Submit challenge"
              >
                Submit
              </Link>
            </div>
            <div className="flex flex-col items-start gap-3">
              <h2 className="text-xl font-semibold">{challenge.title}</h2>
              <Link
                href={`/cohort/current/challenges/${challenge.category}`}
                className="mt-3 inline-block text-sm gradient-text font-medium"
              >
                View challenge details →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
