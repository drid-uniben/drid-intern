"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { apiPost } from "@/lib/api";

interface ChallengeResponse {
  id: string;
}

export function CreateChallengeForm({ cohortId }: { cohortId: string }) {
  const [category, setCategory] = useState<"backend" | "frontend" | "fullstack" | "design">("backend");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const token = localStorage.getItem("accessToken") ?? undefined;
    const result = await apiPost<ChallengeResponse>(
      "/challenges",
      { cohortId, category, title, description },
      token,
    );

    if (!result.success || !result.data) {
      setMessage(result.error ?? "Failed to create challenge");
      return;
    }

    setChallengeId(result.data.id);
    setMessage("Challenge created successfully.");
  };

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <select className="w-full rounded border border-slate-300 p-2" value={category} onChange={(event) => setCategory(event.target.value as typeof category)}>
        <option value="backend">Backend</option>
        <option value="frontend">Frontend</option>
        <option value="fullstack">Fullstack</option>
        <option value="design">Design</option>
      </select>
      <input className="w-full rounded border border-slate-300 p-2" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Challenge title" required />
      <textarea className="w-full rounded border border-slate-300 p-2" rows={10} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Challenge description" required />
      <button className="rounded bg-slate-900 px-4 py-2 text-white" type="submit">Create challenge</button>
      {message ? <p className="text-sm">{message}</p> : null}
      {challengeId ? <Link className="text-sm text-blue-700 underline" href={`/admin/challenges/${challengeId}/edit`}>Open in challenge editor</Link> : null}
    </form>
  );
}
