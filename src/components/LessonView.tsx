import React, { useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ScriptureButton } from './ScriptureButton';
import { AutoGrowTextarea } from './AutoGrowTextarea';

export const LessonView: React.FC = () => {
  const {
    lessons,
    currentLesson,
    currentDayNumber,
    goToLesson,
    goToDay,
    goToNextDay,
    goToPrevDay,
    getAnswer,
    setAnswer,
    getDayProgress,
  } = useApp();

  const currentDay = useMemo(() => {
    return currentLesson.days.find(d => d.dayNumber === currentDayNumber) || currentLesson.days[0];
  }, [currentLesson, currentDayNumber]);

  const dayProgress = useMemo(() => {
    return getDayProgress(currentLesson.id, currentDayNumber);
  }, [getDayProgress, currentLesson.id, currentDayNumber]);

  // Scroll to top on day change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentDayNumber, currentLesson.id]);

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6 min-w-0">
      {/* Lesson Header Banner */}
      <div className="bg-white dark:bg-[#162032] sepia:bg-sepia-50 p-4 sm:p-6 rounded-2xl border border-slate-300 dark:border-[#2b3b57] sepia:border-sepia-300 shadow-sm space-y-3 overflow-hidden max-w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2 min-w-0 max-w-full">
            {/* Quick Lesson Switcher */}
            <div className="relative max-w-[200px] xs:max-w-[240px] sm:max-w-xs md:max-w-sm min-w-0">
              <select
                value={currentLesson.id}
                onChange={e => goToLesson(Number(e.target.value), 1)}
                className="appearance-none w-full pl-2.5 pr-7 py-1.5 rounded-lg text-xs sm:text-sm font-bold bg-slate-100 dark:bg-[#0c1322] sepia:bg-sepia-150 text-slate-900 dark:text-slate-100 sepia:text-sepia-950 border border-slate-300 dark:border-[#35486b] sepia:border-sepia-300 focus:outline-none focus:ring-2 focus:ring-blue-600 sepia:focus:ring-sepia-700 cursor-pointer truncate"
              >
                {lessons.map(l => (
                  <option key={l.id} value={l.id}>
                    Lesson {l.id}: {l.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 dark:text-slate-400 sepia:text-sepia-700" />
            </div>

            <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 sepia:text-sepia-800 shrink-0">
              {currentLesson.passage}
            </span>
          </div>

          {/* Day progress indicator */}
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 sepia:text-sepia-800 flex items-center gap-1.5 shrink-0">
            {dayProgress.isComplete && (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 sepia:text-emerald-700" />
            )}
            <span>
              Day {currentDayNumber}: {dayProgress.answered} of {dayProgress.total} answered
            </span>
          </div>
        </div>

        <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white sepia:text-sepia-950 tracking-tight leading-snug break-words">
          {currentLesson.title}
        </h1>
      </div>

      {/* Sticky Day Navigation Tabs */}
      <div className="sticky top-16 z-30 -mx-4 sm:mx-0 px-4 sm:px-0 py-2 bg-slate-100/95 dark:bg-[#0b0f19]/95 sepia:bg-sepia-200/95 backdrop-blur-md">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {currentLesson.days.map(d => {
            const isCurrent = d.dayNumber === currentDayNumber;
            const dp = getDayProgress(currentLesson.id, d.dayNumber);

            return (
              <button
                key={d.dayNumber}
                onClick={() => goToDay(d.dayNumber)}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition shadow-xs ${
                  isCurrent
                    ? 'bg-blue-700 dark:bg-blue-600 sepia:bg-sepia-700 text-white shadow-sm'
                    : 'bg-white dark:bg-[#162032] sepia:bg-sepia-50 text-slate-800 dark:text-slate-200 sepia:text-sepia-950 hover:bg-slate-50 dark:hover:bg-[#1f2b42] sepia:hover:bg-sepia-100 border border-slate-300 dark:border-[#2b3b57] sepia:border-sepia-300'
                }`}
              >
                <span>Day {d.dayNumber}</span>
                {dp.isComplete && (
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${
                      isCurrent
                        ? 'text-emerald-300'
                        : 'text-emerald-600 dark:text-emerald-400 sepia:text-emerald-700'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Day Header & Reading Passage */}
      <div className="bg-white dark:bg-[#162032] sepia:bg-sepia-50 p-4 sm:p-6 rounded-2xl border border-slate-300 dark:border-[#2b3b57] sepia:border-sepia-300 shadow-sm space-y-3 overflow-hidden max-w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-400 sepia:text-sepia-700">
              Day {currentDayNumber}
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white sepia:text-sepia-950 mt-0.5">
              {currentDay.title}
            </h2>
          </div>

          {/* Scripture Reading Link for the Day */}
          {currentDay.readingLinks && currentDay.readingLinks.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              {currentDay.readingLinks.map((link, idx) => (
                <ScriptureButton key={idx} link={link} variant="primary" />
              ))}
            </div>
          )}
        </div>

        {/* Day theme / summary */}
        {currentDay.summary && (
          <p className="text-sm sm:text-base italic text-slate-700 dark:text-slate-300 sepia:text-sepia-900 pt-2 border-t border-slate-200 dark:border-[#24334d] sepia:border-sepia-300 leading-relaxed font-medium">
            {currentDay.summary}
          </p>
        )}
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {currentDay.questions.map(q => {
          const hasSubquestions = q.subquestions && q.subquestions.length > 0;
          const startsDirectlyWithA = hasSubquestions && !q.text;
          const firstSq = hasSubquestions ? q.subquestions[0] : null;
          const remainingSq = hasSubquestions ? q.subquestions.slice(1) : [];

          return (
            <div
              key={q.id}
              className="bg-white dark:bg-[#162032] sepia:bg-sepia-50 rounded-2xl border border-slate-300 dark:border-[#2b3b57] sepia:border-sepia-300 shadow-sm p-4 sm:p-6 space-y-4 overflow-hidden max-w-full min-w-0"
            >
              {/* Question Header */}
              {startsDirectlyWithA && firstSq ? (
                /* CASE A: No separate question text - first subquestion (a.) sits directly on the same line as (q.number)! */
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="shrink-0 flex items-center justify-center w-8 h-8 rounded-xl font-extrabold text-sm bg-blue-100 dark:bg-blue-950/80 sepia:bg-sepia-150 text-blue-900 dark:text-blue-200 sepia:text-sepia-950 border border-blue-300 dark:border-blue-800 sepia:border-sepia-300 shadow-2xs">
                      {q.number}
                    </span>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-baseline gap-2">
                        <span className="shrink-0 font-bold text-blue-700 dark:text-blue-400 sepia:text-sepia-700 text-lg">
                          {firstSq.letter}.
                        </span>
                        <p className="font-bold text-slate-900 dark:text-white sepia:text-sepia-950 leading-relaxed text-base sm:text-lg">
                          {firstSq.text}
                        </p>
                      </div>

                      {/* Scripture links for first subquestion */}
                      {firstSq.scriptureLinks && firstSq.scriptureLinks.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          {firstSq.scriptureLinks.map((link, idx) => (
                            <ScriptureButton key={idx} link={link} variant="badge" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Answer box for first subquestion */}
                  <div className="pl-0 sm:pl-11 pt-1">
                    <AutoGrowTextarea
                      id={firstSq.id}
                      value={getAnswer(firstSq.id)}
                      onChange={val => setAnswer(firstSq.id, val)}
                      placeholder={`Answer for ${q.number}${firstSq.letter}...`}
                    />
                  </div>

                  {/* Remaining Subquestions (b, c, etc.) */}
                  {remainingSq.map(sq => (
                    <div
                      key={sq.id}
                      className="space-y-3 pt-5 mt-4 sm:pl-11 border-t border-slate-200 dark:border-[#24334d] sepia:border-sepia-300"
                    >
                      <div className="flex items-baseline gap-2">
                        <span className="shrink-0 font-bold text-blue-700 dark:text-blue-400 sepia:text-sepia-700 text-lg">
                          {sq.letter}.
                        </span>
                        <p className="font-bold text-slate-900 dark:text-white sepia:text-sepia-950 leading-relaxed text-base sm:text-lg">
                          {sq.text}
                        </p>
                      </div>

                      {sq.scriptureLinks && sq.scriptureLinks.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          {sq.scriptureLinks.map((link, idx) => (
                            <ScriptureButton key={idx} link={link} variant="badge" />
                          ))}
                        </div>
                      )}

                      <div className="pt-1">
                        <AutoGrowTextarea
                          id={sq.id}
                          value={getAnswer(sq.id)}
                          onChange={val => setAnswer(sq.id, val)}
                          placeholder={`Answer for ${q.number}${sq.letter}...`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : hasSubquestions ? (
                /* CASE B: Question has overarching prompt, followed by subquestions */
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="shrink-0 flex items-center justify-center w-8 h-8 rounded-xl font-extrabold text-sm bg-blue-100 dark:bg-blue-950/80 sepia:bg-sepia-150 text-blue-900 dark:text-blue-200 sepia:text-sepia-950 border border-blue-300 dark:border-blue-800 sepia:border-sepia-300 shadow-2xs">
                      {q.number}
                    </span>

                    <div className="flex-1 space-y-2">
                      <p className="font-bold text-slate-900 dark:text-white sepia:text-sepia-950 leading-relaxed text-base sm:text-lg">
                        {q.text}
                      </p>
                      {q.scriptureLinks && q.scriptureLinks.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {q.scriptureLinks.map((link, idx) => (
                            <ScriptureButton key={idx} link={link} variant="badge" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-5 sm:pl-11">
                    {q.subquestions.map(sq => (
                      <div key={sq.id} className="space-y-2">
                        <div className="flex items-baseline gap-2">
                          <span className="shrink-0 font-bold text-blue-700 dark:text-blue-400 sepia:text-sepia-700 text-lg">
                            {sq.letter}.
                          </span>
                          <p className="font-semibold text-slate-900 dark:text-white sepia:text-sepia-950 leading-relaxed text-base">
                            {sq.text}
                          </p>
                        </div>

                        {sq.scriptureLinks && sq.scriptureLinks.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            {sq.scriptureLinks.map((link, idx) => (
                              <ScriptureButton key={idx} link={link} variant="badge" />
                            ))}
                          </div>
                        )}

                        <div className="pt-1">
                          <AutoGrowTextarea
                            id={sq.id}
                            value={getAnswer(sq.id)}
                            onChange={val => setAnswer(sq.id, val)}
                            placeholder={`Answer for ${q.number}${sq.letter}...`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* CASE C: Standard single question (no subquestions) */
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="shrink-0 flex items-center justify-center w-8 h-8 rounded-xl font-extrabold text-sm bg-blue-100 dark:bg-blue-950/80 sepia:bg-sepia-150 text-blue-900 dark:text-blue-200 sepia:text-sepia-950 border border-blue-300 dark:border-blue-800 sepia:border-sepia-300 shadow-2xs">
                      {q.number}
                    </span>

                    <div className="flex-1 space-y-2">
                      <p className="font-bold text-slate-900 dark:text-white sepia:text-sepia-950 leading-relaxed text-base sm:text-lg">
                        {q.text}
                      </p>

                      {q.scriptureLinks && q.scriptureLinks.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {q.scriptureLinks.map((link, idx) => (
                            <ScriptureButton key={idx} link={link} variant="badge" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pl-0 sm:pl-11 pt-1">
                    <AutoGrowTextarea
                      id={q.id}
                      value={getAnswer(q.id)}
                      onChange={val => setAnswer(q.id, val)}
                      placeholder={`Answer for Question ${q.number}...`}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Navigation Buttons */}
      <div className="flex items-center justify-between gap-2 pt-6 border-t border-slate-300 dark:border-[#2b3b57] sepia:border-sepia-300 pb-12">
        <button
          onClick={goToPrevDay}
          className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-white dark:bg-[#162032] sepia:bg-sepia-50 text-slate-800 dark:text-slate-200 sepia:text-sepia-950 hover:bg-slate-50 dark:hover:bg-[#1f2b42] sepia:hover:bg-sepia-100 border border-slate-300 dark:border-[#2b3b57] sepia:border-sepia-300 shadow-xs transition active:scale-95 shrink-0 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 shrink-0" />
          <span>{currentDayNumber === 1 ? 'Prev Lesson' : 'Prev Day'}</span>
        </button>

        <span className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 sepia:text-sepia-800 text-center shrink-0">
          Day {currentDayNumber} / 6
        </span>

        <button
          onClick={goToNextDay}
          className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 sepia:bg-sepia-700 sepia:hover:bg-sepia-800 text-white shadow-xs transition active:scale-95 shrink-0 cursor-pointer"
        >
          <span>{currentDayNumber === 6 ? 'Next Lesson' : 'Next Day'}</span>
          <ChevronRight className="w-4 h-4 shrink-0" />
        </button>
      </div>
    </div>
  );
};
