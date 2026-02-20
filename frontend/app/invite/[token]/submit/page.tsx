import { InviteSubmissionForm } from "@/components/forms/InviteSubmissionForm";

export default async function InviteSubmitPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  return (
    <main className="mx-auto max-w-2xl space-y-4 px-6 py-12">
      <h1 className="text-3xl font-bold">Submit Challenge</h1>
      <InviteSubmissionForm token={token} />
    </main>
  );
}
