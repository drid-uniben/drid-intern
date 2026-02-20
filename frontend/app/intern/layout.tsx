import { RouteGuard } from "@/components/auth/RouteGuard";

export default function InternLayout({ children }: { children: React.ReactNode }) {
  return <RouteGuard allowedRoles={["INTERN", "ADMIN"]}>{children}</RouteGuard>;
}
