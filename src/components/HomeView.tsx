import React, { useState, useMemo } from 'react';
import { Search, Play, CheckCircle2, ChevronRight, BookOpen, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const HomeView: React.FC = () => {
  const {
    lessons,
    goToLesson,
    lastVisited,
    getLessonProgress,
    getDayProgress,
    overallProgress,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');

  // Find last visited lesson
  const lastLesson = useMemo(() => {
    return lessons.find(l => l.id === lastVisited.lessonId) || lessons[0];
  }, [lessons, lastVisited.lessonId]);

  const lastDayProgress = useMemo(() => {
    return getDayProgress(lastLesson.id, lastVisited.dayNumber);
  }, [getDayProgress, lastLesson.id, lastVisited.dayNumber]);

  // Filter lessons
  const filteredLessons = useMemo(() => {
    if (!searchQuery.trim()) return lessons;
    const q = searchQuery.toLowerCase();
    return lessons.filter(
      l =>
        l.id.toString() === q ||
        `lesson ${l.id}`.includes(q) ||
        l.title.toLowerCase().includes(q) ||
        l.passage.toLowerCase().includes(q)
    );
  }, [lessons, searchQuery]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Hero Continue Card - High Contrast Across All Themes */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border bg-slate-900 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#172554] border-slate-700/60 text-white sepia:bg-[#321706] sepia:bg-gradient-to-br sepia:from-[#3e1f0b] sepia:via-[#2e1404] sepia:to-[#1f0d02] sepia:border-[#6d3e18] sepia:text-amber-50 dark:bg-[#111927] dark:bg-gradient-to-br dark:from-[#162238] dark:via-[#0e1624] dark:to-[#090d16] dark:border-2 dark:border-blue-500/60">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40 sepia:bg-amber-400/25 sepia:text-amber-200 sepia:border-amber-400/50">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Resume Study</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white sepia:text-amber-50">
              Lesson {lastLesson.id}: {lastLesson.title}
            </h1>
            <p className="text-blue-100 sepia:text-amber-200 text-sm sm:text-base font-semibold">
              Day {lastVisited.dayNumber} • {lastLesson.passage}
            </p>

            <div className="pt-2 flex items-center gap-3 text-xs text-blue-100 sepia:text-amber-200 font-semibold">
              <div className="w-32 sm:w-44 bg-slate-800 sepia:bg-[#200e03] h-2.5 rounded-full overflow-hidden border border-slate-600 sepia:border-[#633a17]">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${lastDayProgress.percent}%` }}
                />
              </div>
              <span>
                {lastDayProgress.answered} of {lastDayProgress.total} answered on Day {lastVisited.dayNumber}
              </span>
            </div>
          </div>

          <div className="flex sm:shrink-0">
            <button
              onClick={() => goToLesson(lastLesson.id, lastVisited.dayNumber)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-extrabold text-slate-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] text-base sm:text-lg cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Continue Day {lastVisited.dayNumber}</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-blue-500/10 sepia:bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
      </section>

      {/* Progress & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Overall stats */}
        <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 sepia:text-sepia-900 font-medium">
          <BookOpen className="w-4 h-4 text-blue-700 dark:text-blue-400 sepia:text-sepia-700" />
          <span className="font-bold">Year Progress:</span>
          <span className="font-bold text-blue-800 dark:text-blue-300 sepia:text-sepia-800">
            {overallProgress.percent}% complete
          </span>
          <span className="text-slate-300 dark:text-slate-700 sepia:text-sepia-300">|</span>
          <span className="text-xs font-semibold opacity-80">{overallProgress.answered} questions answered</span>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-400 sepia:text-sepia-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search lessons or passage..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-[#2b3b57] sepia:border-sepia-300 bg-white dark:bg-[#162032] sepia:bg-sepia-50 text-slate-900 dark:text-white sepia:text-sepia-950 placeholder:text-slate-400 dark:placeholder:text-slate-500 sepia:placeholder:text-sepia-400/80 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 sepia:focus:ring-sepia-700 shadow-sm"
          />
        </div>
      </div>

      {/* 30-Lesson Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredLessons.map(lesson => {
          const progress = getLessonProgress(lesson.id);
          const isFinished = progress.total > 0 && progress.answered === progress.total;

          return (
            <div
              key={lesson.id}
              className="flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-[#162032] sepia:bg-sepia-50 border border-slate-300 dark:border-[#2b3b57] sepia:border-sepia-300 shadow-sm hover:shadow-md transition-all duration-200 group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-md text-xs font-extrabold uppercase tracking-wider bg-blue-100 dark:bg-blue-950/80 sepia:bg-sepia-150 text-blue-900 dark:text-blue-200 sepia:text-sepia-950 border border-blue-200 dark:border-blue-900 sepia:border-sepia-300">
                    Lesson {lesson.id}
                  </span>
                  {isFinished && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 sepia:text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 fill-emerald-100 dark:fill-emerald-950" />
                      Complete
                    </span>
                  )}
                </div>

                <h2
                  onClick={() => goToLesson(lesson.id, 1)}
                  className="font-extrabold text-slate-900 dark:text-white sepia:text-sepia-950 text-base sm:text-lg cursor-pointer hover:text-blue-700 dark:hover:text-blue-400 sepia:hover:text-sepia-700 transition line-clamp-2"
                >
                  {lesson.title}
                </h2>

                <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 sepia:text-sepia-800 mt-1 mb-4">
                  {lesson.passage}
                </p>
              </div>

              {/* Progress bar and day pills */}
              <div className="pt-3 border-t border-slate-200 dark:border-[#24334d] sepia:border-sepia-300">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 sepia:text-sepia-800 mb-2">
                  <span>Days:</span>
                  <span>{progress.answered} / {progress.total} answered</span>
                </div>

                {/* Day 1 to 6 pills */}
                <div className="grid grid-cols-6 gap-1.5">
                  {lesson.days.map(d => {
                    const dp = getDayProgress(lesson.id, d.dayNumber);
                    const isDayDone = dp.isComplete;
                    const hasSome = dp.answered > 0 && !isDayDone;

                    return (
                      <button
                        key={d.dayNumber}
                        onClick={() => goToLesson(lesson.id, d.dayNumber)}
                        title={`Day ${d.dayNumber}: ${d.title} (${dp.answered}/${dp.total} answered)`}
                        className={`py-1.5 rounded-lg text-xs font-extrabold transition flex flex-col items-center justify-center cursor-pointer ${
                          isDayDone
                            ? 'bg-emerald-100 text-emerald-950 dark:bg-emerald-950/80 dark:text-emerald-300 sepia:bg-[#d6ecd6] sepia:text-emerald-950 border border-emerald-400 dark:border-emerald-700 sepia:border-emerald-500'
                            : hasSome
                            ? 'bg-blue-100 text-blue-950 dark:bg-blue-950 dark:text-blue-200 sepia:bg-sepia-150 sepia:text-sepia-950 border border-blue-400 dark:border-blue-700 sepia:border-sepia-400'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-[#0c1322] dark:hover:bg-[#1f2b42] dark:text-slate-200 sepia:bg-sepia-150 sepia:text-sepia-950 sepia:hover:bg-sepia-100 border border-slate-300 dark:border-[#2b3b57] sepia:border-sepia-300'
                        }`}
                      >
                        <span>D{d.dayNumber}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
