/**
 * Shared infrastructure for domain SDK modules: env helpers, structured logging,
 * and consistent error wrapping around external services (Prisma, Nominatim, Cloudinary).
 */
import { v2 as cloudinary } from "cloudinary";

export type SdkLogLevel = "debug" | "info" | "warn" | "error";

/** Machine-readable category attached to every {@link SdkError}. */
export type SdkErrorCode =
  | "ENV_MISSING"
  | "EXTERNAL_SERVICE"
  | "DATABASE"
  | "NOT_FOUND"
  | "VALIDATION";

/** Typed error surfaced by SDK operations; rethrown as-is by {@link ApiClient.execute}. */
export class SdkError extends Error {
  readonly code: SdkErrorCode;
  readonly cause?: unknown;

  constructor(message: string, code: SdkErrorCode, cause?: unknown) {
    super(message);
    this.name = "SdkError";
    this.code = code;
    this.cause = cause;
  }
}

export type CloudinaryConfig = Readonly<{
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}>;

export type NominatimConfig = Readonly<{
  baseUrl: string;
  userAgent: string;
}>;

/**
 * Shared client for internal services (Neon/Prisma callers, Nominatim, Cloudinary).
 * Domain SDK modules compose one instance per service boundary.
 */
export class ApiClient {
  private readonly serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  /** @throws {SdkError} with code `ENV_MISSING` when the variable is unset or blank. */
  requireEnv(key: string, label?: string): string {
    const value = process.env[key]?.trim();
    if (!value) {
      throw new SdkError(
        `${label ?? key} belum diatur di lingkungan server.`,
        "ENV_MISSING",
      );
    }
    return value;
  }

  optionalEnv(key: string): string | undefined {
    const value = process.env[key]?.trim();
    return value && value.length > 0 ? value : undefined;
  }

  getCloudinaryConfig(): CloudinaryConfig {
    return {
      cloudName: this.requireEnv("CLOUDINARY_CLOUD_NAME", "CLOUDINARY_CLOUD_NAME"),
      apiKey: this.requireEnv("CLOUDINARY_API_KEY", "CLOUDINARY_API_KEY"),
      apiSecret: this.requireEnv(
        "CLOUDINARY_API_SECRET",
        "CLOUDINARY_API_SECRET",
      ),
    };
  }

  configureCloudinary(): CloudinaryConfig {
    const config = this.getCloudinaryConfig();
    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
    });
    return config;
  }

  getNominatimConfig(): NominatimConfig {
    const siteUrl =
      this.optionalEnv("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3000";
    return {
      baseUrl: "https://nominatim.openstreetmap.org",
      userAgent: `RiComputer-Booking/1.0 (${siteUrl})`,
    };
  }

  getCloudinaryFolder(
    key: "CLOUDINARY_BOOKING_FOLDER" | "CLOUDINARY_INVENTORY_FOLDER",
    fallback: string,
  ): string {
    return this.optionalEnv(key) ?? fallback;
  }

  log(level: SdkLogLevel, message: string, meta?: Record<string, unknown>): void {
    const payload = meta ? { service: this.serviceName, ...meta } : { service: this.serviceName };

    switch (level) {
      case "debug":
        if (process.env.NODE_ENV !== "production") {
          console.debug(`[${this.serviceName}] ${message}`, payload);
        }
        break;
      case "info":
        console.info(`[${this.serviceName}] ${message}`, payload);
        break;
      case "warn":
        console.warn(`[${this.serviceName}] ${message}`, payload);
        break;
      case "error":
        console.error(`[${this.serviceName}] ${message}`, payload);
        break;
    }
  }

  /**
   * Runs an async operation with structured error logging.
   * Existing {@link SdkError} instances are rethrown unchanged; other failures
   * are wrapped in a new {@link SdkError}.
   */
  async execute<T>(
    operation: string,
    fn: () => Promise<T>,
    options?: Readonly<{
      code?: SdkErrorCode;
      message?: string;
    }>,
  ): Promise<T> {
    try {
      return await fn();
    } catch (err) {
      this.log("error", `${operation} failed`, {
        error: err instanceof Error ? err.message : String(err),
      });

      if (err instanceof SdkError) {
        throw err;
      }

      throw new SdkError(
        options?.message ?? `Operasi ${operation} gagal.`,
        options?.code ?? "EXTERNAL_SERVICE",
        err,
      );
    }
  }
}

/** Preconfigured client for Prisma/Neon database operations. */
export const prismaClient = new ApiClient("prisma");
/** Preconfigured client for OpenStreetMap Nominatim geocoding. */
export const nominatimClient = new ApiClient("nominatim");
/** Preconfigured client for Cloudinary image uploads. */
export const cloudinaryClient = new ApiClient("cloudinary");
