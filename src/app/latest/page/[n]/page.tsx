import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Archive } from "@/components/Archive";
import { getArticles } from "@/lib/content";
import { PAGE_SIZE } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  const pages = Math.ceil(getArticles().length / PAGE_SIZE);
  return Array.from({ length: Math.max(0, pages - 1) }, (_, i) => ({ n: String(i + 2) }));
}

type Props = { params: Promise<{ n: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { n } = await params;
  return { title: `Latest, page ${n}`, alternates: { canonical: `/latest/page/${n}` } };
}

export default async function LatestPagedPage({ params }: Props) {
  const page = Number((await params).n);
  const articles = getArticles();
  if (!Number.isInteger(page) || page < 2 || (page - 1) * PAGE_SIZE >= articles.length) notFound();
  return (
    <Archive
      title="Latest"
      description="Every story on PRAWD, newest first."
      articles={articles}
      page={page}
      basePath="/latest"
      current="/latest"
    />
  );
}
