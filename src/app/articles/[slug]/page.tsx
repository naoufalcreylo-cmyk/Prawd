import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReadingProgress, ShareActions } from "@/components/ArticleTools";
import { ArticleBody, Caption } from "@/components/ArticleBody";
import { AngleTabs, ChapterRail } from "@/components/Formats";
import { FormatMark, Headline, StoryCard } from "@/components/StoryCard";
import {
  formatDate,
  getArticle,
  getArticles,
  getRelated,
  getSections,
  placeSlug,
  tagSlug,
  toCard,
  type Article,
} from "@/lib/content";
import { splitSections } from "@/lib/sections";
import { categoryLabel, SITE } from "@/lib/site";
import type { MediaItem } from "@/lib/types";

export const dynamicParams = false;

export function generateStaticParams() {
  return getArticles().map((article) => ({ slug: article.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  const title = article.seo.title ?? article.title;
  const description = article.seo.description ?? article.excerpt;
  const hidden = !SITE.indexable || article.demo || article.status !== "published";
  return {
    title,
    description,
    alternates: { canonical: `/articles/${article.slug}` },
    robots: hidden ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "article",
      title,
      description,
      publishedTime: article.published,
      modifiedTime: article.modified ?? article.published,
      section: categoryLabel(article.category),
      tags: article.tags,
      images: [{ url: article.image.src, alt: article.image.alt }],
    },
    twitter: { card: "summary_large_image", title, description, images: [article.image.src] },
  };
}

function StructuredData({ article }: { article: Article }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: [`${SITE.url}${article.image.src}`],
    datePublished: article.published,
    dateModified: article.modified ?? article.published,
    articleSection: categoryLabel(article.category),
    keywords: article.tags.join(", "),
    author: { "@type": "Organization", name: article.authorName },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      logo: { "@type": "ImageObject", url: `${SITE.url}/brand/prawd-wordmark.png` },
    },
    mainEntityOfPage: `${SITE.url}/articles/${article.slug}`,
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

const DEFAULT_DEMO_NOTE =
  "Demonstration article. PRAWD is in preview: this text was written to show the design, has not been through an editor, and should be reviewed before publication.";

function DemoNotice({ article }: { article: Article }) {
  if (!article.demo) return null;
  return (
    <p className="notice article__demo">
      <strong>Preview.</strong> {article.demoNote ?? DEFAULT_DEMO_NOTE}
    </p>
  );
}

function ArticleHead({ article }: { article: Article }) {
  const signature = article.layout === "matchday" || article.layout === "perspectives";
  return (
    <header className="wrap article__head">
      <p className="article__label label">
        <Link href={`/category/${article.category}`}>{categoryLabel(article.category)}</Link>
        {signature ? (
          <FormatMark>{article.format === "Perspectives" ? "PRAWD Perspectives" : article.format}</FormatMark>
        ) : article.format !== "Interview" ? (
          <span className="meta" style={{ fontWeight: 400 }}>
            {article.format}
          </span>
        ) : null}
        {article.status === "draft" ? <span>Draft</span> : null}
      </p>
      <h1 className="h-mega">
        <Headline text={article.title} display={article.displayTitle} />
      </h1>
      {article.deck ? <p className="deck article__deck">{article.deck}</p> : null}
      <div className="article__byline">
        <strong>By {article.authorName}</strong>
        <span>
          <time dateTime={article.published}>{formatDate(article.published)}</time>
        </span>
        {article.modified ? (
          <span>
            Updated <time dateTime={article.modified}>{formatDate(article.modified)}</time>
          </span>
        ) : null}
        <span>{article.readingMinutes} min read</span>
      </div>
    </header>
  );
}

/** Places, sharing and tags. A sticky margin on wide screens, a block after the text on small ones. */
function ArticleRail({ article, url }: { article: Article; url: string }) {
  return (
    <aside className="article__rail" aria-label="About this story">
      {article.places.length > 0 ? (
        <nav className="tags" aria-label="Places in this story">
          <h2 className="tags__title">
            <FormatMark>In the Atlas</FormatMark>
          </h2>
          <ul className="tags__row">
            {article.places.map((place) => {
              const city = place.split(", ")[0];
              return (
                <li key={place}>
                  <Link href={`/atlas/${placeSlug(city)}`}>{city}</Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
      <ShareActions url={url} title={article.title} />
      {article.tags.length > 0 ? (
        <nav className="tags" aria-label="Tags">
          <h2 className="tags__title">Tags</h2>
          <ul className="tags__row">
            {article.tags.map((tag) => (
              <li key={tag}>
                <Link href={`/tag/${tagSlug(tag)}`}>{tag}</Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
      <p className="author-note">
        <strong>{article.authorName}.</strong> {article.authorBio}
      </p>
    </aside>
  );
}

function StoryImage({ item, ratio, sizes, priority }: { item: MediaItem; ratio: string; sizes: string; priority?: boolean }) {
  return (
    <div className={`media ${ratio}`}>
      <Image
        src={item.src}
        alt={item.alt}
        fill
        priority={priority}
        sizes={sizes}
        style={item.focal ? { objectPosition: item.focal } : undefined}
      />
    </div>
  );
}

function KeepReading({ article }: { article: Article }) {
  const [next, ...others] = getRelated(article, 4);
  if (!next) return null;
  const card = toCard(next);
  return (
    <section className="wrap section" aria-labelledby="related-title">
      <div className="section-head">
        <h2 id="related-title" className="section-title">
          Keep reading
        </h2>
      </div>
      <div className="next-story">
        <StoryCard
          card={card}
          className="next-story__lead"
          ratio="r-wide"
          headingClass="h-l"
          sizes="(min-width: 1040px) 58vw, 100vw"
          excerpt
        />
        <div className="next-story__list">
          {others.map((item) => (
            <StoryCard key={item.slug} card={toCard(item)} className="story-row story-row--small" sizes="96px" />
          ))}
        </div>
      </div>
    </section>
  );
}

async function MatchdayArticle({ article, url }: { article: Article; url: string }) {
  const chapters = getSections(article);
  const { sections } = splitSections(article.body);
  return (
    <>
      <figure>
        <StoryImage item={article.image} ratio="photo-lead" sizes="100vw" priority />
        <div className="wrap">
          <Caption item={article.image} />
        </div>
      </figure>
      <ArticleHead article={article} />
      <ChapterRail chapters={chapters.map(({ id, label }) => ({ id, label }))} />
      <div className="wrap">
        <div className="chapter-notice">
          <DemoNotice article={article} />
        </div>
      </div>
      {chapters.map((chapter, i) => (
        <section key={chapter.id} id={chapter.id} className="chapter" aria-labelledby={`${chapter.id}-title`}>
          <div className="wrap chapter__head">
            <span className="chapter__no" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h2 id={`${chapter.id}-title`} className="h-xl">
                {chapter.label}
              </h2>
              <p className="deck chapter__summary">{chapter.summary}</p>
            </div>
          </div>
          <figure>
            <StoryImage item={chapter.image} ratio="chapter__image" sizes="100vw" />
            <div className="wrap">
              <Caption item={chapter.image} />
            </div>
          </figure>
          <div className="wrap chapter__body">
            <div className="prose prose--chapter">
              <ArticleBody source={sections[i].source} />
            </div>
          </div>
        </section>
      ))}
      <div className="wrap article__foot-wide">
        <ArticleRail article={article} url={url} />
      </div>
    </>
  );
}

async function PerspectivesArticle({ article, url }: { article: Article; url: string }) {
  const angles = getSections(article);
  const { sections } = splitSections(article.body);
  const panels = await Promise.all(
    angles.map(async (angle, i) => (
      <div className="angle" key={angle.id}>
        <figure className="angle__figure">
          <StoryImage item={angle.image} ratio="r-land" sizes="(min-width: 1040px) 54vw, 100vw" priority={i === 0} />
          <Caption item={angle.image} />
        </figure>
        <div className="angle__text">
          <p className="index-rail__no">{String(i + 1).padStart(2, "0")}</p>
          <h2 className="h-l">{angle.label}</h2>
          <p className="deck angle__summary">{angle.summary}</p>
          <div className="prose prose--angle">
            <ArticleBody source={sections[i].source} />
          </div>
        </div>
      </div>
    )),
  );
  return (
    <>
      <ArticleHead article={article} />
      <AngleTabs sections={angles.map(({ id, label }) => ({ id, label }))} panels={panels} />
      <div className="wrap chapter-notice chapter-notice--end">
        <DemoNotice article={article} />
      </div>
      <div className="wrap article__foot-wide">
        <ArticleRail article={article} url={url} />
      </div>
    </>
  );
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const url = `${SITE.url}/articles/${article.slug}`;
  const isPhoto = article.layout === "photo";
  const showProgress = article.layout === "standard" && article.readingMinutes >= 4;

  return (
    <article className={`article--${article.layout}`}>
      <StructuredData article={article} />
      {showProgress ? <ReadingProgress /> : null}

      {article.layout === "matchday" ? (
        <MatchdayArticle article={article} url={url} />
      ) : article.layout === "perspectives" ? (
        <PerspectivesArticle article={article} url={url} />
      ) : (
        <>
          {isPhoto ? (
            <>
              <figure>
                <StoryImage item={article.image} ratio="photo-lead" sizes="100vw" priority />
                <div className="wrap">
                  <Caption item={article.image} />
                </div>
              </figure>
              <ArticleHead article={article} />
            </>
          ) : (
            <>
              <ArticleHead article={article} />
              <figure className="wrap article__lead">
                <StoryImage item={article.image} ratio="r-wide" sizes="(min-width: 1760px) 1680px, 100vw" priority />
                <Caption item={article.image} />
              </figure>
            </>
          )}
          <div className="wrap article__body-wrap">
            <div className={isPhoto ? "article__single" : "article__columns"}>
              <div className="prose" data-article-body>
                <DemoNotice article={article} />
                <ArticleBody source={article.body} />
              </div>
              <ArticleRail article={article} url={url} />
            </div>
          </div>
        </>
      )}

      <KeepReading article={article} />
    </article>
  );
}
