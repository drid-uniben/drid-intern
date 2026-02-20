"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function RoleRedirect() {
  const router = useRouter();

  useEffect(() => {
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

  return <p>Redirecting...</p>;
}
