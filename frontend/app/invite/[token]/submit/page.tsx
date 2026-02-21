import { InviteSubmissionForm } from "@/components/forms/InviteSubmissionForm";

export default async function InviteSubmitPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="glass rounded-3xl p-8" style={{ animation: "slideUp 0.5s ease-out" }}>
        <h1 className="text-3xl font-bold gradient-text">Submit Challenge</h1>
        <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
          Fill in your details and submit your challenge work below.
        </p>
        <div className="mt-6">
          <InviteSubmissionForm token={token} />
        </div>
      </div>
    </main>
  );
}
