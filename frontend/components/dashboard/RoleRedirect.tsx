"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

export function RoleRedirect() {
  const router = useRouter();
  const role = useAppStore((state) => state.userRole);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    if (role === "ADMIN") {
      router.replace("/admin");
      return;
    }

    if (role === "REVIEWER") {
      router.replace("/reviewer");
      return;
    }

    if (role === "INTERN") {
      router.replace("/intern");
      return;
    }

    router.replace("/login");
  }, [role, router]);

  if (!mounted) return null;

  return <p>Redirecting...</p>;
}
