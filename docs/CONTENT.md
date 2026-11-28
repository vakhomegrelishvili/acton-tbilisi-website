# Content model

All content is in `src/content/<collection>/<locale>/`. Locale is `ka` (Georgian) for now.
The schema (field names, types, allowed values) is in `src/content.config.ts`; the build fails with a clear
message if a file doesn't match. Run `npm run check` to validate.

## Shared conventions

| Field / marker | Meaning |
| --- | --- |
| `placeholder: true` | Invented for the design, not yet confirmed by the school. Outlined in yellow ("ნიმუში") on previews. `npm run placeholders` lists them. Remove once confirmed. |
| `[დასაზუსტებელია]` in text | An unconfirmed fact inside a sentence. `npm run check` warns. |
| `photo:` / `cover:` | A photo **id** from `src/content/photos.yaml`, not a file path. |
| `order:` | Sort order, lower first. |
| `label:` | Small label above a heading. Write normal letters; the site renders Georgian capitals (Mtavruli). |
| `title` + `accent` (+ `titleAfter`/`after`) | Heading; `accent` gets the cyan highlight bar. |

**YAML tip:** wrap every text value in double quotes. Georgian sentences often contain `:` or `,`, which
otherwise break YAML (`title: "ფასი: 1000 ₾"`).

## Collections

### `settings/ka.yaml` — site-wide
School name, `logoSubtitle`, `phone`/`phoneHref`, `email`, `address`, `responseTime`, links (`bookingUrl` =
Calendly, `messengerUrl`, `whatsappUrl`, `facebookUrl`, `instagramUrl`), `announcement` (top bar; `enabled`
to hide), `nextExhibition` (`date`, `title` → countdowns on the homepage), `nav` (menu items), `footer`, `seo`.

### `pages/ka/home.yaml` — homepage, in page order
`seo`, `hero`, `marquee`, `honest` (01 quote + 3 values), `studios` (02 heading), `day` (03 schedule),
`progress` (04 portfolio sample, badges), `fit` (05 "for you / not for you" + quiz with 2 audiences × 4
questions × exactly 3 options, best answer first), `videos` (06; add `youtubeId` to make a video play),
`testimonials` (07 heading), `trust` (08 cards), `price` (09: amount, `includes`, `calc` = per-school-day calculator with `ourYear`/`ourDays` and add-ons, `honest` notes, `extras`), `join` (10 steps + form text), `faqPreview`,
`clubs` (after-school clubs section, shown right after `day`: `kicker`, `title`/`accent`/`titleAfter`, `lead`,
`facts`, exactly 3 `photos`, interest-chip label, CTA text; the tiles themselves come from `clubs/ka/`).

Homepage sections can be switched off with `hidden: true` (e.g. `progress`, `videos`, `trust`); the visible sections are numbered 01, 02, … automatically (`src/pages/index.astro`). `honest.quoteHidden: true` hides only the quote. `day.schedule[].text` is optional.

### `pages/ka/about.yaml`
`hero` (+ `stats`), `story.items`, `team` (group names/intros: `guide`, `admin`), `founders` (heading, `intro` with {n}/{p}, `people`: `name`, `isParent`, `inMemory`, optional `photo`),
`accreditation.cards` (`status`: confirmed | pending | info), `safety.items`, `privacy` (`details` Q&A,
`consentDemo` switches), `cta`.

### `pages/ka/faq.yaml`
`seo`, `hero`, `categories` (id → Georgian name), `cta`.

### `pages/ka/philosophy.md` — educational philosophy page (/philosophy)
Frontmatter: `seo`, `label`, `title`, `accent`, `cta` (`title`, `text`, `button`, `href`). Body = the page text (`##` = sections). The homepage block linking here is `home.yaml → philosophy` (`title`, `text`, `link`).

### `pages/ka/questions.yaml` — weekly-question archive page (/questions)
`seo`, `hero` (`title` may contain `{n}` = number of archived questions), `topics` (id → name), `cta`.

### `pages/ka/clubs.yaml` — clubs page + every single club page
`seo`; `facts` (shared by all clubs: `ages`, `agesText`, `ageMin`/`ageMax` (form age list), `frequency`, `time`,
`price` (a number, GEL per club per month: the sign-up form multiplies it), `currency`, `perMonth`, `phone`/`phoneHref`,
`audience`); `categories` (interest id → name; ids: create | tech | think | move); `days` (5 weekdays, Monday first,
`short` + `full`); `hero` (+ `facts`, 3 `photos`, `cta`); `steps` (how it works); `list` (filter, view and card labels;
`{n}` = number of clubs); `join` (sign-up form text; `{n}`, `{clubs}`); `faq` (`title`/`accent` + `pending`: questions
the school has not answered yet, shown with `placeholder: true`. Confirmed club answers live in `faq/ka/` with
`category: clubs`, so the assistant can answer them too); `club` (single club page: section titles, the sample
`timeline`, `groupSize`, facts card labels, related clubs).

