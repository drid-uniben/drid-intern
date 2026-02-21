"use client";

import { FormEvent, use, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { apiGet, apiPost } from "@/lib/api";
import { useAuthToken } from "@/hooks/useAuth";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";

interface SubmissionDetail {
  id: string;
  fullName: string;
  category: string;
  message: string;
}

export default function ReviewerSubmissionPage({ params }: { params: Promise<{ submissionId: string }> }) {
  const { submissionId } = use(params);
  const token = useAuthToken();
  const [rating, setRating] = useState("8");
  const [comment, setComment] = useState("");
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const { data: submission, isLoading } = useQuery({
    queryKey: ["reviewer-submission", submissionId],
    queryFn: async () => {
      const result = await apiGet<SubmissionDetail>(`/submissions/${submissionId}`, token);
      return result.success && result.data ? result.data : null;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      return apiPost("/reviews", {
        submissionId,
        rating: Number(rating),
        comment,
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
        <h1 className="text-3xl font-bold gradient-text">Review Submission</h1>
        <div className="mt-4 space-y-1" style={{ color: "var(--text-secondary)" }}>
          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{submission.fullName}</p>
          <p><span className="badge badge-accent capitalize">{submission.category}</span></p>
        </div>
      </div>

      <div className="glass rounded-2xl p-6" style={{ animation: "slideUp 0.5s ease-out 0.1s both" }}>
        <h2 className="text-sm font-medium mb-2" style={{ color: "var(--text-muted)" }}>SUBMISSION MESSAGE</h2>
        <p className="leading-relaxed" style={{ color: "var(--text-secondary)" }}>{submission.message}</p>
      </div>

      <div className="glass rounded-2xl p-6" style={{ animation: "slideUp 0.5s ease-out 0.2s both" }}>
        <h2 className="text-lg font-semibold mb-4">Your Review</h2>
        <form className="space-y-4" onSubmit={submitReview}>
          <div>
            <label htmlFor="review-rating" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Rating (1-10)
            </label>
            <input
              id="review-rating"
              className="input-glass"
              type="number"
              min={1}
              max={10}
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="review-comment" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Comment
            </label>
            <textarea
              id="review-comment"
              className="input-glass"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Your review comments..."
              required
              style={{ resize: "vertical" }}
            />
          </div>
          <button className="btn-gradient w-full" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Submitting..." : "Submit review"}
          </button>

          <AnimatePresence>
            {resultMessage && (
              <m.p
                className="text-sm rounded-lg p-3"
                style={{
                  background: isSuccess ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                  color: isSuccess ? "var(--success-color)" : "var(--error-color)",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {resultMessage}
              </m.p>
            )}
          </AnimatePresence>
        </form>
      </div>
    </main>
  );
}
