import { CreateChallengeForm } from "@/components/admin/CreateChallengeForm";
import { CohortChallengeList } from "@/components/admin/CohortChallengeList";

export default async function AdminCohortChallengesPage({ params }: { params: Promise<{ cohortId: string }> }) {
  const { cohortId } = await params;
  return (
    <main className="mx-auto max-w-4xl space-y-6 px-6 py-12">
      <h1 className="text-3xl font-bold" style={{ animation: "fadeIn 0.5s ease-out" }}>
        Challenge <span className="gradient-text">Management</span>
      </h1>
      <p style={{ color: "var(--text-secondary)" }}>Manage challenges for this cohort.</p>

      <div className="glass rounded-2xl p-6" style={{ animation: "slideUp 0.5s ease-out 0.1s both" }}>
        <h2 className="mb-4 text-lg font-semibold">Existing Challenges</h2>
        <CohortChallengeList cohortId={cohortId} />
      </div>

      <div style={{ animation: "slideUp 0.5s ease-out 0.2s both" }}>
        <CreateChallengeForm cohortId={cohortId} />
      </div>
    </main>
  );
}
