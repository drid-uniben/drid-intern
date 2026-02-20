import { SignupForm } from "@/components/forms/SignupForm";

export default function SignupPage() {
  return (
    <main className="mx-auto max-w-md space-y-4 px-6 py-12">
      <h1 className="text-3xl font-bold">Sign up</h1>
      <p className="text-slate-600">Intern accounts require admin approval before login.</p>
      <SignupForm />
    </main>
  );
}
