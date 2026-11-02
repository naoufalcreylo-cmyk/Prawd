import Link from "next/link";
import { toCard, type Article } from "@/lib/content";
import { CATEGORIES, PAGE_SIZE } from "@/lib/site";
import type { CategorySlug } from "@/lib/types";
import { StoryCard, StoryRow } from "./StoryCard";
import { LoadMore } from "./LoadMore";

export function Archive({
  title,
  description,
  articles,
  page,
  basePath,
  current,
  category,
  tag,
}: {
  title: string;
  description: string;
  articles: Article[];
  page: number;
  basePath: string;
  current: string;
  category?: CategorySlug;
  tag?: string;
}) {
  const start = (page - 1) * PAGE_SIZE;
  const items = articles.slice(start, start + PAGE_SIZE).map(toCard);
  const totalPages = Math.max(1, Math.ceil(articles.length / PAGE_SIZE));
  const hrefFor = (n: number) => (n === 1 ? basePath : `${basePath}/page/${n}`);

  // Page one opens like a front page. Later pages are a plain list.
  const first = page === 1 ? items[0] : undefined;
  const pair = page === 1 ? items.slice(1, 3) : [];
  const rows = page === 1 ? items.slice(3) : items;

  return (
    <div className="wrap">
      <header className="page-head page-head--split">
        <h1 className="h-mega">{page > 1 ? `${title}, page ${page}` : title}</h1>
        <div>
          <p className="deck">{description}</p>
          <p className="meta page-head__count">
            {articles.length} {articles.length === 1 ? "story" : "stories"}
          </p>
        </div>
      </header>

      <nav aria-label="Filter by section" className="scroll-rail">
        <ul className="filters">
          <li>
            <Link href="/latest" aria-current={current === "/latest" ? "page" : undefined}>
              All
            </Link>
          </li>
          {CATEGORIES.map((c) => {
            const href = `/category/${c.slug}`;
            return (
              <li key={c.slug}>
                <Link href={href} aria-current={current === href ? "page" : undefined}>
                  {c.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {first ? (
        <div className="archive-front">
          <div className="archive-front__lead">
            <StoryCard
              card={first}
              ratio="r-wide"
              headingClass="h-l"
              headingLevel="h2"
              sizes="(min-width: 1040px) 58vw, 100vw"
              priority
              excerpt
            />
          </div>
          {pair.length > 0 ? (
            <div className="archive-front__side">
              {pair.map((card) => (
                <StoryCard
                  key={card.slug}
                  card={card}
                  ratio="r-land"
                  headingClass="h-s"
                  headingLevel="h2"
                  sizes="(min-width: 1040px) 40vw, (min-width: 720px) 50vw, 100vw"
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="rows">
        {rows.map((card) => (
          <StoryRow key={card.slug} card={card} />
        ))}
        {page < totalPages && page === 1 ? (
          <LoadMore
            shown={items.map((a) => a.slug)}
            category={category}
            tag={tag}
            batch={PAGE_SIZE}
            total={articles.length}
            href={hrefFor(page + 1)}
          />
        ) : null}
        {page > 1 ? (
          <nav className="pagination" aria-label="Pagination">
            <Link href={hrefFor(page - 1)}>Newer stories</Link>
            {page < totalPages ? <Link href={hrefFor(page + 1)}>Older stories</Link> : null}
          </nav>
        ) : null}
      </div>
    </div>
  );
}
