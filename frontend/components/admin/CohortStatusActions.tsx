"use client";

import { useMutation } from "@tanstack/react-query";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { apiPatch } from "@/lib/api";
import { useAuthToken } from "@/hooks/useAuth";
import { AutoStatusBadge } from "@/components/ui/StatusBadge";

type CohortStatus = "DRAFT" | "PENDING_APPROVAL" | "ACTIVE" | "CLOSED" | "ARCHIVED";

export function CohortStatusActions({ cohortId, initialStatus }: { cohortId: string; initialStatus: CohortStatus }) {
  const token = useAuthToken();

  const mutation = useMutation({
    mutationFn: async (next: CohortStatus) => {
      return apiPatch<{ status: CohortStatus }>(`/cohorts/${cohortId}/status`, { status: next }, token);
    },
  });

  const currentStatus = mutation.data?.success && mutation.data.data ? mutation.data.data.status : initialStatus;
  const message = mutation.isError
    ? "Failed to update status"
    : mutation.data && !mutation.data.success
      ? (mutation.data.error ?? "Failed to update status")
      : mutation.isSuccess && mutation.data?.success
        ? `Status updated to ${currentStatus}`
        : null;

  const actions: { label: string; value: CohortStatus; style?: React.CSSProperties }[] = [
    { label: "Pending", value: "PENDING_APPROVAL" },
    { label: "Activate", value: "ACTIVE", style: { background: "linear-gradient(135deg, #22c55e, #16a34a)" } },
    { label: "Close", value: "CLOSED", style: { background: "linear-gradient(135deg, #f59e0b, #d97706)" } },
    { label: "Archive", value: "ARCHIVED" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Current status:</span>
        <AutoStatusBadge status={currentStatus} />
      </div>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.value}
            className={action.style ? "btn-gradient !py-1.5 !px-3 !text-sm !rounded-lg" : "btn-glass !py-1.5 !px-3 !text-sm !rounded-lg"}
            style={action.style}
            onClick={() => mutation.mutate(action.value)}
            disabled={mutation.isPending}
            type="button"
          >
            {action.label}
          </button>
        ))}
      </div>
      <AnimatePresence>
        {message && (
          <m.p
            className="text-sm rounded-lg p-2"
            style={{ background: "var(--badge-bg)", color: "var(--badge-text)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {message}
          </m.p>
        )}
      </AnimatePresence>
    </div>
  );
}
