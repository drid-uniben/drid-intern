"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { apiPost } from "@/lib/api";
import { useAuthToken } from "@/hooks/useAuth";

interface ChallengeResponse {
  id: string;
}

export function CreateChallengeForm({ cohortId }: { cohortId: string }) {
  const token = useAuthToken();
  const queryClient = useQueryClient();
  const [category, setCategory] = useState<"backend" | "frontend" | "fullstack" | "design">("backend");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      return apiPost<ChallengeResponse>("/challenges", { cohortId, category, title, description }, token);
    },
    onSuccess: (result) => {
      if (result.success && result.data) {
        setChallengeId(result.data.id);
        setMessage("Challenge created successfully! 🎉");
        setIsSuccess(true);
        queryClient.invalidateQueries({ queryKey: ["admin-challenges", cohortId] });
      } else {
        setMessage(result.error ?? "Failed to create challenge");
        setIsSuccess(false);
      }
    },
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    mutation.mutate();
  };

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="text-lg font-semibold gradient-text">Create New Challenge</h2>
      <form className="mt-4 space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Category</label>
          <select className="input-glass" value={category} onChange={(e) => setCategory(e.target.value as typeof category)}>
            <option value="backend">Backend</option>
            <option value="frontend">Frontend</option>
            <option value="fullstack">Fullstack</option>
            <option value="design">Design</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Title</label>
          <input className="input-glass" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Challenge title" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Description</label>
          <textarea className="input-glass" rows={10} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Challenge description" required style={{ resize: "vertical" }} />
        </div>
        <button className="btn-gradient w-full" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Creating..." : "Create challenge"}
        </button>

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <p
                className="text-sm rounded-lg p-3"
                style={{
                  background: isSuccess ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                  color: isSuccess ? "var(--success-color)" : "var(--error-color)",
                }}
              >
                {message}
              </p>
              {challengeId && (
                <Link className="mt-2 inline-block text-sm gradient-text font-medium" href={`/admin/challenges/${challengeId}/edit`}>
                  Open in challenge editor →
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
