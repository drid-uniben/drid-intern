"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import * as m from "motion/react-m";
import { apiGet } from "@/lib/api";
import { useAuthToken } from "@/hooks/useAuth";
import { ListSkeleton } from "@/components/ui/LoadingSkeleton";
import { AutoStatusBadge } from "@/components/ui/StatusBadge";

interface QueueItem {
  id: string;
  fullName: string;
  category: string;
  status: string;
}

export default function ReviewerQueuePage() {
  const token = useAuthToken();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["reviewer-queue"],
    queryFn: async () => {
      const result = await apiGet<QueueItem[]>("/submissions", token);
      return result.success && result.data ? result.data : [];
    },
  });

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold" style={{ animation: "fadeIn 0.5s ease-out" }}>
        Review <span className="gradient-text">Queue</span>
      </h1>

      {isLoading ? (
        <div className="mt-6"><ListSkeleton count={4} /></div>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((item, i) => (
            <m.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/reviewer/submissions/${item.id}`}
                className="glass block rounded-2xl p-4 transition-all duration-300 hover:scale-[1.01]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{item.fullName}</p>
                    <span className="badge badge-accent capitalize text-xs mt-1">{item.category}</span>
                  </div>
                  <AutoStatusBadge status={item.status} />
                </div>
              </Link>
            </m.div>
          ))}
        </div>
      )}
    </main>
  );
}
