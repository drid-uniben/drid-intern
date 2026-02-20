"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";

interface SubmissionItem {
  id: string;
  fullName: string;
  email: string;
  category: string;
  status: string;
}

export default function AdminSubmissionsPage() {
  const [items, setItems] = useState<SubmissionItem[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken") ?? undefined;
    apiGet<SubmissionItem[]>("/submissions", token).then((result) => {
      if (result.success && result.data) {
        setItems(result.data);
      }
    });
  }, []);

  return (
    <main className="mx-auto max-w-4xl space-y-4 px-6 py-12">
      <h1 className="text-3xl font-bold">Submissions</h1>
      <div className="space-y-2">
        {items.map((item) => (
          <Link key={item.id} href={`/admin/submissions/${item.id}`} className="block rounded border border-slate-300 p-3">
            <p className="font-semibold">{item.fullName} · <span className="capitalize">{item.category}</span></p>
            <p className="text-sm text-slate-600">{item.email} · {item.status}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
