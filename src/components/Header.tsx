import { BookOpen, Settings, Check, Loader2, Home, ZoomIn, Minus, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  onOpenSettings: () => void;
}

const FONT_SIZE_LABELS: Record<string, string> = {
  normal: '100%',
  medium: '112%',
  large: '125%',
  xlarge: '150%',
  jumbo: '175%',
};

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const {
    viewMode,
    setViewMode,
    currentLesson,
    currentDayNumber,
    saveStatus,
    settings,
    stepFontSize,
  } = useApp();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#162032]/95 sepia:bg-sepia-50/95 backdrop-blur-md border-b border-slate-300 dark:border-[#2b3b57] sepia:border-sepia-300 transition-colors shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Left: Brand / Home Button */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => setViewMode('home')}
            className="flex items-center gap-2 text-blue-900 dark:text-blue-300 sepia:text-sepia-950 font-bold text-lg hover:opacity-85 transition cursor-pointer shrink-0"
            title="Go to Home Dashboard"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-700 dark:bg-blue-600 sepia:bg-sepia-700 text-white flex items-center justify-center shadow-xs shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="hidden sm:inline font-bold tracking-tight">BSF Romans</span>
          </button>

          {viewMode === 'lesson' && (
            <div className="flex items-center gap-1 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 sepia:text-sepia-900 min-w-0 truncate">
              <span className="text-slate-400 dark:text-slate-600 sepia:text-sepia-400">/</span>
              <button
                onClick={() => setViewMode('home')}
                className="hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                title="Back to All Lessons"
              >
                <Home className="w-3.5 h-3.5 sm:hidden inline" />
                <span className="hidden xs:inline">Lesson </span>
                <span className="xs:hidden">L</span>
                <span>{currentLesson.id}</span>
              </button>
              <span className="text-slate-400 dark:text-slate-600 sepia:text-sepia-400">·</span>
              <span className="text-blue-700 dark:text-blue-400 sepia:text-sepia-700 shrink-0">
                <span className="hidden xs:inline">Day </span>
                <span className="xs:hidden">D</span>
                <span>{currentDayNumber}</span>
              </span>
            </div>
          )}
        </div>

        {/* Center: Save status */}
        <div className="flex items-center text-xs font-semibold">
          {saveStatus === 'saving' && (
            <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 sepia:text-amber-700 animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span className="hidden sm:inline">Saving...</span>
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 sepia:text-emerald-700 font-bold transition-opacity duration-300">
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Saved</span>
            </span>
          )}
        </div>

        {/* Right: Quick Zoom, Quick Translation, Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Zoom controls */}
          <div
            className="flex items-center bg-slate-100 dark:bg-[#0c1322] sepia:bg-sepia-150 rounded-xl p-0.5 border border-slate-300 dark:border-[#35486b] sepia:border-sepia-300 shadow-2xs"
            title="Adjust text zoom"
          >
            <button
              onClick={() => stepFontSize(-1)}
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-slate-800 dark:text-slate-100 sepia:text-sepia-950 hover:bg-white dark:hover:bg-[#162032] sepia:hover:bg-white rounded-lg transition cursor-pointer"
              aria-label="Zoom out"
              title="Zoom out"
            >
              <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
            <div className="flex items-center gap-1 px-1.5 select-none text-slate-700 dark:text-slate-200 sepia:text-sepia-900">
              <ZoomIn className="w-3.5 h-3.5 opacity-70" />
              <span className="text-[11px] font-bold min-w-[30px] text-center">
                {FONT_SIZE_LABELS[settings.fontSize] || '100%'}
              </span>
            </div>
            <button
              onClick={() => stepFontSize(1)}
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-slate-800 dark:text-slate-100 sepia:text-sepia-950 hover:bg-white dark:hover:bg-[#162032] sepia:hover:bg-white rounded-lg transition cursor-pointer"
              aria-label="Zoom in"
              title="Zoom in"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          {/* Quick translation badge */}
          <button
            onClick={onOpenSettings}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-[#0c1322] sepia:bg-sepia-150 text-slate-800 dark:text-slate-200 sepia:text-sepia-950 border border-slate-300 dark:border-[#35486b] sepia:border-sepia-300 hover:bg-slate-200 dark:hover:bg-[#1f2b42] sepia:hover:bg-sepia-100 transition cursor-pointer"
            title="Change Bible site or translation"
          >
            <span>{settings.bibleService.toUpperCase()}</span>
            <span className="opacity-70">({settings.translation})</span>
          </button>

          {/* Settings modal trigger */}
          <button
            onClick={onOpenSettings}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white sepia:text-sepia-900 sepia:hover:text-sepia-950 hover:bg-slate-100 dark:hover:bg-[#1f2b42] sepia:hover:bg-sepia-150 transition cursor-pointer"
            aria-label="Settings"
            title="Open Settings & Reminders"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
