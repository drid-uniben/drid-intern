import { LoginForm } from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md space-y-4 px-6 py-12">
      <h1 className="text-3xl font-bold">Login</h1>
      <p className="text-slate-600">For admin, reviewer, and intern users.</p>
      <LoginForm />
    </main>
  );
}
