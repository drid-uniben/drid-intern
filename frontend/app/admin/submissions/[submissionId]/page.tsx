"use client";

import { use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { apiGet, apiPatch } from "@/lib/api";
import { useAuthToken } from "@/hooks/useAuth";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { AutoStatusBadge } from "@/components/ui/StatusBadge";

interface SubmissionDetail {
  id: string;
  fullName: string;
  email: string;
  category: string;
  message: string;
  status: string;
}

export default function AdminSubmissionDetailPage({ params }: { params: Promise<{ submissionId: string }> }) {
  const { submissionId } = use(params);
  const token = useAuthToken();
  const queryClient = useQueryClient();

  const { data: submission, isLoading } = useQuery({
    queryKey: ["admin-submission", submissionId],
    queryFn: async () => {
      const result = await apiGet<SubmissionDetail>(`/submissions/${submissionId}`, token);
      return result.success && result.data ? result.data : null;
    },
  });

  const mutation = useMutation({
    mutationFn: async (action: "accept" | "reject") => {
      return apiPatch<SubmissionDetail>(`/submissions/${submissionId}/${action}`, {}, token);
    },
    onMutate: async (action) => {
      await queryClient.cancelQueries({ queryKey: ["admin-submission", submissionId] });
      const previous = queryClient.getQueryData<SubmissionDetail>(["admin-submission", submissionId]);
      queryClient.setQueryData<SubmissionDetail | null>(["admin-submission", submissionId], (old) =>
        old ? { ...old, status: action === "accept" ? "APPROVED" : "REJECTED" } : null,
      );
      return { previous };
    },
    onError: (_err, _action, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["admin-submission", submissionId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-submission", submissionId] });
    },
  });

  if (isLoading) {
    return <main className="mx-auto max-w-3xl px-6 py-12"><CardSkeleton /></main>;
  }

  if (!submission) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-xl font-semibold">Submission not found</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-12">
      <div className="glass rounded-3xl p-8" style={{ animation: "slideUp 0.5s ease-out" }}>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-bold gradient-text">Submission Detail</h1>
          <AutoStatusBadge status={submission.status} />
        </div>
        <div className="mt-4 space-y-1" style={{ color: "var(--text-secondary)" }}>
          <p><span className="font-medium" style={{ color: "var(--text-primary)" }}>{submission.fullName}</span></p>
          <p>{submission.email}</p>
          <p>Category: <span className="badge badge-accent capitalize ml-1">{submission.category}</span></p>
        </div>
      </div>

      <div className="glass rounded-2xl p-6" style={{ animation: "slideUp 0.5s ease-out 0.1s both" }}>
        <h2 className="text-sm font-medium mb-2" style={{ color: "var(--text-muted)" }}>SUBMISSION MESSAGE</h2>
        <p className="leading-relaxed" style={{ color: "var(--text-secondary)" }}>{submission.message}</p>
      </div>

      <div className="flex gap-3" style={{ animation: "slideUp 0.5s ease-out 0.2s both" }}>
        <button
          className="btn-gradient"
          style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
          onClick={() => mutation.mutate("accept")}
          disabled={mutation.isPending}
          type="button"
        >
          Accept
        </button>
        <button
          className="btn-gradient"
          style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}
          onClick={() => mutation.mutate("reject")}
          disabled={mutation.isPending}
          type="button"
        >
          Reject
        </button>
      </div>
    </main>
  );
}
