import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AuthCard from "@/components/AuthCard";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await auth()) redirect("/dashboard");
  const { error } = await searchParams;
  return (
    <AuthCard
      title="Sign in to TaskFlow"
      subtitle="Use the account you already have."
      error={!!error}
      footer={{ text: "New here?", href: "/register", label: "Create an account" }}
    />
  );
}
