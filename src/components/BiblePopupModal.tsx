import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  GripHorizontal,
  ExternalLink,
  BookOpen,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  fetchChapterVerses,
  parseVerseRange,
  POPUP_TRANSLATIONS,
  VerseItem
} from '../utils/bibleApi';
import { getBlbUrl, getBibleGatewayUrl } from '../utils/scripture';
import { PopupTranslationCode } from '../types/lesson';

export const BiblePopupModal: React.FC = () => {
  const { activePopupLink, closePopup, settings, updateSettings } = useApp();

  const [verses, setVerses] = useState<VerseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Position state for desktop draggable window
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initX: number; initY: number }>({
    startX: 0,
    startY: 0,
    initX: 0,
    initY: 0,
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const highlightedRef = useRef<HTMLDivElement>(null);

  const activeTranslation: PopupTranslationCode = settings.popupTranslation || 'BSB';

  // Initialize position when opened (centered or right side of screen)
  useEffect(() => {
    if (activePopupLink) {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        setPos({ x: 0, y: 0 });
      } else {
        const modalWidth = Math.min(620, window.innerWidth - 40);
        const initX = Math.max(20, (window.innerWidth - modalWidth) / 2);
        const initY = Math.max(60, window.innerHeight * 0.12);
        setPos({ x: initX, y: initY });
      }
    }
  }, [activePopupLink]);

  // Fetch chapter verses whenever link or translation changes
  useEffect(() => {
    if (!activePopupLink) {
      setVerses([]);
      setError(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchChapterVerses(activePopupLink.book, activePopupLink.chapter, activeTranslation)
      .then(items => {
        if (!isMounted) return;
        setVerses(items);
        setLoading(false);
      })
      .catch(err => {
        if (!isMounted) return;
        console.error('Failed to fetch verses:', err);
        setError('Could not load chapter text from Bible API. You can still open in Blue Letter Bible or Bible Gateway.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activePopupLink, activeTranslation]);

  // Auto-scroll to highlighted verse
  useEffect(() => {
    if (!loading && highlightedRef.current && scrollContainerRef.current) {
      setTimeout(() => {
        highlightedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [loading, verses]);

  // Drag handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (window.innerWidth < 768) return;
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: pos.x,
      initY: pos.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      const newX = Math.max(10, Math.min(window.innerWidth - 300, dragRef.current.initX + dx));
      const newY = Math.max(10, Math.min(window.innerHeight - 150, dragRef.current.initY + dy));
      setPos({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      if (isDragging) setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (!activePopupLink) return null;

  const parsedRange = parseVerseRange(activePopupLink.verseRange);

  const blbUrl = getBlbUrl(activePopupLink, settings.translation);
  const bgUrl = getBibleGatewayUrl(activePopupLink, settings.translation);

  return (
    <div
      className="fixed z-50 transition-shadow select-none max-w-full"
      style={
        window.innerWidth >= 768
          ? {
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              width: '620px',
              maxWidth: 'calc(100vw - 32px)',
            }
          : {
              left: '12px',
              right: '12px',
              bottom: '16px',
              top: 'auto',
              maxHeight: '85vh',
            }
      }
    >
      <div className="bg-white dark:bg-[#162032] sepia:bg-[#fffdf9] rounded-3xl shadow-2xl border-2 border-blue-600/40 dark:border-blue-500/50 sepia:border-[#b89b7b] flex flex-col overflow-hidden max-h-[82vh] md:max-h-[600px]">
        {/* Draggable Header Bar */}
        <div
          onMouseDown={handleMouseDown}
          className={`flex items-center justify-between px-5 py-3.5 bg-slate-100 dark:bg-[#0c1322] sepia:bg-[#ede0cc] border-b border-slate-300 dark:border-[#2b3b57] sepia:border-[#b89b7b] ${
            window.innerWidth >= 768 ? 'cursor-grab active:cursor-grabbing' : ''
          }`}
        >
          <div className="flex items-center gap-2.5">
            <GripHorizontal className="w-5 h-5 text-slate-400 dark:text-slate-500 sepia:text-[#7a5b3a] hidden md:inline" />
            <BookOpen className="w-4 h-4 text-blue-700 dark:text-blue-400 sepia:text-[#6d3e14]" />
            <span className="font-extrabold text-base text-slate-900 dark:text-white sepia:text-[#140801]">
              {activePopupLink.display}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Translation dropdown selector */}
            <select
              value={activeTranslation}
              onChange={e =>
                updateSettings({ popupTranslation: e.target.value as PopupTranslationCode })
              }
              className="px-2 py-1 rounded-lg text-xs font-bold bg-white dark:bg-[#162032] sepia:bg-[#fffdf9] text-slate-900 dark:text-slate-100 sepia:text-[#140801] border border-slate-300 dark:border-[#35486b] sepia:border-[#b89b7b] focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
              title="Change Pop-up translation"
            >
              {POPUP_TRANSLATIONS.map(t => (
                <option key={t.code} value={t.code}>
                  {t.code}
                </option>
              ))}
            </select>

            {/* External Links Button */}
            <a
              href={blbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white sepia:text-[#6d3e14] hover:bg-slate-200 dark:hover:bg-[#1f2b42] sepia:hover:bg-[#dfcdb5] transition"
              title="Open in Blue Letter Bible (new tab)"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Close Button */}
            <button
              onClick={closePopup}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white sepia:text-[#6d3e14] hover:bg-slate-200 dark:hover:bg-[#1f2b42] sepia:hover:bg-[#dfcdb5] transition cursor-pointer"
              aria-label="Close pop-up"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Verse Content */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-5 select-text space-y-3 leading-relaxed"
        >
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500 dark:text-slate-400 sepia:text-[#7a5b3a]">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400 sepia:text-[#6d3e14]" />
              <span className="text-sm font-bold">Loading Scripture text...</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 sepia:bg-[#f6ebd8] border border-amber-300 dark:border-amber-800 sepia:border-[#b89b7b] space-y-3">
              <div className="flex items-start gap-2.5 text-amber-800 dark:text-amber-200 sepia:text-[#4a2707]">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-semibold">{error}</p>
              </div>
              <div className="flex gap-2 pt-1">
                <a
                  href={blbUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5"
                >
                  <span>Blue Letter Bible</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a
                  href={bgUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-700 text-white font-bold text-xs inline-flex items-center gap-1.5"
                >
                  <span>Bible Gateway</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {!loading && !error && verses.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 sepia:text-[#7a5b3a] pb-2 border-b border-slate-200 dark:border-[#2b3b57] sepia:border-[#ede0cc] flex items-center justify-between">
                <span>
                  {activePopupLink.book} Chapter {activePopupLink.chapter} ({activeTranslation})
                </span>
                {parsedRange && (
                  <span className="text-blue-700 dark:text-blue-400 sepia:text-[#6d3e14]">
                    Highlighted: verses {parsedRange.start}–{parsedRange.end}
                  </span>
                )}
              </div>

              {verses.map((v, idx) => {
                const vNum = parseInt(v.verse, 10);
                const isTarget =
                  parsedRange !== null &&
                  vNum >= parsedRange.start &&
                  vNum <= parsedRange.end;
                const isFirstTarget =
                  parsedRange !== null && vNum === parsedRange.start;

                return (
                  <div
                    key={idx}
                    ref={isFirstTarget ? highlightedRef : null}
                    className={`p-2.5 rounded-xl transition-colors ${
                      isTarget
                        ? 'bg-blue-50/90 dark:bg-blue-950/70 sepia:bg-[#f3e7d3] border-l-4 border-blue-600 dark:border-blue-400 sepia:border-[#6d3e14] shadow-xs'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <span
                      className={`inline-block font-extrabold text-xs mr-2 px-1.5 py-0.5 rounded ${
                        isTarget
                          ? 'bg-blue-600 dark:bg-blue-500 sepia:bg-[#6d3e14] text-white'
                          : 'text-slate-500 dark:text-slate-400 sepia:text-[#7a5b3a]'
                      }`}
                    >
                      {v.verse}
                    </span>
                    <span
                      className={`text-base ${
                        isTarget
                          ? 'font-bold text-slate-900 dark:text-white sepia:text-[#140801]'
                          : 'font-medium text-slate-700 dark:text-slate-300 sepia:text-[#261303]'
                      }`}
                    >
                      {v.text}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-[#0c1322] sepia:bg-[#ede0cc] border-t border-slate-200 dark:border-[#2b3b57] sepia:border-[#b89b7b] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 sepia:text-[#7a5b3a]">
          <span>Scroll up/down to read full chapter</span>
          <div className="flex items-center gap-3">
            <a
              href={blbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline font-bold text-blue-700 dark:text-blue-400 sepia:text-[#6d3e14] inline-flex items-center gap-1"
            >
              <span>BLB ({settings.translation})</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href={bgUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline font-bold text-blue-700 dark:text-blue-400 sepia:text-[#6d3e14] inline-flex items-center gap-1"
            >
              <span>Bible Gateway</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
