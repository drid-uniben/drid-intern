"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { Cohort } from "@/types/domain";

export function CohortList() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken") ?? undefined;
    apiGet<Cohort[]>("/cohorts", token).then((result) => {
      if (result.success && result.data) {
        setCohorts(result.data);
      }
    });
  }, []);

  return (
    <div className="space-y-2">
      {cohorts.map((cohort) => (
        <Link key={cohort.id} href={`/admin/cohorts/${cohort.id}`} className="block rounded border border-slate-300 p-3">
          <p className="font-semibold">{cohort.year} Cohort {cohort.cohortNumber}</p>
          <p className="text-sm text-slate-600">Status: {cohort.status}</p>
        </Link>
      ))}
    </div>
  );
}
