/**
 * Instant loading UI for admin route transitions.
 * Rendered under AdminShell so sidebar / nav stay visible.
 */
export function AdminPageLoading() {
  return (
    <div
      className="space-y-4 lg:space-y-5"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Memuat halaman"
    >
      <span className="sr-only">Memuat halaman…</span>

      <div className="flex items-center justify-between gap-3">
        <div className="h-7 w-40 animate-pulse rounded-lg bg-slate-200/90 lg:h-8 lg:w-52" />
        <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200/80 lg:h-10 lg:w-10" />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-2xl bg-slate-200/80 lg:h-28"
          />
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
        <div className="border-b border-slate-100 px-4 py-3">
          <div className="h-4 w-28 animate-pulse rounded bg-slate-200/90" />
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={index}
              className="flex items-center gap-3 px-4 py-3.5"
            >
              <div className="size-10 shrink-0 animate-pulse rounded-full bg-slate-200/80" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3.5 w-2/3 max-w-48 animate-pulse rounded bg-slate-200/90" />
                <div className="h-3 w-1/2 max-w-32 animate-pulse rounded bg-slate-200/70" />
              </div>
              <div className="h-6 w-16 shrink-0 animate-pulse rounded-full bg-slate-200/80" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
