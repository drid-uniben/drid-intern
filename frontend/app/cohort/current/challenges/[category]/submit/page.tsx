import type { Metadata } from "next";
import { apiGet } from "@/lib/api";
import { Challenge } from "@/types/domain";
import { BackButton } from "@/components/ui/BackButton";
import { PublicChallengeSubmissionForm } from "@/components/forms/PublicChallengeSubmissionForm";
import { getSubmissionRequirements } from "@/lib/submissionRequirements";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Public Challenge Submission — DRID Internship",
  description: "Submit a challenge as a public applicant.",
};

export default async function PublicChallengeSubmitPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const normalizedCategory = category.toLowerCase();

  const challengeResult = await apiGet<Challenge[]>("/public/challenges");
  const challenge = challengeResult.success && challengeResult.data
    ? challengeResult.data.find((item) => item.category === normalizedCategory)
    : undefined;

  if (!challenge) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <BackButton fallbackHref="/cohort/current/challenges" />
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-xl font-semibold">Challenge not found.</p>
        </div>
      </main>
    );
  }

  const requirements = getSubmissionRequirements(challenge.category);

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-12">
      <BackButton fallbackHref={`/cohort/current/challenges/${challenge.category}`} />

      <div className="glass rounded-3xl p-8">
        <span className="badge badge-accent">{challenge.category}</span>
        <h1 className="mt-3 text-3xl font-bold gradient-text">Public Challenge Submission</h1>
        <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
          {challenge.title}
        </p>
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold">{requirements.heading}</h2>
        <ul className="mt-3 space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          {requirements.points.map((point) => (
            <li key={point}>• {point}</li>
          ))}
        </ul>
      </div>

      <div className="glass rounded-2xl p-6">
        <PublicChallengeSubmissionForm category={challenge.category} />
      </div>
    </main>
  );
}
