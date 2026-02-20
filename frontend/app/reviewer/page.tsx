import Link from "next/link";

export default function ReviewerDashboardPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-4 px-6 py-12">
      <h1 className="text-3xl font-bold">Reviewer Dashboard</h1>
      <Link className="rounded bg-slate-900 px-4 py-2 text-white" href="/reviewer/submissions">Open review queue</Link>
    </main>
  );
}
