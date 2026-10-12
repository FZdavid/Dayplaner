/**
 * Datums-Helfer. Ein Tag wird überall als lokaler Schlüssel `YYYY-MM-DD`
 * gespeichert, damit Einträge nicht durch Zeitzonen auf einen anderen Tag rutschen.
 */
export type DateKey = string;

const pad = (n: number) => String(n).padStart(2, '0');

export function toDateKey(date: Date): DateKey {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayKey(): DateKey {
  return toDateKey(new Date());
}

export function parseDateKey(key: DateKey): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function isDateKey(value: string): value is DateKey {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(parseDateKey(value).getTime());
}

export function addDays(key: DateKey, days: number): DateKey {
  const d = parseDateKey(key);
  d.setDate(d.getDate() + days);
  return toDateKey(d);
}

const longFormat = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
const longFormatYear = new Intl.DateTimeFormat('de-DE', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const monthFormat = new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' });
const timeFormat = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' });
const dateTimeFormat = new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' });

/** „Montag, 12. Oktober“ – mit Jahr, wenn es nicht das aktuelle ist. */
export function formatDayLong(key: DateKey): string {
  const d = parseDateKey(key);
  return d.getFullYear() === new Date().getFullYear() ? longFormat.format(d) : longFormatYear.format(d);
}

/** „Heute“, „Gestern“ oder das lange Datum. */
export function formatDayRelative(key: DateKey): string {
  const today = todayKey();
  if (key === today) return 'Heute';
  if (key === addDays(today, -1)) return 'Gestern';
  return formatDayLong(key);
}

export function formatMonth(year: number, month: number): string {
  return monthFormat.format(new Date(year, month, 1));
}

export function formatTime(ms: number): string {
  return timeFormat.format(new Date(ms));
}

export function formatDateTime(ms: number): string {
  return dateTimeFormat.format(new Date(ms));
}

/** Kleiner, stabiler Hash – z. B. um aus dem Datum eine „Frage des Tages“ zu wählen. */
export function hashString(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = (h * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}
