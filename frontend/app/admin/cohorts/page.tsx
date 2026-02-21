import type { Metadata } from "next";
import Link from "next/link";
import { CohortList } from "@/components/admin/CohortList";

export const metadata: Metadata = {
  title: "Manage Cohorts — DRID Internship",
  description: "View, update, and manage internship cohorts.",
};

export default function AdminCohortsPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between" style={{ animation: "fadeIn 0.5s ease-out" }}>
        <h1 className="text-3xl font-bold">
          <span className="gradient-text">Cohorts</span>
        </h1>
        <Link className="btn-gradient !text-sm" href="/admin/cohorts/create">+ Create cohort</Link>
      </div>
      <div className="mt-6">
        <CohortList />
      </div>
    </main>
  );
}
