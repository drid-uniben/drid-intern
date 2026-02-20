"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiGet, apiPatch } from "@/lib/api";
import { Challenge } from "@/types/domain";

export function ChallengeEditorForm({ challengeId }: { challengeId: string }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    apiGet<Challenge>(`/challenges/${challengeId}`).then((result) => {
      if (result.success && result.data) {
        setTitle(result.data.title);
        setDescription(result.data.description);
      }
    });
  }, [challengeId]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = localStorage.getItem("accessToken") ?? undefined;
    const result = await apiPatch<Challenge>(`/challenges/${challengeId}`, { title, description }, token);
    setMessage(result.success ? "Challenge updated with new version." : result.error ?? "Failed to update challenge");
  };

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <input className="w-full rounded border border-slate-300 p-2" value={title} onChange={(event) => setTitle(event.target.value)} required />
      <textarea className="w-full rounded border border-slate-300 p-2" rows={12} value={description} onChange={(event) => setDescription(event.target.value)} required />
      <button className="rounded bg-slate-900 px-4 py-2 text-white" type="submit">Save challenge</button>
      {message ? <p className="text-sm">{message}</p> : null}
    </form>
  );
}
