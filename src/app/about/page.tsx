import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: SITE.description,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="wrap">
      <header className="page-head">
        <h1 className="h-mega">Football, beyond the&nbsp;pitch.</h1>
      </header>
      <div className="g12 page-copy">
        <div className="page-copy__body legal">
          <p className="deck" style={{ fontSize: "clamp(1.375rem, 2vw, 1.875rem)" }}>
            PRAWD is an English-language publication about football: its culture, its people, its style, its images and
            the creative work it keeps inspiring.
          </p>
          <h2>What we cover</h2>
          <p>
            Kits and boots. Supporters and stadiums. Grassroots clubs, football photography, archives, design, and the
            people shaping the game from outside the headlines.
          </p>
          <p>
            Fashion, photography and design all have a place here when they have a clear connection to football. If it
            has nothing to do with the game, it isn&rsquo;t a PRAWD story.
          </p>
          <h2>How we work</h2>
          <p>
            We don&rsquo;t cover transfers, table talk or hot takes. We look for stories that will still be worth reading
            next season, and we give photographs the room they need. Every photograph is credited, and our{" "}
            <Link href="/credits">image credits</Link> list the source and licence of each one.
          </p>
          <h2>This is a preview edition</h2>
          <p>
            The articles currently on this site are demonstration content, written to show how PRAWD will read and look.
            Interviews use invented composite speakers and are labelled as fiction. Where a story mentions a real club,
            place or object, the detail comes from the public record or from the description published with the
            photograph. None of the site is indexed by search engines.
          </p>
          <h2>Get in touch</h2>
          <p>
            Story ideas, photography and corrections are all welcome through the <Link href="/contact">contact page</Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
