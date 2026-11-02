import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Archive } from "@/components/Archive";
import { getArticles, getTags } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return [...getTags().keys()].map((tag) => ({ tag }));
}

type Props = { params: Promise<{ tag: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const label = getTags().get((await params).tag);
  return label ? { title: label, robots: { index: false, follow: true } } : {};
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const label = getTags().get(tag);
  if (!label) notFound();
  return (
    <Archive
      title={label}
      description={`Stories tagged ${label}.`}
      articles={getArticles().filter((a) => a.tags.includes(label))}
      page={1}
      basePath={`/tag/${tag}`}
      current=""
      tag={label}
    />
  );
}
