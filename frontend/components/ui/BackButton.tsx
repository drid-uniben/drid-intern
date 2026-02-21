"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export function BackButton({ fallbackHref = "/" }: { fallbackHref?: string }) {
  const router = useRouter();

  return (
    <button
      onClick={() => {
        if (typeof window !== 'undefined' && window.history.length > 2) {
          router.back();
        } else {
          router.push(fallbackHref);
        }
      }}
      className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80 mb-6"
      style={{ color: "var(--text-secondary)" }}
    >
      <ArrowLeftIcon className="w-4 h-4" />
      Back
    </button>
  );
}
