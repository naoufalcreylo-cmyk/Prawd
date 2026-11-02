import Link from "next/link";
import { CATEGORIES, FORMATS, SECONDARY_NAV, SITE } from "@/lib/site";
import { Wordmark } from "./Wordmark";

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__rule">
          <p className="footer__about">
            {SITE.line} An independent publication about football&rsquo;s culture, people, style and imagery.
          </p>
          <div className="footer__cols">
            <nav aria-label="Sections">
              <h2>Read</h2>
              <ul>
                <li>
                  <Link href="/latest">Latest</Link>
                </li>
                {CATEGORIES.map((category) => (
                  <li key={category.slug}>
                    <Link href={`/category/${category.slug}`}>{category.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="PRAWD formats">
              <h2>Formats</h2>
              <ul>
                {FORMATS.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="About PRAWD">
              <h2>PRAWD</h2>
              <ul>
                {SECONDARY_NAV.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
            {SITE.social.length > 0 ? (
              <nav aria-label="Social">
                <h2>Follow</h2>
                <ul>
                  {SITE.social.map((item) => (
                    <li key={item.href}>
                      <a href={item.href} rel="me noopener">
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}
          </div>
        </div>
        <Link href="/" className="footer__mark" aria-label="PRAWD home">
          <Wordmark decorative />
        </Link>
        <div className="footer__base">
          <p>© {new Date().getFullYear()} PRAWD</p>
          <p>Preview edition. All articles are demonstration content and are not indexed by search engines.</p>
        </div>
      </div>
    </footer>
  );
}
