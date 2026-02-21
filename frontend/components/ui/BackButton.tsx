"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export function BackButton({ fallbackHref = "/" }: { fallbackHref?: string }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80 mb-6"
      style={{ color: "var(--text-secondary)" }}
    >
      <ArrowLeftIcon className="w-4 h-4" />
      Back
    </button>
  );
}
