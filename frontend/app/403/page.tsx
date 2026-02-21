import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="glass rounded-3xl p-10 text-center max-w-md" style={{ animation: "slideUp 0.5s ease-out" }}>
        <p className="text-7xl font-bold gradient-text">403</p>
        <h1 className="mt-4 text-2xl font-bold">Access Denied</h1>
        <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
          You do not have permission to access this page.
        </p>
        <Link href="/" className="btn-gradient mt-6 inline-flex">Go home</Link>
      </div>
    </main>
  );
}
