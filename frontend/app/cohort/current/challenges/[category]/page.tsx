import { apiGet } from "@/lib/api";
import { Challenge } from "@/types/domain";

export default async function ChallengeDetailPage({ params }: { params: Promise<{ category: string }> }) {
  const resolved = await params;
  const result = await apiGet<Challenge[]>("/public/challenges");
  const challenge = result.success && result.data
    ? result.data.find((item) => item.category === resolved.category)
    : undefined;

  if (!challenge) {
    return <main className="mx-auto max-w-3xl px-6 py-12">Challenge not found.</main>;
  }

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-6 py-12">
      <h1 className="text-3xl font-bold capitalize">{challenge.category} Challenge</h1>
      <p className="text-lg font-semibold">{challenge.title}</p>
      <article className="whitespace-pre-wrap text-slate-700">{challenge.description}</article>
    </main>
  );
}
