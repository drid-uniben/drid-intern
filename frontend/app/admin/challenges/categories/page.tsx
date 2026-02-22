import { ChallengeCategoryManager } from "@/components/admin/ChallengeCategoryManager";
import { BackButton } from "@/components/ui/BackButton";

export default function AdminChallengeCategoriesPage() {
  return (
    <main className="mx-auto max-w-4xl space-y-6 px-6 py-12">
      <BackButton fallbackHref="/admin" />
      <h1 className="text-3xl font-bold" style={{ animation: "fadeIn 0.5s ease-out" }}>
        Challenge <span className="gradient-text">Categories</span>
      </h1>
      <p style={{ color: "var(--text-secondary)" }}>Manage available challenge categories for cohorts, invitations, and submissions.</p>
      <div style={{ animation: "slideUp 0.5s ease-out 0.1s both" }}>
        <ChallengeCategoryManager />
      </div>
    </main>
  );
}
