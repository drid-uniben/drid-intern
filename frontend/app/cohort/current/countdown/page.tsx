import type { Metadata } from "next";
import { apiGet } from "@/lib/api";
import { Cohort } from "@/types/domain";

export const metadata: Metadata = {
  title: "Countdown — DRID Internship",
  description: "Countdown timer to the current cohort deadline.",
};

const formatRemaining = (deadlineAt: string): { days: number; hours: number; mins: number; secs: number; ended: boolean } => {
  const diff = new Date(deadlineAt).getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, mins: 0, secs: 0, ended: true };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    mins: Math.floor((diff / (1000 * 60)) % 60),
    secs: Math.floor((diff / 1000) % 60),
    ended: false,
  };
};

function CountdownSegment({ value, label }: { value: number; label: string }) {
  return (
    <div className="glass rounded-2xl p-6 text-center min-w-[100px]">
      <p className="text-4xl md:text-5xl font-bold gradient-text tabular-nums">
        {String(value).padStart(2, "0")}
      </p>
      <p className="mt-2 text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
    </div>
  );
}

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

  const time = formatRemaining(result.data.deadlineAt);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 text-center">
      <h1 className="text-3xl font-bold" style={{ animation: "fadeIn 0.5s ease-out" }}>
        Cohort <span className="gradient-text">Countdown</span>
      </h1>

      {time.ended ? (
        <div className="glass rounded-2xl p-8 mt-8" style={{ animation: "slideUp 0.5s ease-out 0.2s both" }}>
          <p className="text-xl font-semibold">Application window has ended.</p>
        </div>
      ) : (
        <div
          className="mt-8 flex flex-wrap justify-center gap-4"
          style={{ animation: "slideUp 0.5s ease-out 0.2s both" }}
        >
          <CountdownSegment value={time.days} label="Days" />
          <CountdownSegment value={time.hours} label="Hours" />
          <CountdownSegment value={time.mins} label="Minutes" />
          <CountdownSegment value={time.secs} label="Seconds" />
        </div>
      )}
    </main>
  );
}
