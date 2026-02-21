import type { Metadata } from "next";
import { apiGet } from "@/lib/api";
import { Cohort } from "@/types/domain";
import CountdownTimer from "./countdown-timer";

export const metadata: Metadata = {
  title: "Countdown — DRID Internship",
  description: "Countdown timer to the current cohort deadline.",
};

export default async function CohortCountdownPage() {
  const result = await apiGet<Cohort>("/public/cohort");

  if (!result.success || !result.data) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12 text-center" style={{ animation: "slideUp 0.5s ease-out" }}>
        <div className="glass rounded-2xl p-8">
          <h1 className="text-3xl font-bold gradient-text">No Active Cohort</h1>
          <p className="mt-3" style={{ color: "var(--text-secondary)" }}>Check back later for the next application window.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 text-center">
      <h1 className="text-3xl font-bold" style={{ animation: "fadeIn 0.5s ease-out" }}>
        Cohort <span className="gradient-text">Countdown</span>
      </h1>
      <CountdownTimer deadlineAt={result.data.deadlineAt} />
    </main>
  );
}
