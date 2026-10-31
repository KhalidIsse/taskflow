import Link from "next/link";
import SignInButtons from "./SignInButtons";

type Props = {
  title: string;
  subtitle: string;
  error?: boolean;
  footer: { text: string; href: string; label: string };
};

export default function AuthCard({ title, subtitle, error, footer }: Props) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <Link href="/" className="font-display mb-8 text-2xl font-bold">TaskFlow</Link>
      <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-6">
        <h1 className="font-display text-2xl font-bold">{title}</h1>
        <p className="mb-6 mt-1 text-muted">{subtitle}</p>
        {error && (
          <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">
            Sign-in did not finish. Try again, or use the other provider.
          </p>
        )}
        <SignInButtons />
      </div>
      <p className="mt-6 text-sm text-muted">
        {footer.text}{" "}
        <Link href={footer.href} className="font-semibold text-brand underline">{footer.label}</Link>
      </p>
    </main>
  );
}
