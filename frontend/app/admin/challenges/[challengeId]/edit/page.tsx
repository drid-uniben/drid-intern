import { ChallengeEditorForm } from "@/components/admin/ChallengeEditorForm";
import { BackButton } from "@/components/ui/BackButton";

type ChallengeEditorPageParams = { challengeId: string } | Promise<{ challengeId: string }>;

export default async function AdminChallengeEditorPage({ params }: { params: ChallengeEditorPageParams }) {
  const { challengeId } = await Promise.resolve(params);
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <BackButton fallbackHref="/admin" />
      <div className="glass rounded-3xl p-8" style={{ animation: "slideUp 0.5s ease-out" }}>
        <h1 className="text-3xl font-bold gradient-text">Challenge Editor</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>ID: {challengeId}</p>
        <div className="mt-6">
          <ChallengeEditorForm challengeId={challengeId} />
        </div>
      </div>
    </main>
  );
}
