/**
 * CONTENT MODEL — the single source of truth for what content exists and which fields it has.
 *
 * Every collection lives in src/content/<collection>/<locale>/...  (locale = "ka" for now).
 * If you add or rename a field here, update docs/CONTENT.md in the same change.
 *
 * Shared conventions:
 *  - `placeholder: true`  → the text was invented for the design and must be confirmed by the school.
 *                           `npm run placeholders` lists all of them. Remove the flag once confirmed.
 *  - `photo`              → an id from src/content/photos.yaml (never a raw file path).
 *  - `order`              → lower numbers come first.
 */
import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

const placeholder = z.boolean().default(false);
const photoId = z.string();

/* ---------- Site-wide settings (contacts, nav, announcement bar, dates) ---------- */
const settings = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/settings' }),
  schema: z.object({
    schoolName: z.string(),
    schoolNameShort: z.string(),
    logoSubtitle: z.string(),
    phone: z.string(),
    phoneHref: z.string(),
    email: z.string(),
    address: z.string(),
    addressPlaceholder: placeholder,
    responseTime: z.string(),
    bookingUrl: z.string(),
    messengerUrl: z.string(),
    whatsappUrl: z.string(),
    facebookUrl: z.string(),
    instagramUrl: z.string(),
    announcement: z
      .object({ enabled: z.boolean(), text: z.string(), linkText: z.string(), href: z.string(), placeholder })
      .optional(),
    nextExhibition: z.object({ date: z.coerce.date(), title: z.string(), placeholder }),
    nav: z.array(z.object({ label: z.string(), href: z.string() })),
    footer: z.object({
      headline: z.string(),
      headlineAccent: z.string(),
      about: z.array(z.string()),
    }),
    seo: z.object({ title: z.string(), description: z.string() }),
  }),
});

/* ---------- Page copy (one YAML file per page; free-form but validated) ---------- */
const sectionHeading = z.object({
  label: z.string(),
  title: z.string(),
  accent: z.string().optional(),
  titleAfter: z.string().optional(),
  placeholder,
  /** true = the section is not shown (e.g. until real content exists). Homepage section numbers close the gap. */
  hidden: z.boolean().default(false),
});

