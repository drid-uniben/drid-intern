"use client";

import Link from "next/link";
import { use } from "react";
import { apiGet } from "@/lib/api";
import { CohortStatusActions } from "@/components/admin/CohortStatusActions";
import { Cohort } from "@/types/domain";
import { useAuthedQuery } from "@/hooks/useAuthedQuery";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { AutoStatusBadge } from "@/components/ui/StatusBadge";
import { BackButton } from "@/components/ui/BackButton";
import { useAppStore } from "@/lib/store";
import { CohortDeadlineEditor } from "@/components/admin/CohortDeadlineEditor";

export default function AdminCohortDetailPage({ params }: { params: Promise<{ cohortId: string }> }) {
  const { cohortId } = use(params);
  const authInitialized = useAppStore((state) => state.authInitialized);

  const { data: cohort, isLoading } = useAuthedQuery<Cohort | null>({
    queryKey: ["admin-cohort", cohortId],
    queryFn: async (token) => {
      const result = await apiGet<Cohort>(`/cohorts/${cohortId}`, token);
      return result.success && result.data ? result.data : null;
    },
  });

  if (!authInitialized || isLoading) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12">
        <BackButton fallbackHref="/admin" />
        <CardSkeleton />
      </main>
    );
  }

  if (!cohort) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12">
        <BackButton fallbackHref="/admin" />
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-xl font-semibold">Cohort not found</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-6 py-12">
      <BackButton fallbackHref="/admin" />
      <div className="glass rounded-3xl p-8" style={{ animation: "slideUp 0.5s ease-out" }}>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold gradient-text">Cohort Detail</h1>
          <AutoStatusBadge status={cohort.status} />
        </div>
        <div className="mt-3 space-y-1" style={{ color: "var(--text-secondary)" }}>
          <p className="font-medium" style={{ color: "var(--text-primary)" }}>
            {cohort.year} Cohort {cohort.cohortNumber}
          </p>
          <p>Deadline: {new Date(cohort.deadlineAt).toLocaleString()}</p>
        </div>
      </div>

      <div className="glass rounded-2xl p-6" style={{ animation: "slideUp 0.5s ease-out 0.1s both" }}>
        <h2 className="text-lg font-semibold mb-3">Deadline Management</h2>
        <CohortDeadlineEditor cohortId={cohortId} deadlineAt={cohort.deadlineAt} />
      </div>

      <div className="glass rounded-2xl p-6" style={{ animation: "slideUp 0.5s ease-out 0.15s both" }}>
        <h2 className="text-lg font-semibold mb-3">Status Management</h2>
        <CohortStatusActions cohortId={cohortId} initialStatus={cohort.status} />
      </div>

      <div className="flex flex-wrap gap-3" style={{ animation: "slideUp 0.5s ease-out 0.2s both" }}>
        <Link className="btn-gradient" href={`/admin/cohorts/${cohortId}/challenges`}>
          Manage challenges
        </Link>
        <Link className="btn-glass" href={`/admin/cohorts/${cohortId}/invitations`}>
          Manage invitations
        </Link>
      </div>
    </main>
  );
}
