"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";

interface SubmissionDetail {
  id: string;
  fullName: string;
  category: string;
  message: string;
}

export default function ReviewerSubmissionPage({ params }: { params: Promise<{ submissionId: string }> }) {
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [rating, setRating] = useState("8");
  const [comment, setComment] = useState("");
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ submissionId }) => {
      const token = localStorage.getItem("accessToken") ?? undefined;
      apiGet<SubmissionDetail>(`/submissions/${submissionId}`, token).then((result) => {
        if (result.success && result.data) {
          setSubmission(result.data);
        }
      });
    });
  }, [params]);

  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!submission) {
      return;
    }

    const token = localStorage.getItem("accessToken") ?? undefined;
    const result = await apiPost("/reviews", {
      submissionId: submission.id,
      rating: Number(rating),
      comment,
    }, token);

    setResultMessage(result.success ? "Review submitted" : result.error ?? "Failed to submit review");
  };

  if (!submission) {
    return <main className="mx-auto max-w-3xl px-6 py-12">Loading submission...</main>;
  }

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-6 py-12">
      <h1 className="text-3xl font-bold">Review Submission</h1>
      <p className="font-semibold">{submission.fullName}</p>
      <p className="capitalize text-slate-600">{submission.category}</p>
      <p className="rounded border border-slate-300 p-3">{submission.message}</p>
      <form className="space-y-3" onSubmit={submitReview}>
        <input className="w-full rounded border border-slate-300 p-2" type="number" min={1} max={10} value={rating} onChange={(event) => setRating(event.target.value)} required />
        <textarea className="w-full rounded border border-slate-300 p-2" rows={4} value={comment} onChange={(event) => setComment(event.target.value)} required />
        <button className="rounded bg-slate-900 px-4 py-2 text-white" type="submit">Submit review</button>
      </form>
      {resultMessage ? <p>{resultMessage}</p> : null}
    </main>
  );
}
