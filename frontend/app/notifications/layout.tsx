import type { Metadata } from "next";
import { RouteGuard } from "@/components/auth/RouteGuard";

export const metadata: Metadata = {
  title: "Notifications — DRID Internship",
  description: "View your notifications and updates.",
};

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return <RouteGuard>{children}</RouteGuard>;
}
