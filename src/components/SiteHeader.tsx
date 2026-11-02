"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { searchEntries } from "@/lib/search";
import { loadSearchIndex } from "@/lib/search-index";
import { CATEGORIES, NAV, SECONDARY_NAV, SITE } from "@/lib/site";
import type { SearchEntry } from "@/lib/types";
import { Wordmark } from "./Wordmark";

function isCurrent(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavList({ pathname, label }: { pathname: string; label: string }) {
  return (
    <nav aria-label={label}>
      <ul className="nav-list">
        {NAV.map((item) => (
          <li key={item.href}>
            <Link href={item.href} aria-current={isCurrent(pathname, item.href) ? "page" : undefined}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Tools({ onMenu, onSearch }: { onMenu: () => void; onSearch: () => void }) {
  return (
    <div className="tools">
      <button type="button" className="tool tool--menu" onClick={onMenu} aria-haspopup="dialog">
        Menu
      </button>
      <button type="button" className="tool" onClick={onSearch} aria-haspopup="dialog">
        Search
      </button>
    </div>
  );
}

function Overlay({
  open,
  onClose,
  label,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  // Keeps the content in place while the closing fade plays.
  const [visible, setVisible] = useState(open);
  if (open && !visible) setVisible(true);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.classList.remove("is-closing");
      dialog.showModal();
      dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();
      return;
    }
    if (!open && dialog.open) {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      dialog.classList.add("is-closing");
      const timer = setTimeout(
        () => {
          dialog.classList.remove("is-closing");
          dialog.close();
          setVisible(false);
        },
        reduced ? 0 : 170,
      );
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="overlay"
      aria-label={label}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      // Chrome spends the first Esc on clearing a search field unless we take it here.
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onClose();
        }
      }}
      // The browser can close a dialog by itself, so keep the state in step with it.
      onClose={() => {
        if (open) onClose();
      }}
    >
      {visible ? children : null}
    </dialog>
  );
}

function OverlayTop({ onClose }: { onClose: () => void }) {
  return (
    <div className="overlay__top">
      <div className="wrap overlay__top-inner">
        <Link href="/" className="bar__mark" aria-label="PRAWD home" onClick={onClose}>
          <Wordmark decorative />
        </Link>
        <button type="button" className="tool" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

function SearchPanel({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<SearchEntry[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    loadSearchIndex().then(setIndex, () => setFailed(true));
  }, []);

  const trimmed = query.trim();
  const results = index && trimmed ? searchEntries(index, trimmed) : [];

  let status = "";
  if (trimmed && index) {
    status = results.length
      ? `${results.length} ${results.length === 1 ? "story" : "stories"} found`
      : `Nothing found for “${trimmed}”. Try a broader word, like “boots” or “supporters”.`;
  } else if (trimmed && failed) {
    status = "Live results aren't available. Press Enter to search.";
  }

  return (
    <div className="wrap">
      <form
        className="search-form"
        role="search"
        action="/search"
        onSubmit={(event) => {
          event.preventDefault();
          if (!trimmed) return;
          router.push(`/search?q=${encodeURIComponent(trimmed)}`);
          onClose();
        }}
      >
        <label htmlFor="overlay-search" className="visually-hidden">
          Search PRAWD
        </label>
        <input
          id="overlay-search"
          type="search"
          name="q"
          placeholder="Search PRAWD"
          autoComplete="off"
          data-autofocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      <p className="search-status" role="status">
        {status}
      </p>
      {results.length > 0 ? (
        <ul className="search-results">
          {results.slice(0, 8).map((entry) => (
            <li key={entry.slug}>
              <Link href={`/articles/${entry.slug}`} className="search-result" onClick={onClose}>
                <span className="search-result__image">
                  <Image
                    src={entry.image.src}
                    alt=""
                    fill
                    sizes="136px"
                    style={entry.image.focal ? { objectPosition: entry.image.focal } : undefined}
                  />
                </span>
                <span>
                  <span className="label" style={{ display: "block" }}>
                    {entry.categoryLabel}
                  </span>
                  <span className="h-s" style={{ display: "block" }}>
                    <span className="u">{entry.title}</span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : !trimmed ? (
        <nav aria-label="Browse by section">
          <ul className="topic-links">
            {CATEGORIES.map((category) => (
              <li key={category.slug}>
                <Link href={`/category/${category.slug}`} onClick={onClose}>
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [pastMasthead, setPastMasthead] = useState(false);
  const [panel, setPanel] = useState<"menu" | "search" | null>(null);
  const sentinel = useRef<HTMLDivElement>(null);

  const close = () => setPanel(null);

  useEffect(() => {
    document.documentElement.classList.toggle("is-locked", panel !== null);
  }, [panel]);

  useEffect(() => {
    if (!isHome || !sentinel.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      setPastMasthead(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [isHome]);

  return (
    <>
      {isHome ? (
        <header>
          <div className="wrap masthead">
            <h1 className="masthead__mark">
              <Link href="/" aria-label="PRAWD home" tabIndex={-1} style={{ display: "block" }}>
                <Wordmark decorative />
              </Link>
            </h1>
            <div className="masthead__line">
              <p>{SITE.line}</p>
              <p className="meta">Preview edition. Sample content.</p>
            </div>
          </div>
          <div className="nav-row">
            <div className="wrap nav-row__inner">
              <NavList pathname={pathname} label="Main" />
              <Tools onMenu={() => setPanel("menu")} onSearch={() => setPanel("search")} />
            </div>
          </div>
          <div ref={sentinel} aria-hidden="true" />
        </header>
      ) : null}

      <div className={`bar ${isHome ? `bar--float${pastMasthead ? " is-on" : ""}` : "bar--sticky"}`}>
        <div className="wrap bar__inner">
          <Link href="/" className="bar__mark" aria-label="PRAWD home">
            <Wordmark decorative />
          </Link>
          <NavList pathname={pathname} label={isHome ? "Main, compact" : "Main"} />
          <Tools onMenu={() => setPanel("menu")} onSearch={() => setPanel("search")} />
        </div>
      </div>

      <Overlay open={panel === "menu"} onClose={close} label="Menu">
        <OverlayTop onClose={close} />
        <nav className="wrap" aria-label="Menu">
          <ul className="menu-list">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={close}
                  aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="menu-secondary">
            {SECONDARY_NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} onClick={close}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <button
                type="button"
                className="tool"
                style={{ justifyContent: "flex-start" }}
                onClick={() => setPanel("search")}
              >
                Search
              </button>
            </li>
          </ul>
        </nav>
      </Overlay>

      <Overlay open={panel === "search"} onClose={close} label="Search">
        <OverlayTop onClose={close} />
        <SearchPanel onClose={close} />
      </Overlay>
    </>
  );
}
