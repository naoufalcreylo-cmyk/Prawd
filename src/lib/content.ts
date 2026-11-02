import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import { z } from "zod";
import { CATEGORIES, categoryLabel } from "./site";
import type { CardData, CategorySlug, MediaItem, SearchEntry } from "./types";

const ROOT = path.join(process.cwd(), "content");
const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug) as [CategorySlug, ...CategorySlug[]];
const isoDate = z.union([z.date(), z.string()]).transform((v) => (v instanceof Date ? v : new Date(v)).toISOString());

export const frontmatterSchema = z.object({
  title: z.string().min(1),
  /** Optional large-headline version. "|" marks a line break on wider screens. */
  displayTitle: z.string().optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  excerpt: z.string().min(1),
  deck: z.string().optional(),
  category: z.enum(CATEGORY_SLUGS),
  format: z.enum(["Feature", "Essay", "Interview", "Photo Essay"]).default("Feature"),
  tags: z.array(z.string()).default([]),
  author: z.string(),
  published: isoDate,
  modified: isoDate.optional(),
  cover: z.string(),
  coverAlt: z.string().optional(),
  coverCaption: z.string().optional(),
  layout: z.enum(["standard", "photo"]).default("standard"),
  status: z.enum(["draft", "published"]).default("draft"),
  /** Demo content stays out of search engines even after indexing is switched on. */
  demo: z.boolean().default(false),
  demoNote: z.string().optional(),
  featured: z.boolean().default(false),
  homepage: z.enum(["lead", "supporting", "selects", "in-focus", "none"]).default("none"),
  homepageOrder: z.number().default(0),
  seo: z.object({ title: z.string().optional(), description: z.string().optional() }).default({}),
});

export type Article = z.infer<typeof frontmatterSchema> & {
  slug: string;
  body: string;
  readingMinutes: number;
  image: MediaItem;
  authorName: string;
  authorBio: string;
};

export const getMedia = cache((): Record<string, MediaItem> => {
  const items: MediaItem[] = JSON.parse(fs.readFileSync(path.join(ROOT, "media.json"), "utf8"));
  return Object.fromEntries(items.map((item) => [item.id, item]));
});

const getAuthors = cache((): Record<string, { name: string; bio: string }> =>
  JSON.parse(fs.readFileSync(path.join(ROOT, "authors.json"), "utf8")),
);

export function plainText(body: string) {
  return body
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_`>|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function readingMinutes(body: string) {
  const words = plainText(body).split(" ").length;
  const images = (body.match(/<Figure|ids=/g) ?? []).length;
  return Math.max(1, Math.round(words / 220 + images * 0.15));
}

const loadAll = cache((): Article[] => {
  const dir = path.join(ROOT, "articles");
  const media = getMedia();
  const authors = getAuthors();
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const { data, content } = matter(fs.readFileSync(path.join(dir, file), "utf8"));
      const parsed = frontmatterSchema.safeParse(data);
      if (!parsed.success) throw new Error(`${file}: ${parsed.error.message}`);
      const fm = parsed.data;
      const image = media[fm.cover];
      if (!image) throw new Error(`${file}: unknown cover "${fm.cover}"`);
      const author = authors[fm.author];
      if (!author) throw new Error(`${file}: unknown author "${fm.author}"`);
      return {
        ...fm,
        slug: fm.slug ?? file.replace(/\.mdx$/, ""),
        body: content,
        readingMinutes: readingMinutes(content),
        image: {
          ...image,
          alt: fm.coverAlt ?? image.alt,
          caption: fm.coverCaption ?? image.caption,
        },
        authorName: author.name,
        authorBio: author.bio,
      };
    })
    .sort((a, b) => b.published.localeCompare(a.published));
});

/** Drafts show in `npm run dev` for previewing and never in a production build. */
export function getArticles(): Article[] {
  const includeDrafts = process.env.NODE_ENV !== "production";
  return loadAll().filter((a) => a.status === "published" || includeDrafts);
}

export function getArticle(slug: string) {
  return getArticles().find((a) => a.slug === slug);
}

export function getByCategory(slug: CategorySlug) {
  return getArticles().filter((a) => a.category === slug);
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(iso),
  );
}

export function toCard(a: Article): CardData {
  return {
    slug: a.slug,
    title: a.title,
    displayTitle: a.displayTitle,
    excerpt: a.excerpt,
    categorySlug: a.category,
    categoryLabel: categoryLabel(a.category),
    date: a.published,
    dateLabel: formatDate(a.published),
    readingMinutes: a.readingMinutes,
    layout: a.layout,
    image: { src: a.image.src, alt: a.image.alt, focal: a.image.focal },
  };
}

export function toSearchEntry(a: Article): SearchEntry {
  return { ...toCard(a), tags: a.tags, author: a.authorName, text: plainText(a.body).slice(0, 12000) };
}

export function getRelated(article: Article, count = 3) {
  return getArticles()
    .filter((a) => a.slug !== article.slug)
    .map((a) => ({
      a,
      score: (a.category === article.category ? 3 : 0) + a.tags.filter((t) => article.tags.includes(t)).length * 2,
    }))
    .sort((x, y) => y.score - x.score || y.a.published.localeCompare(x.a.published))
    .slice(0, count)
    .map((x) => x.a);
}

export function tagSlug(tag: string) {
  return tag.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function getTags() {
  const tags = new Map<string, string>();
  for (const a of getArticles()) for (const t of a.tags) tags.set(tagSlug(t), t);
  return tags;
}

/** Assembles the homepage from frontmatter, with no story placed twice. */
export function getHomepage() {
  const all = getArticles();
  const slot = (name: Article["homepage"]) =>
    all.filter((a) => a.homepage === name).sort((a, b) => a.homepageOrder - b.homepageOrder);

  const used = new Set<string>();
  const take = (items: Article[], count: number) => {
    const picked = items.filter((a) => !used.has(a.slug)).slice(0, count);
    picked.forEach((a) => used.add(a.slug));
    return picked;
  };

  // Empty slots fill with featured stories first, then with the newest.
  const fallback = [...all.filter((a) => a.featured), ...all];
  const lead = take(slot("lead").concat(fallback), 1)[0];
  const supporting = take(slot("supporting").concat(fallback), 2);
  const focus = take(slot("in-focus").concat(fallback), 1)[0];
  const selects = take(slot("selects").concat(fallback), 3);
  const latest = take(all, 4);
  const kits = take(all.filter((a) => a.category === "kits-boots"), 3);
  const voices = take(all.filter((a) => a.category === "interviews"), 2);
  const leadSlugs = [lead, ...supporting].map((a) => a.slug);

  return { lead, supporting, leadSlugs, focus, selects, kits, voices, latest };
}