const homePage = defineCollection({
  loader: glob({ pattern: '**/home.yaml', base: './src/content/pages' }),
  schema: z.object({
    seo: z.object({ title: z.string(), description: z.string() }),
    hero: z.object({
      kicker: z.string(),
      title: z.string(),
      accent: z.string(),
      lead: z.string(),
      cta: z.string(),
      secondaryCta: z.string(),
      photo: photoId,
      placeholder,
    }),
    marquee: z.array(z.string()),
    honest: sectionHeading.extend({
      quote: z.string(),
      quoteAuthor: z.string(),
      /** true = the quote is not shown (until a confirmed quote exists); the values list stays. */
      quoteHidden: z.boolean().default(false),
      values: z.array(z.string()),
    }),
    studios: sectionHeading,
    day: sectionHeading.extend({
      schedule: z.array(z.object({ time: z.string(), title: z.string(), text: z.string().default('') })),
    }),
    progress: sectionHeading.extend({
      sample: z.object({
        name: z.string(),
        meta: z.string(),
        bars: z.array(z.object({ label: z.string(), value: z.string(), percent: z.number(), color: z.enum(['blue', 'teal', 'red']) })),
        goal: z.string(),
      }),
      badges: z.array(z.object({ label: z.string(), color: z.enum(['blue', 'teal', 'red', 'gold']) })),
      exhibitionText: z.string(),
    }),
    fit: sectionHeading.extend({
      forYou: z.array(z.string()),
      notForYou: z.array(z.string()),
      quiz: z.object({
        title: z.string(),
        intro: z.string(),
        audiences: z.array(
          z.object({
            label: z.string(),
            questions: z.array(z.object({ q: z.string(), options: z.array(z.string()).length(3) })),
            verdicts: z.object({ yes: z.string(), maybe: z.string(), no: z.string() }),
          }),
        ),
        verdictLabels: z.object({ yes: z.array(z.string()), maybe: z.array(z.string()), no: z.array(z.string()) }),
      }),
    }),
    videos: sectionHeading.extend({
      note: z.string(),
      items: z.array(
        z.object({ title: z.string(), subtitle: z.string().optional(), duration: z.string(), photo: photoId, youtubeId: z.string().default('') }),
      ),
    }),
    testimonials: sectionHeading,
    trust: sectionHeading.extend({
      cards: z.array(z.object({ kind: z.enum(['accreditation', 'team', 'safety']), title: z.string(), big: z.string().optional(), text: z.string(), href: z.string() })),
    }),
    /** Price section. Per-day numbers are computed from `calc` (yearly fee ÷ school days), not typed in. */
    price: sectionHeading.extend({
      amount: z.string(),
      period: z.string(),
      includes: z.array(z.string()),
      calc: z.object({
        title: z.string(),
        intro: z.string(),
        ourYear: z.number(),          // our yearly tuition, GEL
        ourDays: z.number(),          // our school days per year
        perDayLabel: z.string(),      // "{n}" = our price per school day
        otherFee: z.string(),         // input label: other school's yearly fee
        otherDays: z.string(),        // input label: other school's school days
        otherDaysDefault: z.number(),
        otherDaysHint: z.string(),
        addonsTitle: z.string(),
        addons: z.array(z.object({ label: z.string(), yearly: z.number() })),  // added to OUR yearly cost when ticked
        resultOther: z.string(),
        resultOurs: z.string(),
        moreDays: z.string(),         // "{n}" = how many more school days we have
        empty: z.string(),
        note: z.string(),
      }),
      honest: z.object({ title: z.string(), items: z.array(z.object({ title: z.string(), text: z.string() })) }),
      extras: z.array(z.object({ label: z.string(), value: z.string() })),
    }),
    join: sectionHeading.extend({
      steps: z.array(z.object({ title: z.string(), text: z.string() })),
      formTitle: z.string(),
      formNote: z.string(),
    }),
    faqPreview: z.object({ label: z.string(), allLink: z.string() }),
    /** Homepage clubs section (after "day"). Club names, taglines and icons come from the clubs collection. */
    /** Short block linking to /philosophy (between the daily schedule/clubs and the fit check). */
    philosophy: z.object({ title: z.string(), text: z.string(), link: z.string(), href: z.string().default('/philosophy') }),
    clubs: z.object({
      kicker: z.string(),
      title: z.string(),
      accent: z.string(),
      titleAfter: z.string().optional(),
      lead: z.string(),
      facts: z.array(z.object({ big: z.string(), text: z.string() })),
      photos: z.array(photoId).length(3),
      interestLabel: z.string(),
      allLabel: z.string(),
      ctaTitle: z.string(),
      ctaText: z.string(),
      ctaAll: z.string(),
      placeholder,
    }),
  }),
});

const aboutPage = defineCollection({
  loader: glob({ pattern: '**/about.yaml', base: './src/content/pages' }),
  schema: z.object({
    seo: z.object({ title: z.string(), description: z.string() }),
    hero: z.object({ label: z.string(), title: z.string(), accent: z.string(), after: z.string().optional(), lead: z.string(), stats: z.array(z.object({ big: z.string(), text: z.string() })), placeholder }),
    story: sectionHeading.extend({ items: z.array(z.object({ when: z.string(), title: z.string(), text: z.string() })) }),
    team: sectionHeading.extend({
      groups: z.object({ guide: z.object({ label: z.string(), intro: z.string() }), admin: z.object({ label: z.string(), intro: z.string() }) }),
      bioNote: z.string(),
    }),
    /** Founders (owners) block. People only, no shares. `intro` may use {n} (all founders) and {p} (parents). */
    founders: sectionHeading.extend({
      intro: z.string(),
      parentLabel: z.string(),
      memoryLabel: z.string(),
      people: z.array(z.object({ name: z.string(), isParent: z.boolean().default(false), inMemory: z.boolean().default(false), photo: photoId.optional() })),
    }),
    accreditation: sectionHeading.extend({
      cards: z.array(z.object({ status: z.enum(['confirmed', 'pending', 'info']), statusLabel: z.string(), title: z.string(), text: z.string(), link: z.object({ text: z.string(), href: z.string() }).optional() })),
    }),
    safety: sectionHeading.extend({ intro: z.string(), items: z.array(z.object({ icon: z.string(), title: z.string(), text: z.string() })) }),
    privacy: sectionHeading.extend({
      intro: z.string(),
      details: z.array(z.object({ q: z.string(), a: z.string() })),
      consentDemo: z.object({ title: z.string(), intro: z.string(), switches: z.array(z.object({ label: z.string(), hint: z.string(), on: z.boolean() })), noneText: z.string(), someText: z.string() }),
    }),
    cta: z.object({ title: z.string(), accent: z.string(), button: z.string() }),
  }),
});

