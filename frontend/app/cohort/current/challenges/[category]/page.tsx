import { apiGet } from "@/lib/api";
import { Challenge } from "@/types/domain";

export default async function ChallengeDetailPage({ params }: { params: Promise<{ category: string }> }) {
  const resolved = await params;
  const result = await apiGet<Challenge[]>("/public/challenges");
  const challenge = result.success && result.data
    ? result.data.find((item) => item.category === resolved.category)
    : undefined;

  if (!challenge) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="glass rounded-2xl p-8 text-center" style={{ animation: "slideUp 0.5s ease-out" }}>
          <p className="text-xl font-semibold">Challenge not found.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-12">
      <div className="glass rounded-3xl p-8" style={{ animation: "slideUp 0.5s ease-out" }}>
        <span className="badge badge-accent">{challenge.category}</span>
        <h1 className="mt-3 text-3xl font-bold capitalize gradient-text">
          {challenge.category} Challenge
        </h1>
        <p className="mt-2 text-lg font-semibold">{challenge.title}</p>
      </div>
      <article
        className="glass rounded-2xl p-6 whitespace-pre-wrap leading-relaxed"
        style={{ color: "var(--text-secondary)", animation: "slideUp 0.5s ease-out 0.2s both" }}
      >
        {challenge.description}
      </article>
    </main>
  );
}
