import { AdminScheduleClient } from "@/components/admin/schedule/admin-schedule-client";
import { formatIsoDateToday } from "@/lib/store-hours";
import { scheduleSdk } from "@/src/lib/sdk/schedule";

export const dynamic = "force-dynamic";

export default async function AdminSchedulePage() {
  const todayIso = formatIsoDateToday();
  const [weekly, overrides] = await Promise.all([
    scheduleSdk.getWeekly(),
    scheduleSdk.listOverridesFrom(todayIso),
  ]);

  return (
    <main className="mx-auto max-w-6xl space-y-6 pb-28 lg:pb-8">
      <header className="hidden lg:block">
        <h1 className="text-xl font-bold text-mate-black">Jadwal Booking</h1>
        <p className="mt-1 text-sm text-mate-black/60">
          Atur hari &amp; jam yang bisa dipilih pelanggan saat booking.
        </p>
      </header>

      <AdminScheduleClient weekly={weekly} overrides={overrides} todayIso={todayIso} />
    </main>
  );
}
