"use client";

import { FormEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { apiPost } from "@/lib/api";
import { useAuthToken } from "@/hooks/useAuth";

export function CreateCohortForm() {
  const token = useAuthToken();
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [cohortNumber, setCohortNumber] = useState("1");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("23:59");
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      const combinedDeadline = `${deadlineDate}T${deadlineTime || "23:59"}`;
      const parsedDeadline = new Date(combinedDeadline);
      if (Number.isNaN(parsedDeadline.getTime())) {
        throw new Error("Please provide a valid deadline date and time");
      }
      return apiPost("/cohorts", {
        year: Number(year),
        cohortNumber: Number(cohortNumber),
        deadlineAt: parsedDeadline.toISOString(),
        allowedCategories: ["backend", "frontend", "fullstack", "design"],
      }, token);
    },
    onSuccess: (result) => {
      if (result.success) {
        setMessage("Cohort created successfully! 🎉");
        setIsSuccess(true);
      } else {
        setMessage(result.error ?? "Failed to create cohort");
        setIsSuccess(false);
      }
    },
    onError: (err: Error) => {
      setMessage(err.message);
      setIsSuccess(false);
    },
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    mutation.mutate();
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Year</label>
        <input className="input-glass" type="number" value={year} onChange={(e) => setYear(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Cohort Number</label>
        <input className="input-glass" type="number" value={cohortNumber} onChange={(e) => setCohortNumber(e.target.value)} required />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Deadline Date</label>
          <input className="input-glass" type="date" value={deadlineDate} onChange={(e) => setDeadlineDate(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Deadline Time</label>
          <input className="input-glass" type="time" value={deadlineTime} onChange={(e) => setDeadlineTime(e.target.value)} required />
        </div>
      </div>
      <button className="btn-gradient w-full" type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Creating..." : "Create cohort"}
      </button>

      <AnimatePresence>
        {message && (
          <motion.p
            className="text-sm rounded-lg p-3"
            style={{
              background: isSuccess ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
              color: isSuccess ? "var(--success-color)" : "var(--error-color)",
            }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {message}
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
}
