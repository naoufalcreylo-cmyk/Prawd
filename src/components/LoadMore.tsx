"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { loadSearchIndex } from "@/lib/search-index";
import type { CardData, CategorySlug } from "@/lib/types";
import { StoryRow } from "./StoryCard";

type Props = {
  /** Slugs already on the page. */
  shown: string[];
  /** Other slugs to leave out, such as the homepage lead stories. */
  exclude?: string[];
  category?: CategorySlug;
  tag?: string;
  batch: number;
  /** Plain link used before JavaScript loads, and if it never does. */
  href: string;
  total: number;
};

export function LoadMore({ shown, exclude = [], category, tag, batch, href, total }: Props) {
  const [cards, setCards] = useState<CardData[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const firstNew = useRef<HTMLDivElement>(null);
  const remaining = total - shown.length - cards.length;

  async function loadMore(event: React.MouseEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setStatus("");
    try {
      const index = await loadSearchIndex();
      const seen = new Set([...shown, ...exclude, ...cards.map((c) => c.slug)]);
      const next = index
        .filter((entry) => !seen.has(entry.slug))
        .filter((entry) => !category || entry.categorySlug === category)
        .filter((entry) => !tag || entry.tags.includes(tag))
        .slice(0, batch);
      setCards((current) => [...current, ...next]);
      setStatus(`${next.length} more ${next.length === 1 ? "story" : "stories"} loaded.`);
      requestAnimationFrame(() => {
        firstNew.current?.querySelector<HTMLAnchorElement>("h3 a")?.focus({ preventScroll: true });
      });
    } catch {
      setStatus("Couldn't load more stories. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  const firstOfLastBatch = cards.length - (cards.length % batch || batch);

  return (
    <>
      {cards.map((card, i) => (
        <div key={card.slug} ref={i === firstOfLastBatch ? firstNew : undefined} className="card--enter">
          <StoryRow card={card} />
        </div>
      ))}
      <div className="stream__more">
        {remaining > 0 ? (
          <Link href={href} className="more-button" onClick={loadMore} aria-busy={busy} scroll={false}>
            <span>{busy ? "Loading…" : "Load more stories"}</span>
            <span aria-hidden="true">{remaining}</span>
          </Link>
        ) : null}
        <p className="stream-live" role="status">
          {status}
          {remaining <= 0 && cards.length > 0 ? " That's everything for now." : ""}
        </p>
      </div>
    </>
  );
}
