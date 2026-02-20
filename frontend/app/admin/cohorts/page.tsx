import Link from "next/link";
import { CohortList } from "@/components/admin/CohortList";

export default function AdminCohortsPage() {
  return (
    <main className="mx-auto max-w-4xl space-y-4 px-6 py-12">
      <h1 className="text-3xl font-bold">Cohorts</h1>
      <Link className="rounded bg-slate-900 px-4 py-2 text-white" href="/admin/cohorts/create">Create cohort</Link>
      <CohortList />
    </main>
  );
}
