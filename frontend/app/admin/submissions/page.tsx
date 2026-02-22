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

interface Reviewer {
  id: string;
  fullName: string;
  email: string;
}

export default function AdminSubmissionsPage() {
  const token = useAuthToken();
  const queryClient = useQueryClient();
  const authInitialized = useAppStore((state) => state.authInitialized);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedReviewerId, setSelectedReviewerId] = useState<string>("");

  const { data: submissions = [], isLoading: isLoadingSubmissions } = useAuthedQuery<SubmissionItem[]>({
    queryKey: ["admin-submissions"],
    queryFn: async (token) => {
      const result = await apiGet<SubmissionItem[]>("/submissions", token);
      return result.success && result.data ? result.data : [];
    },
  });

  const { data: users = [] } = useAuthedQuery<Reviewer[]>({
    queryKey: ["admin-users"],
    queryFn: async (token) => {
      const result = await apiGet<any[]>("/users", token);
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

  const isLoading = isLoadingSubmissions;

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4" style={{ animation: "fadeIn 0.5s ease-out" }}>
        <h1 className="text-3xl font-bold">
          <span className="gradient-text">Submissions</span>
        </h1>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 p-2 bg-[var(--glass-bg-subtle)] border border-[var(--glass-border)] rounded-xl shadow-sm backdrop-blur-md" style={{ animation: "slideInLeft 0.3s ease-out" }}>
            <span className="text-sm font-medium px-2">{selectedIds.size} selected</span>
            <select
              className="input-glass !py-1.5 !px-3 text-sm min-w-[150px]"
              value={selectedReviewerId}
              onChange={(e) => setSelectedReviewerId(e.target.value)}
            >
              <option value="" disabled>Assign to...</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.fullName}</option>
              ))}
            </select>
            <button
              className="btn-gradient !py-1.5 !px-4 text-sm"
              disabled={!selectedReviewerId || assignMutation.isPending}
              onClick={() => assignMutation.mutate()}
            >
              {assignMutation.isPending ? "Assigning..." : "Assign"}
            </button>
          </div>
        )}
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
        </m.div>
      )}
    </main>
  );
}
