"use client";

import { FormEvent, useState } from "react";
import { apiPost } from "@/lib/api";

export function CreateCohortForm() {
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [cohortNumber, setCohortNumber] = useState("1");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("23:59");
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const combinedDeadline = `${deadlineDate}T${deadlineTime || "23:59"}`;
    const parsedDeadline = new Date(combinedDeadline);
    if (Number.isNaN(parsedDeadline.getTime())) {
      setMessage("Please provide a valid deadline date and time");
      return;
    }

    const token = localStorage.getItem("accessToken") ?? undefined;
    const result = await apiPost("/cohorts", {
      year: Number(year),
      cohortNumber: Number(cohortNumber),
      deadlineAt: parsedDeadline.toISOString(),
      allowedCategories: ["backend", "frontend", "fullstack", "design"],
    }, token);

    setMessage(result.success ? "Cohort created" : result.error ?? "Failed to create cohort");
  };

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <input className="w-full rounded border border-slate-300 p-2" type="number" value={year} onChange={(event) => setYear(event.target.value)} required />
      <input className="w-full rounded border border-slate-300 p-2" type="number" value={cohortNumber} onChange={(event) => setCohortNumber(event.target.value)} required />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input className="w-full rounded border border-slate-300 p-2" type="date" value={deadlineDate} onChange={(event) => setDeadlineDate(event.target.value)} required />
        <input className="w-full rounded border border-slate-300 p-2" type="time" value={deadlineTime} onChange={(event) => setDeadlineTime(event.target.value)} required />
      </div>
      <button className="rounded bg-slate-900 px-4 py-2 text-white" type="submit">Create cohort</button>
      {message ? <p className="text-sm text-slate-700">{message}</p> : null}
    </form>
  );
}
