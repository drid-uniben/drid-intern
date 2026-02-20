"use client";

import { useState } from "react";
import { apiPatch } from "@/lib/api";

type CohortStatus = "DRAFT" | "PENDING_APPROVAL" | "ACTIVE" | "CLOSED" | "ARCHIVED";

export function CohortStatusActions({ cohortId, initialStatus }: { cohortId: string; initialStatus: CohortStatus }) {
  const [status, setStatus] = useState<CohortStatus>(initialStatus);
  const [message, setMessage] = useState<string | null>(null);

  const updateStatus = async (next: CohortStatus) => {
    const token = localStorage.getItem("accessToken") ?? undefined;
    const result = await apiPatch<{ status: CohortStatus }>(`/cohorts/${cohortId}/status`, { status: next }, token);
    if (!result.success || !result.data) {
      setMessage(result.error ?? "Failed to update status");
      return;
    }

    setStatus(result.data.status);
    setMessage(`Status updated to ${result.data.status}`);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-700">Current status: {status}</p>
      <div className="flex flex-wrap gap-2">
        <button className="rounded border border-slate-300 px-3 py-2" onClick={() => updateStatus("PENDING_APPROVAL")}>Move to Pending</button>
        <button className="rounded bg-emerald-700 px-3 py-2 text-white" onClick={() => updateStatus("ACTIVE")}>Activate</button>
        <button className="rounded bg-amber-700 px-3 py-2 text-white" onClick={() => updateStatus("CLOSED")}>Close</button>
        <button className="rounded bg-slate-700 px-3 py-2 text-white" onClick={() => updateStatus("ARCHIVED")}>Archive</button>
      </div>
      {message ? <p className="text-sm">{message}</p> : null}
    </div>
  );
}
