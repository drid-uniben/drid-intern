"use client";

import Link from "next/link";
import * as m from "motion/react-m";
import { apiGet } from "@/lib/api";
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
}

export default function AdminSubmissionsPage() {
  const authInitialized = useAppStore((state) => state.authInitialized);

  const { data: items = [], isLoading } = useAuthedQuery<SubmissionItem[]>({
    queryKey: ["admin-submissions"],
    queryFn: async (token) => {
      const result = await apiGet<SubmissionItem[]>("/submissions", token);
      return result.success && result.data ? result.data : [];
    },
  });

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold" style={{ animation: "fadeIn 0.5s ease-out" }}>
        <span className="gradient-text">Submissions</span>
      </h1>

      {!authInitialized || isLoading ? (
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
                href={`/admin/submissions/${item.id}`}
                className="glass block rounded-2xl p-4 transition-all duration-300 hover:scale-[1.01]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{item.fullName}</p>
                    <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
                      {item.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge badge-accent capitalize">{item.category}</span>
                    <AutoStatusBadge status={item.status} />
                  </div>
                </div>
              </Link>
            </m.div>
          ))}
        </div>
      )}
    </main>
  );
}
