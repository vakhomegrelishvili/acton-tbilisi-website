# AGENTS.md — instructions for AI coding agents

This is the website of **Acton Academy Tbilisi (Saburtalo)**, a learner-driven school for children aged 5–14.
The site is in **Georgian only** (structure is ready for more languages). It is built with **Astro** (static HTML),
content lives in **Markdown/YAML files**, it is hosted on **Cloudflare Pages**, and forms go to **Google Sheets**.

Most requests you will get are content changes from school staff who are not developers. Make the change,
keep the site building, and explain what you did in plain language (Georgian if they wrote in Georgian).

## Golden rules

1. **Content goes in `src/content/`, never hard-coded in components.** If text is visible on the site, it should be
   in a `.md` or `.yaml` file. Interface words (button labels, aria text) live in `src/i18n/ui.ts`.
2. **Never invent facts about the school.** Prices, dates, accreditation, names, quotes, safety claims: only write
   what the person gave you. If you must leave a gap, set `placeholder: true` on that block and say so.
3. **Children's privacy.** Every photo must be listed in `src/content/photos.yaml` with alt text and a `consent`
   value. Every enrolled family signs the school contract, which includes written consent to public photo use,
   so photos of **enrolled** children are `consent: signed`. For anyone else (visitors, siblings, trial-week
   children) ask whether written consent exists (Georgian law №3144). Never put a child's full name next to their photo.
4. **The assistant only repeats approved answers.** Don't connect it to an LLM or let it answer outside
   `src/content/faq/` without reading `docs/ASSISTANT.md`.
5. **Georgian typography:** never use CSS `text-transform: uppercase` on Georgian; use `<Caps>` / `toMtavruli()`.
   Never put white text on cyan `#00C0FF` (contrast 2.1:1): text on cyan is navy. Highlighted heading words use
   SectionHeading's `accent` (cyan bar). The approved design is **S4** (see docs/DESIGN-SYSTEM.md).
6. **Use design tokens** from `src/styles/tokens.css`. No new hex colours, fonts or font sizes in components.
7. **Always quote text in YAML** (`title: "…"`). Georgian sentences contain `:` and `,` which break unquoted YAML.
8. **Run the checks before you finish** (see below). Don't commit if they fail.

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies (Node 22+) |
| `npm run dev` | Local site at http://localhost:4321 (forms show an error locally: no API) |
| `npm run dev:full` | Build + run with Cloudflare Functions at http://localhost:8788 (forms work in mock mode) |
| `npm run build` | Production build into `dist/` |
| `npm run check` | Type check (`astro check`) + content checks. **Must pass.** |
| `npm run placeholders` | List every file that still has invented/unconfirmed content |
| `npm run new:article -- slug "სათაური" author` | New article (draft); author = file name in `src/content/team/ka/` |
| `npm run new:question -- "კითხვა?"` | New question of the week (auto-numbered) |
| `npm run new:faq -- slug "კითხვა?" category` | New FAQ entry |

Before finishing any task: `npm run check && npm run build`.

## Where things are

```
src/content/                 ← ALL CONTENT (see docs/CONTENT.md for every field)
  settings/ka.yaml           phone, email, address, nav, announcement bar, next exhibition date
  pages/ka/home.yaml         every homepage section's text, in page order
  pages/ka/about.yaml        about page text, founders list (people only), safety, privacy
  pages/ka/faq.yaml          FAQ page text + category names
  faq/ka/*.md                one file per FAQ question (body = answer)
  questions/ka/NNN.md        question of the week archive; highest number = current week (archive page: /questions)
  pages/ka/questions.yaml    weekly-question archive page copy + topic names
  pages/ka/philosophy.md     educational philosophy page /philosophy (frontmatter: SEO, heading, CTA; body = text)
  studios/ka/*.md            age groups (5–7, 8–11, 12–14)
  team/ka/*.md               guides, administration and contributors (body = bio); article authors come from here
  testimonials/ka/*.md       parent quotes (body = quote)
  articles/ka/*.md           articles / სტატიები (file name = URL /articles/<name>)
  pages/ka/articles.yaml     articles page copy, the 6 topic labels + colours, newsletter, homepage section 08
  clubs/ka/*.md              after-school clubs / კლუბები (file name = URL /clubs/<name>; body = description)
  pages/ka/clubs.yaml        clubs page copy + shared club facts (ages, time, price, phone), interest groups, weekdays
  photos.yaml                photo register: id, file, alt, consent
src/assets/photos/           photo files (referenced by id, never by path)
src/content.config.ts        the content schema (field names + types). Change docs/CONTENT.md with it.
src/pages/                   routes: index, about, faq, questions, philosophy, clubs/ (list, [slug]), articles/ (list, [slug], authors/[author]), design-system, 404
src/components/              home/, about/, articles/, clubs/, shared/, layout/, ui/ (see docs/DESIGN-SYSTEM.md)
src/lib/articles.ts          article helpers: reading time, author lookup, related articles
src/lib/clubs.ts             club helpers: sorted list, URLs, colour vars, related clubs
src/styles/tokens.css        design tokens (colours, type, spacing)
src/i18n/ui.ts               interface strings
functions/api/               Cloudflare Pages Functions: lead, vote, votes, subscribe (newsletter), feedback ("was it helpful")
google/apps-script/Code.gs   Google Sheets bridge (deployed by hand, see docs/BACKEND.md)
scripts/                     check-content.mjs, new.mjs
docs/                        CONTENT, DESIGN-SYSTEM, BACKEND, DEPLOY, ASSISTANT, I18N, OPEN-QUESTIONS, EDITING-GUIDE.ka
```

