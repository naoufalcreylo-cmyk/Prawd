"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";
import type { MediaItem, StorySection } from "@/lib/types";

function pad(n: number) {
  return String(n + 1).padStart(2, "0");
}

function smoothBehaviour(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

/** Keeps the active item in view inside a rail that scrolls sideways, without moving the page. */
function revealInRail(item: HTMLElement | null | undefined) {
  const rail = item?.closest<HTMLElement>(".scroll-rail");
  if (!item || !rail) return;
  rail.scrollTo({ left: item.offsetLeft - 16, behavior: smoothBehaviour() });
}

function useHash() {
  return useSyncExternalStore(
    (notify) => {
      window.addEventListener("hashchange", notify);
      return () => window.removeEventListener("hashchange", notify);
    },
    () => window.location.hash.slice(1),
    () => "",
  );
}

function tabKeys(event: KeyboardEvent, index: number, count: number, select: (next: number) => void) {
  const moves: Record<string, number> = {
    ArrowRight: (index + 1) % count,
    ArrowLeft: (index - 1 + count) % count,
    Home: 0,
    End: count - 1,
  };
  if (event.key in moves) {
    event.preventDefault();
    select(moves[event.key]);
  }
}

/** Article view of PRAWD Perspectives. Each angle has its own address, so it can be linked to. */
export function AngleTabs({
  sections,
  panels,
}: {
  sections: { id: string; label: string }[];
  panels: ReactNode[];
}) {
  const hash = useHash();
  const found = sections.findIndex((section) => section.id === hash);
  const active = found === -1 ? 0 : found;
  const tablist = useRef<HTMLDivElement>(null);

  function select(index: number, focus = false) {
    history.replaceState(null, "", `#${sections[index].id}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    const tab = tablist.current?.querySelectorAll<HTMLElement>('[role="tab"]')[index];
    revealInRail(tab);
    if (focus) tab?.focus();
  }

  const next = sections[active + 1];

  return (
    <>
      <div className="wrap index-rail-wrap">
        <div className="scroll-rail">
          <div ref={tablist} className="index-rail" role="tablist" aria-label="Choose an angle">
            {sections.map((section, i) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                role="tab"
                id={`tab-${section.id}`}
                aria-selected={i === active}
                aria-controls={section.id}
                tabIndex={i === active ? 0 : -1}
                className="index-rail__item"
                onClick={(event) => {
                  event.preventDefault();
                  select(i);
                }}
                onKeyDown={(event) => tabKeys(event, i, sections.length, (n) => select(n, true))}
              >
                <span className="index-rail__no">{pad(i)}</span>
                {section.label}
              </a>
            ))}
          </div>
        </div>
      </div>
      {/* Without JavaScript every angle stays visible, one after another. */}
      <noscript>
        <style>{`.angle-panel[hidden]{display:block!important}.index-rail-wrap{position:static!important}`}</style>
      </noscript>
      {panels.map((panel, i) => (
        <div
          key={sections[i].id}
          id={sections[i].id}
          role="tabpanel"
          aria-labelledby={`tab-${sections[i].id}`}
          hidden={i !== active}
          className="angle-panel wrap"
        >
          {panel}
        </div>
      ))}
      <div className="wrap">
        <div className="angle-next">
          {next ? (
            <a
              href={`#${next.id}`}
              className="more-button"
              onClick={(event) => {
                event.preventDefault();
                select(active + 1, true);
                tablist.current?.closest(".index-rail-wrap")?.scrollIntoView({ behavior: smoothBehaviour() });
              }}
            >
              <span>Next angle: {next.label}</span>
              <span aria-hidden="true">{pad(active + 1)}</span>
            </a>
          ) : (
            <a
              href={`#${sections[0].id}`}
              className="more-button"
              onClick={(event) => {
                event.preventDefault();
                select(0, true);
                tablist.current?.closest(".index-rail-wrap")?.scrollIntoView({ behavior: smoothBehaviour() });
              }}
            >
              <span>Back to the first angle: {sections[0].label}</span>
              <span aria-hidden="true">{pad(0)}</span>
            </a>
          )}
        </div>
      </div>
    </>
  );
}

