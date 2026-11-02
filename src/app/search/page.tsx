import type { Metadata } from "next";
import Link from "next/link";
import { StoryCard } from "@/components/StoryCard";
import { getArticles, toCard, toSearchEntry } from "@/lib/content";
import { searchEntries } from "@/lib/search";
import { CATEGORIES } from "@/lib/site";

export const metadata: Metadata = { title: "Search", robots: { index: false, follow: true } };

type Props = { searchParams: Promise<{ q?: string | string[] }> };

export default async function SearchPage({ searchParams }: Props) {
  const raw = (await searchParams).q;
  const query = (Array.isArray(raw) ? raw[0] : (raw ?? "")).trim().slice(0, 120);
  const results = query ? searchEntries(getArticles().map(toSearchEntry), query) : [];
  const recent = getArticles().slice(0, 3).map(toCard);

  return (
    <div className="wrap">
      <header className="page-head" style={{ paddingBottom: 0 }}>
        <h1 className="visually-hidden">Search PRAWD</h1>
        <form className="search-form" role="search" action="/search" style={{ marginTop: 0 }}>
          <label htmlFor="page-search" className="visually-hidden">
            Search PRAWD
          </label>
          <input id="page-search" type="search" name="q" defaultValue={query} placeholder="Search PRAWD" />
          <button type="submit">Search</button>
        </form>
      </header>

      <p className="search-status" role="status">
        {!query
          ? "Search articles by title, topic, tag or author."
          : results.length > 0
            ? `${results.length} ${results.length === 1 ? "story" : "stories"} for “${query}”`
            : `Nothing found for “${query}”.`}
      </p>

      {results.length > 0 ? (
        <div className="archive-grid">
          {results.map((entry) => (
            <StoryCard key={entry.slug} card={entry} sizes="(min-width: 1040px) 33vw, (min-width: 720px) 50vw, 100vw" excerpt />
          ))}
        </div>
      ) : (
        <>
          {query ? (
            <p className="deck empty">Try a broader word, like “boots”, “supporters” or “pitch”, or browse a section.</p>
          ) : null}
          <nav aria-label="Browse by section">
            <ul className="topic-links">
              {CATEGORIES.map((category) => (
                <li key={category.slug}>
                  <Link href={`/category/${category.slug}`}>{category.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="section-head">
            <h2 className="section-title">Recent stories</h2>
          </div>
          <div className="trio">
            {recent.map((card) => (
              <StoryCard key={card.slug} card={card} sizes="(min-width: 720px) 33vw, 100vw" />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
