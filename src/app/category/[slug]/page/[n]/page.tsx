import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Archive } from "@/components/Archive";
import { getByCategory } from "@/lib/content";
import { CATEGORIES, PAGE_SIZE } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORIES.flatMap((category) => {
    const pages = Math.ceil(getByCategory(category.slug).length / PAGE_SIZE);
    return Array.from({ length: Math.max(0, pages - 1) }, (_, i) => ({ slug: category.slug, n: String(i + 2) }));
  });
}

type Props = { params: Promise<{ slug: string; n: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, n } = await params;
  const category = CATEGORIES.find((c) => c.slug === slug);
  return category ? { title: `${category.label}, page ${n}` } : {};
}

export default async function CategoryPagedPage({ params }: Props) {
  const { slug, n } = await params;
  const page = Number(n);
  const category = CATEGORIES.find((c) => c.slug === slug);
  if (!category) notFound();
  const articles = getByCategory(category.slug);
  if (!Number.isInteger(page) || page < 2 || (page - 1) * PAGE_SIZE >= articles.length) notFound();
  return (
    <Archive
      title={category.label}
      description={category.description}
      articles={articles}
      page={page}
      basePath={`/category/${category.slug}`}
      current={`/category/${category.slug}`}
      category={category.slug}
    />
  );
}
