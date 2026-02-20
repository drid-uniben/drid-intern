import Link from "next/link";
import { apiGet } from "@/lib/api";
import { CohortStatusActions } from "@/components/admin/CohortStatusActions";
import { Cohort } from "@/types/domain";

export default async function AdminCohortDetailPage({ params }: { params: Promise<{ cohortId: string }> }) {
  const { cohortId } = await params;
  const token = undefined;
  const result = await apiGet<Cohort>(`/cohorts/${cohortId}`, token);

  if (!result.success || !result.data) {
    return <main className="mx-auto max-w-4xl px-6 py-12">Cohort not found.</main>;
  }

  const cohort = result.data;
  return (
    <main className="mx-auto max-w-4xl space-y-4 px-6 py-12">
      <h1 className="text-3xl font-bold">Cohort Detail</h1>
      <p className="text-slate-600">{cohort.year} Cohort {cohort.cohortNumber}</p>
      <p className="text-slate-600">Deadline: {new Date(cohort.deadlineAt).toLocaleString()}</p>
      <CohortStatusActions cohortId={cohortId} initialStatus={cohort.status} />
      <div className="flex flex-wrap gap-3">
        <Link className="rounded border border-slate-300 px-3 py-2" href={`/admin/cohorts/${cohortId}/challenges`}>Manage challenges</Link>
        <Link className="rounded border border-slate-300 px-3 py-2" href={`/admin/cohorts/${cohortId}/invitations`}>Manage invitations</Link>
      </div>
    </main>
  );
}
