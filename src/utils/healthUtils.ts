/**
 * Smoothly scrolls the window, document, and menu back to the top.
 */
export function scrollToTop(): void {
  if (typeof window !== 'undefined') {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      window.scrollTo(0, 0);
    }
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
  }
}

/**
 * Calculates human readable age from a YYYY-MM-DD birthdate.
 */
export function formatAge(birthDateString: string): string {
  const birth = new Date(birthDateString);
  const now = new Date();
  
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  
  if (months < 0 || (months === 0 && now.getDate() < birth.getDate())) {
    years--;
    months += 12;
  }
  
  if (years === 0) {
    return `${Math.max(1, months)} meses`;
  }
  if (years === 1) {
    return `1 año ${months > 0 ? `(${months}m)` : ''}`;
  }
  if (years < 3) {
    return `${years} años ${months > 0 ? `(${months}m)` : ''}`;
  }
  return `${years} años`;
}

/**
 * Formats a date into natural localized Spanish (e.g., "14 Oct 2026").
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  // Parse YYYY-MM-DD or ISO string safely
  const parts = dateString.split('T')[0].split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const date = new Date(parseInt(year, 10), month, day);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  return dateString;
}

/**
 * Formats appointment datetime into readable format with time.
 */
export function formatDateTime(dateTimeString: string): string {
  if (!dateTimeString) return '-';
  const [datePart, timePart] = dateTimeString.split('T');
  const formattedDate = formatDate(datePart);
  return `${formattedDate} · ${timePart || '00:00'} hs`;
}

export type MedicineExpiryStatus = 'expired' | 'expiring_soon' | 'valid';

export interface MedicineExpiryInfo {
  status: MedicineExpiryStatus;
  daysRemaining: number;
  label: string;
}

/**
 * Calculates expiry status and days remaining for medication.
 */
export function getMedicineExpiryInfo(expiryDate: string): MedicineExpiryInfo {
  const parts = expiryDate.split('-');
  const expDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = expDate.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    const pastDays = Math.abs(daysRemaining);
    return {
      status: 'expired',
      daysRemaining,
      label: `Vencido hace ${pastDays} ${pastDays === 1 ? 'día' : 'días'}`,
    };
  }

  if (daysRemaining <= 45) {
    return {
      status: 'expiring_soon',
      daysRemaining,
      label: daysRemaining === 0 ? 'Vence hoy' : `Vence en ${daysRemaining} días`,
    };
  }

  return {
    status: 'valid',
    daysRemaining,
    label: `Válido (${daysRemaining} días)`,
  };
}

/**
 * Generates and triggers download of a standardized .ics calendar file for an appointment.
 */
export function downloadCalendarEvent(
  title: string,
  description: string,
  location: string,
  startDateTime: string
): void {
  const startDate = new Date(startDateTime);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

  const formatICSDate = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, '');
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SaludFamiliar//Libreta Digital//ES',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `SUMMARY:${title}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
    `LOCATION:${location}`,
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${title.replace(/\s+/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Opens WhatsApp with a pre-filled encoded message for instant family or doctor sharing.
 * Avoids window.open popup blocks by triggering an anchor click safely.
 */
export function shareViaWhatsApp(message: string, phoneNumber?: string): void {
  if (typeof window === 'undefined') return;
  const cleanPhone = phoneNumber ? phoneNumber.replace(/[^\d+]/g, '') : '';
  const encoded = encodeURIComponent(message);
  const url = cleanPhone
    ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`
    : `https://api.whatsapp.com/send?text=${encoded}`;
  
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Reads a user-uploaded File (image or PDF) and extracts its Data URL and format.
 */
export function readFileAsDataURL(file: File): Promise<{ url: string; name: string; type: 'pdf' | 'image' }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const isPdf = file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf');
      resolve({
        url: reader.result as string,
        name: file.name,
        type: isPdf ? 'pdf' : 'image',
      });
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
