"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { searchEntries } from "@/lib/search";
import { loadSearchIndex } from "@/lib/search-index";
import { CATEGORIES, FORMATS, NAV, SECONDARY_NAV, SITE } from "@/lib/site";
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

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="8.5" cy="8.5" r="5.75" />
      <path d="M12.75 12.75 18 18" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="20" viewBox="0 0 22 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M1 4.5h20M1 10h20M1 15.5h20" />
    </svg>
  );
}

function IconButton({ label, onClick, className = "" }: { label: "Menu" | "Search"; onClick: () => void; className?: string }) {
  return (
    <button type="button" className={`icon-button ${className}`} onClick={onClick} aria-label={label} aria-haspopup="dialog">
      {label === "Menu" ? <MenuIcon /> : <SearchIcon />}
    </button>
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
  if (trimmed && !index && !failed) {
    status = "Searching…";
  } else if (trimmed && index) {
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
                    {entry.places[0] ? <span className="meta"> · {entry.places[0].split(", ")[0]}</span> : null}
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
            {FORMATS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} onClick={onClose} className="fmt">
                  {item.label}
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
  const [pastHeader, setPastHeader] = useState(false);
  const [panel, setPanel] = useState<"menu" | "search" | null>(null);
  const sentinel = useRef<HTMLDivElement>(null);

  const close = () => setPanel(null);
  const openMenu = () => setPanel("menu");
  const openSearch = () => setPanel("search");

  useEffect(() => {
    document.documentElement.classList.toggle("is-locked", panel !== null);
  }, [panel]);

  useEffect(() => {
    if (!sentinel.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      setPastHeader(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, []);

  const logo = (
    <Link href="/" aria-label="PRAWD home" className="hx-logo__link">
      <Wordmark decorative />
    </Link>
  );

  return (
    <>
      <header className="hx">
        <div className="hx-top">
          <div className="wrap hx-top__inner">
            <Link
              href="/search"
              className="hx-search"
              aria-haspopup="dialog"
              onClick={(event) => {
                event.preventDefault();
                openSearch();
              }}
            >
              <SearchIcon />
              Search PRAWD
            </Link>
            <nav aria-label="PRAWD formats and pages">
              <ul className="hx-top__links">
                {FORMATS.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>{item.label}</Link>
                  </li>
                ))}
                <li>
                  <Link href="/about">About</Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        <div className="wrap hx-main">
          <div className="hx-main__left">
            <IconButton label="Menu" onClick={openMenu} />
          </div>
          {isHome ? <h1 className="hx-logo">{logo}</h1> : <div className="hx-logo">{logo}</div>}
          <div className="hx-main__right">
            <div className="hx-line">
              <p>{SITE.line}</p>
              <p className="meta">Preview edition. Sample content.</p>
            </div>
            <IconButton label="Search" onClick={openSearch} className="hx-small-only" />
            <IconButton label="Menu" onClick={openMenu} className="hx-small-only" />
          </div>
        </div>
        <div className="hx-nav">
          <div className="wrap">
            <NavList pathname={pathname} label="Main" />
          </div>
        </div>
        <div ref={sentinel} aria-hidden="true" />
      </header>

      {/* Fixed and out of flow, so appearing causes no layout jump. */}
      <div className={`bar bar--float${pastHeader ? " is-on" : ""}`}>
        <div className="wrap bar__inner">
          <IconButton label="Menu" onClick={openMenu} className="hx-wide-only" />
          <Link href="/" className="bar__mark" aria-label="PRAWD home">
            <Wordmark decorative />
          </Link>
          <NavList pathname={pathname} label="Main, compact" />
          <div className="bar__tools">
            <IconButton label="Search" onClick={openSearch} />
            <IconButton label="Menu" onClick={openMenu} className="hx-small-only" />
          </div>
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
          <div className="menu-formats">
            <h2>PRAWD formats</h2>
            <ul>
              {FORMATS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} onClick={close} className="fmt">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
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
