"use client";

import { FormEvent, useReducer } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { apiGet, apiPost } from "@/lib/api";
import { InvitationValidation } from "@/types/domain";
import { ListSkeleton } from "@/components/ui/LoadingSkeleton";

interface State {
  fullName: string;
  email: string;
  githubUrl: string;
  deploymentUrl: string;
  figmaUrl: string;
  message: string;
  category: string;
  error: string | null;
}

type Action =
  | { type: "SET_FIELD"; field: keyof Omit<State, "error">; value: string }
  | { type: "ERROR"; error: string }
  | { type: "CLEAR_ERROR" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "ERROR":
      return { ...state, error: action.error };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
}

export function InviteSubmissionForm({ token }: { token: string }) {
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, {
    fullName: "",
    email: "",
    githubUrl: "",
    deploymentUrl: "",
    figmaUrl: "",
    message: "",
    category: "",
    error: null,
  });

  const { data: invitation, isLoading: validating } = useQuery({
    queryKey: ["invitation", token],
    queryFn: async () => {
      const result = await apiGet<InvitationValidation>(`/invitations/${token}`);
      return result.success && result.data ? result.data : null;
    },
  });

  const emailValue = invitation?.email ?? state.email;
  const categoryValue = invitation?.category ?? state.category;
  const isDesign = categoryValue === "design";

  const submitMutation = useMutation({
    mutationFn: async () => {
      return apiPost("/submissions", {
        invitationToken: token,
        fullName: state.fullName,
        email: emailValue,
        githubUrl: state.githubUrl || undefined,
        deploymentUrl: state.deploymentUrl || undefined,
        figmaUrl: state.figmaUrl || undefined,
        message: state.message,
      });
    },
    onSuccess: (result) => {
      if (!result.success) {
        dispatch({ type: "ERROR", error: result.error ?? "Submission failed" });
        return;
      }
      router.push(`/invite/${token}/success`);
    },
    onError: () => {
      dispatch({ type: "ERROR", error: "An unexpected error occurred." });
    },
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch({ type: "CLEAR_ERROR" });
    submitMutation.mutate();
  };

  if (validating) {
    return <ListSkeleton count={4} />;
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <label htmlFor="invite-name" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Full name</label>
        <input id="invite-name" className="input-glass" placeholder="John Doe" value={state.fullName} onChange={(e) => dispatch({ type: "SET_FIELD", field: "fullName", value: e.target.value })} required />
      </div>
      <div>
        <label htmlFor="invite-email" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Email</label>
        <input id="invite-email" className="input-glass" placeholder="you@example.com" type="email" value={emailValue} onChange={(e) => dispatch({ type: "SET_FIELD", field: "email", value: e.target.value })} required />
      </div>

      {isDesign ? (
        <div>
          <label htmlFor="invite-figma" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Figma URL</label>
          <input id="invite-figma" className="input-glass" placeholder="https://figma.com/..." type="url" value={state.figmaUrl} onChange={(e) => dispatch({ type: "SET_FIELD", field: "figmaUrl", value: e.target.value })} required />
        </div>
      ) : (
        <>
          <div>
            <label htmlFor="invite-github" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>GitHub repo URL</label>
            <input id="invite-github" className="input-glass" placeholder="https://github.com/..." type="url" value={state.githubUrl} onChange={(e) => dispatch({ type: "SET_FIELD", field: "githubUrl", value: e.target.value })} required />
          </div>
          <div>
            <label htmlFor="invite-deploy" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Deployment URL</label>
            <input id="invite-deploy" className="input-glass" placeholder="https://your-app.vercel.app" type="url" value={state.deploymentUrl} onChange={(e) => dispatch({ type: "SET_FIELD", field: "deploymentUrl", value: e.target.value })} required />
          </div>
        </>
      )}

      <div>
        <label htmlFor="invite-message" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Message to reviewers</label>
        <textarea
          id="invite-message"
          className="input-glass"
          placeholder="Tell us about your approach..."
          value={state.message}
          onChange={(e) => dispatch({ type: "SET_FIELD", field: "message", value: e.target.value })}
          rows={5}
          style={{ resize: "vertical" }}
        />
      </div>

      <AnimatePresence>
        {state.error && (
          <m.p
            className="text-sm rounded-lg p-3"
            style={{ background: "rgba(239,68,68,0.1)", color: "var(--error-color)" }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {state.error}
          </m.p>
        )}
      </AnimatePresence>

      <button className="btn-gradient w-full" disabled={submitMutation.isPending} type="submit">
        {submitMutation.isPending ? (
          <span className="flex items-center justify-center gap-2">
            <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.6s linear infinite" }} />
            Submitting...
          </span>
        ) : (
          "Submit challenge"
        )}
      </button>
    </form>
  );
}
