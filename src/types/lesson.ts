export interface ScriptureLink {
  display: string;
  book: string;
  bookAbbr: string;
  chapter: number;
  verseRange: string | null;
}

export interface SubQuestion {
  id: string;
  letter: string;
  text: string;
  scriptureLinks: ScriptureLink[];
}

export interface Question {
  id: string;
  number: number;
  text: string;
  scriptureLinks: ScriptureLink[];
  subquestions: SubQuestion[];
}

export interface Day {
  dayNumber: number;
  title: string;
  readingPassage: string;
  readingLinks: ScriptureLink[];
  summary: string;
  questions: Question[];
}

export interface Lesson {
  id: number;
  title: string;
  passage: string;
  book: string;
  days: Day[];
}

export type FontSizeLevel = 'normal' | 'medium' | 'large' | 'xlarge' | 'jumbo';
export type ThemeMode = 'light' | 'sepia' | 'dark';
export type FontFamily = 'sans' | 'serif';
export type BibleService = 'popup' | 'blb' | 'bg';
export type TranslationCode = 'NIV' | 'ESV' | 'NKJV' | 'NLT' | 'KJV' | 'NASB' | 'CSB';
export type PopupTranslationCode = 'BSB' | 'WEB' | 'KJV' | 'ASV' | 'FBV';

export interface ReminderSettings {
  enabled: boolean;
  time: string; // HH:mm format, e.g. "08:00"
  days: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  lastNotifiedDate?: string;
}

export interface UserSettings {
  fontSize: FontSizeLevel;
  theme: ThemeMode;
  fontFamily: FontFamily;
  bibleService: BibleService;
  translation: TranslationCode;
  popupTranslation: PopupTranslationCode;
  reminders: ReminderSettings;
}

export type UserAnswers = Record<string, string>;

export interface LastVisited {
  lessonId: number;
  dayNumber: number;
  updatedAt: number;
}
