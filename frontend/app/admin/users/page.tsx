"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { apiGet, apiPatch } from "@/lib/api";
import { AdminUser, UserRole } from "@/types/domain";
import { useAuthToken } from "@/hooks/useAuth";
import { useAuthedQuery } from "@/hooks/useAuthedQuery";
import { ListSkeleton } from "@/components/ui/LoadingSkeleton";
import { AutoStatusBadge } from "@/components/ui/StatusBadge";
import { useAppStore } from "@/lib/store";

export default function AdminUsersPage() {
  const token = useAuthToken();
  const authInitialized = useAppStore((state) => state.authInitialized);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useAuthedQuery<AdminUser[]>({
    queryKey: ["admin-users"],
    queryFn: async (token) => {
      const result = await apiGet<AdminUser[]>("/users", token);
      return result.success && result.data ? result.data : [];
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ userId, action, payload }: { userId: string; action: string; payload: Record<string, unknown> }) => {
      if (action === "approve" || action === "reject") {
        return apiPatch(`/users/${userId}/${action}`, {}, token);
      }
      return apiPatch(`/users/${userId}`, payload, token);
    },
    onMutate: async ({ userId, action, payload }) => {
      await queryClient.cancelQueries({ queryKey: ["admin-users"] });
      const previous = queryClient.getQueryData<AdminUser[]>(["admin-users"]);

      queryClient.setQueryData<AdminUser[]>(["admin-users"], (old) =>
        (old ?? []).map((user) => {
          if (user.id !== userId) return user;
          if (action === "approve") return { ...user, approvedByAdmin: true };
          if (action === "reject") return { ...user, isActive: false };
          return { ...user, ...payload };
        }),
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["admin-users"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const approve = (userId: string) => mutation.mutate({ userId, action: "approve", payload: {} });
  const reject = (userId: string) => mutation.mutate({ userId, action: "reject", payload: {} });
  const updateUser = (userId: string, payload: Partial<Pick<AdminUser, "role" | "isActive" | "fullName">>) =>
    mutation.mutate({ userId, action: "update", payload });

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold" style={{ animation: "fadeIn 0.5s ease-out" }}>
        User <span className="gradient-text">Management</span>
      </h1>

      {!authInitialized || isLoading ? (
        <div className="mt-6"><ListSkeleton count={5} /></div>
      ) : (
        <div className="mt-6 space-y-3">
          <AnimatePresence>
            {users.map((user, i) => (
              <m.div
                key={user.id}
                className="glass rounded-2xl p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="space-y-1">
                  <p className="font-semibold">{user.fullName}</p>
                  <div className="flex flex-wrap items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <span>{user.email}</span>
                    <AutoStatusBadge status={user.role} />
                    <span className={`badge ${user.isActive ? "badge-success" : "badge-error"}`}>
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    className="input-glass !w-auto !py-1.5 !px-2 !text-sm !rounded-lg"
                    value={user.role}
                    onChange={(e) => updateUser(user.id, { role: e.target.value as UserRole })}
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="REVIEWER">REVIEWER</option>
                    <option value="INTERN">INTERN</option>
                  </select>
                  <button
                    className="btn-glass !py-1.5 !px-3 !text-sm !rounded-lg"
                    onClick={() => updateUser(user.id, { isActive: !user.isActive })}
                    type="button"
                  >
                    {user.isActive ? "Deactivate" : "Activate"}
                  </button>
                  {!user.approvedByAdmin && (
                    <button
                      className="btn-gradient !py-1.5 !px-3 !text-sm !rounded-lg"
                      style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
                      onClick={() => approve(user.id)}
                      type="button"
                    >
                      Approve
                    </button>
                  )}
                  <button
                    className="btn-gradient !py-1.5 !px-3 !text-sm !rounded-lg"
                    style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}
                    onClick={() => reject(user.id)}
                    type="button"
                  >
                    Reject
                  </button>
                </div>
              </m.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </main>
  );
}
