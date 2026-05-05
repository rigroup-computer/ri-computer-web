import type { MetadataRoute } from "next";
import { isPublicIndexingAllowed } from "@/lib/seo-indexing";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!isPublicIndexingAllowed()) {
    return [];
  }

  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const paths = ["/", "/booking", "/tracking", "/marketplace"] as const;
  const now = new Date();

  return paths.map((path) => ({
    url: path === "/" ? `${base}/` : `${base}${path}`,
    lastModified: now,
  }));
}
