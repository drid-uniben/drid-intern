import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <main className="mx-auto max-w-4xl space-y-4 px-6 py-12">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="flex flex-wrap gap-3">
        <Link className="rounded border border-slate-300 px-3 py-2" href="/admin/users">Users</Link>
        <Link className="rounded border border-slate-300 px-3 py-2" href="/admin/cohorts">Cohorts</Link>
        <Link className="rounded border border-slate-300 px-3 py-2" href="/admin/submissions">Submissions</Link>
      </div>
    </main>
  );
}
