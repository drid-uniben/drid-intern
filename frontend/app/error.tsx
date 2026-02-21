"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="glass rounded-3xl p-10 text-center max-w-md" style={{ animation: "slideUp 0.5s ease-out" }}>
        <p className="text-7xl font-bold gradient-text">500</p>
        <h1 className="mt-4 text-2xl font-bold">Server Error</h1>
        <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
          An unexpected server error occurred. Please try again later.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <button onClick={reset} className="btn-gradient inline-flex">
            Try again
          </button>
          <Link href="/" className="btn-glass inline-flex">
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
