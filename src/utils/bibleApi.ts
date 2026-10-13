import { PopupTranslationCode } from '../types/lesson';

export interface VerseItem {
  book: string;
  chapter: string;
  verse: string;
  text: string;
}

export interface PopupTranslationOption {
  code: PopupTranslationCode;
  apiId: string;
  label: string;
  description: string;
}

export const POPUP_TRANSLATIONS: PopupTranslationOption[] = [
  { code: 'BSB', apiId: 'en-bsb', label: 'BSB (Berean Study Bible)', description: 'Modern, highly readable, clear study text' },
  { code: 'WEB', apiId: 'en-web', label: 'WEB (World English Bible)', description: 'Modern public domain English' },
  { code: 'KJV', apiId: 'en-kjv', label: 'KJV (King James Version)', description: 'Classic Authorized Version' },
  { code: 'ASV', apiId: 'en-asv', label: 'ASV (American Standard Version)', description: 'Literal classic translation' },
  { code: 'FBV', apiId: 'en-fbv', label: 'FBV (Free Bible Version)', description: 'Simple, accessible English' },
];

const BOOK_SLUG_MAP: Record<string, string> = {
  'psalm': 'psalms',
  'song': 'songofsolomon',
  'song of songs': 'songofsolomon',
};

export function getBookSlug(book: string): string {
  const normalized = book.trim().toLowerCase();
  if (BOOK_SLUG_MAP[normalized]) {
    return BOOK_SLUG_MAP[normalized];
  }
  return normalized.replace(/[^a-z0-9]/g, '');
}

export function parseVerseRange(verseRange: string | null): { start: number; end: number } | null {
  if (!verseRange) return null;
  const cleaned = verseRange.trim().replace('–', '-');
  if (cleaned.includes('-')) {
    const [startStr, endStr] = cleaned.split('-');
    const start = parseInt(startStr, 10);
    const end = parseInt(endStr, 10);
    if (!isNaN(start) && !isNaN(end)) {
      return { start, end };
    }
  } else {
    const single = parseInt(cleaned, 10);
    if (!isNaN(single)) {
      return { start: single, end: single };
    }
  }
  return null;
}

// In-memory cache to make re-opens instantaneous (0ms)
const chapterCache = new Map<string, VerseItem[]>();

export async function fetchChapterVerses(
  book: string,
  chapter: number,
  translationCode: PopupTranslationCode = 'BSB'
): Promise<VerseItem[]> {
  const trans = POPUP_TRANSLATIONS.find(t => t.code === translationCode) || POPUP_TRANSLATIONS[0];
  const bookSlug = getBookSlug(book);
  const cacheKey = `${trans.apiId}_${bookSlug}_${chapter}`;

  if (chapterCache.has(cacheKey)) {
    return chapterCache.get(cacheKey)!;
  }

  const url = `https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/${trans.apiId}/books/${bookSlug}/chapters/${chapter}.json`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load verses (${response.status})`);
    }

    const json = await response.json();
    const rawVerses: VerseItem[] = json.data || [];

    // Deduplicate verses (some translations have duplicate lines in the source repo)
    const seen = new Set<string>();
    const uniqueVerses: VerseItem[] = [];

    for (const v of rawVerses) {
      if (!seen.has(v.verse)) {
        seen.add(v.verse);
        uniqueVerses.push({
          book: v.book || book,
          chapter: v.chapter || chapter.toString(),
          verse: v.verse,
          text: v.text.trim()
        });
      }
    }

    chapterCache.set(cacheKey, uniqueVerses);
    return uniqueVerses;
  } catch (error) {
    console.error('Error fetching verses from bible-api:', error);
    throw error;
  }
}
