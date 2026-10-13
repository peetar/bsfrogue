import React, { useState } from 'react';
import { X, Printer, Copy, Check, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Lesson, UserAnswers } from '../types/lesson';

interface PrintLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function generateLessonPlainText(lesson: Lesson, answers: UserAnswers): string {
  const lines: string[] = [];
  const divider = '='.repeat(68);
  const thinDivider = '-'.repeat(68);

  lines.push(divider);
  lines.push(`BSF ROMANS STUDY — LESSON ${lesson.id}`);
  lines.push(`${lesson.title.toUpperCase()}`);
  lines.push(`Scripture Passage: ${lesson.passage}`);
  lines.push(divider);
  lines.push('');

  for (const day of lesson.days) {
    lines.push(`DAY ${day.dayNumber}: ${day.title.toUpperCase()}`);
    if (day.readingPassage) {
      lines.push(`Reading: ${day.readingPassage}`);
    }
    if (day.summary) {
      lines.push(`Summary: ${day.summary}`);
    }
    lines.push(thinDivider);
    lines.push('');

    if (!day.questions || day.questions.length === 0) {
      lines.push('(No questions for this day)\n');
      continue;
    }

    for (const q of day.questions) {
      const hasSubquestions = q.subquestions && q.subquestions.length > 0;

      if (hasSubquestions) {
        if (q.text) {
          lines.push(`Question ${q.number}: ${q.text}`);
          if (q.scriptureLinks && q.scriptureLinks.length > 0) {
            lines.push(`   Scripture: ${q.scriptureLinks.map(s => s.display).join(', ')}`);
          }
        } else {
          lines.push(`Question ${q.number}:`);
        }

        for (const sq of q.subquestions) {
          lines.push(`  ${sq.letter}. ${sq.text}`);
          if (sq.scriptureLinks && sq.scriptureLinks.length > 0) {
            lines.push(`     Scripture: ${sq.scriptureLinks.map(s => s.display).join(', ')}`);
          }
          const ans = answers[sq.id]?.trim();
          lines.push(`     Answer: ${ans || '[No answer entered]'}`);
          lines.push('');
        }
      } else {
        lines.push(`Question ${q.number}: ${q.text}`);
        if (q.scriptureLinks && q.scriptureLinks.length > 0) {
          lines.push(`   Scripture: ${q.scriptureLinks.map(s => s.display).join(', ')}`);
        }
        const ans = answers[q.id]?.trim();
        lines.push(`   Answer: ${ans || '[No answer entered]'}`);
        lines.push('');
      }
    }

    lines.push('');
  }

  lines.push(divider);
  lines.push(`End of Lesson ${lesson.id} — All 6 Days Complete`);
  lines.push(divider);

  return lines.join('\n');
}

export const PrintLessonModal: React.FC<PrintLessonModalProps> = ({ isOpen, onClose }) => {
  const { currentLesson, answers } = useApp();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const plainText = generateLessonPlainText(currentLesson, answers);

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#162032] sepia:bg-sepia-50 w-full max-w-3xl max-h-[92vh] rounded-3xl shadow-2xl border border-slate-300 dark:border-[#2b3b57] sepia:border-sepia-300 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar (no-print) */}
        <div className="no-print flex items-center justify-between px-5 py-4 border-b border-slate-300 dark:border-[#2b3b57] sepia:border-sepia-300 bg-slate-100 dark:bg-[#0c1322] sepia:bg-sepia-150">
          <div className="flex items-center gap-2.5 min-w-0">
            <FileText className="w-5 h-5 text-blue-700 dark:text-blue-400 sepia:text-sepia-700 shrink-0" />
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white sepia:text-sepia-950 truncate">
                Print Lesson {currentLesson.id} (Days 1–6)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 sepia:text-sepia-700 font-medium truncate">
                {currentLesson.title} · {currentLesson.passage}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-white dark:bg-[#162032] sepia:bg-sepia-50 hover:bg-slate-200 dark:hover:bg-[#1f2b42] sepia:hover:bg-sepia-100 text-slate-700 dark:text-slate-200 sepia:text-sepia-950 border border-slate-300 dark:border-[#35486b] sepia:border-sepia-300 transition cursor-pointer"
              title="Copy plain text to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 sepia:text-emerald-700" />
                  <span className="text-emerald-600 dark:text-emerald-400 sepia:text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Copy Text</span>
                </>
              )}
            </button>

            {/* Print button */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 sepia:bg-sepia-700 sepia:hover:bg-sepia-800 text-white shadow-xs transition cursor-pointer"
              title="Open device print dialog"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 sepia:hover:text-sepia-900 hover:bg-slate-200 dark:hover:bg-[#1f2b42] sepia:hover:bg-sepia-200 transition cursor-pointer"
              aria-label="Close print preview"
              title="Close and return to lesson"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Plain Text Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 dark:bg-[#0c1322] sepia:bg-sepia-100">
          <div
            id="printable-lesson-content"
            className="bg-white dark:bg-[#162032] sepia:bg-[#fffdf9] p-5 sm:p-8 rounded-2xl border border-slate-300 dark:border-[#2b3b57] sepia:border-sepia-300 shadow-sm"
          >
            <pre className="font-mono text-xs sm:text-sm text-slate-900 dark:text-slate-100 sepia:text-[#140801] whitespace-pre-wrap leading-relaxed select-text font-medium">
              {plainText}
            </pre>
          </div>
        </div>

        {/* Footer (no-print) */}
        <div className="no-print px-5 py-3 border-t border-slate-300 dark:border-[#2b3b57] sepia:border-sepia-300 bg-slate-100 dark:bg-[#0c1322] sepia:bg-sepia-150 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400 sepia:text-sepia-700 font-medium">
            Includes all 6 days with questions and entered answers.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 sepia:bg-sepia-700 sepia:hover:bg-sepia-800 text-white shadow-xs transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-bold text-xs bg-white dark:bg-[#162032] sepia:bg-sepia-50 hover:bg-slate-200 dark:hover:bg-[#1f2b42] sepia:hover:bg-sepia-100 text-slate-700 dark:text-slate-200 sepia:text-sepia-950 border border-slate-300 dark:border-[#35486b] sepia:border-sepia-300 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
