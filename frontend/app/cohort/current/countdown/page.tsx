import { apiGet } from "@/lib/api";
import { Cohort } from "@/types/domain";

const formatRemaining = (deadlineAt: string): string => {
  const diff = new Date(deadlineAt).getTime() - Date.now();
  if (diff <= 0) {
    return "Application window has ended.";
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  return `${days}d ${hours}h ${mins}m remaining`;
};

export default async function CohortCountdownPage() {
  const result = await apiGet<Cohort>("/public/cohort");

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold">Cohort Countdown</h1>
      <p className="mt-4 text-xl">{result.success && result.data ? formatRemaining(result.data.deadlineAt) : "No active cohort"}</p>
    </main>
  );
}
