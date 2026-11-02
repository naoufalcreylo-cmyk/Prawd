import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReadingProgress, ShareActions } from "@/components/ArticleTools";
import { ArticleBody, Caption } from "@/components/ArticleBody";
import { Headline, StoryCard } from "@/components/StoryCard";
import { formatDate, getArticle, getArticles, getRelated, tagSlug, toCard, type Article } from "@/lib/content";
import { categoryLabel, SITE } from "@/lib/site";

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

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const url = `${SITE.url}/articles/${article.slug}`;
  const isPhoto = article.layout === "photo";
  const showProgress = !isPhoto && article.readingMinutes >= 4;
  const related = getRelated(article);

  const head = (
    <header className="wrap article__head">
      <p className="article__label label">
        <Link href={`/category/${article.category}`}>{categoryLabel(article.category)}</Link>
        {article.format !== "Interview" ? (
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

  const objectPosition = article.image.focal ? { objectPosition: article.image.focal } : undefined;

  return (
    <article className={isPhoto ? "article--photo" : "article--standard"}>
      <StructuredData article={article} />
      {showProgress ? <ReadingProgress /> : null}

      {isPhoto ? (
        <>
          <figure>
            <div className="media photo-lead">
              <Image src={article.image.src} alt={article.image.alt} fill priority sizes="100vw" style={objectPosition} />
            </div>
            <div className="wrap">
              <Caption item={article.image} />
            </div>
          </figure>
          {head}
        </>
      ) : (
        <>
          {head}
          <figure className="wrap article__lead">
            <div className="media r-wide">
              <Image
                src={article.image.src}
                alt={article.image.alt}
                fill
                priority
                sizes="(min-width: 1760px) 1680px, 100vw"
                style={objectPosition}
              />
            </div>
            <Caption item={article.image} />
          </figure>
        </>
      )}

      <div className="wrap article__body-wrap">
        <div className="prose" data-article-body>
          {article.demo ? (
            <p className="notice article__demo">
              <strong>Preview.</strong> {article.demoNote ?? DEFAULT_DEMO_NOTE}
            </p>
          ) : null}
          <ArticleBody source={article.body} />
        </div>

        <footer className="article__foot">
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
        </footer>
      </div>

      {related.length > 0 ? (
        <section className="wrap section" aria-labelledby="related-title">
          <div className="section-head">
            <h2 id="related-title" className="section-title">
              Keep reading
            </h2>
          </div>
          <div className="trio">
            {related.map((item) => (
              <StoryCard key={item.slug} card={toCard(item)} sizes="(min-width: 720px) 33vw, 100vw" />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
