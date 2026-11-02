import Image from "next/image";
import type { ReactNode } from "react";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { getMedia } from "@/lib/content";
import type { MediaItem } from "@/lib/types";

export function Credit({ item }: { item: MediaItem }) {
  return (
    <>
      Photo: {item.credit}
      {", "}
      {item.licenseUrl ? <a href={item.licenseUrl}>{item.license}</a> : item.license}
      {item.sourceUrl ? (
        <>
          {", "}
          <a href={item.sourceUrl}>source</a>
        </>
      ) : null}
    </>
  );
}

export function Caption({ item, caption }: { item: MediaItem; caption?: string }) {
  return (
    <figcaption className="caption">
      <span className="caption__text">{caption ?? item.caption}</span> <Credit item={item} />
    </figcaption>
  );
}

const SIZES = {
  column: "(min-width: 720px) 560px, calc(100vw - 32px)",
  wide: "(min-width: 1760px) 1680px, calc(100vw - 80px)",
  full: "(min-width: 1760px) 1680px, 100vw",
};

function Frame({ item, sizes, ratio }: { item: MediaItem; sizes: string; ratio?: string }) {
  return (
    <div className="fig__frame" style={{ aspectRatio: ratio ?? `${item.width} / ${item.height}` }}>
      <Image
        src={item.src}
        alt={item.alt}
        fill
        sizes={sizes}
        style={item.focal ? { objectPosition: item.focal } : undefined}
      />
    </div>
  );
}

function getItem(id: string) {
  const item = getMedia()[id];
  if (!item) throw new Error(`Unknown media id "${id}"`);
  return item;
}

function Figure({
  id,
  size = "full",
  ratio,
  caption,
}: {
  id: string;
  size?: "column" | "full";
  ratio?: string;
  caption?: string;
}) {
  const item = getItem(id);
  return (
    <figure className={`fig fig--${size}`}>
      <Frame item={item} sizes={SIZES[size]} ratio={ratio} />
      <Caption item={item} caption={caption} />
    </figure>
  );
}

function Gallery({ ids, ratio = "4 / 3", offset = false }: { ids: string[]; ratio?: string; offset?: boolean }) {
  const columns = ids.length === 3 ? 3 : 2;
  return (
    <div className={`gallery gallery--${columns}${offset ? " gallery--offset" : ""}`}>
      {ids.map((id) => {
        const item = getItem(id);
        return (
          <figure className="fig" key={id}>
            <Frame item={item} sizes={`(min-width: 720px) ${Math.round(100 / columns)}vw, 100vw`} ratio={ratio} />
            <Caption item={item} />
          </figure>
        );
      })}
    </div>
  );
}

function PullQuote({ children }: { children: ReactNode }) {
  return <blockquote className="pull">{children}</blockquote>;
}

function Q({ children }: { children: ReactNode }) {
  return <p className="q">{children}</p>;
}

export async function ArticleBody({ source }: { source: string }) {
  const { default: Content } = await evaluate(source, { ...runtime, baseUrl: import.meta.url });
  return <Content components={{ Figure, Gallery, PullQuote, Q }} />;
}
