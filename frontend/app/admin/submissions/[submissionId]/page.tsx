"use client";

import { use } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch } from "@/lib/api";
import { useAuthToken } from "@/hooks/useAuth";
import { useAuthedQuery } from "@/hooks/useAuthedQuery";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { AutoStatusBadge } from "@/components/ui/StatusBadge";
import { BackButton } from "@/components/ui/BackButton";
import { useAppStore } from "@/lib/store";
import { Review, Recommendation } from "@/types/domain";

interface SubmissionDetail {
  id: string;
  fullName: string;
  email: string;
  category: string;
  message: string;
  status: string;
  repoUrl?: string | null;
  liveLink?: string | null;
  designLinks?: string | null;
}

export default function AdminSubmissionDetailPage({ params }: { params: Promise<{ submissionId: string }> }) {
  const { submissionId } = use(params);
  const token = useAuthToken();
  const authInitialized = useAppStore((state) => state.authInitialized);
  const queryClient = useQueryClient();

  const { data: submission, isLoading: isLoadingSubmission } = useAuthedQuery<SubmissionDetail | null>({
    queryKey: ["admin-submission", submissionId],
    queryFn: async (token) => {
      const result = await apiGet<SubmissionDetail>(`/submissions/${submissionId}`, token);
      return result.success && result.data ? result.data : null;
    },
  });

  const { data: reviews = [], isLoading: isLoadingReviews } = useAuthedQuery<Review[]>({
    queryKey: ["admin-submission-reviews", submissionId],
    queryFn: async (token) => {
      const result = await apiGet<Review[]>(`/reviews/submission/${submissionId}`, token);
      return result.success && result.data ? result.data : [];
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
        old ? { ...old, status: action === "accept" ? "accepted" : "rejected" } : null,
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

  const isLoading = isLoadingSubmission || isLoadingReviews;

  if (!authInitialized || isLoading) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12">
        <BackButton fallbackHref="/admin/submissions" />
        <CardSkeleton />
      </main>
    );
  }

  if (!submission) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12">
        <BackButton fallbackHref="/admin/submissions" />
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-xl font-semibold">Submission not found</p>
        </div>
      </main>
    );
  }

  const isDesign = submission.category.toLowerCase().includes("design");

  const getRecommendationBadge = (rec: Recommendation | null | undefined) => {
    switch (rec) {
      case "RECOMMEND": return <span className="badge badge-success">Recommend</span>;
      case "NEUTRAL": return <span className="badge badge-warning">Neutral</span>;
      case "DO_NOT_RECOMMEND": return <span className="badge badge-error">Do Not Recommend</span>;
      default: return <span className="badge badge-accent">No Recommendation</span>;
    }
  };

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-6 py-12">
      <BackButton fallbackHref="/admin/submissions" />

      <div className="glass rounded-3xl p-8" style={{ animation: "slideUp 0.5s ease-out" }}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold gradient-text">Submission Detail</h1>
            <AutoStatusBadge status={submission.status} />
          </div>

          <div className="flex gap-3">
            <button
              className="btn-gradient"
              style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
              onClick={() => mutation.mutate("accept")}
              disabled={mutation.isPending}
              type="button"
            >
              Approve Intern
            </button>
            <button
              className="btn-gradient"
              style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}
              onClick={() => mutation.mutate("reject")}
              disabled={mutation.isPending}
              type="button"
            >
              Reject Intern
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-col md:flex-row md:items-center gap-x-8 gap-y-4 text-sm" style={{ color: "var(--text-secondary)" }}>
          <div>
            <span className="block text-[var(--text-muted)] uppercase tracking-wider text-xs mb-1">Applicant</span>
            <span className="font-medium text-[var(--text-primary)] text-base">{submission.fullName}</span>
            <span className="block mt-0.5">{submission.email}</span>
          </div>
          <div>
            <span className="block text-[var(--text-muted)] uppercase tracking-wider text-xs mb-1">Track</span>
            <span className="badge badge-accent capitalize">{submission.category}</span>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-4 pt-6 border-t border-[var(--glass-border)]">
          {submission.repoUrl && (
            <a href={submission.repoUrl} target="_blank" rel="noopener noreferrer" className="btn-glass text-sm">
              View Repository ↗
            </a>
          )}
          {submission.liveLink && (
            <a href={submission.liveLink} target="_blank" rel="noopener noreferrer" className="btn-glass text-sm">
              View Live Deployment ↗
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6" style={{ animation: "slideUp 0.5s ease-out 0.1s both" }}>
            <h2 className="text-sm font-medium mb-3 text-[var(--text-muted)] uppercase tracking-wider">Applicant Message</h2>
            <p className="leading-relaxed text-[var(--text-secondary)] whitespace-pre-wrap">{submission.message || "No message provided."}</p>
          </div>

          {submission.designLinks && (
            <div className="glass rounded-2xl p-6" style={{ animation: "slideUp 0.5s ease-out 0.15s both" }}>
              <h2 className="text-sm font-medium mb-3 text-[var(--text-muted)] uppercase tracking-wider">
                {isDesign ? "Design Links & Notes" : "Architecture Notes"}
              </h2>
              <p className="leading-relaxed text-[var(--text-secondary)] whitespace-pre-wrap">
                {submission.designLinks}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold px-2 gradient-text" style={{ animation: "fadeIn 0.5s ease-out 0.2s both" }}>Reviewer Feedback</h2>

          {reviews.length === 0 ? (
            <div className="glass rounded-2xl p-6 text-center text-[var(--text-muted)]" style={{ animation: "slideUp 0.5s ease-out 0.2s both" }}>
              No reviews have been submitted yet.
            </div>
          ) : (
            reviews.map((review, i) => (
              <div key={review.id} className="glass rounded-2xl p-6" style={{ animation: `slideUp 0.5s ease-out ${0.2 + (i * 0.05)}s both` }}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    {/* Can fetch the reviewer's name here if we mapped it, or just show ID/placeholder */}
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Review {i + 1}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="font-bold text-[var(--text-primary)] text-lg">{review.rating.toFixed(1)} / 10</span>
                    {getRecommendationBadge(review.recommendation)}
                  </div>
                </div>

                {review.criteriaScores && review.criteriaScores.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {review.criteriaScores.map((score: { label: string, score: number, comment?: string }) => (
                      <div key={score.label} className="bg-[var(--glass-bg-subtle)] px-3 py-2 rounded-lg flex justify-between items-center text-sm border border-[var(--glass-border)]">
                        <span className="text-[var(--text-secondary)] font-medium">{score.label}</span>
                        <span className="font-semibold text-[var(--text-primary)]">{score.score}/10</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t border-[var(--glass-border)]">
                  <h3 className="text-xs font-semibold mb-2 text-[var(--text-muted)] uppercase">General Comment:</h3>
                  <p className="text-sm italic text-[var(--text-secondary)]">&quot;{review.comment}&quot;</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
