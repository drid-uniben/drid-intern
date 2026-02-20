"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPatch } from "@/lib/api";

interface SubmissionDetail {
  id: string;
  fullName: string;
  email: string;
  category: string;
  message: string;
  status: string;
}

export default function AdminSubmissionDetailPage({ params }: { params: Promise<{ submissionId: string }> }) {
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);

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

  const updateStatus = async (action: "accept" | "reject") => {
    if (!submission) {
      return;
    }

    const token = localStorage.getItem("accessToken") ?? undefined;
    const result = await apiPatch<SubmissionDetail>(`/submissions/${submission.id}/${action}`, {}, token);
    if (result.success && result.data) {
      setSubmission(result.data);
    }
  };

  if (!submission) {
    return <main className="mx-auto max-w-3xl px-6 py-12">Loading submission...</main>;
  }

  return (
    <main className="mx-auto max-w-3xl space-y-3 px-6 py-12">
      <h1 className="text-3xl font-bold">Submission Detail</h1>
      <p>{submission.fullName} · {submission.email}</p>
      <p className="capitalize">Category: {submission.category}</p>
      <p>Status: {submission.status}</p>
      <p className="rounded border border-slate-300 p-3">{submission.message}</p>
      <div className="flex gap-3">
        <button className="rounded bg-emerald-700 px-3 py-2 text-white" onClick={() => updateStatus("accept")}>Accept</button>
        <button className="rounded bg-red-700 px-3 py-2 text-white" onClick={() => updateStatus("reject")}>Reject</button>
      </div>
    </main>
  );
}
