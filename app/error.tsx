"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-display text-3xl font-bold">We could not load this page</h1>
      <p className="max-w-md text-muted">
        {error.message.includes("MONGODB_URI")
          ? "The database is not configured. Add MONGODB_URI to .env.local and restart."
          : "Check your connection and try again."}
      </p>
      <button onClick={reset} className="btn btn-primary">Try again</button>
    </main>
  );
}
