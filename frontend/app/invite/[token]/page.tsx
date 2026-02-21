import Link from "next/link";
import { apiGet } from "@/lib/api";
import { InvitationValidation } from "@/types/domain";

export default async function InviteValidationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await apiGet<InvitationValidation>(`/invitations/${token}`);

  if (!result.success || !result.data) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="glass rounded-3xl p-10 text-center max-w-md" style={{ animation: "slideUp 0.5s ease-out" }}>
          <p className="text-5xl font-bold gradient-text">⚠️</p>
          <h1 className="mt-4 text-2xl font-bold">Invalid Invitation</h1>
          <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
            This invitation token is invalid or has expired.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="glass rounded-3xl p-8" style={{ animation: "slideUp 0.5s ease-out" }}>
        <span className="badge badge-success">Verified</span>
        <h1 className="mt-3 text-3xl font-bold gradient-text">Invitation Confirmed</h1>
        <div className="mt-4 space-y-2" style={{ color: "var(--text-secondary)" }}>
          <p>Email: <span style={{ color: "var(--text-primary)" }}>{result.data.email}</span></p>
          <p>Category: <span className="badge badge-accent ml-1 capitalize">{result.data.category}</span></p>
          <p>Cohort: <span style={{ color: "var(--text-primary)" }}>{result.data.cohort.year} Cohort {result.data.cohort.cohortNumber}</span></p>
        </div>
        <Link className="btn-gradient mt-6 inline-flex" href={`/invite/${token}/submit`}>
          Continue to submission →
        </Link>
      </div>
    </main>
  );
}
