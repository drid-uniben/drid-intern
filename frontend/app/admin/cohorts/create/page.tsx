import type { Metadata } from "next";
import { CreateCohortForm } from "@/components/admin/CreateCohortForm";
import { BackButton } from "@/components/ui/BackButton";

export const metadata: Metadata = {
  title: "Create Cohort — DRID Internship",
  description: "Set up a new internship cohort.",
};

export default function AdminCreateCohortPage() {
  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <BackButton fallbackHref="/admin" />
      <div className="glass rounded-3xl p-8" style={{ animation: "slideUp 0.5s ease-out" }}>
        <h1 className="text-3xl font-bold gradient-text">Create Cohort</h1>
        <p className="mt-1" style={{ color: "var(--text-secondary)" }}>Set up a new internship cohort</p>
        <div className="mt-6">
          <CreateCohortForm />
        </div>
      </div>
    </main>
  );
}
