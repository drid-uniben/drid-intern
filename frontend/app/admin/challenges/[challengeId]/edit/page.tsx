import { ChallengeEditorForm } from "@/components/admin/ChallengeEditorForm";

export default async function AdminChallengeEditorPage({ params }: { params: Promise<{ challengeId: string }> }) {
  const { challengeId } = await params;
  return (
    <main className="mx-auto max-w-4xl space-y-4 px-6 py-12">
      <h1 className="text-3xl font-bold">Challenge Editor</h1>
      <p className="text-slate-600">Challenge ID: {challengeId}</p>
      <ChallengeEditorForm challengeId={challengeId} />
    </main>
  );
}
