"use client";

import { FormEvent, use, useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { apiGet, apiPost } from "@/lib/api";
import { useAuthToken } from "@/hooks/useAuth";
import { useAuthedQuery } from "@/hooks/useAuthedQuery";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { BackButton } from "@/components/ui/BackButton";
import { useAppStore } from "@/lib/store";
import { Recommendation } from "@/types/domain";

interface SubmissionDetail {
  id: string;
  fullName: string;
  category: string;
  message: string;
  repoUrl?: string | null;
  liveLink?: string | null;
  designLinks?: string | null;
}

const ENGINEERING_CRITERIA = [
  { id: "code_quality", label: "Code Quality" },
  { id: "architecture", label: "Architecture Decisions" },
  { id: "product", label: "Product Thinking" },
  { id: "documentation", label: "Documentation Clarity" },
];

const DESIGN_CRITERIA = [
  { id: "ux", label: "UX Quality" },
  { id: "visual", label: "Visual Consistency" },
  { id: "thinking", label: "Design Thinking" },
  { id: "rationale", label: "Rationale Clarity" },
];

export default function ReviewerSubmissionPage({ params }: { params: Promise<{ submissionId: string }> }) {
  const { submissionId } = use(params);
  const token = useAuthToken();
  const authInitialized = useAppStore((state) => state.authInitialized);

  const [scores, setScores] = useState<Record<string, { score: number; comment: string }>>({});
  const [generalComment, setGeneralComment] = useState("");
  const [recommendation, setRecommendation] = useState<Recommendation | "">("");
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const { data: submission, isLoading } = useAuthedQuery<SubmissionDetail | null>({
    queryKey: ["reviewer-submission", submissionId],
    queryFn: async (token) => {
      const result = await apiGet<SubmissionDetail>(`/submissions/${submissionId}`, token);
      return result.success && result.data ? result.data : null;
    },
  });

  const isDesign = submission?.category?.toLowerCase().includes("design");
  const activeCriteria = isDesign ? DESIGN_CRITERIA : ENGINEERING_CRITERIA;

  const mutation = useMutation({
    mutationFn: async () => {
      const criteriaScores = activeCriteria.map(c => ({
        label: c.label,
        score: scores[c.id]?.score || 0,
        comment: scores[c.id]?.comment || "",
      }));

      return apiPost("/reviews", {
        submissionId,
        rating: 0, // Backend calculates average
        criteriaScores,
        recommendation: recommendation || null,
        comment: generalComment,
      }, token);
    },
    onSuccess: (result) => {
      if (result.success) {
        setResultMessage("Review submitted successfully! ✅");
        setIsSuccess(true);
      } else {
        setResultMessage(result.error ?? "Failed to submit review");
        setIsSuccess(false);
      }
    },
  });

  const submitReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResultMessage(null);
    mutation.mutate();
  };

  const handleScoreChange = (id: string, field: "score" | "comment", value: string | number) => {
    setScores(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        score: field === "score" ? Number(value) : (prev[id]?.score || 0),
        comment: field === "comment" ? String(value) : (prev[id]?.comment || ""),
      }
    }));
  };

  if (!authInitialized || isLoading) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <BackButton fallbackHref="/reviewer" />
        <CardSkeleton />
      </main>
    );
  }

  if (!submission) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <BackButton fallbackHref="/reviewer" />
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-xl font-semibold">Submission not found</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-6 py-12">
      <BackButton fallbackHref="/reviewer/submissions" />
      <div className="glass rounded-3xl p-8" style={{ animation: "slideUp 0.5s ease-out" }}>
        <h1 className="text-3xl font-bold gradient-text">Review Submission</h1>
        <div className="mt-4 flex items-center gap-4">
          <p className="text-xl font-semibold text-[var(--text-primary)]">{submission.fullName}</p>
          <span className="badge badge-accent capitalize">{submission.category}</span>
        </div>

        <div className="mt-6 flex flex-wrap gap-4">
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

        <div className="glass rounded-2xl p-6" style={{ animation: "slideUp 0.5s ease-out 0.2s both" }}>
          <h2 className="text-lg font-bold mb-6 gradient-text">Scoring Rubric</h2>
          <form className="space-y-8" onSubmit={submitReview}>

            <div className="space-y-6">
              {activeCriteria.map((criteria) => (
                <div key={criteria.id} className="p-4 rounded-xl bg-[var(--glass-bg-subtle)] border border-[var(--glass-border)] space-y-3">
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-semibold text-[var(--text-primary)]">{criteria.label}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="10"
                        required
                        className="input-glass !w-18 text-center !py-1"
                        placeholder="1-10"
                        value={scores[criteria.id]?.score || ""}
                        onChange={(e) => handleScoreChange(criteria.id, "score", e.target.value)}
                      />
                      <span className="text-sm text-[var(--text-muted)]">/ 10</span>
                    </div>
                  </div>
                  <input
                    type="text"
                    className="input-glass text-sm"
                    placeholder="Optional comment on this specific criteria..."
                    value={scores[criteria.id]?.comment || ""}
                    onChange={(e) => handleScoreChange(criteria.id, "comment", e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[var(--glass-border)] space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
                  Final Recommendation
                </label>
                <select
                  required
                  className="input-glass w-full"
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value as Recommendation)}
                >
                  <option value="" disabled>Select a recommendation...</option>
                  <option value="RECOMMEND">🟢 Recommend for Next Stage</option>
                  <option value="NEUTRAL">🟡 Neutral / Borderline</option>
                  <option value="DO_NOT_RECOMMEND">🔴 Do Not Recommend</option>
                </select>
                <p className="text-xs text-[var(--text-muted)] mt-1.5">* This is a recommendation, admins make the final decision.</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-[var(--text-secondary)]">
                  Overall Feedback
                </label>
                <textarea
                  className="input-glass w-full"
                  rows={3}
                  value={generalComment}
                  onChange={(e) => setGeneralComment(e.target.value)}
                  placeholder="Summary of your thoughts..."
                  required
                  style={{ resize: "vertical" }}
                />
              </div>
            </div>

            <button className="btn-gradient w-full py-3" type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Submitting Review..." : "Submit Complete Review"}
            </button>

            <AnimatePresence>
              {resultMessage && (
                <m.div
                  className="text-sm rounded-xl p-4 border border-[var(--glass-border)]"
                  style={{
                    background: isSuccess ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                    color: isSuccess ? "var(--success-color)" : "var(--error-color)",
                  }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {resultMessage}
                </m.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </div>
    </main>
  );
}
