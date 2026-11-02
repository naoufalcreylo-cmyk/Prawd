import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FormatMark, StoryCard, StoryRow } from "@/components/StoryCard";
import { getPlaces, toCard } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPlaces().map((place) => ({ place: place.slug }));
}

type Props = { params: Promise<{ place: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).place;
  const place = getPlaces().find((p) => p.slug === slug);
  if (!place) return {};
  return {
    title: `${place.city}, ${place.country}`,
    description: `PRAWD stories from ${place.city}, ${place.country}.`,
    alternates: { canonical: `/atlas/${place.slug}` },
  };
}

export default async function PlacePage({ params }: Props) {
  const slug = (await params).place;
  const places = getPlaces();
  const place = places.find((p) => p.slug === slug);
  if (!place) notFound();
  const neighbours = places.filter((p) => p.country === place.country && p.slug !== place.slug);
  const [first, ...rest] = place.articles.map(toCard);

  return (
    <div className="wrap">
      <header className="page-head">
        <p className="label page-head__eyebrow">
          <FormatMark>
            <Link href="/atlas">PRAWD Atlas</Link>
          </FormatMark>
          <span className="meta">{place.country}</span>
        </p>
        <h1 className="h-mega">{place.city}</h1>
        <p className="meta page-head__count">
          {place.articles.length} {place.articles.length === 1 ? "story" : "stories"}
        </p>
      </header>

      <div className="archive-front archive-front--solo">
        <div className="archive-front__lead">
          <StoryCard
            card={first}
            ratio="r-wide"
            headingClass="h-l"
            headingLevel="h2"
            sizes="(min-width: 1040px) 66vw, 100vw"
            priority
            excerpt
          />
        </div>
      </div>

      {rest.length > 0 ? (
        <div className="rows">
          {rest.map((card) => (
            <StoryRow key={card.slug} card={card} />
          ))}
        </div>
      ) : null}

      <nav className="atlas-more" aria-label="More places">
        {neighbours.length > 0 ? (
          <>
            <h2 className="label">Also in {place.country}</h2>
            <ul className="topic-links">
              {neighbours.map((p) => (
                <li key={p.slug}>
                  <Link href={`/atlas/${p.slug}`}>{p.city}</Link>
                </li>
              ))}
            </ul>
          </>
        ) : null}
        <Link href="/atlas" className="more-button">
          <span>All places in the Atlas</span>
          <span aria-hidden="true">{places.length}</span>
        </Link>
      </nav>
    </div>
  );
}
