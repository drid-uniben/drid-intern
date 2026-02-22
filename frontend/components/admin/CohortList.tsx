"use client";

import Link from "next/link";
import * as m from "motion/react-m";
import { apiGet } from "@/lib/api";
import { Cohort } from "@/types/domain";
import { useAuthedQuery } from "@/hooks/useAuthedQuery";
import { ListSkeleton } from "@/components/ui/LoadingSkeleton";
import { AutoStatusBadge } from "@/components/ui/StatusBadge";
import { useAppStore } from "@/lib/store";

export function CohortList() {
  const authInitialized = useAppStore((state) => state.authInitialized);

  const { data: cohorts = [], isLoading } = useAuthedQuery<Cohort[]>({
    queryKey: ["admin-cohorts"],
    queryFn: async (token) => {
      const result = await apiGet<Cohort[]>("/cohorts", token);
      return result.success && result.data ? result.data : [];
    },
  });

  if (!authInitialized || isLoading) return <ListSkeleton count={3} />;

  return (
    <div className="space-y-3">
      {cohorts.map((cohort, i) => (
        <m.div
          key={cohort.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Link
            href={`/admin/cohorts/${cohort.id}`}
            className="glass block rounded-2xl p-4 transition-all duration-300 hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{cohort.year} Cohort {cohort.cohortNumber}</p>
                <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                  Deadline: {new Date(cohort.deadlineAt).toLocaleDateString()}
                </p>
              </div>
              <AutoStatusBadge status={cohort.status} />
            </div>
          </Link>
        </m.div>
      ))}
    </div>
  );
}
