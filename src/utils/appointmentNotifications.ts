import { MedicalAppointment, FamilyMember } from '../types/health';
import { formatDateTime } from './healthUtils';

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export function isNotificationsEnabled(): boolean {
  try {
    const val = localStorage.getItem('fv_notifications_enabled');
    if (val === null) {
      return getNotificationPermission() === 'granted';
    }
    return val === 'true';
  } catch {
    return false;
  }
}

export function setNotificationsEnabled(enabled: boolean) {
  try {
    localStorage.setItem('fv_notifications_enabled', enabled ? 'true' : 'false');
  } catch (e) {
    console.error('Error saving notification setting:', e);
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  try {
    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';
    setNotificationsEnabled(granted);
    return granted;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return false;
  }
}

export function sendAppointmentNotification(
  apt: MedicalAppointment,
  memberName: string,
  customMessage?: string
): boolean {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const title = `🔔 Recordatorio de Turno - ${apt.specialty}`;
    const body =
      customMessage ||
      `${memberName}: Consulta con ${apt.doctorName} el ${formatDateTime(
        apt.dateTime
      )}. Lugar: ${apt.clinicAddress}.`;

    const notification = new Notification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/favicon.svg',
      tag: `apt-${apt.id}`,
      requireInteraction: false,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return true;
  } catch (err) {
    console.error('Error sending notification:', err);
    return false;
  }
}

export function triggerImmediateTestNotification(
  apt?: MedicalAppointment,
  memberName: string = 'Familiar'
): boolean {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const title = apt ? `🔔 Recordatorio de Turno - ${apt.specialty}` : '🔔 FamiliaVital - Notificaciones Activas';
    const body = apt
      ? `Turno de ${memberName} con ${apt.doctorName} el ${formatDateTime(apt.dateTime)} (${apt.clinicAddress}).`
      : 'Las alertas de turnos médicos y consultas están activadas en tu dispositivo.';

    const notification = new Notification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/favicon.svg',
      tag: `test-apt-${Date.now()}`,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return true;
  } catch (err) {
    console.error('Error triggering test notification:', err);
    return false;
  }
}

/**
 * Checks upcoming appointments (within next 72 hours) and sends a notification if not already sent today
 */
export function checkAndNotifyUpcomingAppointments(
  appointments: MedicalAppointment[],
  members: FamilyMember[]
): {
  notifiedCount: number;
  upcomingList: { apt: MedicalAppointment; memberName: string; hoursLeft: number; urgency: 'today' | 'tomorrow' | 'upcoming' }[];
} {
  const now = new Date().getTime();
  const notifiedKey = 'fv_notified_turnos_v1';
  let notifiedMap: Record<string, string> = {};

  try {
    const saved = localStorage.getItem(notifiedKey);
    if (saved) notifiedMap = JSON.parse(saved);
  } catch {
    notifiedMap = {};
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingList: {
    apt: MedicalAppointment;
    memberName: string;
    hoursLeft: number;
    urgency: 'today' | 'tomorrow' | 'upcoming';
  }[] = [];
  let notifiedCount = 0;

  appointments
    .filter((a) => a.status === 'scheduled')
    .forEach((apt) => {
      const aptTime = new Date(apt.dateTime).getTime();
      const diffHours = (aptTime - now) / (1000 * 60 * 60);

      // If appointment is within the next 7 days (168 hours)
      if (diffHours >= -2 && diffHours <= 168) {
        const member = members.find((m) => m.id === apt.memberId);
        const memberName = member ? member.name.split(' ')[0] : 'Familiar';
        
        let urgency: 'today' | 'tomorrow' | 'upcoming' = 'upcoming';
        if (diffHours <= 24) urgency = 'today';
        else if (diffHours <= 48) urgency = 'tomorrow';

        upcomingList.push({ apt, memberName, hoursLeft: Math.round(diffHours), urgency });

        // If in next 72 hours and not already notified today for this appointment
        if (diffHours <= 72) {
          const alreadyNotifiedDate = notifiedMap[apt.id];
          if (
            alreadyNotifiedDate !== todayStr &&
            isNotificationSupported() &&
            Notification.permission === 'granted' &&
            isNotificationsEnabled()
          ) {
            const hoursMsg =
              diffHours <= 0
                ? 'es ahora'
                : diffHours < 24
                ? `es hoy en ${Math.max(1, Math.round(diffHours))} hs`
                : `es en ${Math.round(diffHours / 24)} día(s)`;

            const sent = sendAppointmentNotification(
              apt,
              memberName,
              `Recordatorio: El turno de ${memberName} (${apt.specialty}) ${hoursMsg}. Centro: ${apt.clinicAddress}`
            );

            if (sent) {
              notifiedMap[apt.id] = todayStr;
              notifiedCount++;
            }
          }
        }
      }
    });

  try {
    localStorage.setItem(notifiedKey, JSON.stringify(notifiedMap));
  } catch {
    // Ignore storage issues
  }

  return { notifiedCount, upcomingList };
}

/**
 * Generate Google Calendar direct URL with automatic reminder
 */
export function generateGoogleCalendarUrl(apt: MedicalAppointment, memberName: string): string {
  const startDate = new Date(apt.dateTime);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

  const formatGCalDate = (d: Date) => {
    return d.toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  const title = encodeURIComponent(`Turno Médico: ${apt.specialty} (${memberName})`);
  const details = encodeURIComponent(
    `Paciente: ${memberName}\nProfesional: ${apt.doctorName}\nMotivo: ${apt.reason}\n${
      apt.preparationNotes ? `Preparación: ${apt.preparationNotes}\n` : ''
    }Registrado en FamiliaVital (Alarma activada)`
  );
  const location = encodeURIComponent(apt.clinicAddress);
  const dates = `${formatGCalDate(startDate)}/${formatGCalDate(endDate)}`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
}
