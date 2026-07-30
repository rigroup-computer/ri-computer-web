import { describe, expect, it } from "vitest";

import { buildVisitConfirmationWhatsAppMessage } from "@/lib/admin-visit-confirmation-message";

const confirmedVisitAt = new Date("2025-08-01T03:00:00.000Z");

describe("buildVisitConfirmationWhatsAppMessage", () => {
  it("uses store visit copy for REGULAR service type", () => {
    const message = buildVisitConfirmationWhatsAppMessage({
      customerName: "Budi",
      trackingId: "RC-12345",
      confirmedVisitAt,
      serviceType: "REGULAR",
    });

    expect(message).toContain("mengonfirmasi jadwal kunjungan/servis Anda.");
    expect(message).toContain("Mohon datang sesuai jadwal di atas.");
    expect(message).not.toContain("Alamat:");
  });

  it("uses delivery copy with address for DELIVERY service type", () => {
    const message = buildVisitConfirmationWhatsAppMessage({
      customerName: "Budi",
      trackingId: "RC-12345",
      confirmedVisitAt,
      serviceType: "DELIVERY",
      visitAddress: "Jl. Merdeka No. 10, Bandung",
    });

    expect(message).toContain("mengonfirmasi jadwal delivery servis Anda.");
    expect(message).toContain("Alamat: Jl. Merdeka No. 10, Bandung");
    expect(message).toContain("Mohon stand by sesuai jadwal di atas.");
  });

  it("falls back when delivery address is empty", () => {
    const message = buildVisitConfirmationWhatsAppMessage({
      customerName: "Budi",
      trackingId: "RC-12345",
      confirmedVisitAt,
      serviceType: "DELIVERY",
      visitAddress: "",
    });

    expect(message).toContain("Alamat: -");
  });
});
