export type Searchable = {
  title: string;
  excerpt: string;
  categoryLabel: string;
  tags: string[];
  places?: string[];
  author: string;
  text: string;
};

function normalise(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    // Letters that Unicode doesn't split into a base letter and an accent.
    .replace(/ł/g, "l")
    .replace(/đ/g, "d")
    .replace(/ø/g, "o")
    .replace(/ß/g, "ss");
}

/** Every word must match somewhere. Titles count for more than body copy. */
export function searchEntries<T extends Searchable>(entries: T[], query: string): T[] {
  const terms = normalise(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  return entries
    .map((entry) => {
      const title = normalise(entry.title);
      const excerpt = normalise(entry.excerpt);
      const meta = normalise([entry.categoryLabel, entry.author, ...entry.tags, ...(entry.places ?? [])].join(" "));
      const text = normalise(entry.text);
      let score = 0;
      for (const term of terms) {
        const hit =
          (title.includes(term) ? 8 : 0) +
          (meta.includes(term) ? 4 : 0) +
          (excerpt.includes(term) ? 2 : 0) +
          (text.includes(term) ? 1 : 0);
        if (hit === 0) return { entry, score: 0 };
        score += hit;
      }
      return { entry, score };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((result) => result.entry);
}
