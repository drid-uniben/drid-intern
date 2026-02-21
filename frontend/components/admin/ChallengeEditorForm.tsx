"use client";

import { FormEvent, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { apiGet, apiPatch } from "@/lib/api";
import { Challenge } from "@/types/domain";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";

export function ChallengeEditorForm({ challengeId }: { challengeId: string }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const { isLoading } = useQuery({
    queryKey: ["challenge", challengeId],
    queryFn: async () => {
      const result = await apiGet<Challenge>(`/challenges/${challengeId}`);
      if (result.success && result.data) {
        setTitle(result.data.title);
        setDescription(result.data.description);
        return result.data;
      }
      return null;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("accessToken") ?? undefined;
      return apiPatch<Challenge>(`/challenges/${challengeId}`, { title, description }, token);
    },
    onSuccess: (result) => {
      if (result.success) {
        setMessage("Challenge updated with new version! ✅");
        setIsSuccess(true);
      } else {
        setMessage(result.error ?? "Failed to update challenge");
        setIsSuccess(false);
      }
    },
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    mutation.mutate();
  };

  if (isLoading) return <CardSkeleton />;

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Title</label>
        <input className="input-glass" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Description</label>
        <textarea className="input-glass" rows={12} value={description} onChange={(e) => setDescription(e.target.value)} required style={{ resize: "vertical" }} />
      </div>
      <button className="btn-gradient" type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Saving..." : "Save challenge"}
      </button>

      <AnimatePresence>
        {message && (
          <motion.p
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
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
}
