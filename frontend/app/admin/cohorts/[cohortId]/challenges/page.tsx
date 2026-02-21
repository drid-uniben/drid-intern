import Link from "next/link";
import { CohortChallengeList } from "@/components/admin/CohortChallengeList";
import { BackButton } from "@/components/ui/BackButton";

export default async function AdminCohortChallengesPage({ params }: { params: Promise<{ cohortId: string }> }) {
  const { cohortId } = await params;
  return (
    <main className="mx-auto max-w-4xl space-y-6 px-6 py-12">
      <BackButton fallbackHref={`/admin/cohorts/${cohortId}`} />
      <h1 className="text-3xl font-bold" style={{ animation: "fadeIn 0.5s ease-out" }}>
        Challenge <span className="gradient-text">Management</span>
      </h1>
      <p style={{ color: "var(--text-secondary)" }}>Manage challenges for this cohort.</p>

      <div className="glass rounded-2xl p-6" style={{ animation: "slideUp 0.5s ease-out 0.1s both" }}>
        <div className="mb-4 flex items-center justify-between gap-3" id="existing-challenges">
          <h2 className="text-lg font-semibold">Existing Challenges</h2>
          <Link className="btn-gradient !text-sm" href={`/admin/cohorts/${cohortId}/challenges/create`}>
            + Create challenge
          </Link>
        </div>
        <CohortChallengeList cohortId={cohortId} />
      </div>
    </main>
  );
}
