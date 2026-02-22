"use client";

import * as m from "motion/react-m";
import { apiGet } from "@/lib/api";
import { useAuthedQuery } from "@/hooks/useAuthedQuery";
import { ListSkeleton } from "@/components/ui/LoadingSkeleton";
import { useAppStore } from "@/lib/store";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
}

export default function NotificationsPage() {
  const authInitialized = useAppStore((state) => state.authInitialized);

  const { data: items = [], isLoading } = useAuthedQuery<NotificationItem[]>({
    queryKey: ["notifications"],
    queryFn: async (token) => {
      const result = await apiGet<NotificationItem[]>("/notifications", token);
      return result.success && result.data ? result.data : [];
    },
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold" style={{ animation: "fadeIn 0.5s ease-out" }}>
        <span className="gradient-text">Notifications</span>
      </h1>

      {!authInitialized || isLoading ? (
        <div className="mt-6"><ListSkeleton count={3} /></div>
      ) : items.length === 0 ? (
        <div className="glass rounded-2xl p-8 mt-6 text-center" style={{ animation: "slideUp 0.5s ease-out" }}>
          <p className="text-lg" style={{ color: "var(--text-muted)" }}>No notifications yet</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((item, i) => (
            <m.article
              key={item.id}
              className="glass rounded-2xl p-4"
              style={{ opacity: item.isRead ? 0.7 : 1 }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: item.isRead ? 0.7 : 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-start gap-3">
                {!item.isRead && (
                  <div
                    className="mt-1.5 w-2 h-2 rounded-full shrink-0"
                    style={{ background: "var(--accent-start)" }}
                  />
                )}
                <div>
                  <h2 className="font-semibold">{item.title}</h2>
                  <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{item.message}</p>
                </div>
              </div>
            </m.article>
          ))}
        </div>
      )}
    </main>
  );
}
