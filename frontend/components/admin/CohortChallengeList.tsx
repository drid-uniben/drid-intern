"use client";

import Link from "next/link";
import * as m from "motion/react-m";
import { apiGet } from "@/lib/api";
import { Challenge } from "@/types/domain";
import { useAuthedQuery } from "@/hooks/useAuthedQuery";
import { ListSkeleton } from "@/components/ui/LoadingSkeleton";
import { useAppStore } from "@/lib/store";

export function CohortChallengeList({ cohortId }: { cohortId: string }) {
  const authInitialized = useAppStore((state) => state.authInitialized);

  const { data: challenges = [], isLoading } = useAuthedQuery<Challenge[]>({
    queryKey: ["admin-challenges", cohortId],
    queryFn: async (token) => {
      const result = await apiGet<Challenge[]>(`/challenges?cohortId=${cohortId}`, token);
      return result.success && result.data ? result.data : [];
    },
  });

  if (!authInitialized || isLoading) return <ListSkeleton count={2} />;

  if (challenges.length === 0) {
    return <p className="text-sm" style={{ color: "var(--text-muted)" }}>No challenges created yet for this cohort.</p>;
  }

  return (
    <div className="space-y-3">
      {challenges.map((challenge, i) => (
        <m.div
          key={challenge.id}
          className="glass rounded-xl p-4 flex items-center justify-between"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <div>
            <p className="font-semibold capitalize">{challenge.category}</p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{challenge.title}</p>
          </div>
          <Link className="btn-glass !py-1.5 !px-3 !text-sm !rounded-lg" href={`/admin/challenges/${challenge.id}/edit`}>
            Edit
          </Link>
        </m.div>
      ))}
    </div>
  );
}
