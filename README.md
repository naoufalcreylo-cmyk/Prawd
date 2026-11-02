# PRAWD

An English-language football publication. Next.js 16 (App Router), React 19, plain CSS and MDX files. There is no database, CMS or admin interface: articles are files in this repository.

## Run it

Requires Node.js 20 or newer.

```bash
npm install
npm run dev        # http://localhost:3000, shows drafts too
```

To run the production version, which hides drafts:

```bash
npm run build      # checks the content, then builds
npm start
```

Other commands: `npm test` (forms and search logic), `npm run lint`, `npm run content:check`.

## Add and publish an article

1. Add the images, if they're new (see below).
2. Copy `content/templates/new-article.mdx` into `content/articles/` and rename it. The filename becomes the URL: `my-story.mdx` publishes at `/articles/my-story`.
3. Fill in the frontmatter and write the article. It stays private while it has `status: draft`, and you can preview it with `npm run dev`.
4. When it's ready, set `status: published` and `demo: false`.
5. Run `npm run build`. It stops with a clear message if an image, author or field is wrong. Deploy the result.

### Article fields

| Field | Notes |
| --- | --- |
| `title`, `displayTitle` | `displayTitle` is optional. `\|` marks a line break in large headlines on wider screens. |
| `excerpt`, `deck` | The excerpt appears on cards and search results. The deck appears under the headline. |
| `category` | `football-culture`, `kits-boots`, `stories`, `interviews` or `photography` |
| `format` | `Feature`, `Essay`, `Interview`, `Photo Essay`, `Perspectives` or `The Matchday Edit` |
| `tags` | Each tag gets its own page at `/tag/...` |
| `author` | An id from `content/authors.json` |
| `published`, `modified` | Dates as `YYYY-MM-DD`. `modified` is optional. |
| `cover`, `coverAlt`, `coverCaption` | `cover` is an id from `content/media.json`. The other two override its text. |
| `layout` | `standard`, `photo` for a picture-led feature, `matchday` or `perspectives` |
| `status` | `draft` or `published` |
| `demo`, `demoNote` | `demo: true` shows a preview notice and keeps the article out of search engines |
| `homepage`, `homepageOrder` | `lead`, `supporting`, `row`, `selects`, `in-focus` or `none` |
| `places`, `placeImages` | Build the Atlas. Each place is `City, Country`. A story with several places names the photograph taken in each one |
| `sections` | The angles of a Perspectives story or chapters of a Matchday Edit |
| `featured` | Featured stories fill any empty lead, supporting, In Focus or Selects slot before newer stories do |
| `seo.title`, `seo.description` | Optional replacements for the title and description in search results and social previews |

### Article body

Write Markdown, plus four components:

```mdx
<Figure id="image-id" />
<Figure id="image-id" size="column" ratio="4 / 3" caption="Replacement caption" />
<Gallery ids={["first-id", "second-id"]} ratio="4 / 5" offset />
<PullQuote>Words taken from the article itself.</PullQuote>
<Q>A question in an interview.</Q>
```

The homepage arranges itself from the frontmatter. Only the text list "In this edition" repeats stories placed further down:

- **Lead stories:** one `lead` and two `supporting`.
- **Four-up row:** four stories with `row`.
- **The Matchday Edit and PRAWD Perspectives:** the newest story with that `layout`.
- **Latest:** the newest four stories not placed elsewhere. "Load more" then adds the rest.
- **PRAWD Selects:** three stories with `selects`.
- **In Focus:** one story with `in-focus`. Use a wide photograph, as it's cropped to a panorama.
- **Kits & Boots and Voices:** the newest unplaced stories from `kits-boots` and `interviews`.

## PRAWD formats

- **PRAWD Atlas** (`/atlas`) builds itself from each article's `places`. A place appears once a published story covers it. Only name a place the story is really about, and never pair a place with a photograph taken somewhere else.
- **The Matchday Edit** (`layout: matchday`) and **PRAWD Perspectives** (`layout: perspectives`) list their chapters or angles under `sections`, each with an `id`, `label`, `summary` and `image`. The body then has one marker per section, in the same order. See `content/articles/the-matchday-edit.mdx`:

```mdx
{/* section: the-journey */}

The text of this chapter.
```

## Add an image

1. Put the file in `public/images/`. Aim for about 2,200 px on the long edge. Next.js makes the smaller sizes.
2. Add an entry to `content/media.json`:

```json
{
  "id": "my-image",
  "src": "/images/my-image.jpg",
  "width": 2200,
  "height": 1467,
  "alt": "What the image shows, for people who can't see it.",
  "caption": "What it is, where and when.",
  "credit": "Photographer's name",
  "license": "Commissioned for PRAWD",
  "focal": "50% 40%"
}
```

`focal` is the point to keep in view when the image is cropped, as a horizontal and vertical percentage. Add `licenseUrl` and `sourceUrl` where they exist. The image then appears on `/credits` automatically. Each image can be used only once across the site, and the build fails if one is repeated.

## Go live

Before launch:

1. Set `NEXT_PUBLIC_SITE_URL` to the real domain.
2. Replace or approve the demo articles, and the preview labels in `src/components/SiteHeader.tsx` and `src/components/SiteFooter.tsx`.
3. Have the owner complete and review `/privacy`.
4. Set `NEXT_PUBLIC_ALLOW_INDEXING=true`. Until then every page is `noindex` and `robots.txt` blocks crawlers. Articles with `demo: true` stay out of search engines either way.
5. Add real social links to `SITE.social` in `src/lib/site.ts`. The footer shows them only when they exist.

Any Node.js host works. Vercel's free tier is the simplest fit for a preview. `/search` and the forms need a running server, so a purely static export won't work.

## Integrations

Copy `.env.example` to `.env.local` to configure these. Nothing else needs an external service.

| Service | Variables | Without it |
| --- | --- | --- |
| [Buttondown](https://buttondown.com) newsletter | `BUTTONDOWN_API_KEY` | The form says sign-ups aren't open and that nothing was saved |
| [Resend](https://resend.com) contact email | `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | The form says the message wasn't sent |

The form logic is covered by tests against a simulated provider. It hasn't been run against live Buttondown or Resend accounts, so send a test through each once the keys are in place. The forms have validation and a hidden spam-trap field but no rate limiting. Add a CAPTCHA or rate limit if spam arrives.

## Photographs

All photographs are temporary and come from Wikimedia Commons, under the licences listed at `/credits`. `content/image-sources.json` records the original file, author, licence and source description for each one. Attribution is shown wherever an image appears with a caption, and on `/credits` for the crops used on cards.

CC BY-SA images can be used commercially, but they need attribution and share-alike on adapted images, and that licence covers the photographer's copyright only. It doesn't clear trademarks (crests, sponsors) or the rights of identifiable people. Have the set reviewed before relying on it for a public launch, or replace it with commissioned work.

## How it's organised

```
content/articles/    one MDX file per article
content/media.json   every image, with alt text, credit and focal point
content/authors.json bylines
content/image-sources.json  original file, author and licence of each image
src/lib/content.ts   reads and validates content, builds the homepage
src/lib/forms.ts     form validation and provider calls
src/app/             routes
src/components/      header, cards, article parts, forms
src/app/globals.css  the core design system
src/app/formats.css  front page, rows and PRAWD formats
```
