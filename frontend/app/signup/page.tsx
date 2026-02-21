import type { Metadata } from "next";
import { SignupForm } from "@/components/forms/SignupForm";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign Up — DRID Internship",
  description: "Create your DRID Internship account. Admin approval required.",
};

export default function SignupPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md" style={{ animation: "slideUp 0.5s ease-out" }}>
        <div className="glass rounded-3xl p-8 gradient-border">
          <h1 className="text-3xl font-bold gradient-text">Create account</h1>
          <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
            Intern accounts require admin approval before login.
          </p>
          <div className="mt-6">
            <SignupForm />
          </div>
          <p className="mt-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link href="/login" className="gradient-text font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
