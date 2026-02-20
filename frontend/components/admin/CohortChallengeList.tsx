"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { Challenge } from "@/types/domain";

export function CohortChallengeList({ cohortId }: { cohortId: string }) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken") ?? undefined;
    apiGet<Challenge[]>(`/challenges?cohortId=${cohortId}`, token).then((result) => {
      if (result.success && result.data) {
        setChallenges(result.data);
      }
    });
  }, [cohortId]);

  if (challenges.length === 0) {
    return <p className="text-sm text-slate-600">No challenges created yet for this cohort.</p>;
  }

  return (
    <div className="space-y-2">
      {challenges.map((challenge) => (
        <div key={challenge.id} className="flex items-center justify-between rounded border border-slate-300 bg-white p-3">
          <div>
            <p className="font-semibold capitalize">{challenge.category}</p>
            <p className="text-sm text-slate-600">{challenge.title}</p>
          </div>
          <Link className="rounded border border-slate-300 px-3 py-2 text-sm" href={`/admin/challenges/${challenge.id}/edit`}>Edit</Link>
        </div>
      ))}
    </div>
  );
}
