"use client";

import { FormEvent, useReducer } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { apiPost } from "@/lib/api";
import { useAuthToken } from "@/hooks/useAuth";

interface State {
  year: string;
  cohortNumber: string;
  deadlineDate: string;
  deadlineTime: string;
  message: string | null;
  isSuccess: boolean;
}

type Action =
  | { type: "SET_FIELD"; field: "year" | "cohortNumber" | "deadlineDate" | "deadlineTime"; value: string }
  | { type: "RESULT"; message: string; isSuccess: boolean }
  | { type: "CLEAR_MESSAGE" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "RESULT":
      return { ...state, message: action.message, isSuccess: action.isSuccess };
    case "CLEAR_MESSAGE":
      return { ...state, message: null };
    default:
      return state;
  }
}

export function CreateCohortForm() {
  const router = useRouter();
  const token = useAuthToken();
  const [state, dispatch] = useReducer(reducer, {
    year: String(new Date().getFullYear()),
    cohortNumber: "1",
    deadlineDate: "",
    deadlineTime: "23:59",
    message: null,
    isSuccess: false,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const combinedDeadline = `${state.deadlineDate}T${state.deadlineTime || "23:59"}`;
      const parsedDeadline = new Date(combinedDeadline);
      if (Number.isNaN(parsedDeadline.getTime())) {
        throw new Error("Please provide a valid deadline date and time");
      }
      return apiPost("/cohorts", {
        year: Number(state.year),
        cohortNumber: Number(state.cohortNumber),
        deadlineAt: parsedDeadline.toISOString(),
        allowedCategories: ["backend", "frontend", "fullstack", "design"],
      }, token);
    },
    onSuccess: (result) => {
      if (result.success) {
        router.push("/admin/cohorts");
      } else {
        dispatch({ type: "RESULT", message: result.error ?? "Failed to create cohort", isSuccess: false });
      }
    },
    onError: (err: Error) => {
      dispatch({ type: "RESULT", message: err.message, isSuccess: false });
    },
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch({ type: "CLEAR_MESSAGE" });
    mutation.mutate();
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <label htmlFor="cohort-year" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Year</label>
        <input id="cohort-year" className="input-glass" type="number" value={state.year} onChange={(e) => dispatch({ type: "SET_FIELD", field: "year", value: e.target.value })} required />
      </div>
      <div>
        <label htmlFor="cohort-number" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Cohort Number</label>
        <input id="cohort-number" className="input-glass" type="number" value={state.cohortNumber} onChange={(e) => dispatch({ type: "SET_FIELD", field: "cohortNumber", value: e.target.value })} required />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cohort-date" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Deadline Date</label>
          <input id="cohort-date" className="input-glass" type="date" value={state.deadlineDate} onChange={(e) => dispatch({ type: "SET_FIELD", field: "deadlineDate", value: e.target.value })} required />
        </div>
        <div>
          <label htmlFor="cohort-time" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Deadline Time</label>
          <input id="cohort-time" className="input-glass" type="time" value={state.deadlineTime} onChange={(e) => dispatch({ type: "SET_FIELD", field: "deadlineTime", value: e.target.value })} required />
        </div>
      </div>
      <button className="btn-gradient w-full" type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Creating..." : "Create cohort"}
      </button>

      <AnimatePresence>
        {state.message && (
          <m.p
            className="text-sm rounded-lg p-3"
            style={{
              background: state.isSuccess ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
              color: state.isSuccess ? "var(--success-color)" : "var(--error-color)",
            }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {state.message}
          </m.p>
        )}
      </AnimatePresence>
    </form>
  );
}