const faqPage = defineCollection({
  loader: glob({ pattern: '**/faq.yaml', base: './src/content/pages' }),
  schema: z.object({
    seo: z.object({ title: z.string(), description: z.string() }),
    hero: z.object({ label: z.string(), title: z.string(), accent: z.string(), after: z.string().optional(), lead: z.string() }),
    categories: z.record(z.string(), z.string()),
    cta: z.object({ title: z.string(), accent: z.string(), button: z.string() }),
  }),
});

/** Educational philosophy page (/philosophy): frontmatter = page bits, body = the text. */
const philosophyPage = defineCollection({
  loader: glob({ pattern: '**/philosophy.md', base: './src/content/pages' }),
  schema: z.object({
    seo: z.object({ title: z.string(), description: z.string() }),
    label: z.string(),
    title: z.string(),
    accent: z.string().optional(),
    cta: z.object({ title: z.string(), text: z.string(), button: z.string(), href: z.string().default('/#join') }),
  }),
});

/** Weekly-question archive page (/questions). The questions themselves: src/content/questions/<lang>/. */
const questionsPage = defineCollection({
  loader: glob({ pattern: '**/questions.yaml', base: './src/content/pages' }),
  schema: z.object({
    seo: z.object({ title: z.string(), description: z.string() }),
    hero: z.object({ label: z.string(), title: z.string(), accent: z.string(), lead: z.string() }),
    /** Shown instead of the archive while there are no questions yet. */
    empty: z.object({ title: z.string(), accent: z.string(), lead: z.string() }),
    topics: z.record(z.string(), z.string()),
    cta: z.object({ title: z.string(), accent: z.string(), button: z.string() }),
  }),
});

/** The fixed article topic list. Labels and colours: src/content/pages/ka/articles.yaml → topics. Add a topic in both places. */
export const ARTICLE_TOPICS = ['method', 'life', 'quests', 'clubs', 'parents', 'acton'] as const;
const articlesPage = defineCollection({
  loader: glob({ pattern: '**/articles.yaml', base: './src/content/pages' }),
  schema: z.object({
    seo: z.object({ title: z.string(), description: z.string() }),
    hero: z.object({ label: z.string(), title: z.string(), accent: z.string(), after: z.string().optional(), lead: z.string() }),
    /** Label + tag colour for every topic in ARTICLE_TOPICS. */
    topics: z.record(z.enum(ARTICLE_TOPICS), z.object({ label: z.string(), color: z.enum(['blue', 'teal', 'gold', 'red', 'green', 'navy']) })),
    list: z.object({ title: z.string(), accent: z.string(), cadence: z.string() }),
    newsletter: z.object({ enabled: z.boolean(), title: z.string(), accent: z.string(), text: z.string(), success: z.string(), placeholder }),
    cta: z.object({ title: z.string(), accent: z.string(), text: z.string(), button: z.string(), secondary: z.string() }),
    home: sectionHeading.extend({ intro: z.string() }),
  }),
});

