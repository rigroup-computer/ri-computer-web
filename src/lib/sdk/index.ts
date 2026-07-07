/** Public barrel — import domain SDK modules from `@/src/lib/sdk`. */
export {
  ApiClient,
  SdkError,
  cloudinaryClient,
  nominatimClient,
  prismaClient,
  type CloudinaryConfig,
  type NominatimConfig,
  type SdkErrorCode,
  type SdkLogLevel,
} from "@/src/lib/sdk/base";

export {
  orderSdk,
  normalizePhoneForLookup,
  type AdminDashboardInventoryPreview,
  type AdminDashboardRecentOrder,
  type AdminDashboardStats,
  type PublicOrderTimeline,
  type PublicOrderView,
} from "@/src/lib/sdk/orders";

export { authSdk, type AuthSessionState } from "@/src/lib/sdk/auth";

export { geoSdk, type AddressSuggestion, type ReverseGeocodeResult } from "@/src/lib/sdk/geo";

export {
  marketplaceSdk,
  type InventoryPreviewItem,
} from "@/src/lib/sdk/marketplace";

export {
  rateLimitSdk,
  type RateLimitOptions,
  type RateLimitResult,
} from "@/src/lib/sdk/rate-limit";
