"use client";

import { useState } from "react";
import { SCHEDULE_SERVICE_LABELS } from "@/components/admin/schedule/schedule-labels";
import { ScheduleOverridesSection } from "@/components/admin/schedule/schedule-overrides-section";
import { WeeklyScheduleEditor } from "@/components/admin/schedule/weekly-schedule-editor";
import {
  SCHEDULE_SERVICE_TYPES,
  type ScheduleConfig,
  type ScheduleServiceType,
} from "@/lib/types/schedule";
import type { ScheduleOverrideRow } from "@/src/lib/sdk/schedule";

type AdminScheduleClientProps = Readonly<{
  weekly: ScheduleConfig["weekly"];
  overrides: readonly ScheduleOverrideRow[];
  todayIso: string;
}>;

export function AdminScheduleClient({ weekly, overrides, todayIso }: AdminScheduleClientProps) {
  const [serviceType, setServiceType] = useState<ScheduleServiceType>("REGULAR");

  return (
    <div className="space-y-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-start lg:gap-8 lg:space-y-0">
      <div className="space-y-4">
        <div
          role="tablist"
          aria-label="Jenis layanan"
          className="grid grid-cols-2 gap-1 rounded-xl bg-[#f3f4f6] p-1"
        >
          {SCHEDULE_SERVICE_TYPES.map((type) => {
            const active = serviceType === type;
            return (
              <button
                key={type}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setServiceType(type)}
                className={`min-h-11 rounded-lg text-sm font-semibold transition ${
                  active ? "bg-white text-[#1a73e8] shadow-sm" : "text-[#565d6d]"
                }`}
              >
                {SCHEDULE_SERVICE_LABELS[type]}
              </button>
            );
          })}
        </div>

        <WeeklyScheduleEditor
          key={serviceType}
          serviceType={serviceType}
          initialDays={weekly[serviceType]}
        />
      </div>

      <ScheduleOverridesSection overrides={overrides} weekly={weekly} todayIso={todayIso} />
    </div>
  );
}
