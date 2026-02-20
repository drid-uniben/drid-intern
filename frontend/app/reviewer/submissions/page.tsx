"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";

interface QueueItem {
  id: string;
  fullName: string;
  category: string;
  status: string;
}

export default function ReviewerQueuePage() {
  const [items, setItems] = useState<QueueItem[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken") ?? undefined;
    apiGet<QueueItem[]>("/submissions", token).then((result) => {
      if (result.success && result.data) {
        setItems(result.data);
      }
    });
  }, []);

  return (
    <main className="mx-auto max-w-4xl space-y-4 px-6 py-12">
      <h1 className="text-3xl font-bold">Review Queue</h1>
      {items.map((item) => (
        <Link key={item.id} href={`/reviewer/submissions/${item.id}`} className="block rounded border border-slate-300 p-3">
          <p className="font-semibold">{item.fullName}</p>
          <p className="text-sm capitalize text-slate-600">{item.category} · {item.status}</p>
        </Link>
      ))}
    </main>
  );
}
