"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPatch } from "@/lib/api";

interface UserItem {
  id: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "REVIEWER" | "INTERN";
  approvedByAdmin: boolean;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);

  useEffect(() => {
    let active = true;
    void (async () => {
      const token = localStorage.getItem("accessToken") ?? undefined;
      const result = await apiGet<UserItem[]>("/users", token);
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
    const result = await apiGet<UserItem[]>("/users", token);
    if (result.success && result.data) {
      setUsers(result.data);
    }
  };

  return (
    <main className="mx-auto max-w-4xl space-y-4 px-6 py-12">
      <h1 className="text-3xl font-bold">User Management</h1>
      <div className="space-y-2">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between rounded border border-slate-300 p-3">
            <div>
              <p className="font-semibold">{user.fullName}</p>
              <p className="text-sm text-slate-600">{user.email} · {user.role}</p>
            </div>
            {!user.approvedByAdmin ? <button className="rounded bg-slate-900 px-3 py-2 text-white" onClick={() => approve(user.id)}>Approve</button> : null}
          </div>
        ))}
      </div>
    </main>
  );
}
