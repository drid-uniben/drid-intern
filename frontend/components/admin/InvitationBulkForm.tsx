"use client";

import { FormEvent, useState } from "react";
import { apiPost } from "@/lib/api";

export function InvitationBulkForm({ cohortId }: { cohortId: string }) {
  const [category, setCategory] = useState<"backend" | "frontend" | "fullstack" | "design">("backend");
  const [emails, setEmails] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedEmails = emails
      .split(/\r?\n|,|;/)
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    const token = localStorage.getItem("accessToken") ?? undefined;
    const result = await apiPost<{ id: string }[]>(
      "/invitations",
      { cohortId, category, emails: parsedEmails, expiresInDays: 7 },
      token,
    );

    if (!result.success || !result.data) {
      setMessage(result.error ?? "Failed to create invitations");
      return;
    }

    setMessage(`${result.data.length} invitation(s) created and email dispatch queued.`);
  };

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <select className="w-full rounded border border-slate-300 p-2" value={category} onChange={(event) => setCategory(event.target.value as typeof category)}>
        <option value="backend">Backend</option>
        <option value="frontend">Frontend</option>
        <option value="fullstack">Fullstack</option>
        <option value="design">Design</option>
      </select>
      <textarea
        className="w-full rounded border border-slate-300 p-2"
        rows={8}
        placeholder="Enter one email per line, or comma-separated"
        value={emails}
        onChange={(event) => setEmails(event.target.value)}
        required
      />
      <button className="rounded bg-slate-900 px-4 py-2 text-white" type="submit">Send invitations</button>
      {message ? <p className="text-sm text-slate-700">{message}</p> : null}
    </form>
  );
}
