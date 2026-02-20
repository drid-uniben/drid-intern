import Link from "next/link";
import { apiGet } from "@/lib/api";
import { Challenge } from "@/types/domain";

export default async function ChallengeListPage() {
  const result = await apiGet<Challenge[]>("/public/challenges");
  const challenges = result.success && result.data ? result.data : [];

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold">Current Cohort Challenges</h1>
      <div className="mt-6 space-y-3">
        {challenges.map((challenge) => (
          <Link key={challenge.id} href={`/cohort/current/challenges/${challenge.category}`} className="block rounded border border-slate-300 p-4">
            <h2 className="text-xl font-semibold capitalize">{challenge.category}</h2>
            <p className="text-slate-600">{challenge.title}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
