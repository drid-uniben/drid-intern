"use client";

import { useState, useEffect } from "react";
import { Cohort } from "@/types/domain";

type Phase = {
  key: string;
  label: string;
  description: string;
  icon: string;
};

const PHASES: Phase[] = [
  {
    key: "opens",
    label: "Challenge Opens",
    description: "Challenge opens to all participants.",
    icon: "🚀",
  },
  {
    key: "submission",
    label: "Submission Deadline",
    description: "All submissions must be completed before this date.",
    icon: "📬",
  },
  {
    key: "review",
    label: "Review Period",
    description: "DRID reviewers evaluate all submitted work.",
    icon: "🔍",
  },
  {
    key: "results",
    label: "Results Release",
    description: "Candidates are notified of outcomes.",
    icon: "🏁",
  },
];

function getActivePhaseKey(cohort: Cohort | undefined): string {
  if (!cohort) return "opens";
  switch (cohort.status) {
    case "ACTIVE":
      return "submission";
    case "CLOSED":
      return "review";
    case "ARCHIVED":
      return "results";
    default:
      return "opens";
  }
}

function calcTimeLeft(deadlineAt: string) {
  const diff = new Date(deadlineAt).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    mins: Math.floor((diff / (1000 * 60)) % 60),
    secs: Math.floor((diff / 1000) % 60),
  };
}

function Pad({ n }: { n: number }) {
  return <span suppressHydrationWarning>{String(n).padStart(2, "0")}</span>;
}

interface Props {
  cohort: Cohort | undefined;
}

export default function TimelinePhases({ cohort }: Props) {
  const activeKey = getActivePhaseKey(cohort);
  const activeIndex = PHASES.findIndex((p) => p.key === activeKey);

  const [timeLeft, setTimeLeft] = useState(() =>
    cohort ? calcTimeLeft(cohort.deadlineAt) : null
  );

  useEffect(() => {
    if (!cohort) return;
    const id = setInterval(() => setTimeLeft(calcTimeLeft(cohort.deadlineAt)), 1000);
    return () => clearInterval(id);
  }, [cohort]);

  return (
    <div className="glass rounded-3xl p-8 md:p-10 relative overflow-hidden">
      {/* subtle orb inside */}
      <div
        className="orb"
        style={{
          width: 180,
          height: 180,
          background: "var(--accent-mid)",
          opacity: 0.12,
          top: -40,
          right: -40,
        }}
      />

      {/* Phase list */}
      <ol className="relative space-y-0" aria-label="Cohort timeline">
        {PHASES.map((phase, i) => {
          const isDone = i < activeIndex;
          const isActive = i === activeIndex;
          const isFuture = i > activeIndex;

          return (
            <li key={phase.key} className="relative flex gap-4">
              {/* Vertical connector */}
              {i < PHASES.length - 1 && (
                <div
                  className="absolute left-[19px] top-[40px] w-[2px] bottom-0"
                  style={{
                    background: isDone
                      ? "linear-gradient(to bottom, var(--accent-start), var(--accent-end))"
                      : "var(--glass-border)",
                    minHeight: "48px",
                  }}
                />
              )}

              {/* Step circle */}
              <div className="flex-shrink-0 relative z-10" style={{ width: "40px", paddingTop: "12px" }}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${isActive
                      ? "gradient-border"
                      : ""
                    }`}
                  style={{
                    background: isDone
                      ? "linear-gradient(135deg, var(--accent-start), var(--accent-end))"
                      : isActive
                        ? "var(--glass-bg-strong)"
                        : "var(--glass-bg-subtle)",
                    border: isDone
                      ? "none"
                      : isActive
                        ? "2px solid transparent"
                        : "1px solid var(--glass-border)",
                    boxShadow: isActive ? "0 0 16px var(--glow-color)" : "none",
                    backgroundImage: isDone
                      ? "linear-gradient(135deg, var(--accent-start), var(--accent-end))"
                      : undefined,
                  }}
                >
                  {isDone ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                      <path d="M13.5 3.5L6 11 2.5 7.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  ) : (
                    <span
                      style={{
                        color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                        fontSize: "18px",
                        lineHeight: 1,
                      }}
                    >
                      {phase.icon}
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div
                className={`flex-1 pb-8 ${i === PHASES.length - 1 ? "pb-0" : ""}`}
              >
                <div className="pt-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3
                      className={`text-base font-semibold ${isDone ? "gradient-text" : ""
                        }`}
                      style={{
                        color: isDone
                          ? undefined
                          : isActive
                            ? "var(--text-primary)"
                            : "var(--text-muted)",
                      }}
                    >
                      {phase.label}
                    </h3>
                    {isActive && (
                      <span className="badge badge-accent text-xs">
                        Current
                      </span>
                    )}
                    {isDone && (
                      <span
                        className="text-xs font-medium"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Completed
                      </span>
                    )}
                  </div>
                  <p
                    className="mt-1 text-sm leading-relaxed"
                    style={{
                      color: isFuture
                        ? "var(--text-muted)"
                        : "var(--text-secondary)",
                    }}
                  >
                    {phase.description}
                  </p>

                  {/* Countdown for the current (submission) phase */}
                  {isActive && cohort && phase.key === "submission" && (
                    <div className="mt-4">
                      {timeLeft ? (
                        <div>
                          <p
                            className="text-xs uppercase tracking-wider mb-2 font-medium"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Deadline in
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            {(
                              [
                                { v: timeLeft.days, l: "d" },
                                { v: timeLeft.hours, l: "h" },
                                { v: timeLeft.mins, l: "m" },
                                { v: timeLeft.secs, l: "s" },
                              ] as { v: number; l: string }[]
                            ).map(({ v, l }, idx) => (
                              <div key={l} className="flex items-baseline gap-0.5">
                                <span className="countdown-segment glass rounded-lg px-3 py-1.5 text-xl font-bold gradient-text tabular-nums">
                                  <Pad n={v} />
                                </span>
                                <span
                                  className="text-xs ml-0.5"
                                  style={{ color: "var(--text-muted)" }}
                                >
                                  {l}
                                </span>
                                {idx < 3 && (
                                  <span
                                    className="countdown-separator gradient-text font-bold text-lg mx-1"
                                  >
                                    :
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Submission window has closed.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Deadline label for submission phase when not active */}
                  {!isActive && phase.key === "submission" && cohort && (
                    <p
                      className="mt-1 text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Deadline:{" "}
                      {new Date(cohort.deadlineAt).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {/* No cohort state */}
      {!cohort && (
        <p
          className="mt-4 text-sm italic"
          style={{ color: "var(--text-muted)" }}
        >
          No active cohort. Check back for the next application window.
        </p>
      )}
    </div>
  );
}
