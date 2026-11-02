import type { Metadata } from "next";
import Image from "next/image";
import { getMedia } from "@/lib/content";

export const metadata: Metadata = {
  title: "Image credits",
  description: "The source, author and licence of every photograph on PRAWD.",
  alternates: { canonical: "/credits" },
};

export default function CreditsPage() {
  const items = Object.values(getMedia());
  return (
    <div className="wrap">
      <header className="page-head">
        <h1 className="h-mega">Image credits</h1>
        <p className="deck">
          Every photograph on this preview comes from Wikimedia Commons under the licence shown. Images may be cropped
          to fit the layout. They are temporary and can be replaced with commissioned work.
        </p>
      </header>
      <ul className="credits">
        {items.map((item) => (
          <li key={item.id} className="credit">
            <div className="credit__image">
              <Image
                src={item.src}
                alt=""
                fill
                sizes="96px"
                loading="lazy"
                style={item.focal ? { objectPosition: item.focal } : undefined}
              />
            </div>
            <div>
              <p>{item.caption}</p>
              <p className="meta">
                {item.credit},{" "}
                {item.licenseUrl ? <a href={item.licenseUrl}>{item.license}</a> : item.license}
                {item.sourceUrl ? (
                  <>
                    {", "}
                    <a href={item.sourceUrl}>source</a>
                  </>
                ) : null}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
