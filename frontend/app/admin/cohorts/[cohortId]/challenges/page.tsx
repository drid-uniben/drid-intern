import { CreateChallengeForm } from "@/components/admin/CreateChallengeForm";

export default async function AdminCohortChallengesPage({ params }: { params: Promise<{ cohortId: string }> }) {
  const { cohortId } = await params;
  return (
    <main className="mx-auto max-w-4xl space-y-3 px-6 py-12">
      <h1 className="text-3xl font-bold">Challenge Management</h1>
      <p className="text-slate-600">Manage challenges for cohort {cohortId}.</p>
      <CreateChallengeForm cohortId={cohortId} />
    </main>
  );
}
