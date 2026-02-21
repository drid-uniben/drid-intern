type BadgeVariant = "accent" | "success" | "warning" | "error";

interface StatusBadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const statusToVariant: Record<string, BadgeVariant> = {
  ACTIVE: "success",
  CLOSED: "error",
  ARCHIVED: "warning",
  DRAFT: "accent",
  PENDING_APPROVAL: "warning",
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "error",
  SUBMITTED: "accent",
};

export function StatusBadge({ variant = "accent", children, className = "" }: StatusBadgeProps) {
  return <span className={`badge badge-${variant} ${className}`}>{children}</span>;
}

export function AutoStatusBadge({ status, className = "" }: { status: string; className?: string }) {
  const variant = statusToVariant[status] ?? "accent";
  return <StatusBadge variant={variant} className={className}>{status}</StatusBadge>;
}
