import type { Metadata } from "next";
import { AtlasIndex } from "@/components/Formats";
import { FormatMark } from "@/components/StoryCard";
import { getPlaces } from "@/lib/content";

export const metadata: Metadata = {
  title: "Atlas",
  description: "PRAWD Atlas connects football culture stories by place. Pick a city and read what's been written from there.",
  alternates: { canonical: "/atlas" },
};

export default function AtlasPage() {
  const places = getPlaces();
  const countries = [...new Set(places.map((place) => place.country))].sort((a, b) => a.localeCompare(b, "en"));
  const groups = countries.map((country) => ({
    country,
    places: places
      .filter((place) => place.country === country)
      .map((place) => ({
        slug: place.slug,
        city: place.city,
        count: place.articles.length,
        image: place.image ? { src: place.image.src, focal: place.image.focal } : null,
      })),
  }));

  return (
    <div className="wrap">
      <header className="page-head page-head--split">
        <div>
          <p className="label page-head__eyebrow">
            <FormatMark>PRAWD Atlas</FormatMark>
          </p>
          <h1 className="h-mega">Football, by place.</h1>
        </div>
        <p className="deck">
          Every city here has at least one PRAWD story behind it. The index grows on its own as the archive does.
        </p>
      </header>
      <AtlasIndex groups={groups} total={places.length} />
    </div>
  );
}
