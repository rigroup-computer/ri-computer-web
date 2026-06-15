import { serviceStatusMilestoneRank } from "@/lib/service-order-status-transitions";
import { serviceStatusLabel } from "@/lib/service-status-label";

const STEPS = [
  {
    label: "Laptop masuk antrian",
    description: "Laptop Anda telah diterima dan masuk dalam antrian",
  },
  {
    label: "Sedang diservice",
    description: "Teknisi sedang melakukan pemeriksaan & perbaikan",
  },
  {
    label: "Konfirmasi tambahan biaya",
    description:
      "Konfirmasi otomatis akan dikirim via WhatsApp jika ada tambahan biaya / part yang diganti",
  },
  {
    label: "Selesai",
    description: "Laptop telah selesai diperbaiki dan siap diambil / diantar",
  },
] as const;

export function ServiceProgress({ status }: { status: string }) {
  const allDone = status === "COMPLETED";
  const current = serviceStatusMilestoneRank(status);

  return (
    <div className="mt-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-blue-900">
        Status Servis · {serviceStatusLabel(status)}
      </p>
      <div className="relative mt-4 space-y-0 pl-1">
        {STEPS.map((step, idx) => {
          const reached = allDone || idx < current;
          const active = !allDone && idx === current;

          return (
            <div key={step.label} className="relative flex gap-3 pb-6 last:pb-0">
              {idx < STEPS.length - 1 ? (
                <span
                  className={`absolute left-[11px] top-7 h-[calc(100%-0.75rem)] w-px ${reached ? "bg-blue-500" : "bg-slate-200"}`}
                  aria-hidden
                />
              ) : null}

              <div
                className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white shadow ${
                  reached
                    ? "bg-blue-600"
                    : active
                      ? "bg-blue-500 ring-4 ring-blue-100"
                      : "bg-slate-300"
                }`}
              >
                {reached ? "✓" : idx + 1}
              </div>

              <div className="-mt-1">
                <p
                  className={`text-sm font-semibold capitalize ${active ? "text-blue-950" : reached ? "text-slate-900" : "text-slate-500"}`}
                >
                  {step.label}
                </p>
                <p className="text-xs text-slate-600">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
