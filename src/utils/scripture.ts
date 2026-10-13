import { ScriptureLink, BibleService, TranslationCode } from '../types/lesson';

export interface TranslationOption {
  code: TranslationCode;
  label: string;
  blbCode: string;
  bgCode: string;
}

export const TRANSLATION_OPTIONS: TranslationOption[] = [
  { code: 'NIV', label: 'NIV (New International Version)', blbCode: 'niv', bgCode: 'NIV' },
  { code: 'ESV', label: 'ESV (English Standard Version)', blbCode: 'esv', bgCode: 'ESV' },
  { code: 'NKJV', label: 'NKJV (New King James Version)', blbCode: 'nkjv', bgCode: 'NKJV' },
  { code: 'NLT', label: 'NLT (New Living Translation)', blbCode: 'nlt', bgCode: 'NLT' },
  { code: 'CSB', label: 'CSB (Christian Standard Bible)', blbCode: 'csb', bgCode: 'CSB' },
  { code: 'NASB', label: 'NASB (New American Standard Bible)', blbCode: 'nasb20', bgCode: 'NASB' },
  { code: 'KJV', label: 'KJV (King James Version)', blbCode: 'kjv', bgCode: 'KJV' },
];

export function getBlbUrl(link: ScriptureLink, translation: TranslationCode = 'NIV'): string {
  const opt = TRANSLATION_OPTIONS.find(t => t.code === translation) || TRANSLATION_OPTIONS[0];
  const blbCode = opt.blbCode;
  
  if (link.verseRange) {
    // If verse range contains cross-chapter (e.g., 9:30-10:13)
    if (link.verseRange.includes(':')) {
      return `https://www.blueletterbible.org/search/search.cfm?Criteria=${encodeURIComponent(link.display)}&t=${translation}`;
    }
    return `https://www.blueletterbible.org/${blbCode}/${link.bookAbbr}/${link.chapter}/${link.verseRange}/`;
  }
  
  return `https://www.blueletterbible.org/${blbCode}/${link.bookAbbr}/${link.chapter}/`;
}

export function getBibleGatewayUrl(link: ScriptureLink, translation: TranslationCode = 'NIV'): string {
  const opt = TRANSLATION_OPTIONS.find(t => t.code === translation) || TRANSLATION_OPTIONS[0];
  return `https://www.biblegateway.com/passage/?search=${encodeURIComponent(link.display)}&version=${opt.bgCode}`;
}

export function getBibleUrl(
  link: ScriptureLink,
  service: BibleService = 'blb',
  translation: TranslationCode = 'NIV'
): string {
  return service === 'blb' ? getBlbUrl(link, translation) : getBibleGatewayUrl(link, translation);
}
