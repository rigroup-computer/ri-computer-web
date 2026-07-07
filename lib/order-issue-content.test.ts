import { describe, expect, it } from "vitest";

import {
  formatIssueWithDeviceSpecs,
  parseStoredOrderIssue,
} from "@/lib/order-issue-content";

describe("order-issue-content", () => {
  it("round-trips specs and complaint", () => {
    const stored = formatIssueWithDeviceSpecs(
      "Intel i5-1135G7, Intel Iris Xe",
      "Laptop lemot saat dipakai",
    );
    expect(parseStoredOrderIssue(stored)).toEqual({
      deviceSpecs: "Intel i5-1135G7, Intel Iris Xe",
      complaint: "Laptop lemot saat dipakai",
    });
  });

  it("treats legacy plain issue as complaint only", () => {
    expect(parseStoredOrderIssue("Layar flickering")).toEqual({
      deviceSpecs: null,
      complaint: "Layar flickering",
    });
  });
});
