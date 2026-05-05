import type { MetadataRoute } from "next";
import { isPublicIndexingAllowed } from "@/lib/seo-indexing";

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

  if (!isPublicIndexingAllowed()) {
    return {
      rules: {
        userAgent: "*",
        disallow: ["/"],
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: ["/"],
      disallow: ["/admin"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
