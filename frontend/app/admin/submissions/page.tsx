"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as m from "motion/react-m";
import { apiGet, apiPost } from "@/lib/api";
import { useAuthToken } from "@/hooks/useAuth";
import { useAuthedQuery } from "@/hooks/useAuthedQuery";
import { ListSkeleton } from "@/components/ui/LoadingSkeleton";
import { AutoStatusBadge } from "@/components/ui/StatusBadge";
import { useAppStore } from "@/lib/store";

interface SubmissionItem {
  id: string;
  fullName: string;
  email: string;
  category: string;
  status: string;
  assignedReviewerId?: string | null;
  averageRating?: number | null;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

interface Reviewer {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export default function AdminSubmissionsPage() {
  const token = useAuthToken();
  const queryClient = useQueryClient();
  const authInitialized = useAppStore((state) => state.authInitialized);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedReviewerId, setSelectedReviewerId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: queryResult, isLoading: isLoadingSubmissions } = useAuthedQuery<PaginatedResponse<SubmissionItem>>({
    queryKey: ["admin-submissions", statusFilter, searchQuery, page],
    queryFn: async (token) => {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (searchQuery) params.append("search", searchQuery);
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      const query = params.toString() ? `?${params.toString()}` : "";
      const result = await apiGet<SubmissionItem[]>(`/submissions${query}`, token);
      return result.success && result.data 
        ? { data: result.data, meta: result.meta as NonNullable<PaginatedResponse<SubmissionItem>['meta']> } 
        : { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 } };
    },
  });

  const submissions = queryResult?.data || [];
  const meta = queryResult?.meta || { total: 0, page: 1, limit: 10, totalPages: 1 };

  const { data: users = [] } = useAuthedQuery<Reviewer[]>({
    queryKey: ["admin-users"],
    queryFn: async (token) => {
      const result = await apiGet<Reviewer[]>("/users", token);
      return result.success && result.data
        ? result.data.filter(u => u.role === "REVIEWER" || u.role === "ADMIN")
        : [];
    },
  });

  const assignMutation = useMutation({
    mutationFn: async () => {
      return apiPost("/submissions/bulk-assign", {
        submissionIds: Array.from(selectedIds),
        reviewerId: selectedReviewerId,
      }, token);
    },
    onSuccess: (res) => {
      if (res.success) {
        setSelectedIds(new Set());
        setSelectedReviewerId("");
        queryClient.invalidateQueries({ queryKey: ["admin-submissions"] });
      } else {
        alert(res.error || "Failed to assign reviewers");
      }
    },
  });

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleAll = () => {
    if (selectedIds.size === submissions.length) {
      setSelectedIds(newSet => { newSet.clear(); return new Set() });
    } else {
      setSelectedIds(new Set(submissions.map(s => s.id)));
    }
  };

  const getReviewerName = (reviewerId?: string | null) => {
    if (!reviewerId) return "Unassigned";
    const reviewer = users.find(u => u.id === reviewerId);
    return reviewer ? reviewer.fullName : "Unknown";
  };

  const exportMutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("No auth token");

      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (searchQuery) params.append("search", searchQuery);

