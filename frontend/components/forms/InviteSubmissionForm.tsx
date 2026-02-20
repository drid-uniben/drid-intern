"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";
import { InvitationValidation } from "@/types/domain";

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiGet<InvitationValidation>(`/invitations/${token}`).then((result) => {
      if (result.success && result.data) {
        setEmail(result.data.email);
        setCategory(result.data.category);
      }
    });
  }, [token]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await apiPost("/submissions", {
      invitationToken: token,
      fullName,
      email,
      githubUrl: githubUrl || undefined,
      deploymentUrl: deploymentUrl || undefined,
      figmaUrl: figmaUrl || undefined,
      message,
    });

    setLoading(false);

    if (!result.success) {
      setError(result.error ?? "Submission failed");
      return;
    }

    router.push(`/invite/${token}/success`);
  };

  const isDesign = category === "design";

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <input className="w-full rounded border border-slate-300 p-2" placeholder="Full name" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
      <input className="w-full rounded border border-slate-300 p-2" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      {isDesign ? (
        <input className="w-full rounded border border-slate-300 p-2" placeholder="Figma URL" type="url" value={figmaUrl} onChange={(event) => setFigmaUrl(event.target.value)} required />
      ) : (
        <>
          <input className="w-full rounded border border-slate-300 p-2" placeholder="GitHub repo URL" type="url" value={githubUrl} onChange={(event) => setGithubUrl(event.target.value)} required />
          <input className="w-full rounded border border-slate-300 p-2" placeholder="Deployment URL" type="url" value={deploymentUrl} onChange={(event) => setDeploymentUrl(event.target.value)} required />
        </>
      )}
      <textarea className="w-full rounded border border-slate-300 p-2" placeholder="Message to reviewers" value={message} onChange={(event) => setMessage(event.target.value)} rows={5} />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button className="rounded bg-slate-900 px-4 py-2 text-white" disabled={loading} type="submit">{loading ? "Submitting..." : "Submit challenge"}</button>
    </form>
  );
}
