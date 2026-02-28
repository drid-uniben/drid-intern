"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthedQuery } from "@/hooks/useAuthedQuery";
import { useAuthToken } from "@/hooks/useAuth";
import { apiGet, apiPost } from "@/lib/api";
import { ChallengeCategory, Cohort, OutboundEmailHistoryItem, SubmissionStatus } from "@/types/domain";

type AudienceResponse = {
  count: number;
  recipients: {
    submissionId: string;
    fullName: string;
    email: string;
    category: string;
    status: SubmissionStatus;
  }[];
};

const statusOptions: { label: string; value: "" | SubmissionStatus }[] = [
  { label: "All statuses", value: "" },
  { label: "Accepted", value: "accepted" },
  { label: "Under Review", value: "under_review" },
  { label: "Submitted", value: "submitted" },
  { label: "Rejected", value: "rejected" },
];

export default function AdminEmailsPage() {
  const token = useAuthToken();
  const queryClient = useQueryClient();

  const [cohortId, setCohortId] = useState("");
  const [status, setStatus] = useState<"" | SubmissionStatus>("accepted");
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("Congratulations from DRID Internship");
  const [html, setHtml] = useState("<p>Hello,</p><p>Congratulations! You have been successful in the DRID internship process.</p><p>Regards,<br/>DRID Team</p>");
  const [sendFeedback, setSendFeedback] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  const { data: cohorts = [] } = useAuthedQuery<Cohort[]>({
    queryKey: ["admin-cohorts"],
    queryFn: async (authToken) => {
      const result = await apiGet<Cohort[]>("/cohorts", authToken);
      return result.success && result.data ? result.data : [];
    },
  });

  const { data: categories = [] } = useAuthedQuery<ChallengeCategory[]>({
    queryKey: ["challenge-categories"],
    queryFn: async () => {
      const result = await apiGet<ChallengeCategory[]>("/challenge-categories");
      return result.success && result.data ? result.data : [];
    },
  });

  const audienceQuery = useAuthedQuery<AudienceResponse>({
    queryKey: ["admin-email-audience", cohortId, status, category],
    enabled: !!cohortId,
    queryFn: async (authToken) => {
      const params = new URLSearchParams();
      params.set("cohortId", cohortId);
      if (status) params.set("status", status);
      if (category) params.set("category", category);
      const result = await apiGet<AudienceResponse>(`/admin/email-campaigns/audience?${params.toString()}`, authToken);
      return result.success && result.data ? result.data : { count: 0, recipients: [] };
    },
  });

  const { data: history = [] } = useAuthedQuery<OutboundEmailHistoryItem[]>({
    queryKey: ["admin-email-history", cohortId],
    queryFn: async (authToken) => {
      const query = cohortId ? `?cohortId=${cohortId}` : "";
      const result = await apiGet<OutboundEmailHistoryItem[]>(`/admin/email-campaigns${query}`, authToken);
      return result.success && result.data ? result.data : [];
    },
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      return apiPost<OutboundEmailHistoryItem>(
        "/admin/email-campaigns/send",
        {
          cohortId,
          status: status || undefined,
          category: category || undefined,
          subject,
          html,
        },
        token,
      );
    },
    onSuccess: async (result) => {
      if (result.success && result.data) {
        setSendFeedback({
          kind: "success",
          message: `Email campaign saved. Sent: ${result.data.sentCount}, Failed: ${result.data.failedCount}.`,
        });
        await queryClient.invalidateQueries({ queryKey: ["admin-email-history"] });
      } else {
        setSendFeedback({ kind: "error", message: result.error ?? "Failed to send emails" });
      }
    },
  });

  const selectedCohort = useMemo(() => cohorts.find((item) => item.id === cohortId), [cohorts, cohortId]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSendFeedback(null);
    if (!cohortId) {
      setSendFeedback({ kind: "error", message: "Please select a cohort before sending." });
      return;
    }
    sendMutation.mutate();
  };

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 space-y-8">
      <header>
        <h1 className="text-3xl font-bold">
          Bulk <span className="gradient-text">Email Campaigns</span>
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          Filter recipients by cohort, submission status, and category. Compose with HTML and preview before sending.
        </p>
      </header>

      <form className="glass rounded-2xl p-6 space-y-5" onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="campaign-cohort" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Cohort
            </label>
            <select
              id="campaign-cohort"
              className="input-glass"
              value={cohortId}
              onChange={(e) => setCohortId(e.target.value)}
              required
            >
              <option value="">Select cohort</option>
              {cohorts.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.year} Cohort {item.cohortNumber}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="campaign-status" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Submission status
            </label>
            <select id="campaign-status" className="input-glass" value={status} onChange={(e) => setStatus(e.target.value as "" | SubmissionStatus)}>
              {statusOptions.map((item) => (
                <option key={item.value || "all"} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="campaign-category" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Challenge category
            </label>
            <select id="campaign-category" className="input-glass" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] p-4 text-sm">
          <p>
            Audience preview: <span className="font-semibold">{audienceQuery.data?.count ?? 0}</span> recipient(s)
            {selectedCohort ? ` in ${selectedCohort.year} Cohort ${selectedCohort.cohortNumber}` : ""}
          </p>
        </div>

        <div>
          <label htmlFor="campaign-subject" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Email subject
          </label>
          <input
            id="campaign-subject"
            className="input-glass"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            minLength={3}
            maxLength={160}
            required
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label htmlFor="campaign-html" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              HTML content
            </label>
            <textarea
              id="campaign-html"
              className="input-glass"
              rows={14}
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              required
              style={{ resize: "vertical" }}
            />
          </div>

          <div>
            <p className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              HTML preview
            </p>
            <div className="glass rounded-xl p-4 min-h-[330px] overflow-auto border border-[var(--glass-border)]" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>

        <button className="btn-gradient" type="submit" disabled={sendMutation.isPending || !cohortId}>
          {sendMutation.isPending ? "Sending..." : "Send campaign"}
        </button>

        {sendFeedback && (
          <p
            className="text-sm rounded-lg p-3"
            style={{
              background: sendFeedback.kind === "success" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
              color: sendFeedback.kind === "success" ? "var(--success-color)" : "var(--error-color)",
            }}
          >
            {sendFeedback.message}
          </p>
        )}
      </form>

      <section className="glass rounded-2xl p-6">
        <h2 className="text-xl font-semibold">Sent Email History</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--glass-border)] text-sm text-[var(--text-muted)]">
                <th className="py-3 pr-4">When</th>
                <th className="py-3 pr-4">Subject</th>
                <th className="py-3 pr-4">Filters</th>
                <th className="py-3 pr-4">Delivery</th>
                <th className="py-3">Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--glass-border)]">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-[var(--text-muted)]">No campaigns sent yet.</td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 pr-4 text-sm">{new Date(item.createdAt).toLocaleString()}</td>
                    <td className="py-3 pr-4 text-sm">{item.subject}</td>
                    <td className="py-3 pr-4 text-sm">
                      <div>{item.cohortLabel}</div>
                      <div style={{ color: "var(--text-secondary)" }}>
                        {item.filters.status ?? "all statuses"} • {item.filters.category ?? "all categories"}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-sm">
                      Sent {item.sentCount}/{item.attemptedCount}
                      {item.failedCount > 0 ? ` (${item.failedCount} failed)` : ""}
                    </td>
                    <td className="py-3 text-sm">
                      <details>
                        <summary className="cursor-pointer text-[var(--accent-start)]">View HTML</summary>
                        <div className="mt-3 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] p-3 max-h-48 overflow-auto" dangerouslySetInnerHTML={{ __html: item.htmlBody }} />
                      </details>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
