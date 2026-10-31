export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6" aria-busy="true" aria-label="Loading your board">
      <div className="mb-8 h-8 w-40 animate-pulse rounded bg-line" />
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-xl bg-white/50 p-3">
            <div className="mb-3 h-5 w-24 animate-pulse rounded bg-line" />
            <div className="flex flex-col gap-2">
              <div className="h-20 animate-pulse rounded-lg bg-line" />
              <div className="h-20 animate-pulse rounded-lg bg-line" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
