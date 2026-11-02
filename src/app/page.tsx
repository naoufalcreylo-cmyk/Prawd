import Image from "next/image";
import Link from "next/link";
import { NewsletterForm } from "@/components/Forms";
import { LoadMore } from "@/components/LoadMore";
import { Headline, StoryCard } from "@/components/StoryCard";
import { getArticles, getHomepage, toCard } from "@/lib/content";

const STREAM_SIZES = "(min-width: 1040px) 37vw, (min-width: 720px) 50vw, 100vw";

export default function HomePage() {
  const home = getHomepage();
  const lead = toCard(home.lead);
  const focus = toCard(home.focus);
  const [voice, ...moreVoices] = home.voices.map(toCard);
  const streamTotal = getArticles().length - home.leadSlugs.length;

  return (
    <>
      <section className="wrap lead" aria-label="Lead stories">
        <div className="lead__grid">
          <div className="lead__main">
            <StoryCard
              card={lead}
              ratio="r-wide"
              headingClass="h-xl"
              headingLevel="h2"
              sizes="(min-width: 1040px) 66vw, 100vw"
              priority
              display
              excerpt
              className="card--lead"
            />
          </div>
          <div className="lead__side">
            {home.supporting.map((article) => (
              <StoryCard
                key={article.slug}
                card={toCard(article)}
                ratio="r-land"
                headingClass="h-m"
                headingLevel="h2"
                sizes="(min-width: 1040px) 33vw, (min-width: 720px) 50vw, 100vw"
                priority
              />
            ))}
          </div>
        </div>
      </section>

      <section className="wrap section" aria-labelledby="latest-title">
        <div className="latest">
          <div className="latest__head">
            <h2 id="latest-title" className="section-title">
              Latest
            </h2>
            <p className="latest__note">New stories from around the game.</p>
            <Link href="/latest" className="text-link">
              All stories
            </Link>
          </div>
          <div className="latest__stream">
            <div className="stream">
              {home.latest.map((article) => (
                <StoryCard key={article.slug} card={toCard(article)} sizes={STREAM_SIZES} excerpt />
              ))}
              <LoadMore
                shown={home.latest.map((a) => a.slug)}
                exclude={home.leadSlugs}
                batch={4}
                total={streamTotal}
                href="/latest"
                sizes={STREAM_SIZES}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="wrap section" aria-labelledby="selects-title">
        <div className="section-head">
          <h2 id="selects-title" className="section-title">
            PRAWD Selects
          </h2>
        </div>
        <div className="selects">
          {home.selects.map((article, i) => {
            const layout = [
              { cls: "selects__a", ratio: "r-port", heading: "h-l", sizes: "(min-width: 720px) 58vw, 100vw" },
              { cls: "selects__b", ratio: "r-wide", heading: "h-m", sizes: "(min-width: 720px) 42vw, 100vw" },
              { cls: "selects__c", ratio: "r-sq", heading: "h-m", sizes: "(min-width: 720px) 33vw, 100vw" },
            ][i];
            return (
              <div className={layout.cls} key={article.slug}>
                <p className="selects__no" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <StoryCard
                  card={toCard(article)}
                  ratio={layout.ratio}
                  headingClass={layout.heading}
                  sizes={layout.sizes}
                  excerpt={i === 0}
                />
              </div>
            );
          })}
        </div>
      </section>

      <section className="section" aria-labelledby="focus-title">
        <div className="wrap">
          <div className="section-head" style={{ marginBottom: 12 }}>
            <h2 id="focus-title" className="section-title">
              In Focus
            </h2>
          </div>
        </div>
        <article className="card">
          <Link href={`/articles/${focus.slug}`} className="media r-pano" tabIndex={-1} aria-hidden="true">
            <Image
              src={focus.image.src}
              alt=""
              fill
              sizes="100vw"
              style={focus.image.focal ? { objectPosition: focus.image.focal } : undefined}
            />
          </Link>
          <div className="wrap">
            <div className="focus__body">
              <div className="focus__title">
                <p className="label" style={{ marginBottom: 8 }}>
                  <Link href={`/category/${focus.categorySlug}`}>{focus.categoryLabel}</Link>
                </p>
                <h3 className="h-xl">
                  <Link href={`/articles/${focus.slug}`}>
                    <Headline text={focus.title} display={focus.displayTitle} />
                  </Link>
                </h3>
              </div>
              <div className="focus__intro">
                <p className="deck">{focus.excerpt}</p>
                <Link href={`/articles/${focus.slug}`} className="text-link">
                  Read the feature<span className="visually-hidden">: {focus.title}</span>
                </Link>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="wrap section" aria-labelledby="kits-title">
        <div className="section-head">
          <h2 id="kits-title" className="section-title">
            Kits &amp; Boots
          </h2>
          <Link href="/category/kits-boots" className="text-link">
            All kits &amp; boots
          </Link>
        </div>
        <div className="trio">
          {home.kits.map((article) => (
            <StoryCard
              key={article.slug}
              card={toCard(article)}
              ratio="r-port"
              headingClass="h-m"
              sizes="(min-width: 720px) 33vw, 100vw"
            />
          ))}
        </div>
      </section>

      <section className="wrap section" aria-labelledby="voices-title">
        <div className="section-head">
          <h2 id="voices-title" className="section-title">
            Voices
          </h2>
          <Link href="/category/interviews" className="text-link">
            All interviews
          </Link>
        </div>
        <div className="voices">
          <StoryCard
            card={voice}
            ratio="r-port"
            headingClass="h-xl"
            sizes="(min-width: 720px) 42vw, 100vw"
            excerpt
            display
            className="voices__feature"
          />
          {moreVoices.map((card) => (
            <StoryCard
              key={card.slug}
              card={card}
              ratio="r-land"
              headingClass="h-l"
              sizes="(min-width: 720px) 16vw, 100vw"
              className="voices__second"
            />
          ))}
        </div>
      </section>

      <section className="wrap section" aria-labelledby="newsletter-title">
        <div className="newsletter">
          <div className="newsletter__text">
            <h2 id="newsletter-title" className="h-xl">
              Stay close to the game.
            </h2>
            <p className="newsletter__copy">Stories, people and perspectives from football culture. In your inbox.</p>
          </div>
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}
