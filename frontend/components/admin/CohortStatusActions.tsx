"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { apiPatch } from "@/lib/api";
import { useAuthToken } from "@/hooks/useAuth";
import { AutoStatusBadge } from "@/components/ui/StatusBadge";

type CohortStatus = "DRAFT" | "PENDING_APPROVAL" | "ACTIVE" | "CLOSED" | "ARCHIVED";

export function CohortStatusActions({ cohortId, initialStatus }: { cohortId: string; initialStatus: CohortStatus }) {
  const token = useAuthToken();
  const [status, setStatus] = useState<CohortStatus>(initialStatus);
  const [message, setMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (next: CohortStatus) => {
      return apiPatch<{ status: CohortStatus }>(`/cohorts/${cohortId}/status`, { status: next }, token);
    },
    onMutate: (next) => {
      setStatus(next);
      setMessage(null);
    },
    onSuccess: (result) => {
      if (result.success && result.data) {
        setStatus(result.data.status);
        setMessage(`Status updated to ${result.data.status}`);
      } else {
        setMessage(result.error ?? "Failed to update status");
      }
    },
  });

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
        <AutoStatusBadge status={status} />
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
          <motion.p
            className="text-sm rounded-lg p-2"
            style={{ background: "var(--badge-bg)", color: "var(--badge-text)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
