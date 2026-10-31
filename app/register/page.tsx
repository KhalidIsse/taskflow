import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AuthCard from "@/components/AuthCard";

export const metadata = { title: "Create account" };

export default async function RegisterPage() {
  if (await auth()) redirect("/dashboard");
  return (
    <AuthCard
      title="Create your account"
      subtitle="No password to remember. Sign up with Google or GitHub."
      footer={{ text: "Already have an account?", href: "/login", label: "Sign in" }}
    />
  );
}
