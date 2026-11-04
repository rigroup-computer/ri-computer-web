"use client";

import { createContext, useContext } from "react";
import type { ScheduleConfig } from "@/lib/types/schedule";

const ScheduleConfigContext = createContext<ScheduleConfig | null>(null);

export function ScheduleConfigProvider({
  config,
  children,
}: Readonly<{ config: ScheduleConfig; children: React.ReactNode }>) {
  return (
    <ScheduleConfigContext.Provider value={config}>
      {children}
    </ScheduleConfigContext.Provider>
  );
}

export function useScheduleConfig(): ScheduleConfig {
  const config = useContext(ScheduleConfigContext);
  if (!config) {
    throw new Error("useScheduleConfig must be used inside <ScheduleConfigProvider>.");
  }
  return config;
}
