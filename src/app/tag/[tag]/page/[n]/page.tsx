import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Archive } from "@/components/Archive";
import { getArticles, getTags } from "@/lib/content";
import { PAGE_SIZE } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return [...getTags()].flatMap(([tag, label]) => {
    const count = getArticles().filter((a) => a.tags.includes(label)).length;
    const pages = Math.ceil(count / PAGE_SIZE);
    return Array.from({ length: Math.max(0, pages - 1) }, (_, i) => ({ tag, n: String(i + 2) }));
  });
}

type Props = { params: Promise<{ tag: string; n: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag, n } = await params;
  const label = getTags().get(tag);
  return label ? { title: `${label}, page ${n}`, robots: { index: false, follow: true } } : {};
}

export default async function TagPagedPage({ params }: Props) {
  const { tag, n } = await params;
  const label = getTags().get(tag);
  const page = Number(n);
  if (!label) notFound();
  const articles = getArticles().filter((a) => a.tags.includes(label));
  if (!Number.isInteger(page) || page < 2 || (page - 1) * PAGE_SIZE >= articles.length) notFound();
  return (
    <Archive
      title={label}
      description={`Stories tagged ${label}.`}
      articles={articles}
      page={page}
      basePath={`/tag/${tag}`}
      current=""
      tag={label}
    />
  );
}
