// Run by `npm run build`, or on its own with `npm run content:check`.
// Catches the mistakes the article schema can't: missing files, repeated covers, bad image ids.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const root = process.cwd();
const media = JSON.parse(fs.readFileSync(path.join(root, "content/media.json"), "utf8"));
const authors = JSON.parse(fs.readFileSync(path.join(root, "content/authors.json"), "utf8"));
const ids = new Map(media.map((m) => [m.id, m]));
const problems = [];
const warnings = [];

for (const item of media) {
  if (!item.alt?.trim()) problems.push(`media "${item.id}": missing alt text`);
  if (!item.credit?.trim()) problems.push(`media "${item.id}": missing credit`);
  if (!item.license?.trim()) problems.push(`media "${item.id}": missing licence`);
  if (!fs.existsSync(path.join(root, "public", item.src))) problems.push(`media "${item.id}": missing file ${item.src}`);
}

const dir = path.join(root, "content/articles");
const covers = new Map();
const used = new Set();
const slugs = new Set();
const required = ["title", "excerpt", "category", "author", "published", "cover"];

for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"))) {
  const { data, content } = matter(fs.readFileSync(path.join(dir, file), "utf8"));
  for (const key of required) if (!data[key]) problems.push(`${file}: missing "${key}"`);

  const slug = data.slug ?? file.replace(/\.mdx$/, "");
  if (slugs.has(slug)) problems.push(`${file}: duplicate slug "${slug}"`);
  slugs.add(slug);

  if (data.author && !authors[data.author]) problems.push(`${file}: unknown author "${data.author}"`);
  if (data.cover && !ids.has(data.cover)) problems.push(`${file}: unknown cover "${data.cover}"`);
  if (covers.has(data.cover)) problems.push(`${file}: cover "${data.cover}" is already used by ${covers.get(data.cover)}`);
  covers.set(data.cover, file);
  used.add(data.cover);

  const refs = [...content.matchAll(/<Figure[^>]*\bid="([^"]+)"/g)].map((m) => m[1]);
  for (const match of content.matchAll(/ids=\{\[([^\]]+)\]\}/g)) {
    refs.push(...[...match[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]));
  }
  // A first section may open on the story's own cover.
  for (const section of data.sections ?? []) if (section.image !== data.cover) refs.push(section.image);
  const markers = [...content.matchAll(/\{\/\* section: ([a-z0-9-]+) \*\/\}/g)].map((m) => m[1]);
  const declared = (data.sections ?? []).map((section) => section.id);
  if (markers.join() !== declared.join()) problems.push(`${file}: section markers [${markers}] don't match frontmatter [${declared}]`);
  for (const [place, image] of Object.entries(data.placeImages ?? {})) {
    if (!ids.has(image)) problems.push(`${file}: unknown place image "${image}"`);
    if (!(data.places ?? []).includes(place)) problems.push(`${file}: placeImages lists "${place}", which isn't in places`);
  }
  for (const place of data.places ?? []) if (!/^[^,]+, [^,]+$/.test(place)) problems.push(`${file}: place "${place}" must be "City, Country"`);
  for (const ref of refs) {
    if (!ids.has(ref)) problems.push(`${file}: unknown image "${ref}"`);
    if (used.has(ref)) problems.push(`${file}: image "${ref}" is used more than once on the site`);
    used.add(ref);
  }
}

for (const item of media) if (!used.has(item.id)) warnings.push(`media "${item.id}" isn't used by any article`);

for (const warning of warnings) console.warn(`warning: ${warning}`);
if (problems.length > 0) {
  for (const problem of problems) console.error(`error: ${problem}`);
  process.exit(1);
}
console.log(`Content OK: ${slugs.size} articles, ${media.length} images.`);
