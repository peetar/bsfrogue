import React, { useState, useRef, useEffect } from 'react';
import { ExternalLink, BookOpen, ChevronDown, Layers } from 'lucide-react';
import { ScriptureLink } from '../types/lesson';
import { getBlbUrl, getBibleGatewayUrl, TRANSLATION_OPTIONS } from '../utils/scripture';
import { useApp } from '../context/AppContext';

interface ScriptureButtonProps {
  link: ScriptureLink;
  variant?: 'primary' | 'badge' | 'compact';
}

export const ScriptureButton: React.FC<ScriptureButtonProps> = ({ link, variant = 'badge' }) => {
  const { settings, openPopup } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isPopup = settings.bibleService === 'popup';
  const blbUrl = getBlbUrl(link, settings.translation);
  const bgUrl = getBibleGatewayUrl(link, settings.translation);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [menuOpen]);

  const handleMainClick = (e: React.MouseEvent) => {
    if (isPopup) {
      e.preventDefault();
      openPopup(link);
    }
  };

  const mainHref = isPopup
    ? '#'
    : settings.bibleService === 'blb'
    ? blbUrl
    : bgUrl;

  const target = isPopup ? undefined : '_blank';
  const rel = isPopup ? undefined : 'noopener noreferrer';

  if (variant === 'primary') {
    return (
      <div className="relative inline-flex items-center" ref={menuRef}>
        <a
          href={mainHref}
          target={target}
          rel={rel}
          onClick={handleMainClick}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 sepia:bg-sepia-700 sepia:hover:bg-sepia-800 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 cursor-pointer"
          title={
            isPopup
              ? `Read ${link.display} in Pop-up Window`
              : `Open ${link.display} on ${settings.bibleService.toUpperCase()}`
          }
        >
          <BookOpen className="w-4 h-4" />
          <span>{link.display}</span>
          <span className="text-xs opacity-90 uppercase tracking-wider font-extrabold bg-blue-900/40 dark:bg-blue-800/40 sepia:bg-sepia-900/40 px-1.5 py-0.5 rounded">
            {isPopup ? settings.popupTranslation || 'BSB' : settings.translation}
          </span>
          {isPopup ? (
            <Layers className="w-3.5 h-3.5 opacity-80" />
          ) : (
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          )}
        </a>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="ml-1 p-2 rounded-lg text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white sepia:text-sepia-900 sepia:hover:text-sepia-950 hover:bg-slate-200 dark:hover:bg-[#1f2b42] sepia:hover:bg-sepia-150 transition cursor-pointer"
          aria-label="More reading options"
        >
          <ChevronDown className="w-4 h-4" />
        </button>

        {menuOpen && (
          <div className="absolute left-0 top-full mt-1.5 w-64 bg-white dark:bg-[#162032] sepia:bg-sepia-50 rounded-2xl shadow-2xl border border-slate-300 dark:border-[#2b3b57] sepia:border-sepia-300 z-50 p-2 text-sm">
            <div className="px-2 py-1 text-xs font-bold text-slate-500 dark:text-slate-400 sepia:text-sepia-700 uppercase">
              Reading Options
            </div>

            {/* Pop-up option */}
            <button
              onClick={() => {
                setMenuOpen(false);
                openPopup(link);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1f2b42] sepia:hover:bg-sepia-100 font-bold text-slate-800 dark:text-slate-200 sepia:text-sepia-950 text-left"
            >
              <span>Pop-up Window (In-App)</span>
              <Layers className="w-3.5 h-3.5 opacity-70" />
            </button>

            {/* Blue Letter Bible */}
            <a
              href={blbUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1f2b42] sepia:hover:bg-sepia-100 font-bold text-slate-800 dark:text-slate-200 sepia:text-sepia-950"
            >
              <span>Blue Letter Bible</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>

            {/* Bible Gateway */}
            <a
              href={bgUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1f2b42] sepia:hover:bg-sepia-100 font-bold text-slate-800 dark:text-slate-200 sepia:text-sepia-950"
            >
              <span>Bible Gateway</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>

            <div className="my-1 border-t border-slate-200 dark:border-[#24334d] sepia:border-sepia-300" />
            <div className="px-2 py-1 text-xs font-bold text-slate-500 dark:text-slate-400 sepia:text-sepia-700 uppercase">
              Translations (BLB/BG)
            </div>
            {TRANSLATION_OPTIONS.slice(0, 3).map(t => (
              <a
                key={t.code}
                href={getBlbUrl(link, t.code)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1f2b42] sepia:hover:bg-sepia-100 text-xs font-semibold text-slate-700 dark:text-slate-300 sepia:text-sepia-900"
              >
                <span>{t.label}</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative inline-flex items-center my-1 mr-2" ref={menuRef}>
      <a
        href={mainHref}
        target={target}
        rel={rel}
        onClick={handleMainClick}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-blue-100 hover:bg-blue-200 dark:bg-blue-950/80 dark:hover:bg-blue-900/80 sepia:bg-sepia-150 sepia:hover:bg-sepia-100 text-blue-950 dark:text-blue-200 sepia:text-sepia-950 border border-blue-300 dark:border-blue-700/80 sepia:border-sepia-300 transition-colors shadow-2xs cursor-pointer"
        title={
          isPopup
            ? `Read ${link.display} in Pop-up Window`
            : `Read ${link.display} on ${settings.bibleService.toUpperCase()}`
        }
      >
        <BookOpen className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400 sepia:text-sepia-700" />
        <span>{link.display}</span>
        {isPopup ? (
          <Layers className="w-3 h-3 opacity-70" />
        ) : (
          <ExternalLink className="w-3 h-3 opacity-70" />
        )}
      </a>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white sepia:text-sepia-700 sepia:hover:text-sepia-950 rounded cursor-pointer"
        title="More reading options"
        aria-label="More reading options"
      >
        <ChevronDown className="w-3.5 h-3.5" />
      </button>

      {menuOpen && (
        <div className="absolute left-0 top-full mt-1 w-56 bg-white dark:bg-[#162032] sepia:bg-sepia-50 rounded-xl shadow-xl border border-slate-300 dark:border-[#2b3b57] sepia:border-sepia-300 z-50 p-1.5 text-xs">
          {!isPopup && (
            <button
              onClick={() => {
                setMenuOpen(false);
                openPopup(link);
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1f2b42] sepia:hover:bg-sepia-100 text-slate-800 dark:text-slate-200 sepia:text-sepia-950 font-bold text-left cursor-pointer"
            >
              <span>Open in Pop-up</span>
              <Layers className="w-3 h-3 opacity-70" />
            </button>
          )}
          <a
            href={blbUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1f2b42] sepia:hover:bg-sepia-100 text-slate-800 dark:text-slate-200 sepia:text-sepia-950 font-bold"
          >
            <span>Open in Blue Letter Bible</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>
          <a
            href={bgUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1f2b42] sepia:hover:bg-sepia-100 text-slate-800 dark:text-slate-200 sepia:text-sepia-950 font-bold"
          >
            <span>Open in Bible Gateway</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>
        </div>
      )}
    </div>
  );
};
