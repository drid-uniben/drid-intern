import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Review Queue — DRID Internship",
  description: "Review and rate intern challenge submissions.",
};

export default function ReviewerSubmissionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
