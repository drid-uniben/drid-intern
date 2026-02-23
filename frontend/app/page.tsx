import type { Metadata } from "next";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { Challenge, Cohort } from "@/types/domain";
import TimelinePhases from "@/components/public/TimelinePhases";

export const metadata: Metadata = {
  title: "DRID Internship Platform",
  description:
    "A cohort-based, invite-only internship program for engineering and design talent. View the timeline and challenge tracks.",
};

export default async function Home() {
  const cohortResult = await apiGet<Cohort>("/public/cohort");
  const challengeResult = await apiGet<Challenge[]>("/public/challenges");
  const cohort = cohortResult.success ? cohortResult.data : undefined;
  const challenges =
    challengeResult.success && challengeResult.data
      ? challengeResult.data
      : [];

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[var(--glass-bg-subtle)] via-transparent to-transparent pointer-events-none" />

      <div
        className="orb"
        style={{
          width: 600,
          height: 600,
          background: "var(--accent-start)",
          opacity: 0.15,
          top: -200,
          left: -200,
          filter: "blur(120px)",
        }}
      />
      <div
        className="orb"
        style={{
          width: 500,
          height: 500,
          background: "var(--accent-end)",
          opacity: 0.12,
          bottom: -100,
          right: -150,
          animationDelay: "4s",
          filter: "blur(100px)",
        }}
      />

      <div className="w-full max-w-6xl space-y-16 px-6 py-20 relative z-10">
        {/* ── Hero text ── */}
        <section className="text-center space-y-6" style={{ animation: "slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both" }}>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
            Build your future with the<br className="hidden md:block" />
            <span className="gradient-text pb-2 inline-block">DRID Engineering Team</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed">
            An exclusive program designed to identify, challenge, and nurture exceptional technical and design talent.
          </p>

          {/* CTA buttons */}
          <div className="pt-6 flex flex-wrap justify-center gap-4">
            <Link className="btn-gradient px-8 py-3.5 text-base shadow-lg shadow-[var(--glow-color)] hover:shadow-xl hover:shadow-[var(--glow-color)]/60 transition-all" href="/cohort/current">
              View Active Cohort
            </Link>
            <Link className="btn-glass px-8 py-3.5 text-base hover:bg-[var(--glass-bg-strong)] transition-all" href="/cohort/current/challenges">
              Explore Challenges
            </Link>
          </div>
        </section>

        {/* ── Timeline ── */}
        <section style={{ animation: "slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both" }}>
          <TimelinePhases cohort={cohort} />
        </section>

        {/* ── What This Program Is ── */}
        <section
          className="glass-strong rounded-3xl p-8 md:p-12 relative overflow-hidden group hover:border-[var(--glass-border)] transition-colors"
          style={{ animation: "slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--glass-bg-subtle)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">About the Program</h2>
            <p className="text-lg leading-relaxed text-[var(--text-secondary)]">
              The DRID Internship Program places selected candidates into rigorous, real-world engineering and design scenarios. Participation is open to anyone. Participants receive a feedback email after the active cohort window on their submissions.
            </p>
          </div>
        </section>

        {/* ── Tracks ── */}
        <section className="space-y-8" style={{ animation: "slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both" }}>
          <div className="text-center">
            <h2 className="text-3xl font-bold">Challenge Tracks</h2>
            <p className="mt-2 text-[var(--text-secondary)]">Select your area of expertise</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Dynamic challenge cards if available, otherwise static list */}
            {challenges.length > 0 ? (
              challenges.map((challenge, i) => (
                <div
                  key={challenge.id}
                  className="glass rounded-2xl p-6 group hover:bg-[var(--glass-bg-strong)] transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-[var(--glass-shadow)] flex flex-col h-full"
                  style={{ animation: `slideUp 0.5s ease-out ${0.5 + i * 0.1}s both` }}
                >
                  <div className="flex-1">
                    <div className="mb-4 inline-flex">
                      <span className="badge badge-accent text-xs px-2.5 py-1 rounded-md">{challenge.category}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:gradient-text transition-colors">{challenge.title}</h3>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[var(--glass-border)]">
                    <Link
                      className="inline-flex items-center text-sm font-semibold gradient-text hover:opacity-80 transition-opacity"
                      href={`/cohort/current/challenges/${challenge.category}`}
                    >
                      View Challenge Details <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <>
                {/* Static Fallback Tracks when no cohort/challenges */}
                {[
                  { id: 'frontend', title: 'Frontend Engineering', category: 'frontend', track: 'Engineering' },
                  { id: 'backend', title: 'Backend Engineering', category: 'backend', track: 'Engineering' },
                  { id: 'fullstack', title: 'Fullstack Engineering', category: 'fullstack', track: 'Engineering' },
                  { id: 'design', title: 'Product Design', category: 'design', track: 'Design' }
                ].map((c, i) => (
                  <div
                    key={c.id}
                    className="glass rounded-2xl p-6 group hover:bg-[var(--glass-bg-strong)] transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-[var(--glass-shadow)] flex flex-col h-full"
                    style={{ animation: `slideUp 0.5s ease-out ${0.5 + i * 0.1}s both` }}
                  >
                    <div className="flex-1">
                      <div className="mb-4 flex flex-col items-start gap-2">
                        <span className="text-[10px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">{c.track}</span>
                        <span className="badge badge-accent text-xs px-2.5 py-1 rounded-md">{c.category}</span>
                      </div>
                      <h3 className="text-xl font-bold mb-2 group-hover:gradient-text transition-colors">{c.title}</h3>
                      <p className="text-sm text-[var(--text-secondary)]">Challenge details published during active cohort.</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[var(--glass-border)]">
                      <Link
                        className="inline-flex items-center text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                        href={`/cohort/current/challenges/${c.category}`}
                      >
                        View Example Details <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
