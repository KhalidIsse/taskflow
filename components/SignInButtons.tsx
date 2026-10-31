import { signIn } from "@/auth";

const providers = [
  { id: "google", label: "Continue with Google" },
  { id: "github", label: "Continue with GitHub" },
];

export default function SignInButtons() {
  return (
    <div className="flex flex-col gap-3">
      {providers.map((p) => (
        <form
          key={p.id}
          action={async () => {
            "use server";
            await signIn(p.id, { redirectTo: "/dashboard" });
          }}
        >
          <button type="submit" className="btn btn-outline w-full">{p.label}</button>
        </form>
      ))}
    </div>
  );
}
