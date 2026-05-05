"use client";

import { useFormStatus } from "react-dom";

export function InventoryFormSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="h-12 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-sm disabled:opacity-70"
    >
      {pending ? "Menyimpan…" : "Simpan Listing"}
    </button>
  );
}
