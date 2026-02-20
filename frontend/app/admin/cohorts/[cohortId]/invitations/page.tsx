import { InvitationBulkForm } from "@/components/admin/InvitationBulkForm";

export default async function AdminCohortInvitationsPage({ params }: { params: Promise<{ cohortId: string }> }) {
  const { cohortId } = await params;
  return (
    <main className="mx-auto max-w-4xl space-y-3 px-6 py-12">
      <h1 className="text-3xl font-bold">Invitation Management</h1>
      <p className="text-slate-600">Upload and send invitations for cohort {cohortId}.</p>
      <InvitationBulkForm cohortId={cohortId} />
    </main>
  );
}
