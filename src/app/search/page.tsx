import type { Metadata } from "next";
import Link from "next/link";
import { StoryCard, StoryRow } from "@/components/StoryCard";
import { getArticles, getPlaces, toCard, toSearchEntry } from "@/lib/content";
import { searchEntries } from "@/lib/search";
import { CATEGORIES } from "@/lib/site";

export const metadata: Metadata = { title: "Search", robots: { index: false, follow: true } };

type Props = { searchParams: Promise<{ q?: string | string[]; section?: string | string[] }> };

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : (value ?? ""));

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = first(params.q).trim().slice(0, 120);
  const section = first(params.section);
  const matches = query ? searchEntries(getArticles().map(toSearchEntry), query) : [];
  const results = section ? matches.filter((entry) => entry.categorySlug === section) : matches;
  const sections = CATEGORIES.map((c) => ({
    ...c,
    count: matches.filter((entry) => entry.categorySlug === c.slug).length,
  })).filter((c) => c.count > 0);
  const places = query
    ? getPlaces().filter((place) => place.city.toLowerCase().includes(query.toLowerCase()) || place.country.toLowerCase().includes(query.toLowerCase()))
    : [];
  const recent = getArticles().slice(0, 3).map(toCard);
  const href = (slug?: string) =>
    `/search?q=${encodeURIComponent(query)}${slug ? `&section=${encodeURIComponent(slug)}` : ""}`;

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
          ? "Search articles by title, topic, tag, author or place."
          : matches.length > 0
            ? `${results.length} ${results.length === 1 ? "story" : "stories"} for “${query}”`
            : `Nothing found for “${query}”.`}
      </p>

      {matches.length > 0 && sections.length > 1 ? (
        <nav aria-label="Filter results by section" className="scroll-rail">
          <ul className="filters">
            <li>
              <Link href={href()} aria-current={!section ? "page" : undefined}>
                All {matches.length}
              </Link>
            </li>
            {sections.map((c) => (
              <li key={c.slug}>
                <Link href={href(c.slug)} aria-current={section === c.slug ? "page" : undefined}>
                  {c.label} {c.count}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      {places.length > 0 ? (
        <nav className="search-places" aria-label="Places in the Atlas">
          <span className="fmt">In the Atlas</span>
          <ul className="topic-links">
            {places.map((place) => (
              <li key={place.slug}>
                <Link href={`/atlas/${place.slug}`}>{place.city}</Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      {results.length > 0 ? (
        <div className="rows">
          {results.map((entry) => (
            <StoryRow key={entry.slug} card={entry} />
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
              <li>
                <Link href="/atlas">Atlas</Link>
              </li>
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
