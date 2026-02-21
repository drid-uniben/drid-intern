"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function RoleRedirect() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const role = localStorage.getItem("userRole");
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
  }, [router]);

  if (!mounted) return null;

  return <p>Redirecting...</p>;
}
