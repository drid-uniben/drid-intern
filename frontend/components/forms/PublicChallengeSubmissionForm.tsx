"use client";

import { FormEvent, useState } from "react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { apiPost } from "@/lib/api";
import { getSubmissionRequirements } from "@/lib/submissionRequirements";

interface PublicChallengeSubmissionFormProps {
  category: string;
}

export function PublicChallengeSubmissionForm({ category }: PublicChallengeSubmissionFormProps) {
  const requirements = getSubmissionRequirements(category);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [liveLink, setLiveLink] = useState("");
  const [designLinks, setDesignLinks] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    const result = await apiPost("/submissions", {
      category,
      fullName,
      email,
      repoUrl: requirements.requiresDesignAssets ? undefined : repoUrl || undefined,
      liveLink: requirements.requiresDesignAssets ? undefined : liveLink || undefined,
      designLinks: requirements.requiresDesignAssets ? designLinks || undefined : undefined,
      message,
    });

    setSubmitting(false);

    if (!result.success) {
      setError(result.error ?? "Failed to submit challenge");
      return;
    }

    setSuccess("Submission received successfully. We’ll review it and follow up.");
    setFullName("");
    setEmail("");
    setRepoUrl("");
    setLiveLink("");
    setDesignLinks("");
    setMessage("");
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <label htmlFor="public-submit-name" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
          Full name
        </label>
        <input id="public-submit-name" className="input-glass" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
      </div>

      <div>
        <label htmlFor="public-submit-email" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
          Email
        </label>
        <input id="public-submit-email" type="email" className="input-glass" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>

      {requirements.requiresDesignAssets ? (
        <div>
          <label htmlFor="public-submit-figma" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Design Links (Figma, etc.)
          </label>
          <input id="public-submit-figma" type="url" className="input-glass" value={designLinks} onChange={(e) => setDesignLinks(e.target.value)} required />
        </div>
      ) : (
        <>
          <div>
            <label htmlFor="public-submit-github" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Repository URL
            </label>
            <input id="public-submit-github" type="url" className="input-glass" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="public-submit-deploy" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Live Deployment URL
            </label>
            <input id="public-submit-deploy" type="url" className="input-glass" value={liveLink} onChange={(e) => setLiveLink(e.target.value)} required />
          </div>
        </>
      )}

      <div>
        <label htmlFor="public-submit-message" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
          Message
        </label>
        <textarea id="public-submit-message" className="input-glass" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} style={{ resize: "vertical" }} />
      </div>

      <button className="btn-gradient w-full" type="submit" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit challenge"}
      </button>

      <AnimatePresence>
        {error && (
          <m.p
            className="text-sm rounded-lg p-3"
            style={{ background: "rgba(239,68,68,0.1)", color: "var(--error-color)" }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {error}
          </m.p>
        )}
        {success && (
          <m.p
            className="text-sm rounded-lg p-3"
            style={{ background: "rgba(34,197,94,0.1)", color: "var(--success-color)" }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {success}
          </m.p>
        )}
      </AnimatePresence>
    </form>
  );
}
