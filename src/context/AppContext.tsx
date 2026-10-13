import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import lessonsData from '../data/lessons.json';
import {
  Lesson,
  UserAnswers,
  UserSettings,
  LastVisited,
  FontSizeLevel,
  ScriptureLink,
} from '../types/lesson';
import { checkAndTriggerReminder } from '../utils/notifications';

const STORAGE_KEYS = {
  ANSWERS: 'bsf_answers_v1',
  SETTINGS: 'bsf_settings_v1',
  LAST_VISITED: 'bsf_last_visited_v1',
};

const FONT_SIZE_LEVELS: FontSizeLevel[] = ['normal', 'medium', 'large', 'xlarge', 'jumbo'];

const FONT_SIZE_PX_MAP: Record<FontSizeLevel, string> = {
  normal: '16px',
  medium: '18px',
  large: '20px',
  xlarge: '24px',
  jumbo: '28px',
};

const DEFAULT_SETTINGS: UserSettings = {
  fontSize: 'normal', // Default to 100% zoom
  theme: 'light',
  fontFamily: 'sans',
  bibleService: 'popup', // Default to in-app draggable pop-up
  translation: 'NIV',
  popupTranslation: 'BSB',
  reminders: {
    enabled: false,
    time: '08:00',
    days: [1, 2, 3, 4], // Mon - Thu
  }
};

interface AppContextType {
  lessons: Lesson[];
  currentLesson: Lesson;
  currentLessonId: number;
  currentDayNumber: number;
  viewMode: 'home' | 'lesson';
  saveStatus: 'idle' | 'saving' | 'saved';
  answers: UserAnswers;
  settings: UserSettings;
  lastVisited: LastVisited;
  
  // Pop-up Bible Modal
  activePopupLink: ScriptureLink | null;
  openPopup: (link: ScriptureLink) => void;
  closePopup: () => void;
  
  // Navigation
  setViewMode: (mode: 'home' | 'lesson') => void;
  goToLesson: (lessonId: number, dayNumber?: number) => void;
  goToDay: (dayNumber: number) => void;
  goToNextDay: () => void;
  goToPrevDay: () => void;
  
  // Answers
  getAnswer: (questionId: string) => string;
  setAnswer: (questionId: string, answer: string) => void;
  
  // Settings & Accessibility
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  stepFontSize: (delta: 1 | -1) => void;
  
  // Progress
  getLessonProgress: (lessonId: number) => { total: number; answered: number; percent: number };
  getDayProgress: (lessonId: number, dayNumber: number) => { total: number; answered: number; percent: number; isComplete: boolean };
  overallProgress: { total: number; answered: number; percent: number };
  
  // Export / Import
  exportAnswersJson: () => void;
  exportAnswersFormatted: (lessonId?: number) => void;
  importAnswersJson: (jsonStr: string) => boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const lessons = lessonsData as unknown as Lesson[];

