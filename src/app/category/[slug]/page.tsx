import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Archive } from "@/components/Archive";
import { getByCategory } from "@/lib/content";
import { CATEGORIES } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ slug: category.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORIES.find((c) => c.slug === slug);
  if (!category) return {};
  return {
    title: category.label,
    description: category.description,
    alternates: { canonical: `/category/${category.slug}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = CATEGORIES.find((c) => c.slug === slug);
  if (!category) notFound();
  return (
    <Archive
      title={category.label}
      description={category.description}
      articles={getByCategory(category.slug)}
      page={1}
      basePath={`/category/${category.slug}`}
      current={`/category/${category.slug}`}
      category={category.slug}
    />
  );
}
