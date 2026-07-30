import { describe, expect, it } from "vitest";

import { buildNoShowCancelWhatsAppMessage } from "@/lib/admin-cancel-whatsapp-message";

describe("buildNoShowCancelWhatsAppMessage", () => {
  it("uses store no-show copy for REGULAR service type", () => {
    const message = buildNoShowCancelWhatsAppMessage("Budi", "REGULAR");

    expect(message).toContain(
      "tidak datang sampai jam operasional store berakhir.",
    );
    expect(message).not.toContain("Waktu delivery hanya jam 9");
  });

  it("uses delivery cancel copy for DELIVERY service type", () => {
    const message = buildNoShowCancelWhatsAppMessage("Budi", "DELIVERY");

    expect(message).toContain("Halo ka Budi,");
    expect(message).toContain("Waktu delivery hanya jam 9");
    expect(message).toContain("Fee booking Rp.10,000");
    expect(message).not.toContain("jam operasional store berakhir");
  });
});