## Common tasks (recipes)

- **Change a price / phone / date / any sentence** → find it with a search in `src/content/`, edit, run checks.
  If the change confirms a placeholder, remove `placeholder: true` from that block.
- **Add an article** → `npm run new:article -- my-slug "სათაური" salome-davituliani`, write the body with `##`
  subheadings (they become the table of contents), pick 1–3 `topics` from the fixed list, set `draft: false`.
  Cover must be a photo id from `photos.yaml`. The author must be a team file; a founder/parent who writes gets a
  team file with `group: contributor`. Reading time, author card, related articles and the homepage section are automatic.
- **Add an article topic** → add the key to `ARTICLE_TOPICS` in `src/content.config.ts`, its label + colour to
  `topics` in `pages/ka/articles.yaml`, and the key list in `scripts/check-content.mjs`. Keep the list short.
- **Add / change a club** → `src/content/clubs/ka/<slug>.md` (see docs/CONTENT.md). Price, time, ages and phone
  shared by all clubs are in `pages/ka/clubs.yaml → facts`. Club weekdays are `days: [0, 2]` (0 = Monday).
  Homepage tiles, the list, the weekly schedule, the sign-up form and `/clubs/<slug>` update automatically.
- **New question of the week** (every Monday) → `npm run new:question -- "კითხვა?"`. On Friday, add
  `conclusion:` (the kids' summary) to that file. The homepage automatically shows the highest number.
- **Add / edit an FAQ** → `src/content/faq/ka/`. Add `keywords:` so the assistant can find it; `chip:` makes it a
  quick-pick button; `showOnHome: true` puts it on the homepage; `handoff: true` for sensitive topics.
- **Add a photo** → put the file in `src/assets/photos/` (JPG/WebP, ≤ 2000px, lowercase-dashed name), add an entry
  to `src/content/photos.yaml` with Georgian alt text and consent status, then reference its `id`.
- **Add a team member** → copy a file in `src/content/team/ka/`, change the fields and the bio.
- **Add a new homepage section** → new component in `src/components/home/`, its text in `home.yaml`
  (extend the schema in `src/content.config.ts`), add it to the list in `src/pages/index.astro`, document it.
- **Add a new page** → `src/pages/<slug>.astro` using `BaseLayout` + `PageHero`; put its copy in
  `src/content/pages/ka/<slug>.yaml` with a new collection in `content.config.ts`; add it to `nav` in settings.
- **Change styling** → tokens first (`tokens.css`), then the component's `<style>`. Check `/design-system`.

## Conventions

- Astro components, plain TypeScript in `<script>` tags for interactivity (no React/Vue). Keep JS small and
  progressive: the page must make sense without JS.
- Each interactive widget finds its root via a `data-*` attribute and supports several instances per page.
- Accessibility: real `<button>`s, `aria-pressed`/`aria-selected`/`aria-expanded`, visible focus,
  48px touch targets, `prefers-reduced-motion` respected, images have Georgian alt text.
- Mobile first: check at 390px wide. No horizontal page scroll.
- Commit messages in English, imperative ("Add FAQ about lunch"). One topic per pull request.
- Every pull request gets a Cloudflare preview URL. Placeholder content is outlined in yellow ("ნიმუში") on
  previews and in `npm run dev`, never on the live site.

## Things that need a human (don't guess)

Listed in `docs/OPEN-QUESTIONS.md`: state (NCEQE) authorisation status, "Acton Academy" vs "American School" naming,
real prices/fees, schedule, address, guide bios, parent quotes approval, video links, real articles and author bios.
