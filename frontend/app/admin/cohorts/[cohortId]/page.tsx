"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { CohortStatusActions } from "@/components/admin/CohortStatusActions";
import { Cohort } from "@/types/domain";

export default function AdminCohortDetailPage({ params }: { params: Promise<{ cohortId: string }> }) {
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [cohortId, setCohortId] = useState<string>("");

  useEffect(() => {
    params.then(async (resolved) => {
      setCohortId(resolved.cohortId);
      const token = localStorage.getItem("accessToken") ?? undefined;
      const result = await apiGet<Cohort>(`/cohorts/${resolved.cohortId}`, token);
      if (result.success && result.data) {
        setCohort(result.data);
      }
    });
  }, [params]);

  if (!cohort) {
    return <main className="mx-auto max-w-4xl px-6 py-12">Loading cohort...</main>;
  }

  return (
    <main className="mx-auto max-w-4xl space-y-4 px-6 py-12">
      <h1 className="text-3xl font-bold">Cohort Detail</h1>
      <p className="text-slate-600">{cohort.year} Cohort {cohort.cohortNumber}</p>
      <p className="text-slate-600">Deadline: {new Date(cohort.deadlineAt).toLocaleString()}</p>
      <CohortStatusActions cohortId={cohortId} initialStatus={cohort.status} />
      <div className="flex flex-wrap gap-3">
        <Link className="rounded border border-slate-300 px-3 py-2" href={`/admin/cohorts/${cohortId}/challenges`}>Manage challenges</Link>
        <Link className="rounded border border-slate-300 px-3 py-2" href={`/admin/cohorts/${cohortId}/invitations`}>Manage invitations</Link>
      </div>
    </main>
  );
}
