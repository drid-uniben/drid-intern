import { InvitationBulkForm } from "@/components/admin/InvitationBulkForm";
import { BackButton } from "@/components/ui/BackButton";

export default async function AdminCohortInvitationsPage({ params }: { params: Promise<{ cohortId: string }> }) {
  const { cohortId } = await params;
  return (
    <main className="mx-auto max-w-4xl space-y-6 px-6 py-12">
      <BackButton fallbackHref={`/admin/cohorts/${cohortId}`} />
      <div style={{ animation: "fadeIn 0.5s ease-out" }}>
        <h1 className="text-3xl font-bold">
          Invitation <span className="gradient-text">Management</span>
        </h1>
        <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
          Upload and send invitations for this cohort.
        </p>
      </div>
      <div style={{ animation: "slideUp 0.5s ease-out 0.1s both" }}>
        <InvitationBulkForm cohortId={cohortId} />
      </div>
    </main>
  );
}