      const query = params.toString() ? `?${params.toString()}` : "";
      const url = `/api/proxy/submissions/export${query}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      return response;
    },

    onSuccess: async (response) => {
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = downloadUrl;

      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "submissions_export.csv";

      if (contentDisposition?.includes("filename=")) {
        filename = contentDisposition
          .split("filename=")[1]
          .replace(/"/g, "");
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    },

    onError: (error: unknown) => {
      if (error instanceof Error) {
        alert(`Failed to export: ${error.message}`);
        return;
      }

      alert("Failed to export: Unexpected error during export");
    },
  });

  const isLoading = isLoadingSubmissions;

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      {/* Page Header */}
      <div className="mb-8" style={{ animation: "fadeIn 0.5s ease-out" }}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">
            <span className="gradient-text">Submissions</span>
          </h1>

          <button
            className="btn-glass !py-2 !px-4 text-sm flex items-center gap-2"
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
          >
            {exportMutation.isPending ? "Exporting..." : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export CSV
              </>
            )}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative w-full md:max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name or email..."
              className="input-glass !py-2 !pl-9 !pr-3 text-sm w-full"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1); // Reset page on query
              }}
            />
          </div>

          <select
            className="input-glass !py-2 !px-3 text-sm w-full md:w-48"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1); // Reset page on filter
            }}
          >
            <option value="">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div
          className="mb-6 flex items-center justify-between gap-4 p-3 bg-[var(--glass-bg-subtle)] border border-[var(--glass-border)] rounded-xl shadow-sm"
          style={{ animation: "slideInLeft 0.3s ease-out" }}
        >
          <span className="text-sm font-medium">
            {selectedIds.size} selected
          </span>

          <div className="flex items-center gap-2">
            <select
              className="input-glass !py-2 !px-3 text-sm min-w-[160px]"
              value={selectedReviewerId}
              onChange={(e) => setSelectedReviewerId(e.target.value)}
            >
              <option value="" disabled>Assign to...</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.fullName}
                </option>
              ))}
            </select>

            <button
              className="btn-gradient !py-2 !px-4 text-sm"
              disabled={!selectedReviewerId || assignMutation.isPending}
              onClick={() => assignMutation.mutate()}
            >
              {assignMutation.isPending ? "Assigning..." : "Assign"}
            </button>
          </div>
        </div>
      )}

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
                  <th className="px-5 py-4 w-12 text-center">
                    <input
                      type="checkbox"
                      className="rounded border-[var(--glass-border)] bg-[var(--input-bg)] focus:ring-[var(--glow-color)] text-[var(--accent-start)] cursor-pointer"
                      checked={submissions.length > 0 && selectedIds.size === submissions.length}
                      onChange={toggleAll}
                    />
                  </th>
                  <th className="px-6 py-4 font-semibold">Applicant</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Assigned To</th>
                  <th className="px-6 py-4 font-semibold">Score</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--glass-border)]">
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[var(--text-muted)]">
                      No submissions found.
                    </td>
                  </tr>
                ) : (
                  submissions.map((item) => (
                    <tr
                      key={item.id}
                      className={`group transition-colors hover:bg-[var(--glass-bg-subtle)] ${selectedIds.has(item.id) ? 'bg-[var(--glass-bg-subtle)]' : ''}`}
                    >
                      <td className="px-5 py-4 w-12 text-center">
                        <input
                          type="checkbox"
                          className="rounded border-[var(--glass-border)] bg-[var(--input-bg)] focus:ring-[var(--glow-color)] text-[var(--accent-start)] cursor-pointer"
                          checked={selectedIds.has(item.id)}
                          onChange={() => toggleSelection(item.id)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-[var(--text-primary)]">{item.fullName}</div>
                        <div className="text-xs text-[var(--text-secondary)] mt-1">{item.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-2 items-start">
                          <span className="badge badge-accent capitalize text-xs">
                            {item.category}
                          </span>
                          <AutoStatusBadge status={item.status} />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {item.assignedReviewerId ? (
                          <div className="flex items-center gap-2 text-[var(--text-primary)]">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--accent-start)] to-[var(--accent-end)] flex items-center justify-center text-white text-xs font-bold uppercase">
                              {getReviewerName(item.assignedReviewerId).charAt(0)}
                            </div>
                            {getReviewerName(item.assignedReviewerId)}
                          </div>
                        ) : (
                          <span className="text-[var(--text-muted)] italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {item.averageRating ? (
                          <span className="text-[var(--text-primary)]">{item.averageRating.toFixed(1)} / 10</span>
                        ) : (
                          <span className="text-[var(--text-muted)]">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <Link
                          href={`/admin/submissions/${item.id}`}
                          className="inline-flex items-center gap-1 text-[var(--accent-start)] font-medium hover:underline"
                        >
                          View <span aria-hidden="true">&rarr;</span>
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
              Showing {submissions.length > 0 ? (meta.page - 1) * meta.limit + 1 : 0} to{" "}
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
