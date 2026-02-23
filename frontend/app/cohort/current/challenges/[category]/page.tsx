import type { Metadata } from "next";
import { apiGet } from "@/lib/api";
import { Challenge } from "@/types/domain";
import { BackButton } from "@/components/ui/BackButton";
import Link from "next/link";
import { getSubmissionRequirements } from "@/lib/submissionRequirements";

export const metadata: Metadata = {
  title: "Challenge Details — DRID Internship",
  description: "View challenge details and submission instructions.",
};

export default async function ChallengeDetailPage({ params }: { params: Promise<{ category: string }> }) {
  const resolved = await params;
  const result = await apiGet<Challenge[]>("/public/challenges");
  const challenge = result.success && result.data
    ? result.data.find((item) => item.category === resolved.category)
    : undefined;

  if (!challenge) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <BackButton fallbackHref="/cohort/current/challenges" />
        <div className="glass rounded-2xl p-8 text-center" style={{ animation: "slideUp 0.5s ease-out" }}>
          <p className="text-xl font-semibold">Challenge not found.</p>
        </div>
      </main>
    );
  }

  const requirements = getSubmissionRequirements(challenge.category);

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-12">
      <BackButton fallbackHref="/cohort/current/challenges" />
      <div className="glass rounded-3xl p-8" style={{ animation: "slideUp 0.5s ease-out" }}>
        <div className="flex items-center justify-between gap-3">
          <span className="badge badge-accent">{challenge.category}</span>
          <Link
            href={`/cohort/current/challenges/${challenge.category}/submit`}
            className="btn-gradient !py-1.5 !px-3 !text-sm !rounded-lg"
            aria-label={`Submit ${challenge.category} challenge`}
          >
            Submit
          </Link>
        </div>
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
      <div className="glass rounded-2xl p-6" style={{ animation: "slideUp 0.5s ease-out 0.3s both" }}>
        <h2 className="text-lg font-semibold">{requirements.heading}</h2>
        <ul className="mt-3 space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          {requirements.points.map((point) => (
            <li key={point}>• {point}</li>
          ))}
        </ul>
      </div>
    </main>
  );
}
