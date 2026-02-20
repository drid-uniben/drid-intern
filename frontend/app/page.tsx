import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center gap-6 px-6 py-12">
      <h1 className="text-4xl font-bold">DRID Internship Platform</h1>
      <p className="text-slate-600">
        Cohort-based challenge submission and review system for design, backend, frontend, and fullstack tracks.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link className="rounded bg-slate-900 px-4 py-2 text-white" href="/cohort/current">View active cohort</Link>
        <Link className="rounded border border-slate-300 px-4 py-2" href="/cohort/current/challenges">View challenges</Link>
        <Link className="rounded border border-slate-300 px-4 py-2" href="/login">Staff login</Link>
        <Link className="rounded border border-slate-300 px-4 py-2" href="/signup">Create intern account</Link>
      </div>
    </main>
  );
}
