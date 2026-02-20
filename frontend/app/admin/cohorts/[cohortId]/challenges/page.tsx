import { CreateChallengeForm } from "@/components/admin/CreateChallengeForm";
import { CohortChallengeList } from "@/components/admin/CohortChallengeList";

export default async function AdminCohortChallengesPage({ params }: { params: Promise<{ cohortId: string }> }) {
  const { cohortId } = await params;
  return (
    <main className="mx-auto max-w-4xl space-y-3 px-6 py-12">
      <h1 className="text-3xl font-bold">Challenge Management</h1>
      <p className="text-slate-600">Manage challenges for cohort {cohortId}.</p>
      <div className="rounded border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Existing Challenges</h2>
        <CohortChallengeList cohortId={cohortId} />
      </div>
      <CreateChallengeForm cohortId={cohortId} />
    </main>
  );
}
