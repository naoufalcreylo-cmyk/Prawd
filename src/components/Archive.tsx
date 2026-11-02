import Image from "next/image";
import Link from "next/link";
import { toCard, type Article } from "@/lib/content";
import { CATEGORIES, PAGE_SIZE } from "@/lib/site";
import type { CategorySlug } from "@/lib/types";
import { Headline, StoryCard } from "./StoryCard";
import { LoadMore } from "./LoadMore";

const GRID_SIZES = "(min-width: 1040px) 33vw, (min-width: 720px) 50vw, 100vw";

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
  const items = articles.slice(start, start + PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(articles.length / PAGE_SIZE));
  const [first, ...rest] = items;
  const hasLead = page === 1 && first;
  const gridItems = hasLead ? rest : items;
  const hrefFor = (n: number) => (n === 1 ? basePath : `${basePath}/page/${n}`);

  return (
    <div className="wrap">
      <header className="page-head">
        <h1 className="h-mega">{page > 1 ? `${title}, page ${page}` : title}</h1>
        <p className="deck">{description}</p>
      </header>

      <nav aria-label="Filter by section">
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

      {hasLead ? (
        <article className="card archive-lead">
          <Link href={`/articles/${first.slug}`} className="media r-wide" tabIndex={-1} aria-hidden="true">
            <ArchiveImage article={first} />
          </Link>
          <div className="card__body">
            <p className="label">
              <Link href={`/category/${toCard(first).categorySlug}`}>{toCard(first).categoryLabel}</Link>
            </p>
            <h2 className="h-l">
              <Link href={`/articles/${first.slug}`}>
                <Headline text={first.title} />
              </Link>
            </h2>
            <p className="excerpt">{first.excerpt}</p>
            <p className="meta">
              <time dateTime={first.published}>{toCard(first).dateLabel}</time>
            </p>
          </div>
        </article>
      ) : null}

      <div className="archive-grid">
        {gridItems.map((article) => (
          <StoryCard key={article.slug} card={toCard(article)} sizes={GRID_SIZES} excerpt />
        ))}
        {page < totalPages && page === 1 ? (
          <LoadMore
            shown={items.map((a) => a.slug)}
            category={category}
            tag={tag}
            batch={PAGE_SIZE}
            total={articles.length}
            href={hrefFor(page + 1)}
            sizes={GRID_SIZES}
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

function ArchiveImage({ article }: { article: Article }) {
  return (
    <Image
      src={article.image.src}
      alt=""
      fill
      priority
      sizes="(min-width: 720px) 66vw, 100vw"
      style={article.image.focal ? { objectPosition: article.image.focal } : undefined}
    />
  );
}
