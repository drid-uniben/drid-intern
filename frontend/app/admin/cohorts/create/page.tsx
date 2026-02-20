import { CreateCohortForm } from "@/components/admin/CreateCohortForm";

export default function AdminCreateCohortPage() {
  return (
    <main className="mx-auto max-w-xl space-y-4 px-6 py-12">
      <h1 className="text-3xl font-bold">Create Cohort</h1>
      <CreateCohortForm />
    </main>
  );
}
