import Image from "next/image";
import Link from "next/link";
import type { CardData } from "@/lib/types";

const SIGNATURE_FORMATS = new Set(["Perspectives", "The Matchday Edit"]);

/** The black square marks PRAWD's own formats everywhere they appear. */
export function FormatMark({ children }: { children: React.ReactNode }) {
  return <span className="fmt">{children}</span>;
}

export function Headline({ text, display }: { text: string; display?: string }) {
  const lines = (display ?? text).split("|");
  return (
    <span className="u">
      {lines.map((line, i) => (
        <span key={i}>
          {line.trim()}
          {i < lines.length - 1 ? (
            <>
              {" "}
              <br className="br-wide" />
            </>
          ) : null}
        </span>
      ))}
    </span>
  );
}

type Props = {
  card: CardData;
  /** r-wide 3:2, r-land 4:3, r-port 4:5, r-sq 1:1, r-pano 21:9 */
  ratio?: string;
  headingClass?: string;
  sizes: string;
  excerpt?: boolean;
  priority?: boolean;
  display?: boolean;
  className?: string;
  headingLevel?: "h2" | "h3";
};

export function StoryCard({
  card,
  ratio = "r-wide",
  headingClass = "h-s",
  sizes,
  excerpt = false,
  priority = false,
  display = false,
  className = "",
  headingLevel: Heading = "h3",
}: Props) {
  const href = `/articles/${card.slug}`;
  return (
    <article className={`card ${className}`}>
      {/* The headline carries the link for keyboards and screen readers. */}
      <Link href={href} className={`media ${ratio}`} tabIndex={-1} aria-hidden="true">
        <Image
          src={card.image.src}
          alt=""
          fill
          sizes={sizes}
          priority={priority}
          style={card.image.focal ? { objectPosition: card.image.focal } : undefined}
        />
      </Link>
      <div className="card__body">
        <p className="label">
          <Link href={`/category/${card.categorySlug}`}>{card.categoryLabel}</Link>
          {SIGNATURE_FORMATS.has(card.format) ? <FormatMark>{card.format}</FormatMark> : null}
        </p>
        <Heading className={headingClass}>
          <Link href={href}>
            <Headline text={card.title} display={display ? card.displayTitle : undefined} />
          </Link>
        </Heading>
        {excerpt ? <p className="excerpt">{card.excerpt}</p> : null}
        <p className="meta">
          <time dateTime={card.date}>{card.dateLabel}</time>
        </p>
      </div>
    </article>
  );
}

/** The dense list row used by Latest, archives and search. */
export function StoryRow({ card, sizes = "(min-width: 720px) 28vw, 112px" }: { card: CardData; sizes?: string }) {
  return (
    <StoryCard
      card={card}
      className="story-row"
      ratio="r-wide"
      headingClass="h-m"
      sizes={sizes}
      excerpt
    />
  );
}
