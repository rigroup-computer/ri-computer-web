"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      position="bottom-center"
      offset={{ bottom: 72 }}
      mobileOffset={{ bottom: 88 }}
      richColors
      closeButton
      duration={5000}
      toastOptions={{
        classNames: {
          toast:
            "rounded-sm border border-slate-200 bg-white text-mate-black shadow-lg",
          title: "text-sm font-semibold text-mate-black",
          description: "text-xs text-slate-600",
          error: "!border-red-200 !bg-red-50",
          success: "!border-emerald-200 !bg-emerald-50",
        },
      }}
    />
  );
}
