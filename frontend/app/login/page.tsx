import type { Metadata } from "next";
import { LoginForm } from "@/components/forms/LoginForm";
import Link from "next/link";
import { PublicOnlyRoute } from "@/components/auth/PublicOnlyRoute";

export const metadata: Metadata = {
  title: "Sign In — DRID Internship",
  description: "Sign in to your DRID Internship account.",
};

export default function LoginPage() {
  return (
    <PublicOnlyRoute>
      <main className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="w-full max-w-md" style={{ animation: "slideUp 0.5s ease-out" }}>
          <div className="glass rounded-3xl p-8 gradient-border">
            <h1 className="text-3xl font-bold gradient-text">Welcome back</h1>
            <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
              Sign in to your account
            </p>
            <div className="mt-6">
              <LoginForm />
            </div>
            <p className="mt-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="gradient-text font-medium">Sign up</Link>
            </p>
          </div>
        </div>
      </main>
    </PublicOnlyRoute>
  );
}
