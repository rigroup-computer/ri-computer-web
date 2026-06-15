import { z } from "zod";

export type ServiceOrderCostLineItem = Readonly<{
  name: string;
  price: number;
}>;

export const serviceOrderCostLineItemSchema = z.object({
  name: z.string().trim().min(1, "Nama part wajib diisi."),
  price: z.number().int().positive("Harga harus lebih dari 0."),
});

export const serviceOrderCostLineItemsSchema = z
  .array(serviceOrderCostLineItemSchema)
  .min(1, "Minimal satu item biaya diperlukan.");

export function parseStoredCostLineItems(
  value: unknown,
): ServiceOrderCostLineItem[] {
  const parsed = z.array(serviceOrderCostLineItemSchema).safeParse(value);
  return parsed.success ? parsed.data : [];
}

export function sumCostLineItems(items: readonly ServiceOrderCostLineItem[]): number {
  return items.reduce((total, item) => total + item.price, 0);
}

export function formatCostLineItemsForTimelineNote(
  items: readonly ServiceOrderCostLineItem[],
  note?: string | null,
): string {
  const lines = items.map(
    (item) => `${item.name} — Rp ${item.price.toLocaleString("id-ID")}`,
  );
  if (note?.trim()) {
    lines.push("", note.trim());
  }
  return lines.join("\n");
}
