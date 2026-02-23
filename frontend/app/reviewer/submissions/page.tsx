"use client";

import Link from "next/link";
import { useState } from "react";
import * as m from "motion/react-m";
import { apiGet } from "@/lib/api";
import { useAuthedQuery } from "@/hooks/useAuthedQuery";
import { ListSkeleton } from "@/components/ui/LoadingSkeleton";
import { AutoStatusBadge } from "@/components/ui/StatusBadge";
import { useAppStore } from "@/lib/store";

interface QueueItem {
  id: string;
  fullName: string;
  category: string;
  status: string;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export default function ReviewerQueuePage() {
  const authInitialized = useAppStore((state) => state.authInitialized);
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: queryResult, isLoading } = useAuthedQuery<PaginatedResponse<QueueItem>>({
    queryKey: ["reviewer-queue", page],
    queryFn: async (token) => {
      const result = await apiGet<QueueItem[]>(`/submissions?page=${page}&limit=${limit}`, token);
      return result.success && result.data
        ? { data: result.data, meta: result.meta as NonNullable<PaginatedResponse<QueueItem>['meta']> }
        : { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 } };
    },
  });

  const items: QueueItem[] = queryResult?.data || [];
  const meta = queryResult?.meta || { total: 0, page: 1, limit: 10, totalPages: 1 };

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-center justify-between mb-8" style={{ animation: "fadeIn 0.5s ease-out" }}>
        <h1 className="text-3xl font-bold">
          Review <span className="gradient-text">Queue</span>
        </h1>
        {/* Reviewers don't have bulk assignment, but could have bulk actions like Mark as Reviewed in future */}
      </div>

      {!authInitialized || isLoading ? (
        <div className="mt-6"><ListSkeleton count={5} /></div>
      ) : (
        <m.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl overflow-hidden shadow-lg border border-[var(--glass-border)]"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] text-sm uppercase tracking-wider text-[var(--text-muted)]">
                  <th className="px-6 py-4 font-semibold">Applicant</th>
                  <th className="px-6 py-4 font-semibold">Track</th>
                  <th className="px-6 py-4 font-semibold">Submission Status</th>
                  <th className="px-6 py-4 font-semibold">Review Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--glass-border)]">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-muted)]">
                      No submissions assigned to you yet.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr
                      key={item.id}
                      className="group transition-colors hover:bg-[var(--glass-bg-subtle)]"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-[var(--text-primary)]">{item.fullName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="badge badge-accent capitalize text-xs">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <AutoStatusBadge status={item.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.status === "under_review" || item.status === "accepted" || item.status === "rejected" ? (
                          <span className="text-green-500 font-medium text-sm flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Reviewed
                          </span>
                        ) : (
                          <span className="text-yellow-500 font-medium text-sm flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <Link
                          href={`/reviewer/submissions/${item.id}`}
                          className="inline-flex items-center gap-1 text-[var(--accent-start)] font-medium hover:underline"
                        >
                          Review <span aria-hidden="true">&rarr;</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--glass-border)] bg-[var(--glass-bg)]">
            <span className="text-sm text-[var(--text-secondary)]">
              Showing {items.length > 0 ? (meta.page - 1) * meta.limit + 1 : 0} to{" "}
              {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} results
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={meta.page <= 1}
                className="px-3 py-1.5 text-sm rounded bg-[var(--input-bg)] border border-[var(--glass-border)] disabled:opacity-50 hover:bg-[var(--glass-bg-subtle)] transition-colors text-[var(--text-primary)]"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={meta.page >= meta.totalPages}
                className="px-3 py-1.5 text-sm rounded bg-[var(--input-bg)] border border-[var(--glass-border)] disabled:opacity-50 hover:bg-[var(--glass-bg-subtle)] transition-colors text-[var(--text-primary)]"
              >
                Next
              </button>
            </div>
          </div>
        </m.div>
      )}
    </main>
  );
}
