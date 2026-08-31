import { looksLikeDatabaseUnreachable } from "@/lib/error-display";
import { SdkError } from "@/src/lib/sdk/base";

function sdkCauseMessage(cause: unknown): string {
  if (cause instanceof Error) {
    return cause.message;
  }
  if (
    typeof cause === "object" &&
    cause !== null &&
    "message" in cause &&
    typeof cause.message === "string"
  ) {
    return cause.message;
  }
  return "";
}

/** User-facing copy when a Server Action hits SDK/infra failures. */
export function serverActionFailureMessage(
  err: unknown,
  fallback: string,
): string {
  if (err instanceof SdkError) {
    const causeMessage = sdkCauseMessage(err.cause);

    if (looksLikeDatabaseUnreachable(causeMessage)) {
      return "Database sementara tidak tersedia. Tunggu beberapa detik lalu coba lagi.";
    }

    if (
      err.cause &&
      typeof err.cause === "object" &&
      "name" in err.cause &&
      err.cause.name === "TimeoutError"
    ) {
      return "Permintaan timeout. Periksa koneksi internet lalu coba lagi.";
    }

    if (err.code === "ENV_MISSING") {
      return err.message;
    }
  }

  if (err instanceof Error) {
    if (looksLikeDatabaseUnreachable(err.message)) {
      return "Database sementara tidak tersedia. Tunggu beberapa detik lalu coba lagi.";
    }
    return err.message;
  }

  return fallback;
}
