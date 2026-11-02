import type { Metadata } from "next";
import Link from "next/link";
import { StoryCard } from "@/components/StoryCard";
import { getArticles, toCard } from "@/lib/content";
import { NAV } from "@/lib/site";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  const recent = getArticles().slice(0, 3).map(toCard);
  return (
    <div className="wrap error-page">
      <p className="error-page__mark" aria-hidden="true">
        404
      </p>
      <div className="error-page__copy">
        <h1 className="h-l">This one went wide.</h1>
        <p className="deck">The page you were looking for isn&rsquo;t here. It may have moved, or the link may be wrong.</p>
        <form className="search-form" role="search" action="/search">
          <label htmlFor="not-found-search" className="visually-hidden">
            Search PRAWD
          </label>
          <input id="not-found-search" type="search" name="q" placeholder="Search PRAWD" />
          <button type="submit">Search</button>
        </form>
        <nav aria-label="Sections" style={{ marginTop: 16 }}>
          <ul className="topic-links">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <section aria-labelledby="not-found-recent">
        <div className="section-head">
          <h2 id="not-found-recent" className="section-title">
            Recent stories
          </h2>
        </div>
        <div className="trio">
          {recent.map((card) => (
            <StoryCard key={card.slug} card={card} sizes="(min-width: 720px) 33vw, 100vw" />
          ))}
        </div>
      </section>
    </div>
  );
}