### `clubs/ka/<slug>.md` — one after-school club per file (URL `/clubs/<slug>`)
```yaml
name: "რობოტიკა"
order: 2                     # position everywhere (homepage tiles, list, switcher)
category: tech               # create | tech | think | move (labels in pages/ka/clubs.yaml → categories)
tagline: "ააწყე, დააპროგრამე, აამოძრავე"
icon: "M6 9h12v10H6z …"      # SVG path data, 24×24, stroked line icon
colors: { bg: "#E9FDFE", fg: "#00707A" }   # light tile + dark icon/text; check-content requires 4.5:1 contrast
photo: clubs-gamelab         # optional photo id; without it the card shows the coloured icon tile ("ფოტო მალე")
days: [0, 2]                 # weekdays it meets: 0 = Monday … 4 = Friday (drives the day filter + weekly schedule)
activities:                  # "რას აკეთებენ ბავშვები" cards
  - { title: "აწყობა", text: "…" }
gains: ["ლოგიკური ფიქრი", "…"]   # "რას წაიღებს ბავშვი" pills
guide: { name: "…", bio: "…" }   # optional; without it a placeholder guide card is shown
placeholder: true
```
Body (Markdown) = the description (its first paragraph is used on the list card). The sign-up form on `/clubs#join`
posts to `/api/lead` with `type: "club"` (see BACKEND.md); `/clubs?club=<slug>#join` pre-selects a club.

### `faq/ka/<slug>.md` — one question per file
```yaml
question: "რა ღირს სწავლა?"
category: enrollment     # status | learning | progress | daily | enrollment | clubs
order: 1
showOnHome: true         # optional: show in the homepage FAQ block
chip: "რამდენი ღირს?"     # optional: quick button in the assistant
assistantAnswer: "…"     # optional: shorter answer for the assistant (else first paragraph)
keywords: [ფასი, ღირს]   # words people might type
handoff: false           # true = assistant also says "ask a human"
```
Body (Markdown) = the full answer. URL anchor: `/faq#<slug>`.

### `questions/ka/NNN.md` — question of the week
`number` (unique), `week` (Monday date), `topic` (fairness | science | money | people), `question`,
`options` (2–4, used for voting while current), `results` (optional fallback %), `conclusion` (kids' summary),
`studios`. **The highest number is "this week's" question** on the homepage; all others form the archive at `/questions`.

### `studios/ka/<slug>.md`
`name`, `ageMin`, `ageMax`, optional `openEnded: true` (no upper limit, shown as "15+"), `photo`, `color` (teal | blue | red | gold), `points` (short facts), `order`. Body = description.
The age buttons on the homepage are generated from the min/max of all studios.

### `team/ka/<slug>.md`
`name`, `group` (guide | admin | contributor), `role`, `isParent`, `facts` (badges), `photo` (optional),
`since` (optional, e.g. "2025 წლიდან", shown on the author page), `order`. Body = bio.
Guides and administration appear in the About page team block. `contributor` = someone who only writes articles (a parent,
a founder). Founders are a simple list in `about.yaml → founders` (no shares; add `photo` as photos arrive). The same file feeds the article author card and the
author page `/articles/authors/<file name>`, so bio and photo are edited in one place.

### `testimonials/ka/<slug>.md`
`name`, `role`, `order`, `approved` (the parent approved this exact wording). Body = quote.
`npm run check` refuses `placeholder: false` without `approved: true`. Only approved quotes are shown on the homepage; with none approved, the section is hidden.

### `articles/ka/<slug>.md` — articles (სტატიები)
| Field | Meaning |
| --- | --- |
| `title` | Headline. `titleAccent` (optional) = the words of the title that get the highlight bar. |
| `description` | 1–2 sentences: card text, page lead and Google description. |
| `date` | Publication date (YYYY-MM-DD). Lists are newest first. |
| `author` | File name of a team member in `team/ka/` (without `.md`). |
| `topics` | 1–3 of the fixed list: `method` (სწავლის მეთოდი), `life` (სტუდიის ცხოვრება), `quests` (ქვესტები), `clubs` (კლუბები), `parents` (მშობლებს), `acton` (Acton-ის ფილოსოფია). |
| `cover` | Photo id from `photos.yaml`. `coverCaption` optional. The "published with parents' consent" note shows when the photo's consent is `signed`. |
| `summary` | Optional 1–4 points for the "მოკლედ, თუ 30 წამი გაქვთ" box. |
| `readMinutes` | Optional; otherwise counted from the text (words ÷ 130). |
| `draft` | `true` = only visible in `npm run dev`. |

Body = Markdown. Every `## heading` becomes an entry in the table of contents. `> quote` is shown as a navy quote card.
URLs: `/articles/<file name>`; author pages `/articles/authors/<author>`. Old `/blog/...` links redirect (`public/_redirects`).
Page copy (hero, topic labels and colours, newsletter, trial-week CTA, homepage section 08): `pages/ka/articles.yaml`.

### `photos.yaml` — photo register
```yaml
- id: market-stall
  file: market-stall.jpg          # in src/assets/photos/
  alt: "ბავშვები შაბათის ბაზრობაზე…" # Georgian description, no child names
  consent: signed                  # signed | pending | none-needed (enrolled families: signed via the enrolment contract)
  source: "Facebook, 2026"
```
Every file in `src/assets/photos/` must be listed (the check fails otherwise). Images are resized and converted
to WebP automatically at build time.

## Interface strings
Button labels, form messages, aria labels: `src/i18n/ui.ts`.
