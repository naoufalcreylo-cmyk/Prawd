import Image from "next/image";
import Link from "next/link";
import { NewsletterForm } from "@/components/Forms";
import { PerspectivesModule } from "@/components/Formats";
import { LoadMore } from "@/components/LoadMore";
import { FormatMark, Headline, StoryCard, StoryRow } from "@/components/StoryCard";
import { getArticles, getHomepage, getPlaces, getSections, getTags, tagSlug, toCard } from "@/lib/content";

export default function HomePage() {
  const home = getHomepage();
  const all = getArticles();
  const lead = toCard(home.lead);
  const focus = toCard(home.focus);
  const [voice, ...moreVoices] = home.voices.map(toCard);
  const streamTotal = all.length - home.leadSlugs.length;
  const chapters = getSections(home.matchday);
  const places = getPlaces();
  const topics = [...getTags().entries()]
    .map(([slug, label]) => ({ slug, label, count: all.filter((a) => a.tags.includes(label)).length }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, 8);

  return (
    <>
      <section className="wrap front" aria-label="Lead stories">
        <div className="front__lead">
          <StoryCard
            card={lead}
            ratio="r-wide"
            headingClass="h-xl front__headline"
            headingLevel="h2"
            sizes="(min-width: 1040px) 50vw, 100vw"
            priority
            display
            excerpt
            className="card--lead"
          />
        </div>
        <div className="front__index">
          <h2 className="front__index-title">In this edition</h2>
          <ol>
            {home.edition.map((article, i) => {
              const card = toCard(article);
              return (
                <li key={card.slug}>
                  <span className="index-rail__no" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="label">{card.categoryLabel}</p>
                    <Link href={`/articles/${card.slug}`} className="h-s front__index-link">
                      <span className="u">{card.title}</span>
                    </Link>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
        <div className="front__side">
          {home.supporting.map((article) => (
            <StoryCard
              key={article.slug}
              card={toCard(article)}
              ratio="r-land"
              headingClass="h-s"
              headingLevel="h2"
              sizes="(min-width: 1040px) 25vw, (min-width: 720px) 50vw, 100vw"
              priority
            />
          ))}
        </div>
      </section>

      <section className="wrap four-wrap" aria-label="More stories">
        <div className="four">
          {home.row.map((article) => (
            <StoryCard
              key={article.slug}
              card={toCard(article)}
              ratio="r-land"
              sizes="(min-width: 1040px) 25vw, 50vw"
            />
          ))}
        </div>
      </section>

      <section className="wrap section" aria-labelledby="matchday-title">
        <div className="format-head">
          <div>
            <p className="label">
              <FormatMark>The Matchday Edit</FormatMark>
            </p>
            <h2 id="matchday-title" className="h-l">
              <Link href={`/articles/${home.matchday.slug}`}>
                <span className="u">One matchday, five chapters.</span>
              </Link>
            </h2>
          </div>
          <p className="excerpt">{home.matchday.excerpt}</p>
        </div>
        <div className="scroll-rail filmstrip-rail">
          <ol className="filmstrip">
            {chapters.map((chapter, i) => (
              <li key={chapter.id}>
                <Link href={`/articles/${home.matchday.slug}#${chapter.id}`} className="filmstrip__item">
                  <span className="filmstrip__image">
                    <Image
                      src={chapter.image.src}
                      alt=""
                      fill
                      sizes="(min-width: 1040px) 30vw, 70vw"
                      style={chapter.image.focal ? { objectPosition: chapter.image.focal } : undefined}
                    />
                  </span>
                  <span className="index-rail__no">{String(i + 1).padStart(2, "0")}</span>
                  <span className="h-s filmstrip__label">
                    <span className="u">{chapter.label}</span>
                  </span>
                  <span className="meta filmstrip__summary">{chapter.summary}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="wrap section" aria-labelledby="latest-title">
        <div className="latest2">
          <div className="latest2__main">
            <div className="section-head">
              <h2 id="latest-title" className="section-title">
                Latest
              </h2>
              <Link href="/latest" className="text-link">
                All stories
              </Link>
            </div>
            <div className="rows">
              {home.latest.map((article) => (
                <StoryRow key={article.slug} card={toCard(article)} />
              ))}
              <LoadMore
                shown={home.latest.map((a) => a.slug)}
                exclude={home.leadSlugs}
                batch={4}
                total={streamTotal}
                href="/latest"
              />
            </div>
          </div>
          <aside className="latest2__rail" aria-labelledby="topics-title">
            <h2 id="topics-title" className="section-title section-title--rail">
              Topics
            </h2>
            <ul>
              {topics.map((topic) => (
                <li key={topic.slug}>
                  <Link href={`/tag/${tagSlug(topic.label)}`} className="topic-row">
                    <span className="u">{topic.label}</span>
                    <span className="meta">{topic.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="wrap section" aria-labelledby="perspectives-title">
        <PerspectivesModule
          slug={home.perspectives.slug}
          title={home.perspectives.title}
          deck={home.perspectives.excerpt}
          sections={getSections(home.perspectives)}
        />
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

      <section className="wrap section" aria-labelledby="atlas-title">
        <div className="format-head">
          <div>
            <p className="label">
              <FormatMark>PRAWD Atlas</FormatMark>
            </p>
            <h2 id="atlas-title" className="h-l">
              <Link href="/atlas">
                <span className="u">Football, by place.</span>
              </Link>
            </h2>
          </div>
          <p className="excerpt">
            {places.length} places so far, each with at least one story behind it. Pick a city and start there.
          </p>
        </div>
        <ul className="atlas-strip">
          {places.map((place) => (
            <li key={place.slug}>
              <Link href={`/atlas/${place.slug}`}>
                <span className="u">{place.city}</span>
              </Link>
            </li>
          ))}
        </ul>
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
