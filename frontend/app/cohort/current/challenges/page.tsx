import type { Metadata } from "next";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { Challenge } from "@/types/domain";

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
          <Link
            key={challenge.id}
            href={`/cohort/current/challenges/${challenge.category}`}
            className="glass block rounded-2xl p-5 transition-all duration-300 hover:scale-[1.01]"
            style={{ animation: `slideUp 0.5s ease-out ${0.1 + i * 0.1}s both` }}
          >
            <div className="flex items-center gap-3">
              <span className="badge badge-accent">{challenge.category}</span>
              <h2 className="text-xl font-semibold">{challenge.title}</h2>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
