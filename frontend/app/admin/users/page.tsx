"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPatch } from "@/lib/api";
import { AdminUser, UserRole } from "@/types/domain";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);

  const reload = async () => {
    const token = localStorage.getItem("accessToken") ?? undefined;
    const result = await apiGet<AdminUser[]>("/users", token);
    if (result.success && result.data) {
      setUsers(result.data);
    }
  };

  useEffect(() => {
    let active = true;
    void (async () => {
      const token = localStorage.getItem("accessToken") ?? undefined;
      const result = await apiGet<AdminUser[]>("/users", token);
      if (active && result.success && result.data) {
        setUsers(result.data);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const approve = async (userId: string) => {
    const token = localStorage.getItem("accessToken") ?? undefined;
    await apiPatch(`/users/${userId}/approve`, {}, token);
    await reload();
  };

  const reject = async (userId: string) => {
    const token = localStorage.getItem("accessToken") ?? undefined;
    await apiPatch(`/users/${userId}/reject`, {}, token);
    await reload();
  };

  const updateUser = async (userId: string, payload: Partial<Pick<AdminUser, "role" | "isActive" | "fullName">>) => {
    const token = localStorage.getItem("accessToken") ?? undefined;
    await apiPatch(`/users/${userId}`, payload, token);
    await reload();
  };

  return (
    <main className="mx-auto max-w-4xl space-y-4 px-6 py-12">
      <h1 className="text-3xl font-bold">User Management</h1>
      <div className="space-y-2">
        {users.map((user) => (
          <div key={user.id} className="flex flex-col gap-3 rounded border border-slate-300 bg-white p-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="font-semibold">{user.fullName}</p>
              <p className="text-sm text-slate-600">{user.email} · {user.role} · {user.isActive ? "Active" : "Inactive"}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                className="rounded border border-slate-300 px-2 py-2 text-sm"
                value={user.role}
                onChange={(event) => updateUser(user.id, { role: event.target.value as UserRole })}
              >
                <option value="ADMIN">ADMIN</option>
                <option value="REVIEWER">REVIEWER</option>
                <option value="INTERN">INTERN</option>
              </select>
              <button
                className="rounded border border-slate-300 px-3 py-2 text-sm"
                onClick={() => updateUser(user.id, { isActive: !user.isActive })}
                type="button"
              >
                {user.isActive ? "Deactivate" : "Activate"}
              </button>
              {!user.approvedByAdmin ? (
                <button className="rounded bg-emerald-700 px-3 py-2 text-sm text-white" onClick={() => approve(user.id)} type="button">Approve</button>
              ) : null}
              <button className="rounded bg-red-700 px-3 py-2 text-sm text-white" onClick={() => reject(user.id)} type="button">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
