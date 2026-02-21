import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pending Approval — DRID Internship",
  description: "Your account is pending admin approval.",
};

export default function SignupPendingPage() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="glass rounded-3xl p-10 text-center max-w-md" style={{ animation: "slideUp 0.5s ease-out" }}>
        <p className="text-5xl">⏳</p>
        <h1 className="mt-4 text-3xl font-bold gradient-text">Pending Approval</h1>
        <p className="mt-3" style={{ color: "var(--text-secondary)" }}>
          Your account was created successfully. An admin must approve it before you can log in.
        </p>
        <Link href="/login" className="btn-glass mt-6 inline-flex">Back to login</Link>
      </div>
    </main>
  );
}
