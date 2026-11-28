/**
 * Small helpers so pages never deal with locale folders or photo files directly.
 */
import { getCollection, getEntry, type CollectionKey, type CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';
import { defaultLang, type Lang } from '@/i18n/ui';

/** Entries of a collection for one language (files in src/content/<collection>/<lang>/). */
export async function getLocalized<C extends CollectionKey>(collection: C, lang: Lang = defaultLang): Promise<CollectionEntry<C>[]> {
  const all = (await getCollection(collection)) as CollectionEntry<C>[];
  return all.filter((e) => e.id.startsWith(`${lang}/`));
}

export async function getSettings(lang: Lang = defaultLang) {
  const entry = await getEntry('settings', lang);
  if (!entry) throw new Error(`Missing src/content/settings/${lang}.yaml`);
  return entry.data;
}

type PageKey = 'homePage' | 'aboutPage' | 'faqPage' | 'questionsPage' | 'articlesPage' | 'clubsPage';

/** The philosophy page entry (frontmatter + markdown body), for render(). */
export async function getPhilosophy(lang: Lang = defaultLang) {
  const entry = await getEntry('philosophyPage', `${lang}/philosophy`);
  if (!entry) throw new Error(`Missing src/content/pages/${lang}/philosophy.md`);
  return entry;
}
export async function getPage<C extends PageKey>(collection: C, lang: Lang = defaultLang): Promise<CollectionEntry<C>['data']> {
  const name = { homePage: 'home', aboutPage: 'about', faqPage: 'faq', questionsPage: 'questions', articlesPage: 'articles', clubsPage: 'clubs' }[collection];
  const entry = (await getEntry(collection as PageKey, `${lang}/${name}`)) as CollectionEntry<C> | undefined;
  if (!entry) throw new Error(`Missing src/content/pages/${lang}/${name}.yaml`);
  return entry.data;
}

/** The slug part of an entry id: "ka/saturday-market" → "saturday-market". */
export const slugOf = (id: string) => id.split('/').slice(1).join('/');

/* ---------- Photos ---------- */
const files = import.meta.glob<{ default: ImageMetadata }>('/src/assets/photos/*.{jpg,jpeg,png,webp,avif}', { eager: true });

export async function getPhoto(id: string) {
  const entry = await getEntry('photos', id);
  if (!entry) throw new Error(`Photo "${id}" is not listed in src/content/photos.yaml`);
  const mod = files[`/src/assets/photos/${entry.data.file}`];
  if (!mod) throw new Error(`Photo file src/assets/photos/${entry.data.file} not found (photo id "${id}")`);
  return { src: mod.default, alt: entry.data.alt, consent: entry.data.consent };
}
