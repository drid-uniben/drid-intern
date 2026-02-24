"use client";

import { FormEvent, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { useRouter } from "next/navigation";
import { apiGet, apiPatch } from "@/lib/api";
import { Challenge } from "@/types/domain";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { useAuthToken } from "@/hooks/useAuth";
import { useAppStore } from "@/lib/store";
import { validateChallengeDescriptionLinks } from "@/lib/challengeLinks";

export function ChallengeEditorForm({ challengeId }: { challengeId: string }) {
  const router = useRouter();
  const token = useAuthToken();
  const authInitialized = useAppStore((state) => state.authInitialized);
  const [titleDraft, setTitleDraft] = useState<string | null>(null);
  const [descriptionDraft, setDescriptionDraft] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const { data: challenge, isLoading, isError } = useQuery({
    queryKey: ["challenge", challengeId],
    enabled: authInitialized,
    queryFn: async () => {
      const result = await apiGet<Challenge>(`/challenges/${challengeId}`);
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error(result.error ?? "Challenge not found");
    },
  });

  const title = titleDraft ?? challenge?.title ?? "";
  const description = descriptionDraft ?? challenge?.description ?? "";

  const mutation = useMutation({
    mutationFn: async () => {
      return apiPatch<Challenge>(`/challenges/${challengeId}`, { title, description }, token);
    },
    onSuccess: (result) => {
      if (result.success && result.data) {
        setTitleDraft(result.data.title);
        setDescriptionDraft(result.data.description);
        setMessage("Challenge updated with new version! ✅");
        setIsSuccess(true);
        if (result.data.id !== challengeId) {
          router.replace(`/admin/challenges/${result.data.id}/edit`);
        }
      } else {
        setMessage(result.error ?? "Failed to update challenge");
        setIsSuccess(false);
      }
    },
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const linkError = validateChallengeDescriptionLinks(description);
    if (linkError) {
      setMessage(linkError);
      setIsSuccess(false);
      return;
    }

    setMessage(null);
    mutation.mutate();
  };

  if (!authInitialized || isLoading) return <CardSkeleton />;

  if (isError) {
    return <p className="text-sm" style={{ color: "var(--error-color)" }}>Challenge not found.</p>;
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <label htmlFor="editor-title" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Title</label>
        <input id="editor-title" className="input-glass" value={title} onChange={(e) => setTitleDraft(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="editor-desc" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Description</label>
        <textarea id="editor-desc" className="input-glass" rows={12} value={description} onChange={(e) => setDescriptionDraft(e.target.value)} required style={{ resize: "vertical" }} />
        <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
          Add links with [text](https://example.com) or paste full https:// URLs.
        </p>
      </div>
      <button className="btn-gradient" type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Saving..." : "Save challenge"}
      </button>

      <AnimatePresence>
        {message && (
          <m.p
            className="text-sm rounded-lg p-3"
            style={{
              background: isSuccess ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
              color: isSuccess ? "var(--success-color)" : "var(--error-color)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {message}
          </m.p>
        )}
      </AnimatePresence>
    </form>
  );
}
