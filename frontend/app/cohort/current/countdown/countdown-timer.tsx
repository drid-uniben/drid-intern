"use client";

import { useState, useEffect } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  mins: number;
  secs: number;
  ended: boolean;
}

function calcTimeLeft(deadlineAt: string): TimeLeft {
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
}

function CountdownSegment({ value, label, index }: { value: number; label: string; index: number }) {
  return (
    <div
      className="countdown-segment glass rounded-2xl p-6 text-center min-w-[100px]"
      style={{ animationDelay: `${index * 0.1 + 0.2}s` }}
    >
      <p className="text-4xl md:text-5xl font-bold gradient-text tabular-nums">
        {String(value).padStart(2, "0")}
      </p>
      <p className="mt-2 text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
    </div>
  );
}

function Separator({ index }: { index: number }) {
  return (
    <span
      className="countdown-separator gradient-text text-3xl md:text-4xl font-bold self-start pt-5"
      style={{ animationDelay: `${index * 0.1 + 0.25}s` }}
    >
      :
    </span>
  );
}

export default function CountdownTimer({ deadlineAt }: { deadlineAt: string }) {
  const [time, setTime] = useState<TimeLeft>(calcTimeLeft(deadlineAt));

  useEffect(() => {
    const id = setInterval(() => setTime(calcTimeLeft(deadlineAt)), 1000);
    return () => clearInterval(id);
  }, [deadlineAt]);

  if (time.ended) {
    return (
      <div className="glass rounded-2xl p-8 mt-8 countdown-segment" style={{ animationDelay: "0.2s" }}>
        <p className="text-xl font-semibold">Application window has ended.</p>
      </div>
    );
  }

  const segments: { value: number; label: string }[] = [
    { value: time.days, label: "Days" },
    { value: time.hours, label: "Hours" },
    { value: time.mins, label: "Minutes" },
    { value: time.secs, label: "Seconds" },
  ];

  return (
    <div className="mt-8 flex flex-wrap items-start justify-center gap-3 md:gap-4" suppressHydrationWarning>
      {segments.map((seg, i) => (
        <div key={seg.label} className="flex items-start gap-3 md:gap-4">
          <CountdownSegment value={seg.value} label={seg.label} index={i} />
          {i < segments.length - 1 && <Separator index={i} />}
        </div>
      ))}
    </div>
  );
}
