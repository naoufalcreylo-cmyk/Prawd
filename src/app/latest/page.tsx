import type { Metadata } from "next";
import { Archive } from "@/components/Archive";
import { getArticles } from "@/lib/content";

export const metadata: Metadata = {
  title: "Latest",
  description: "Every PRAWD story, newest first.",
  alternates: { canonical: "/latest" },
};

export default function LatestPage() {
  return (
    <Archive
      title="Latest"
      description="Every story on PRAWD, newest first."
      articles={getArticles()}
      page={1}
      basePath="/latest"
      current="/latest"
    />
  );
}
