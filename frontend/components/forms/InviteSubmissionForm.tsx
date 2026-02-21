"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { apiGet, apiPost } from "@/lib/api";
import { InvitationValidation } from "@/types/domain";
import { ListSkeleton } from "@/components/ui/LoadingSkeleton";

export function InviteSubmissionForm({ token }: { token: string }) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [deploymentUrl, setDeploymentUrl] = useState("");
  const [figmaUrl, setFigmaUrl] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const { isLoading: validating } = useQuery({
    queryKey: ["invitation", token],
    queryFn: async () => {
      const result = await apiGet<InvitationValidation>(`/invitations/${token}`);
      if (result.success && result.data) {
        setEmail(result.data.email);
        setCategory(result.data.category);
        return result.data;
      }
      return null;
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      return apiPost("/submissions", {
        invitationToken: token,
        fullName,
        email,
        githubUrl: githubUrl || undefined,
        deploymentUrl: deploymentUrl || undefined,
        figmaUrl: figmaUrl || undefined,
        message,
      });
    },
    onSuccess: (result) => {
      if (!result.success) {
        setError(result.error ?? "Submission failed");
        return;
      }
      router.push(`/invite/${token}/success`);
    },
    onError: () => {
      setError("An unexpected error occurred.");
    },
  });

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    submitMutation.mutate();
  };

  if (validating) {
    return <ListSkeleton count={4} />;
  }

  const isDesign = category === "design";

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Full name</label>
        <input className="input-glass" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Email</label>
        <input className="input-glass" placeholder="you@example.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>

      {isDesign ? (
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Figma URL</label>
          <input className="input-glass" placeholder="https://figma.com/..." type="url" value={figmaUrl} onChange={(e) => setFigmaUrl(e.target.value)} required />
        </div>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>GitHub repo URL</label>
            <input className="input-glass" placeholder="https://github.com/..." type="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Deployment URL</label>
            <input className="input-glass" placeholder="https://your-app.vercel.app" type="url" value={deploymentUrl} onChange={(e) => setDeploymentUrl(e.target.value)} required />
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Message to reviewers</label>
        <textarea
          className="input-glass"
          placeholder="Tell us about your approach..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          style={{ resize: "vertical" }}
        />
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            className="text-sm rounded-lg p-3"
            style={{ background: "rgba(239,68,68,0.1)", color: "var(--error-color)" }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {error}
          </motion.p>
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
