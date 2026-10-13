import React, { useState, useRef } from 'react';
import {
  X,
  Type,
  Sun,
  Moon,
  Coffee,
  Bell,
  Calendar,
  Download,
  Upload,
  Check,
  Globe
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  FontSizeLevel,
  ThemeMode,
  TranslationCode,
  PopupTranslationCode
} from '../types/lesson';
import { TRANSLATION_OPTIONS } from '../utils/scripture';
import { POPUP_TRANSLATIONS } from '../utils/bibleApi';
import { downloadIcsFile } from '../utils/calendar';
import { requestNotificationPermission, getNotificationPermission } from '../utils/notifications';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FONT_SIZES: { level: FontSizeLevel; label: string; desc: string }[] = [
  { level: 'normal', label: '100% (Default)', desc: '16px' },
  { level: 'medium', label: '112%', desc: '18px' },
  { level: 'large', label: '125%', desc: '20px (Comfortable)' },
  { level: 'xlarge', label: '150%', desc: '24px (High Readability)' },
  { level: 'jumbo', label: '175%', desc: '28px (Max Zoom)' },
];

const THEMES: { mode: ThemeMode; label: string; icon: React.ReactNode; desc: string }[] = [
  { mode: 'light', label: 'Light', icon: <Sun className="w-4 h-4" />, desc: 'Crisp high contrast' },
  { mode: 'sepia', label: 'Warm Paper', icon: <Coffee className="w-4 h-4" />, desc: 'Soothing parchment' },
  { mode: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" />, desc: 'Night mode' },
];

const DAYS_OF_WEEK = [
  { day: 0, label: 'Su' },
  { day: 1, label: 'M' },
  { day: 2, label: 'Tu' },
  { day: 3, label: 'W' },
  { day: 4, label: 'Th' },
  { day: 5, label: 'F' },
  { day: 6, label: 'Sa' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    settings,
    updateSettings,
    exportAnswersJson,
    exportAnswersFormatted,
    importAnswersJson,
    currentLessonId,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(() =>
    getNotificationPermission()
  );

  if (!isOpen) return null;

  const handleToggleDay = (day: number) => {
    const curDays = settings.reminders.days;
    const newDays = curDays.includes(day)
      ? curDays.filter(d => d !== day)
      : [...curDays, day].sort();
    updateSettings({
      reminders: { ...settings.reminders, days: newDays },
    });
  };

  const handleRequestNotif = async () => {
    const res = await requestNotificationPermission();
    setNotifPermission(res);
    if (res === 'granted') {
      updateSettings({
        reminders: { ...settings.reminders, enabled: true },
      });
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      const success = importAnswersJson(content);
      if (success) {
        setImportStatus('Answers imported successfully!');
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        setImportStatus('Failed to import file. Please check format.');
        setTimeout(() => setImportStatus(null), 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#162032] sepia:bg-sepia-50 w-full max-w-xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-300 dark:border-[#2b3b57] sepia:border-sepia-300 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-300 dark:border-[#2b3b57] sepia:border-sepia-300">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white sepia:text-sepia-950 flex items-center gap-2">
            Settings & Preferences
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 sepia:hover:text-sepia-900 hover:bg-slate-100 dark:hover:bg-[#1f2b42] sepia:hover:bg-sepia-150 transition cursor-pointer"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section: Text Size (Mom's Zoom) */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 sepia:text-sepia-950">
              <Type className="w-4 h-4 text-blue-600 dark:text-blue-400 sepia:text-sepia-700" />
              <span>Text Size & Zoom (Mom-Friendly)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FONT_SIZES.map(f => (
                <button
                  key={f.level}
                  onClick={() => updateSettings({ fontSize: f.level })}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                    settings.fontSize === f.level
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/80 sepia:bg-sepia-150 sepia:border-sepia-700 ring-2 ring-blue-600 dark:ring-blue-400 sepia:ring-sepia-700'
                      : 'border-slate-300 dark:border-[#2b3b57] sepia:border-sepia-300 bg-slate-50 dark:bg-[#0c1322] sepia:bg-sepia-100/50 hover:bg-slate-100 dark:hover:bg-[#1f2b42] sepia:hover:bg-sepia-150'
                  }`}
                >
                  <span className="font-bold text-slate-900 dark:text-white sepia:text-sepia-950 text-sm">
                    {f.label}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 sepia:text-sepia-700 mt-0.5">
                    {f.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Section: Reading Theme */}
          <div className="space-y-3">
            <label className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 sepia:text-sepia-950">
              Reading Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              {THEMES.map(t => (
                <button
                  key={t.mode}
                  onClick={() => updateSettings({ theme: t.mode })}
                  className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 cursor-pointer ${
                    settings.theme === t.mode
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/80 sepia:bg-sepia-150 sepia:border-sepia-700 ring-2 ring-blue-600 sepia:ring-sepia-700'
                      : 'border-slate-300 dark:border-[#2b3b57] sepia:border-sepia-300 bg-slate-50 dark:bg-[#0c1322] sepia:bg-sepia-100/50 hover:bg-slate-100 dark:hover:bg-[#1f2b42] sepia:hover:bg-sepia-150'
                  }`}
                >
                  <div className="text-slate-700 dark:text-slate-300 sepia:text-sepia-900">
                    {t.icon}
                  </div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white sepia:text-sepia-950">
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Section: Font Family */}
          <div className="space-y-3">
            <label className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 sepia:text-sepia-950">
              Font Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateSettings({ fontFamily: 'sans' })}
                className={`p-3 rounded-xl border font-sans text-sm font-bold transition cursor-pointer ${
                  settings.fontFamily === 'sans'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/80 sepia:bg-sepia-150 sepia:border-sepia-700 ring-2 ring-blue-600'
                    : 'border-slate-300 dark:border-[#2b3b57] sepia:border-sepia-300 bg-slate-50 dark:bg-[#0c1322] sepia:bg-sepia-100/50 hover:bg-slate-100 dark:hover:bg-[#1f2b42]'
                }`}
              >
                Modern Sans (System)
              </button>
              <button
                onClick={() => updateSettings({ fontFamily: 'serif' })}
                className={`p-3 rounded-xl border font-serif text-sm font-bold transition cursor-pointer ${
                  settings.fontFamily === 'serif'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/80 sepia:bg-sepia-150 sepia:border-sepia-700 ring-2 ring-blue-600'
                    : 'border-slate-300 dark:border-[#2b3b57] sepia:border-sepia-300 bg-slate-50 dark:bg-[#0c1322] sepia:bg-sepia-100/50 hover:bg-slate-100 dark:hover:bg-[#1f2b42]'
                }`}
              >
                Classic Book Serif
              </button>
            </div>
          </div>

          {/* Section: Bible Service & Translation */}
          <div className="space-y-4 pt-2 border-t border-slate-300 dark:border-[#2b3b57] sepia:border-sepia-300">
            <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 sepia:text-sepia-950">
              <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400 sepia:text-sepia-700" />
              <span>Bible Links Provider</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => updateSettings({ bibleService: 'popup' })}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  settings.bibleService === 'popup'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/80 sepia:bg-sepia-150 sepia:border-sepia-700 ring-2 ring-blue-600'
                    : 'border-slate-300 dark:border-[#2b3b57] sepia:border-sepia-300 bg-slate-50 dark:bg-[#0c1322] sepia:bg-sepia-100/50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white sepia:text-sepia-950 text-sm block">
                    Pop-up Window
                  </span>
                  <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-blue-600 text-white">
                    Default
                  </span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 sepia:text-sepia-700">
                  In-app draggable modal
                </span>
              </button>

              <button
                onClick={() => updateSettings({ bibleService: 'blb' })}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  settings.bibleService === 'blb'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/80 sepia:bg-sepia-150 sepia:border-sepia-700 ring-2 ring-blue-600'
                    : 'border-slate-300 dark:border-[#2b3b57] sepia:border-sepia-300 bg-slate-50 dark:bg-[#0c1322] sepia:bg-sepia-100/50 hover:bg-slate-100'
                }`}
              >
                <span className="font-bold text-slate-900 dark:text-white sepia:text-sepia-950 text-sm block">
                  Blue Letter Bible
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 sepia:text-sepia-700">
                  blueletterbible.org
                </span>
              </button>

              <button
                onClick={() => updateSettings({ bibleService: 'bg' })}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  settings.bibleService === 'bg'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/80 sepia:bg-sepia-150 sepia:border-sepia-700 ring-2 ring-blue-600'
                    : 'border-slate-300 dark:border-[#2b3b57] sepia:border-sepia-300 bg-slate-50 dark:bg-[#0c1322] sepia:bg-sepia-100/50 hover:bg-slate-100'
                }`}
              >
                <span className="font-bold text-slate-900 dark:text-white sepia:text-sepia-950 text-sm block">
                  Bible Gateway
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 sepia:text-sepia-700">
                  biblegateway.com
                </span>
              </button>
            </div>

            {settings.bibleService === 'popup' ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 sepia:text-sepia-900 mb-1.5 uppercase">
                  Pop-up Translation
                </label>
                <select
                  value={settings.popupTranslation}
                  onChange={e =>
                    updateSettings({ popupTranslation: e.target.value as PopupTranslationCode })
                  }
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-[#2b3b57] sepia:border-sepia-300 bg-slate-50 dark:bg-[#0c1322] sepia:bg-sepia-150 text-slate-900 dark:text-white sepia:text-sepia-950 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  {POPUP_TRANSLATIONS.map(opt => (
                    <option key={opt.code} value={opt.code}>
                      {opt.label} — {opt.description}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 sepia:text-sepia-700 mt-1">
                  Powered by public domain CDN API (instant, offline-cached, zero usage caps).
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 sepia:text-sepia-900 mb-1.5 uppercase">
                  Preferred Translation
                </label>
                <select
                  value={settings.translation}
                  onChange={e => updateSettings({ translation: e.target.value as TranslationCode })}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-[#2b3b57] sepia:border-sepia-300 bg-slate-50 dark:bg-[#0c1322] sepia:bg-sepia-150 text-slate-900 dark:text-white sepia:text-sepia-950 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  {TRANSLATION_OPTIONS.map(opt => (
                    <option key={opt.code} value={opt.code}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Section: Daily Reminders */}
          <div className="space-y-4 pt-2 border-t border-slate-300 dark:border-[#2b3b57] sepia:border-sepia-300">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 sepia:text-sepia-950">
                <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400 sepia:text-sepia-700" />
                <span>Daily Study Reminders</span>
              </label>
              <input
                type="checkbox"
                checked={settings.reminders.enabled}
                onChange={e =>
                  updateSettings({
                    reminders: { ...settings.reminders, enabled: e.target.checked },
                  })
                }
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            {settings.reminders.enabled && (
              <div className="space-y-4 bg-slate-100 dark:bg-[#0c1322] sepia:bg-sepia-150 p-4 rounded-2xl border border-slate-300 dark:border-[#2b3b57] sepia:border-sepia-300">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 sepia:text-sepia-900 mb-2">
                    Repeat on Days:
                  </label>
                  <div className="flex gap-1.5 justify-between">
                    {DAYS_OF_WEEK.map(d => {
                      const selected = settings.reminders.days.includes(d.day);
                      return (
                        <button
                          key={d.day}
                          onClick={() => handleToggleDay(d.day)}
                          className={`w-10 h-10 rounded-xl text-xs font-extrabold transition flex items-center justify-center cursor-pointer ${
                            selected
                              ? 'bg-blue-700 dark:bg-blue-600 sepia:bg-sepia-700 text-white shadow-xs'
                              : 'bg-white dark:bg-[#162032] sepia:bg-sepia-50 text-slate-800 dark:text-slate-200 sepia:text-sepia-950 border border-slate-300 dark:border-[#2b3b57] sepia:border-sepia-300'
                          }`}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 sepia:text-sepia-900">
                    Reminder Time:
                  </label>
                  <input
                    type="time"
                    value={settings.reminders.time}
                    onChange={e =>
                      updateSettings({
                        reminders: { ...settings.reminders, time: e.target.value },
                      })
                    }
                    className="p-2 rounded-xl border border-slate-300 dark:border-[#2b3b57] sepia:border-sepia-300 bg-white dark:bg-[#162032] sepia:bg-sepia-50 text-slate-900 dark:text-white sepia:text-sepia-950 text-sm font-bold focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Browser permission button */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  {notifPermission !== 'granted' ? (
                    <button
                      onClick={handleRequestNotif}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 sepia:bg-sepia-200 sepia:text-sepia-950 hover:bg-blue-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>Allow Browser Notifications</span>
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 sepia:text-emerald-700 flex items-center gap-1 font-bold">
                      <Check className="w-4 h-4" /> Browser notifications active
                    </span>
                  )}

                  {/* Bulletproof 1-Click Calendar Download for Phone */}
                  <button
                    onClick={() => downloadIcsFile(settings.reminders)}
                    className="py-2 px-3 rounded-xl text-xs font-bold bg-amber-200 hover:bg-amber-300 dark:bg-amber-950 dark:hover:bg-amber-900 text-amber-950 dark:text-amber-200 sepia:bg-sepia-300 sepia:text-sepia-950 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Add recurring reminder directly to Apple Calendar or Google Calendar"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Add to Phone Calendar (.ics)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section: Backup, Export & Restore */}
          <div className="space-y-3 pt-2 border-t border-slate-300 dark:border-[#2b3b57] sepia:border-sepia-300">
            <label className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 sepia:text-sepia-950">
              Backup & Export Answers
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => exportAnswersFormatted(currentLessonId)}
                className="p-3 rounded-xl border border-slate-300 dark:border-[#2b3b57] sepia:border-sepia-300 bg-slate-50 dark:bg-[#0c1322] sepia:bg-sepia-100/50 hover:bg-slate-100 dark:hover:bg-[#1f2b42] sepia:hover:bg-sepia-150 transition text-left flex items-center gap-2.5 cursor-pointer"
              >
                <Download className="w-4 h-4 text-blue-600 dark:text-blue-400 sepia:text-sepia-700" />
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white sepia:text-sepia-950 block">
                    Export Current Lesson (.txt)
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 sepia:text-sepia-700 font-medium">
                    For sharing or printing
                  </span>
                </div>
              </button>

              <button
                onClick={exportAnswersJson}
                className="p-3 rounded-xl border border-slate-300 dark:border-[#2b3b57] sepia:border-sepia-300 bg-slate-50 dark:bg-[#0c1322] sepia:bg-sepia-100/50 hover:bg-slate-100 dark:hover:bg-[#1f2b42] sepia:hover:bg-sepia-150 transition text-left flex items-center gap-2.5 cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400 sepia:text-emerald-700" />
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white sepia:text-sepia-950 block">
                    Backup All Answers (.json)
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 sepia:text-sepia-700 font-medium">
                    Full backup of all lessons
                  </span>
                </div>
              </button>
            </div>

            <div className="pt-1">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileImport}
                accept=".json"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-2.5 rounded-xl border border-dashed border-slate-400 dark:border-[#35486b] sepia:border-sepia-400 bg-slate-50 dark:bg-[#0c1322] sepia:bg-sepia-100/50 hover:bg-slate-100 dark:hover:bg-[#1f2b42] sepia:hover:bg-sepia-150 text-slate-700 dark:text-slate-200 sepia:text-sepia-950 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Restore / Import Answers from JSON Backup</span>
              </button>
              {importStatus && (
                <p className="text-xs text-center font-bold text-emerald-600 dark:text-emerald-400 sepia:text-emerald-700 mt-2">
                  {importStatus}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-100 dark:bg-[#0c1322] sepia:bg-sepia-150 border-t border-slate-300 dark:border-[#2b3b57] sepia:border-sepia-300 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 sepia:bg-sepia-700 text-white shadow-xs transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
