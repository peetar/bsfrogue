import { ReminderSettings } from '../types/lesson';

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return await Notification.requestPermission();
}

export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

export function sendStudyNotification(title: string, body: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, {
          body,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
          tag: 'bsf-daily-reminder',
        });
      });
    } else {
      new Notification(title, {
        body,
        icon: '/icons/icon-192.png',
        tag: 'bsf-daily-reminder',
      });
    }
  } catch (err) {
    console.error('Failed to send notification:', err);
  }
}

export function checkAndTriggerReminder(
  settings: ReminderSettings,
  lessonTitle: string,
  dayNumber: number,
  onNotified?: (dateStr: string) => void
) {
  if (!settings.enabled || !settings.days.length || !settings.time) {
    return;
  }

  const now = new Date();
  const currentDayOfWeek = now.getDay(); // 0 to 6
  if (!settings.days.includes(currentDayOfWeek)) {
    return;
  }

  const todayStr = now.toISOString().split('T')[0];
  if (settings.lastNotifiedDate === todayStr) {
    return;
  }

  const [targetH, targetM] = settings.time.split(':').map(Number);
  const currentH = now.getHours();
  const currentM = now.getMinutes();

  // If within the scheduled hour and minute or up to 60 mins past
  if (currentH > targetH || (currentH === targetH && currentM >= targetM)) {
    sendStudyNotification(
      'BSF Daily Study Reminder',
      `Time for today's lesson: Day ${dayNumber} - ${lessonTitle}`
    );
    if (onNotified) {
      onNotified(todayStr);
    }
  }
}