  // Load Initial Settings
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          bibleService: parsed.bibleService === 'blb' && !parsed.popupTranslation ? 'popup' : (parsed.bibleService || 'popup'),
          popupTranslation: parsed.popupTranslation || 'BSB',
        };
      }
    } catch (e) {
      console.error('Error reading settings from localStorage', e);
    }
    return DEFAULT_SETTINGS;
  });

  // Load Initial Last Visited
  const [lastVisited, setLastVisited] = useState<LastVisited>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LAST_VISITED);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error reading last visited from localStorage', e);
    }
    return { lessonId: 1, dayNumber: 1, updatedAt: Date.now() };
  });

  // Load Answers
  const [answers, setAnswers] = useState<UserAnswers>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ANSWERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error reading answers from localStorage', e);
    }
    return {};
  });

  const [currentLessonId, setCurrentLessonId] = useState<number>(lastVisited.lessonId || 1);
  const [currentDayNumber, setCurrentDayNumber] = useState<number>(lastVisited.dayNumber || 1);
  const [viewMode, setViewMode] = useState<'home' | 'lesson'>('home');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [activePopupLink, setActivePopupLink] = useState<ScriptureLink | null>(null);

  const openPopup = useCallback((link: ScriptureLink) => {
    setActivePopupLink(link);
  }, []);

  const closePopup = useCallback(() => {
    setActivePopupLink(null);
  }, []);

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  // Apply Font Size to HTML root for scaling
  useEffect(() => {
    const px = FONT_SIZE_PX_MAP[settings.fontSize] || '18px';
    document.documentElement.style.fontSize = px;
  }, [settings.fontSize]);

  // Apply Theme Mode (light / sepia / dark)
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'sepia');
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'sepia') {
      root.classList.add('sepia');
    }
  }, [settings.theme]);

  // Apply Font Family
  useEffect(() => {
    const body = document.body;
    if (settings.fontFamily === 'serif') {
      body.classList.add('font-serif');
      body.classList.remove('font-sans');
    } else {
      body.classList.add('font-sans');
      body.classList.remove('font-serif');
    }
  }, [settings.fontFamily]);

  // Save Settings to LocalStorage
  const updateSettings = useCallback((partial: Partial<UserSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...partial };
      try {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(next));
      } catch (err) {
        console.error('Error saving settings', err);
      }
      return next;
    });
  }, []);

  // Step Font Size (A- / A+)
  const stepFontSize = useCallback((delta: 1 | -1) => {
    setSettings(prev => {
      const curIndex = FONT_SIZE_LEVELS.indexOf(prev.fontSize);
      const nextIndex = Math.max(0, Math.min(FONT_SIZE_LEVELS.length - 1, curIndex + delta));
      const nextSize = FONT_SIZE_LEVELS[nextIndex];
      const nextSettings = { ...prev, fontSize: nextSize };
      try {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(nextSettings));
      } catch (err) {
        console.error('Error saving settings', err);
      }
      return nextSettings;
    });
  }, []);

  // Track Last Visited
  const updateLastVisited = useCallback((lessonId: number, dayNumber: number) => {
    const record: LastVisited = { lessonId, dayNumber, updatedAt: Date.now() };
    setLastVisited(record);
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_VISITED, JSON.stringify(record));
    } catch (err) {
      console.error('Error saving last visited', err);
    }
  }, []);

  // Set Answer with Debounced LocalStorage Write
  const setAnswer = useCallback((questionId: string, value: string) => {
    setAnswers(prev => {
      const updated = { ...prev, [questionId]: value };
      return updated;
    });
    setSaveStatus('saving');

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify(answersRef.current));
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2500);
      } catch (err) {
        console.error('Error auto-saving answers', err);
        setSaveStatus('idle');
      }
    }, 400);
  }, []);

  const getAnswer = useCallback((questionId: string): string => {
    return answers[questionId] || '';
  }, [answers]);

  // Navigation Handlers
  const goToLesson = useCallback((lessonId: number, dayNumber: number = 1) => {
    setCurrentLessonId(lessonId);
    setCurrentDayNumber(dayNumber);
    setViewMode('lesson');
    updateLastVisited(lessonId, dayNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [updateLastVisited]);

  const goToDay = useCallback((dayNumber: number) => {
    setCurrentDayNumber(dayNumber);
    updateLastVisited(currentLessonId, dayNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentLessonId, updateLastVisited]);

  const goToNextDay = useCallback(() => {
    if (currentDayNumber < 6) {
      goToDay(currentDayNumber + 1);
    } else if (currentLessonId < lessons.length) {
      goToLesson(currentLessonId + 1, 1);
    } else {
      setViewMode('home');
    }
  }, [currentDayNumber, currentLessonId, lessons.length, goToDay, goToLesson]);

  const goToPrevDay = useCallback(() => {
    if (currentDayNumber > 1) {
      goToDay(currentDayNumber - 1);
    } else if (currentLessonId > 1) {
      goToLesson(currentLessonId - 1, 6);
    } else {
      setViewMode('home');
    }
  }, [currentDayNumber, currentLessonId, goToDay, goToLesson]);

  // Current Lesson Object
  const currentLesson = lessons.find(l => l.id === currentLessonId) || lessons[0];

  // Daily Reminder Periodic Check
  useEffect(() => {
    const timer = setInterval(() => {
      checkAndTriggerReminder(
        settings.reminders,
        currentLesson.title,
        currentDayNumber,
        (dateStr) => {
          updateSettings({
            reminders: { ...settings.reminders, lastNotifiedDate: dateStr }
          });
        }
      );
    }, 60000); // Check every minute

    return () => clearInterval(timer);
  }, [settings.reminders, currentLesson.title, currentDayNumber, updateSettings]);

  // Progress Calculations
  const getDayProgress = useCallback((lessonId: number, dayNumber: number) => {
    const l = lessons.find(item => item.id === lessonId);
    if (!l) return { total: 0, answered: 0, percent: 0, isComplete: false };
    const d = l.days.find(item => item.dayNumber === dayNumber);
    if (!d) return { total: 0, answered: 0, percent: 0, isComplete: false };

    let total = 0;
    let answered = 0;

    for (const q of d.questions) {
      if (q.subquestions && q.subquestions.length > 0) {
        for (const sq of q.subquestions) {
          total++;
          if (answers[sq.id]?.trim()) answered++;
        }
      } else {
        total++;
        if (answers[q.id]?.trim()) answered++;
      }
    }

    const percent = total > 0 ? Math.round((answered / total) * 100) : 0;
    return { total, answered, percent, isComplete: total > 0 && answered === total };
  }, [lessons, answers]);

  const getLessonProgress = useCallback((lessonId: number) => {
    const l = lessons.find(item => item.id === lessonId);
    if (!l) return { total: 0, answered: 0, percent: 0 };
    let total = 0;
    let answered = 0;

    for (const d of l.days) {
      const p = getDayProgress(lessonId, d.dayNumber);
      total += p.total;
      answered += p.answered;
    }

    const percent = total > 0 ? Math.round((answered / total) * 100) : 0;
    return { total, answered, percent };
  }, [lessons, getDayProgress]);

  const overallProgress = React.useMemo(() => {
    let total = 0;
    let answered = 0;
    for (const l of lessons) {
      const p = getLessonProgress(l.id);
      total += p.total;
      answered += p.answered;
    }
    const percent = total > 0 ? Math.round((answered / total) * 100) : 0;
    return { total, answered, percent };
  }, [lessons, getLessonProgress]);

  // Export / Import
  const exportAnswersJson = useCallback(() => {
    const dataStr = JSON.stringify(answers, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bsf_romans_answers_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [answers]);

  const exportAnswersFormatted = useCallback((targetLessonId?: number) => {
    let output = `# BSF Romans Study Answers\nExported: ${new Date().toLocaleDateString()}\n\n`;
    const targetLessons = targetLessonId
      ? lessons.filter(l => l.id === targetLessonId)
      : lessons;

    for (const l of targetLessons) {
      output += `## Lesson ${l.id}: ${l.title} (${l.passage})\n\n`;
      for (const d of l.days) {
        output += `### Day ${d.dayNumber}: ${d.title}\n`;
        if (d.summary) output += `*${d.summary}*\n\n`;
        for (const q of d.questions) {
          if (q.subquestions && q.subquestions.length > 0) {
            output += `Question ${q.number}:\n`;
            for (const sq of q.subquestions) {
              const ans = answers[sq.id]?.trim() || '[No answer]';
              output += `${sq.letter}. ${sq.text}\n   Answer: ${ans}\n\n`;
            }
          } else {
            const ans = answers[q.id]?.trim() || '[No answer]';
            output += `Question ${q.number}: ${q.text}\nAnswer: ${ans}\n\n`;
          }
        }
      }
      output += `---\n\n`;
    }

    const blob = new Blob([output], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = targetLessonId
      ? `bsf_romans_lesson_${targetLessonId}_study.txt`
      : `bsf_romans_all_answers_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [lessons, answers]);

  const importAnswersJson = useCallback((jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (typeof parsed === 'object' && parsed !== null) {
        setAnswers(prev => {
          const merged = { ...prev, ...parsed };
          localStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify(merged));
          return merged;
        });
        return true;
      }
    } catch (e) {
      console.error('Failed to import answers', e);
    }
    return false;
  }, []);

  return (
    <AppContext.Provider
      value={{
        lessons,
        currentLesson,
        currentLessonId,
        currentDayNumber,
        viewMode,
        saveStatus,
        answers,
        settings,
        lastVisited,
        setViewMode,
        goToLesson,
        goToDay,
        goToNextDay,
        goToPrevDay,
        getAnswer,
        setAnswer,
        updateSettings,
        stepFontSize,
        getDayProgress,
        getLessonProgress,
        overallProgress,
        exportAnswersJson,
        exportAnswersFormatted,
        importAnswersJson,
        activePopupLink,
        openPopup,
        closePopup,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
