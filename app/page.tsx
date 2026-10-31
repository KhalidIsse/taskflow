import Link from "next/link";
import { auth } from "@/auth";

function BoardPreview() {
  const cols = [
    { name: "To do", cards: ["Book dentist", "Plan sprint"] },
    { name: "In progress", cards: ["Write report"] },
    { name: "Done", cards: ["Pay invoice", "Reply to Sam"] },
  ];
  return (
    <div aria-hidden className="relative grid grid-cols-3 gap-3 rounded-2xl border border-line bg-white/60 p-3">
      {cols.map((c) => (
        <div key={c.name} className="rounded-xl bg-paper p-2">
          <p className="mb-2 px-1 text-xs font-semibold text-muted">{c.name}</p>
          <div className="flex flex-col gap-2">
            {c.cards.map((t) => (
              <div key={t} className="rounded-lg border border-line bg-white p-2 text-sm">{t}</div>
            ))}
          </div>
        </div>
      ))}
      <div className="absolute left-[38%] top-[44%] w-[28%] rotate-3 rounded-lg border border-brand bg-white p-2 text-sm font-medium shadow-xl">
        Ship v1
      </div>
    </div>
  );
}

export default async function Home() {
  const session = await auth();
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-6">
      <nav className="flex items-center justify-between py-6">
        <Link href="/" className="font-display text-xl font-bold">TaskFlow</Link>
        <div className="flex gap-2">
          {session ? (
            <Link href="/dashboard" className="btn btn-primary">Open dashboard</Link>
          ) : (
            <>
              <Link href="/login" className="btn btn-outline">Sign in</Link>
              <Link href="/register" className="btn btn-primary">Create account</Link>
            </>
          )}
        </div>
      </nav>

      <section className="grid flex-1 items-center gap-12 py-12 md:grid-cols-2">
        <div>
          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
            Drag work from to do to done.
          </h1>
          <p className="mt-5 max-w-md text-lg text-muted">
            TaskFlow is a small task board for one person: three columns, your tasks, and nothing else in the way.
          </p>
          <div className="mt-8 flex gap-3">
            <Link href={session ? "/dashboard" : "/register"} className="btn btn-primary">
              {session ? "Go to your board" : "Get started free"}
            </Link>
          </div>
        </div>
        <BoardPreview />
      </section>
    </main>
  );
}
