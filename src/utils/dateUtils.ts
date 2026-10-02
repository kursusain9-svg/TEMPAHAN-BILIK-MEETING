/**
 * Utility functions for date and time in Bahasa Melayu
 */

export const MONTH_NAMES_MS = [
  'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
  'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'
];

export const MONTH_NAMES_SHORT_MS = [
  'Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun',
  'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'
];

export const DAY_NAMES_MS = [
  'Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'
];

export const DAY_NAMES_SHORT_MS = [
  'Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'
];

/**
 * Format YYYY-MM-DD string from Date
 */
export function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Format Malay date, e.g. "2 Oktober 2026"
 */
export function formatDateMalay(dateStr: string | Date): string {
  if (!dateStr) return '';
  const d = typeof dateStr === 'string' ? new Date(dateStr + (dateStr.length === 10 ? 'T00:00:00' : '')) : dateStr;
  if (isNaN(d.getTime())) return dateStr as string;
  const day = d.getDate();
  const month = MONTH_NAMES_MS[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Format Malay full date with day name, e.g. "Jumaat, 2 Oktober 2026"
 */
export function formatFullDateMalay(dateStr: string | Date): string {
  if (!dateStr) return '';
  const d = typeof dateStr === 'string' ? new Date(dateStr + (dateStr.length === 10 ? 'T00:00:00' : '')) : dateStr;
  if (isNaN(d.getTime())) return dateStr as string;
  const dayName = DAY_NAMES_MS[d.getDay()];
  const day = d.getDate();
  const month = MONTH_NAMES_MS[d.getMonth()];
  const year = d.getFullYear();
  return `${dayName}, ${day} ${month} ${year}`;
}

/**
 * Format 24h time "14:30" to 12h time "02:30 PM"
 */
export function formatTime12h(time24: string): string {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12; // 0 becomes 12
  const formattedH = String(h).padStart(2, '0');
  return `${formattedH}:${m} ${ampm}`;
}

/**
 * Convert time to minutes from midnight
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Check if two time ranges overlap on the same date
 */
export function doTimesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const minStartA = timeToMinutes(startA);
  const minEndA = timeToMinutes(endA);
  const minStartB = timeToMinutes(startB);
  const minEndB = timeToMinutes(endB);

  // Overlap condition: startA < endB && endA > startB
  return minStartA < minEndB && minEndA > minStartB;
}

/**
 * Get relative day offset in ISO string (e.g. +0 = today, +1 = tomorrow, -1 = yesterday)
 */
export function getDateOffsetISO(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return formatDateISO(d);
}
