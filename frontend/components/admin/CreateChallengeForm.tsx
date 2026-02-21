"use client";

import Link from "next/link";
import { FormEvent, useReducer } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { apiGet, apiPost } from "@/lib/api";
import { useAuthToken } from "@/hooks/useAuth";
import { ChallengeCategory } from "@/types/domain";

interface ChallengeResponse {
  id: string;
}

interface State {
  category: string;
  title: string;
  description: string;
  challengeId: string | null;
  message: string | null;
  isSuccess: boolean;
}

type Action =
  | { type: "SET_FIELD"; field: "category" | "title" | "description"; value: string }
  | { type: "RESULT"; message: string; isSuccess: boolean; challengeId?: string }
  | { type: "CLEAR_MESSAGE" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "RESULT":
      return { ...state, message: action.message, isSuccess: action.isSuccess, challengeId: action.challengeId ?? state.challengeId };
    case "CLEAR_MESSAGE":
      return { ...state, message: null };
    default:
      return state;
  }
}

export function CreateChallengeForm({ cohortId }: { cohortId: string }) {
  const router = useRouter();
  const token = useAuthToken();
  const queryClient = useQueryClient();
  const { data: categories = [] } = useQuery({
    queryKey: ["challenge-categories"],
    queryFn: async () => {
      const result = await apiGet<ChallengeCategory[]>("/challenge-categories");
      return result.success && result.data ? result.data : [];
    },
  });
  const [state, dispatch] = useReducer(reducer, {
    category: "",
    title: "",
    description: "",
    challengeId: null,
    message: null,
    isSuccess: false,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const selectedCategory = state.category || categories[0]?.name;
      if (!selectedCategory) {
        throw new Error("No challenge categories available. Please add categories first.");
      }

      return apiPost<ChallengeResponse>("/challenges", { cohortId, category: selectedCategory, title: state.title, description: state.description }, token);
    },
    onSuccess: (result) => {
      if (result.success && result.data) {
        dispatch({ type: "RESULT", message: "Challenge created successfully! 🎉", isSuccess: true, challengeId: result.data.id });
        queryClient.invalidateQueries({ queryKey: ["admin-challenges", cohortId] });
        router.push(`/admin/cohorts/${cohortId}/challenges#existing-challenges`);
      } else {
        dispatch({ type: "RESULT", message: result.error ?? "Failed to create challenge", isSuccess: false });
      }
    },
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch({ type: "CLEAR_MESSAGE" });
    mutation.mutate();
  };

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="text-lg font-semibold gradient-text">Create New Challenge</h2>
      <form className="mt-4 space-y-4" onSubmit={onSubmit}>
        <div>
          <label htmlFor="challenge-category" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Category</label>
          <select id="challenge-category" className="input-glass" value={state.category || categories[0]?.name || ""} onChange={(e) => dispatch({ type: "SET_FIELD", field: "category", value: e.target.value })}>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="challenge-title" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Title</label>
          <input id="challenge-title" className="input-glass" value={state.title} onChange={(e) => dispatch({ type: "SET_FIELD", field: "title", value: e.target.value })} placeholder="Challenge title" required />
        </div>
        <div>
          <label htmlFor="challenge-desc" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Description</label>
          <textarea id="challenge-desc" className="input-glass" rows={10} value={state.description} onChange={(e) => dispatch({ type: "SET_FIELD", field: "description", value: e.target.value })} placeholder="Challenge description" required style={{ resize: "vertical" }} />
        </div>
        <button className="btn-gradient w-full" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Creating..." : "Create challenge"}
        </button>

        <AnimatePresence>
          {state.message && (
            <m.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <p
                className="text-sm rounded-lg p-3"
                style={{
                  background: state.isSuccess ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                  color: state.isSuccess ? "var(--success-color)" : "var(--error-color)",
                }}
              >
                {state.message}
              </p>
              {state.challengeId && (
                <Link className="mt-2 inline-block text-sm gradient-text font-medium" href={`/admin/challenges/${state.challengeId}/edit`}>
                  Open in challenge editor →
                </Link>
              )}
            </m.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
