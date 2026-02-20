import Link from "next/link";
import { apiGet } from "@/lib/api";
import { InvitationValidation } from "@/types/domain";

export default async function InviteValidationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await apiGet<InvitationValidation>(`/invitations/${token}`);

  if (!result.success || !result.data) {
    return <main className="mx-auto max-w-2xl px-6 py-12">Invalid or expired invitation token.</main>;
  }

  return (
    <main className="mx-auto max-w-2xl space-y-4 px-6 py-12">
      <h1 className="text-3xl font-bold">Invitation confirmed</h1>
      <p>Invited email: {result.data.email}</p>
      <p>Category: <span className="capitalize">{result.data.category}</span></p>
      <p>Cohort: {result.data.cohort.year} Cohort {result.data.cohort.cohortNumber}</p>
      <Link className="rounded bg-slate-900 px-4 py-2 text-white" href={`/invite/${token}/submit`}>Continue to submission</Link>
    </main>
  );
}
