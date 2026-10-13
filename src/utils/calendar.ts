import { ReminderSettings } from '../types/lesson';

const DAY_MAP: Record<number, string> = {
  0: 'SU',
  1: 'MO',
  2: 'TU',
  3: 'WE',
  4: 'TH',
  5: 'FR',
  6: 'SA'
};

export function generateIcsContent(settings: ReminderSettings): string {
  const [hours, minutes] = settings.time.split(':').map(Number);
  const byDays = settings.days.map(d => DAY_MAP[d]).filter(Boolean).join(',');

  const now = new Date();
  const nextDate = new Date();
  nextDate.setHours(hours, minutes, 0, 0);
  if (nextDate < now) {
    nextDate.setDate(nextDate.getDate() + 1);
  }

  const pad = (n: number) => n.toString().padStart(2, '0');
  const formatDateUtc = (d: Date) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;

  const dtStart = formatDateUtc(nextDate);
  const uid = `bsf-study-reminder-${Date.now()}@bsfrogue.vercel.app`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BSF Romans Study App//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatDateUtc(now)}`,
    `DTSTART:${dtStart}`,
    `DURATION:PT30M`,
    `RRULE:FREQ=WEEKLY;BYDAY=${byDays}`,
    'SUMMARY:BSF Daily Lesson Study',
    'DESCRIPTION:Time for your BSF Romans lesson study. Open your study app to continue!',
    'BEGIN:VALARM',
    'TRIGGER:-PT0M',
    'ACTION:DISPLAY',
    'DESCRIPTION:BSF Daily Lesson Study Reminder',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

export function downloadIcsFile(settings: ReminderSettings) {
  const content = generateIcsContent(settings);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'bsf_daily_study_reminder.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
