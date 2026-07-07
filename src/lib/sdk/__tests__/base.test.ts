import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClient, SdkError } from "@/src/lib/sdk/base";

describe("ApiClient", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("requireEnv throws SdkError with ENV_MISSING when unset", () => {
    const client = new ApiClient("test");
    delete process.env.MISSING_TEST_KEY;

    expect(() => client.requireEnv("MISSING_TEST_KEY")).toThrow(SdkError);
    try {
      client.requireEnv("MISSING_TEST_KEY");
    } catch (err) {
      expect(err).toBeInstanceOf(SdkError);
      expect((err as SdkError).code).toBe("ENV_MISSING");
    }
  });

  it("requireEnv returns trimmed value when set", () => {
    vi.stubEnv("PRESENT_KEY", "  hello  ");
    const client = new ApiClient("test");
    expect(client.requireEnv("PRESENT_KEY")).toBe("hello");
  });

  it("execute rethrows SdkError unchanged", async () => {
    const client = new ApiClient("test");
    const original = new SdkError("not found", "NOT_FOUND");

    await expect(
      client.execute("op", async () => {
        throw original;
      }),
    ).rejects.toBe(original);
  });

  it("execute wraps unknown errors in SdkError", async () => {
    const client = new ApiClient("test");

    await expect(
      client.execute("op", async () => {
        throw new Error("db down");
      }),
    ).rejects.toMatchObject({
      name: "SdkError",
      code: "EXTERNAL_SERVICE",
    });
  });
});
