import { CreateChallengeForm } from "@/components/admin/CreateChallengeForm";
import { BackButton } from "@/components/ui/BackButton";

export default async function AdminCreateChallengePage({ params }: { params: Promise<{ cohortId: string }> }) {
  const { cohortId } = await params;

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-6 py-12">
      <BackButton fallbackHref={`/admin/cohorts/${cohortId}/challenges`} />
      <h1 className="text-3xl font-bold" style={{ animation: "fadeIn 0.5s ease-out" }}>
        Create <span className="gradient-text">Challenge</span>
      </h1>
      <p style={{ color: "var(--text-secondary)" }}>Add a new challenge for this cohort.</p>
      <div style={{ animation: "slideUp 0.5s ease-out 0.1s both" }}>
        <CreateChallengeForm cohortId={cohortId} />
      </div>
    </main>
  );
}