/** Club interest groups. Labels: src/content/pages/ka/clubs.yaml → categories. */
export const CLUB_CATEGORIES = ['create', 'tech', 'think', 'move'] as const;
const clubsPage = defineCollection({
  loader: glob({ pattern: '**/clubs.yaml', base: './src/content/pages' }),
  schema: z.object({
    seo: z.object({ title: z.string(), description: z.string() }),
    /** Facts shared by every club. `price` is a number (GEL per club per month), used for the live total. */
    facts: z.object({
      ages: z.string(),
      agesText: z.string(),
      ageMin: z.number().int(),
      ageMax: z.number().int(),
      frequency: z.string(),
      time: z.string(),
      price: z.number(),
      currency: z.string(),
      perMonth: z.string(),
      phone: z.string(),
      phoneHref: z.string(),
      audience: z.string(),
    }),
    categories: z.record(z.enum(CLUB_CATEGORIES), z.string()),
    /** Weekday names, Monday first. Club `days` are indexes into this list (0 = Monday). */
    days: z.array(z.object({ short: z.string(), full: z.string() })).length(5),
    hero: z.object({
      kicker: z.string(),
      title: z.string(),
      accent: z.string(),
      lead: z.string(),
      facts: z.array(z.object({ big: z.string(), text: z.string() })),
      photos: z.array(photoId).length(3),
      cta: z.string(),
    }),
    steps: z.array(z.object({ title: z.string(), text: z.string() })),
    list: z.object({
      title: z.string(),
      accent: z.string(),
      viewCards: z.string(),
      viewWeek: z.string(),
      interest: z.string(),
      day: z.string(),
      all: z.string(),
      anyDay: z.string(),
      daysPlaceholderNote: z.string(),
      weekNote: z.string(),
      total: z.string(),
      found: z.string(),
      clear: z.string(),
      noResultsTitle: z.string(),
      noResultsText: z.string(),
      noResultsButton: z.string(),
      photoSoon: z.string(),
      add: z.string(),
      added: z.string(),
      details: z.string(),
    }),
    join: z.object({
      title: z.string(),
      accent: z.string(),
      text: z.string(),
      chosen: z.string(),
      chooseHint: z.string(),
      whichClubs: z.string(),
      school: z.string(),
      schoolOurs: z.string(),
      schoolOther: z.string(),
      agePlaceholder: z.string(),
      ageSuffix: z.string(),
      note: z.string(),
      success: z.string(),
      successChoice: z.string(),
      successNone: z.string(),
      again: z.string(),
      required: z.string(),
    }),
    faq: z.object({
      title: z.string(),
      accent: z.string(),
      /** Questions the school still has to answer. Confirmed answers live in src/content/faq/ka/ (category: clubs). */
      pending: z.array(z.object({ q: z.string(), a: z.string(), placeholder })).default([]),
    }),
    club: z.object({
      switcher: z.string(),
      breadcrumb: z.string(),
      signUp: z.string(),
      photoSoon: z.string(),
      activities: z.object({ title: z.string(), accent: z.string(), after: z.string().optional() }),
      timeline: z.object({ title: z.string(), accent: z.string(), placeholder, items: z.array(z.object({ time: z.string(), title: z.string(), text: z.string() })) }),
      gains: z.object({ title: z.string(), accent: z.string(), after: z.string().optional() }),
      guide: z.object({ label: z.string(), emptyName: z.string(), emptyBio: z.string() }),
      factsTitle: z.string(),
      factLabels: z.object({ ages: z.string(), frequency: z.string(), time: z.string(), days: z.string(), group: z.string(), audience: z.string(), price: z.string() }),
      groupSize: z.object({ value: z.string(), placeholder }),
      question: z.string(),
      related: z.object({ title: z.string(), accent: z.string(), after: z.string().optional(), all: z.string(), see: z.string() }),
    }),
  }),
});

/* ---------- Repeating content (one Markdown file per item) ---------- */
const studios = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/studios' }),
  schema: z.object({
    name: z.string(),
    ageMin: z.number().int(),
    ageMax: z.number().int(),
    /** true = no upper age limit: shown as "15+" (ageMax is then the last age button). */
    openEnded: z.boolean().default(false),
    photo: photoId,
    color: z.enum(['teal', 'blue', 'red', 'gold']),
    points: z.array(z.string()),
    order: z.number().default(0),
    placeholder,
  }),
});

