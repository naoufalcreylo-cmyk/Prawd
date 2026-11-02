import type { MetadataRoute } from "next";
import { getArticles } from "@/lib/content";
import { CATEGORIES, SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!SITE.indexable) return [];
  const pages = ["", "/latest", "/about", "/contact", "/privacy", "/credits", ...CATEGORIES.map((c) => `/category/${c.slug}`)];
  return [
    ...pages.map((path) => ({ url: `${SITE.url}${path}` })),
    ...getArticles()
      .filter((a) => !a.demo)
      .map((a) => ({ url: `${SITE.url}/articles/${a.slug}`, lastModified: a.modified ?? a.published })),
  ];
}
