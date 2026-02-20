import { RouteGuard } from "@/components/auth/RouteGuard";

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return <RouteGuard>{children}</RouteGuard>;
}