/* ---------- After-school clubs (კლუბები): one file per club, body = description ---------- */
const clubs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/clubs' }),
  schema: z.object({
    name: z.string(),
    order: z.number().default(100),
    category: z.enum(CLUB_CATEGORIES),
    tagline: z.string(),
    /** SVG path data (24×24 viewBox, stroked) for the club icon. */
    icon: z.string(),
    /** Light tile background + dark icon/text colour. Pick a pair with at least 4.5:1 contrast. */
    colors: z.object({ bg: z.string().regex(/^#[0-9A-Fa-f]{6}$/), fg: z.string().regex(/^#[0-9A-Fa-f]{6}$/) }),
    /** Cover photo id from photos.yaml. Without one the page shows the coloured icon tile ("ფოტო მალე"). */
    photo: photoId.optional(),
    /** Weekdays the club meets: 0 = Monday … 4 = Friday. */
    days: z.array(z.number().int().min(0).max(4)).min(1).max(5),
    activities: z.array(z.object({ title: z.string(), text: z.string() })).default([]),
    gains: z.array(z.string()).default([]),
    guide: z.object({ name: z.string(), bio: z.string(), photo: photoId.optional() }).optional(),
    placeholder,
  }),
});

export const FAQ_CATEGORIES = ['status', 'learning', 'progress', 'daily', 'enrollment', 'clubs'] as const;
const faq = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/faq' }),
  schema: z.object({
    question: z.string(),
    category: z.enum(FAQ_CATEGORIES),
    order: z.number().default(100),
    showOnHome: z.boolean().default(false),
    /** Short answer the on-site assistant gives. If missing, the assistant uses the first paragraph. */
    assistantAnswer: z.string().optional(),
    /** Extra words people might type, to help the assistant find this answer. */
    keywords: z.array(z.string()).default([]),
    /** Optional short button label: this question is offered as a quick-pick chip in the assistant. */
    chip: z.string().optional(),
    /** true = the assistant must hand this topic to a human after answering. */
    handoff: z.boolean().default(false),
    placeholder,
  }),
});

export const QUESTION_TOPICS = ['fairness', 'science', 'money', 'people'] as const;
const questions = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/questions' }),
  schema: z.object({
    number: z.number().int().positive(),
    week: z.coerce.date(),
    topic: z.enum(QUESTION_TOPICS),
    question: z.string(),
    /** Answer choices shown for voting (only used while this is the current question). */
    options: z.array(z.string()).min(2).max(4).default(['დიახ', 'არა', 'დამოკიდებულია']),
    /** Optional fallback percentages, same order as options, shown when live votes are unavailable. */
    results: z.array(z.number()).optional(),
    conclusion: z.string().optional(),
    studios: z.string().optional(),
    placeholder,
  }),
});

const team = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/team' }),
  schema: z.object({
    name: z.string(),
    /** guide / admin = shown on the About page team block. contributor = only an article author (a founder, a parent…).
     *  Founders are a plain list in pages/<lang>/about.yaml → founders. */
    group: z.enum(['guide', 'admin', 'contributor']),
    role: z.string(),
    isParent: z.boolean().default(false),
    facts: z.array(z.string()).default([]),
    photo: photoId.optional(),
    /** Short text for the author page, e.g. "2025 წლიდან". */
    since: z.string().optional(),
    order: z.number().default(100),
    placeholder,
  }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/testimonials' }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    order: z.number().default(100),
    /** The parent approved this exact wording for the website. */
    approved: z.boolean().default(false),
    placeholder,
  }),
});

/* ---------- Articles (სტატიები) ---------- */
const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    /** Optional: the words of the title to show on the highlight bar (must appear in `title`). */
    titleAccent: z.string().optional(),
    description: z.string(),
    date: z.coerce.date(),
    /** File name of a team member in src/content/team/<lang>/ (without .md), e.g. "salome-davituliani". */
    author: z.string(),
    topics: z.array(z.enum(ARTICLE_TOPICS)).min(1).max(3),
    cover: photoId,
    coverCaption: z.string().optional(),
    /** "Short version, if you have 30 seconds": 1–4 bullet points shown above the text. */
    summary: z.array(z.string()).max(4).default([]),
    /** Minutes to read. Leave empty: it is counted from the text. */
    readMinutes: z.number().int().positive().optional(),
    draft: z.boolean().default(false),
    placeholder,
  }),
});

/* ---------- Photo register (alt text + consent for every photo) ---------- */
const photos = defineCollection({
  loader: file('./src/content/photos.yaml'),
  schema: z.object({
    id: z.string(),
    file: z.string(),
    alt: z.string(),
    /** signed = written parental consent on file; pending = not yet; none-needed = no identifiable children. */
    consent: z.enum(['signed', 'pending', 'none-needed']),
    source: z.string().optional(),
    note: z.string().optional(),
  }),
});

export const collections = { settings, homePage, aboutPage, faqPage, questionsPage, philosophyPage, clubsPage, clubs, studios, faq, questions, team, testimonials, articles, articlesPage, photos };
