import Link from "next/link";
import { getArticles, getPlaces, getTags } from "@/lib/content";
import { FormatMark } from "./StoryCard";

/** Ranked by how many stories cover each place. PRAWD has no readership data to rank by. */
export function PlacesRail() {
  const places = [...getPlaces()]
    .sort((a, b) => b.articles.length - a.articles.length || a.city.localeCompare(b.city, "en"))
    .slice(0, 6);
  return (
    <section className="rail-block" aria-labelledby="rail-places">
      <h2 id="rail-places" className="section-title section-title--rail">
        <FormatMark>Most covered places</FormatMark>
      </h2>
      <ol>
        {places.map((place, i) => (
          <li key={place.slug}>
            <Link href={`/atlas/${place.slug}`} className="rank-row">
              <span className="index-rail__no" aria-hidden="true">
                {i + 1}
              </span>
              <span>
                <span className="u">{place.city}</span>
              </span>
              <span className="meta">{place.articles.length}</span>
            </Link>
          </li>
        ))}
      </ol>
      <Link href="/atlas" className="text-link rail-block__more">
        Open the Atlas
      </Link>
    </section>
  );
}

export function TopicsRail() {
  const all = getArticles();
  const topics = [...getTags().entries()]
    .map(([slug, label]) => ({ slug, label, count: all.filter((a) => a.tags.includes(label)).length }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "en"))
    .slice(0, 8);
  return (
    <section className="rail-block" aria-labelledby="rail-topics">
      <h2 id="rail-topics" className="section-title section-title--rail">
        Topics
      </h2>
      <ul>
        {topics.map((topic) => (
          <li key={topic.slug}>
            <Link href={`/tag/${topic.slug}`} className="topic-row">
              <span className="u">{topic.label}</span>
              <span className="meta">{topic.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
