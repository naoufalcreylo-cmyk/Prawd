export type CategorySlug =
  | "football-culture"
  | "kits-boots"
  | "stories"
  | "interviews"
  | "photography";

export type MediaItem = {
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
  credit: string;
  license: string;
  licenseUrl?: string;
  sourceUrl?: string;
  /** CSS object-position, keeps the subject in frame across crops. */
  focal?: string;
};

/** Everything a story card needs. Plain data, so it can cross into client components. */
export type CardData = {
  slug: string;
  title: string;
  displayTitle?: string;
  excerpt: string;
  categorySlug: CategorySlug;
  categoryLabel: string;
  date: string;
  dateLabel: string;
  readingMinutes: number;
  layout: "standard" | "photo" | "matchday" | "perspectives";
  format: string;
  image: { src: string; alt: string; focal?: string };
};

export type SearchEntry = CardData & { tags: string[]; places: string[]; author: string; text: string };

/** A chapter of a Matchday Edit, or an angle of a Perspectives story. */
export type StorySection = { id: string; label: string; summary: string; image: MediaItem };
