import { RouteGuard } from "@/components/auth/RouteGuard";

export default function ReviewerLayout({ children }: { children: React.ReactNode }) {
  return <RouteGuard allowedRoles={["REVIEWER", "ADMIN"]}>{children}</RouteGuard>;
}
