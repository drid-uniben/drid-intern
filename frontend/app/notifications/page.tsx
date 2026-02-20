"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
}

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken") ?? undefined;
    apiGet<NotificationItem[]>("/notifications", token).then((result) => {
      if (result.success && result.data) {
        setItems(result.data);
      }
    });
  }, []);

  return (
    <main className="mx-auto max-w-3xl space-y-3 px-6 py-12">
      <h1 className="text-3xl font-bold">Notifications</h1>
      {items.map((item) => (
        <article key={item.id} className="rounded border border-slate-300 p-3">
          <h2 className="font-semibold">{item.title}</h2>
          <p className="text-sm text-slate-600">{item.message}</p>
        </article>
      ))}
    </main>
  );
}
