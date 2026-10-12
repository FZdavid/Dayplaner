import type { Table } from 'dexie';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../core/db/db';
import { getSetting, setSetting } from '../../core/db/settings';
import { hashString, type DateKey } from '../../core/lib/date';
import { newId } from '../../core/lib/id';
import { DEFAULT_ACTIVITIES, DEFAULT_PROMPTS } from './defaults';
import {
  JOURNAL_SETTINGS,
  JOURNAL_TABLES,
  type JournalActivity,
  type JournalDay,
  type JournalEntry,
  type JournalPrompt,
  type Mood,
} from './schema';

/**
 * Einziger Zugriffspunkt auf die Journal-Tabellen.
 * Andere Module (z. B. Statistik) nutzen nur diese Funktionen.
 */

const entries = () => db.table<JournalEntry, string>(JOURNAL_TABLES.entries);
const days = () => db.table<JournalDay, string>(JOURNAL_TABLES.days);
const activities = () => db.table<JournalActivity, string>(JOURNAL_TABLES.activities);
const prompts = () => db.table<JournalPrompt, string>(JOURNAL_TABLES.prompts);

// ---------- Startdaten ----------

export async function seedJournal(): Promise<void> {
  await db.transaction('rw', [activities(), prompts(), db.table('settings')], async () => {
    if (await getSetting(JOURNAL_SETTINGS.seeded, false)) return;
    if ((await activities().count()) === 0) await activities().bulkPut(DEFAULT_ACTIVITIES);
    if ((await prompts().count()) === 0) await prompts().bulkPut(DEFAULT_PROMPTS);
    await setSetting(JOURNAL_SETTINGS.seeded, true);
  });
}

// ---------- Einträge ----------

export async function addEntry(input: {
  date: DateKey;
  text: string;
  prompt?: Pick<JournalPrompt, 'id' | 'text'> | null;
}): Promise<string> {
  const now = Date.now();
  const id = newId();
  await entries().add({
    id,
    date: input.date,
    text: input.text.trim(),
    promptId: input.prompt?.id ?? null,
    promptText: input.prompt?.text ?? null,
    createdAt: now,
    updatedAt: now,
  });
  return id;
}

export async function updateEntryText(id: string, text: string): Promise<void> {
  await entries().update(id, { text: text.trim(), updatedAt: Date.now() });
}

export async function deleteEntry(id: string): Promise<void> {
  await entries().delete(id);
}

export function useEntriesForDay(date: DateKey) {
  return useLiveQuery(() => entries().where('date').equals(date).sortBy('createdAt'), [date]);
}

export function useAllEntries() {
  return useLiveQuery(() => entries().toArray());
}

// ---------- Tage (Stimmung & Aktivitäten) ----------

const emptyDay = (date: DateKey): JournalDay => ({ date, mood: null, activityIds: [], updatedAt: 0 });

export function useDay(date: DateKey) {
  return useLiveQuery(async () => (await days().get(date)) ?? emptyDay(date), [date]);
}

export function useAllDays() {
  return useLiveQuery(() => days().toArray());
}

export function useDaysInRange(from: DateKey, to: DateKey) {
  return useLiveQuery(() => days().where('date').between(from, to, true, true).toArray(), [from, to]);
}

export function useEntryDatesInRange(from: DateKey, to: DateKey) {
  return useLiveQuery(
    async () => new Set(await entries().where('date').between(from, to, true, true).keys()),
    [from, to],
  );
}

async function updateDay(date: DateKey, change: (day: JournalDay) => JournalDay): Promise<void> {
  await db.transaction('rw', days(), async () => {
    const current = (await days().get(date)) ?? emptyDay(date);
    const next = { ...change(current), date, updatedAt: Date.now() };
    if (next.mood === null && next.activityIds.length === 0) {
      await days().delete(date);
    } else {
      await days().put(next);
    }
  });
}

export function setMood(date: DateKey, mood: Mood | null): Promise<void> {
  return updateDay(date, (d) => ({ ...d, mood }));
}

export function toggleActivity(date: DateKey, activityId: string): Promise<void> {
  return updateDay(date, (d) => ({
    ...d,
    activityIds: d.activityIds.includes(activityId)
      ? d.activityIds.filter((id) => id !== activityId)
      : [...d.activityIds, activityId],
  }));
}

// ---------- Aktivitäten ----------

export function useActivities() {
  return useLiveQuery(() => activities().orderBy('order').toArray());
}

export async function addActivity(name: string, icon: string): Promise<string> {
  const now = Date.now();
  const id = newId();
  const last = await activities().orderBy('order').last();
  await activities().add({ id, name: name.trim(), icon, order: (last?.order ?? -1) + 1, createdAt: now, updatedAt: now });
  return id;
}

export async function updateActivity(id: string, change: Partial<Pick<JournalActivity, 'name' | 'icon'>>) {
  await activities().update(id, {
    ...change,
    ...(change.name !== undefined ? { name: change.name.trim() } : {}),
    updatedAt: Date.now(),
  });
}

/** Löscht die Aktivität und entfernt sie aus allen Tagen. */
export async function deleteActivity(id: string): Promise<void> {
  await db.transaction('rw', [activities(), days()], async () => {
    await activities().delete(id);
    const now = Date.now();
    const affected = await days().where('activityIds').equals(id).toArray();
    for (const day of affected) {
      const next = { ...day, activityIds: day.activityIds.filter((a) => a !== id), updatedAt: now };
      if (next.mood === null && next.activityIds.length === 0) await days().delete(day.date);
      else await days().put(next);
    }
  });
}

/** Verschiebt eine Aktivität um eine Position nach oben (-1) oder unten (+1). */
export async function moveActivity(id: string, direction: -1 | 1): Promise<void> {
  await reorder(activities(), id, direction);
}

/** Anzahl der Tage, an denen eine Aktivität angetippt wurde. */
export async function countDaysWithActivity(id: string): Promise<number> {
  return days().where('activityIds').equals(id).count();
}

// ---------- Fragen ----------

export function usePrompts() {
  return useLiveQuery(() => prompts().orderBy('order').toArray());
}

export async function addPrompt(text: string): Promise<void> {
  const last = await prompts().orderBy('order').last();
  await prompts().add({ id: newId(), text: text.trim(), active: true, order: (last?.order ?? -1) + 1, updatedAt: Date.now() });
}

export async function updatePrompt(id: string, change: Partial<Pick<JournalPrompt, 'text' | 'active'>>) {
  await prompts().update(id, {
    ...change,
    ...(change.text !== undefined ? { text: change.text.trim() } : {}),
    updatedAt: Date.now(),
  });
}

export async function deletePrompt(id: string): Promise<void> {
  await prompts().delete(id);
}

export async function movePrompt(id: string, direction: -1 | 1): Promise<void> {
  await reorder(prompts(), id, direction);
}

/** Die Frage des Tages: bleibt den ganzen Tag gleich, wechselt täglich. */
export function pickPromptForDay(date: DateKey, all: JournalPrompt[], offset = 0): JournalPrompt | null {
  const active = all.filter((p) => p.active);
  if (active.length === 0) return null;
  return active[(hashString(date) + offset) % active.length];
}

// ---------- Hilfen ----------

async function reorder<T extends { id: string; order: number }>(
  table: Table<T, string>,
  id: string,
  direction: -1 | 1,
) {
  await db.transaction('rw', table, async () => {
    const list = await table.orderBy('order').toArray();
    const index = list.findIndex((item) => item.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    const now = Date.now();
    await table.bulkPut(list.map((item, order) => ({ ...item, order, updatedAt: now })));
  });
}
