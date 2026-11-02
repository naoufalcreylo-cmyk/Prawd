import type { CategorySlug } from "./types";

export const SITE = {
  name: "PRAWD",
  line: "Football, beyond the pitch.",
  description:
    "PRAWD is an independent football publication exploring the game through its culture, people, style, imagery and creative expression.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  indexable: process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true",
  /** Add real destinations here and they appear in the footer. None exist yet. */
  social: [] as { label: string; href: string }[],
};

export const CATEGORIES: { slug: CategorySlug; label: string; description: string }[] = [
  {
    slug: "football-culture",
    label: "Football Culture",
    description:
      "Supporters, walls, rituals and the communities that give the game its meaning away from the ninety minutes.",
  },
  {
    slug: "kits-boots",
    label: "Kits & Boots",
    description: "What football wears, and why it matters: shirts, boots, design and the long afterlife of both.",
  },
  {
    slug: "stories",
    label: "Stories",
    description: "Longer reads about the places, habits and small histories football leaves behind.",
  },
  {
    slug: "interviews",
    label: "Interviews",
    description: "Conversations with the people who keep football going, from the touchline to the kit room.",
  },
  {
    slug: "photography",
    label: "Photography",
    description: "Photo essays and picture-led features about how football looks when you take the time to see it.",
  },
];

export const NAV = [
  { href: "/latest", label: "Latest" },
  ...CATEGORIES.map((c) => ({ href: `/category/${c.slug}`, label: c.label })),
  { href: "/atlas", label: "Atlas" },
];

/** PRAWD's own formats. Each link goes to a page that exists today. */
export const FORMATS = [
  { href: "/atlas", label: "PRAWD Atlas" },
  { href: "/articles/the-matchday-edit", label: "The Matchday Edit" },
  { href: "/articles/a-wallpaper-pattern-walks-onto-the-pitch", label: "PRAWD Perspectives" },
];

export const SECONDARY_NAV = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/credits", label: "Image credits" },
];

export const PAGE_SIZE = 9;

export function categoryLabel(slug: CategorySlug) {
  return CATEGORIES.find((c) => c.slug === slug)!.label;
}