/** Homepage view of PRAWD Perspectives: tabs that preview each angle, then link to it. */
export function PerspectivesModule({
  slug,
  title,
  deck,
  sections,
}: {
  slug: string;
  title: string;
  deck: string;
  sections: StorySection[];
}) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const section = sections[active];
  const href = `/articles/${slug}#${section.id}`;

  function select(index: number, focus = false) {
    setActive(index);
    revealInRail(refs.current[index]);
    if (focus) refs.current[index]?.focus();
  }

  return (
    <div className="persp">
      <div className="persp__media" id="persp-panel" role="tabpanel" aria-labelledby={`persp-tab-${section.id}`}>
        <Link href={href} className="media r-wide persp__image" tabIndex={-1} aria-hidden="true">
          <Image
            key={section.id}
            src={section.image.src}
            alt=""
            fill
            sizes="(min-width: 1040px) 58vw, 100vw"
            className="fade-in"
            style={section.image.focal ? { objectPosition: section.image.focal } : undefined}
          />
        </Link>
      </div>
      <div className="persp__text">
        <p className="label">
          <span className="fmt">PRAWD Perspectives</span>
        </p>
        <h2 className="h-l" id="perspectives-title">
          <Link href={`/articles/${slug}`}>
            <span className="u">{title}</span>
          </Link>
        </h2>
        <p className="excerpt">{deck}</p>
        <div className="scroll-rail persp__rail">
          <div className="index-rail index-rail--stack" role="tablist" aria-label="Choose an angle">
            {sections.map((item, i) => (
              <button
                key={item.id}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`persp-tab-${item.id}`}
                aria-selected={i === active}
                aria-controls="persp-panel"
                tabIndex={i === active ? 0 : -1}
                className="index-rail__item"
                onClick={() => select(i)}
                onKeyDown={(event) => tabKeys(event, i, sections.length, (n) => select(n, true))}
              >
                <span className="index-rail__no">{pad(i)}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <p className="persp__summary" key={section.id}>
          {section.summary}
        </p>
        <Link href={href} className="text-link">
          Read this angle<span className="visually-hidden">: {section.label}</span>
        </Link>
      </div>
    </div>
  );
}

/** The homepage's two lists. Both are in the page, so without JavaScript they simply follow each other. */
export function StreamTabs({ tabs }: { tabs: { id: string; label: string; panel: ReactNode }[] }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function select(index: number, focus = false) {
    setActive(index);
    if (focus) refs.current[index]?.focus();
  }

  return (
    <>
      <div className="stream-tabs" role="tablist" aria-label="Choose a list">
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${tab.id}-tab`}
            aria-selected={i === active}
            aria-controls={tab.id}
            tabIndex={i === active ? 0 : -1}
            onClick={() => select(i)}
            onKeyDown={(event) => tabKeys(event, i, tabs.length, (n) => select(n, true))}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <noscript>
        <style>{`.stream-panel[hidden]{display:block!important}`}</style>
      </noscript>
      {tabs.map((tab, i) => (
        <div
          key={tab.id}
          id={tab.id}
          role="tabpanel"
          aria-labelledby={`${tab.id}-tab`}
          hidden={i !== active}
          className="stream-panel"
        >
          {tab.panel}
        </div>
      ))}
    </>
  );
}

/** Sticky chapter navigation for The Matchday Edit. Highlights the chapter being read. */
export function ChapterRail({ chapters }: { chapters: { id: string; label: string }[] }) {
  const [active, setActive] = useState(chapters[0].id);
  const items = useRef<Record<string, HTMLAnchorElement | null>>({});

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      // The active chapter is the last one to have crossed the upper part of the screen.
      let current = chapters[0].id;
      for (const chapter of chapters) {
        const element = document.getElementById(chapter.id);
        if (element && element.getBoundingClientRect().top < window.innerHeight * 0.4) current = chapter.id;
      }
      setActive((previous) => {
        if (previous !== current) revealInRail(items.current[current]);
        return current;
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [chapters]);

  return (
    <nav className="index-rail-wrap" aria-label="Chapters">
      <div className="wrap">
        <div className="scroll-rail">
          <div className="index-rail">
            {chapters.map((chapter, i) => (
              <a
                key={chapter.id}
                ref={(el) => {
                  items.current[chapter.id] = el;
                }}
                href={`#${chapter.id}`}
                className="index-rail__item"
                aria-current={active === chapter.id ? "true" : undefined}
              >
                <span className="index-rail__no">{pad(i)}</span>
                {chapter.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

type AtlasPlace = { slug: string; city: string; count: number; image: Pick<MediaItem, "src" | "focal"> | null };
type AtlasGroup = { country: string; places: AtlasPlace[] };

/** The city index. Filters as you type, and previews a story's image on wider screens. */
export function AtlasIndex({ groups, total }: { groups: AtlasGroup[]; total: number }) {
  const [query, setQuery] = useState("");
  const [hovered, setHovered] = useState<AtlasPlace | null>(null);
  const normalise = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/ł/g, "l");
  const term = normalise(query.trim());
  const visible = groups
    .map((group) => ({
      ...group,
      places: normalise(group.country).includes(term)
        ? group.places
        : group.places.filter((place) => normalise(place.city).includes(term)),
    }))
    .filter((group) => group.places.length > 0);
  const count = visible.reduce((sum, group) => sum + group.places.length, 0);
  const preview = hovered ?? visible[0]?.places[0] ?? null;

  return (
    <div className="atlas">
      <div className="atlas__filter">
        <label htmlFor="atlas-filter" className="label">
          Find a place
        </label>
        <input
          id="atlas-filter"
          type="search"
          placeholder="City or country"
          autoComplete="off"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <p className="meta" role="status">
          {term ? `${count} of ${total} places` : `${total} places`}
        </p>
      </div>
      {visible.length === 0 ? (
        <p className="deck empty">No stories from there yet. Try a country, or clear the search.</p>
      ) : null}
      <div className="atlas__grid">
        <div className="atlas__list">
          {visible.map((group) => (
            <section key={group.country} className="atlas__group">
              <h2 className="atlas__country">{group.country}</h2>
              <ul>
                {group.places.map((place) => (
                  <li key={place.slug}>
                    <Link
                      href={`/atlas/${place.slug}`}
                      className="atlas__place"
                      onMouseEnter={() => setHovered(place)}
                      onFocus={() => setHovered(place)}
                    >
                      <span className="atlas__thumb" aria-hidden="true">
                        {place.image ? (
                          <Image
                            src={place.image.src}
                            alt=""
                            fill
                            sizes="72px"
                            style={place.image.focal ? { objectPosition: place.image.focal } : undefined}
                          />
                        ) : (
                          <span className="atlas__initial">{place.city[0]}</span>
                        )}
                      </span>
                      <span className="atlas__city">
                        <span className="u">{place.city}</span>
                      </span>
                      <span className="meta atlas__count">
                        {place.count} {place.count === 1 ? "story" : "stories"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <div className="atlas__preview" aria-hidden="true">
          {preview ? (
            <>
              <div className="atlas__preview-frame">
                {preview.image ? (
                  <Image
                    key={preview.slug}
                    src={preview.image.src}
                    alt=""
                    fill
                    sizes="34vw"
                    className="fade-in"
                    style={preview.image.focal ? { objectPosition: preview.image.focal } : undefined}
                  />
                ) : (
                  <p className="atlas__hint">No photograph from {preview.city} yet.</p>
                )}
              </div>
              <p className="label atlas__preview-label">{preview.city}</p>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
