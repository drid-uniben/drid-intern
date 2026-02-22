"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { apiPatch } from "@/lib/api";
import { useAuthToken } from "@/hooks/useAuth";
import { Cohort } from "@/types/domain";

const toDateTimeParts = (iso: string): { date: string; time: string } => {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`,
  };
};

const toIsoFromParts = (date: string, time: string): string => {
  return new Date(`${date}T${time}`).toISOString();
};

const hours = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0"));
const minutes = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, "0"));

export function CohortDeadlineEditor({ cohortId, deadlineAt }: { cohortId: string; deadlineAt: string }) {
  const token = useAuthToken();
  const queryClient = useQueryClient();
  const initialParts = toDateTimeParts(deadlineAt);
  const [draft, setDraft] = useState<{ date: string; time: string } | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const currentParts = draft ?? initialParts;
  const hasChanges = currentParts.date !== initialParts.date || currentParts.time !== initialParts.time;
  const [currentHour, currentMinute] = currentParts.time.split(":");

  const mutation = useMutation({
    mutationFn: async () => {
      return apiPatch<Cohort>(`/cohorts/${cohortId}`, { deadlineAt: toIsoFromParts(currentParts.date, currentParts.time) }, token);
    },
    onSuccess: async (result) => {
      if (!result.success) {
        setNotice({ type: "error", text: result.error ?? "Failed to update deadline" });
        return;
      }

      setNotice({ type: "success", text: "Deadline updated successfully" });
      setDraft(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-cohort", cohortId] });
    },
    onError: () => {
      setNotice({ type: "error", text: "Failed to update deadline" });
    },
  });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cohort-deadline-date" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Deadline date
          </label>
          <input
            id="cohort-deadline-date"
            className="input-glass"
            type="date"
            value={currentParts.date}
            onChange={(e) => {
              setNotice(null);
              setDraft((prev) => ({
                date: e.target.value,
                time: prev?.time ?? initialParts.time,
              }));
            }}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Deadline time
          </label>
          <div className="grid grid-cols-2 gap-2">
            <select
              id="cohort-deadline-hour"
              className="input-glass"
              value={currentHour}
              onChange={(e) => {
              setNotice(null);
              setDraft((prev) => ({
                date: prev?.date ?? initialParts.date,
                  time: `${e.target.value}:${prev?.time.split(":")[1] ?? currentMinute}`,
              }));
            }}
            >
              {hours.map((hour) => (
                <option key={hour} value={hour}>
                  {hour}h
                </option>
              ))}
            </select>
            <select
              id="cohort-deadline-minute"
              className="input-glass"
              value={currentMinute}
              onChange={(e) => {
                setNotice(null);
                setDraft((prev) => ({
                  date: prev?.date ?? initialParts.date,
                  time: `${prev?.time.split(":")[0] ?? currentHour}:${e.target.value}`,
                }));
              }}
            >
              {minutes.map((minute) => (
                <option key={minute} value={minute}>
                  {minute}m
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <button className="btn-gradient !py-1.5 !px-3 !text-sm !rounded-lg" onClick={() => mutation.mutate()} disabled={mutation.isPending || !hasChanges} type="button">
        {mutation.isPending ? "Saving..." : "Update deadline"}
      </button>
      <AnimatePresence>
        {notice && (
          <m.p
            className="text-sm rounded-lg p-2"
            style={{
              background: notice.type === "success" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
              color: notice.type === "success" ? "var(--success-color)" : "var(--error-color)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {notice.text}
          </m.p>
        )}
      </AnimatePresence>
    </div>
  );
}
