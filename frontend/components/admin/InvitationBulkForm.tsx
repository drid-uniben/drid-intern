"use client";

import { FormEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { apiPost } from "@/lib/api";
import { useAuthToken } from "@/hooks/useAuth";

export function InvitationBulkForm({ cohortId }: { cohortId: string }) {
  const token = useAuthToken();
  const [category, setCategory] = useState<"backend" | "frontend" | "fullstack" | "design">("backend");
  const [emails, setEmails] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      const parsedEmails = emails
        .split(/\r?\n|,|;/)
        .map((email) => email.trim())
        .filter((email) => email.length > 0);

      return apiPost<{ id: string }[]>(
        "/invitations",
        { cohortId, category, emails: parsedEmails, expiresInDays: 7 },
        token,
      );
    },
    onSuccess: (result) => {
      if (result.success && result.data) {
        setMessage(`${result.data.length} invitation(s) created and email dispatch queued. 📧`);
        setIsSuccess(true);
      } else {
        setMessage(result.error ?? "Failed to create invitations");
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
      <h2 className="text-lg font-semibold gradient-text">Send Invitations</h2>
      <form className="mt-4 space-y-4" onSubmit={onSubmit}>
        <div>
          <label htmlFor="invite-bulk-category" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Category</label>
          <select id="invite-bulk-category" className="input-glass" value={category} onChange={(e) => setCategory(e.target.value as typeof category)}>
            <option value="backend">Backend</option>
            <option value="frontend">Frontend</option>
            <option value="fullstack">Fullstack</option>
            <option value="design">Design</option>
          </select>
        </div>
        <div>
          <label htmlFor="invite-bulk-emails" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Email addresses</label>
          <textarea
            id="invite-bulk-emails"
            className="input-glass"
            rows={8}
            placeholder="Enter one email per line, or comma-separated"
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            required
            style={{ resize: "vertical" }}
          />
        </div>
        <button className="btn-gradient w-full" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Sending..." : "Send invitations"}
        </button>

        <AnimatePresence>
          {message && (
            <m.p
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
            </m.p>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
