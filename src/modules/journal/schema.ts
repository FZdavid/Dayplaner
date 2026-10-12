import type { DateKey } from '../../core/lib/date';

/** Tabellen und Typen des Journal-Moduls. Diese Datei hat keine Laufzeit-Abhängigkeiten. */

export const JOURNAL_TABLES = {
  entries: 'journal_entries',
  days: 'journal_days',
  activities: 'journal_activities',
  prompts: 'journal_prompts',
} as const;

export const journalStores = {
  [JOURNAL_TABLES.entries]: 'id, date, createdAt, updatedAt',
  [JOURNAL_TABLES.days]: 'date, mood, *activityIds, updatedAt',
  [JOURNAL_TABLES.activities]: 'id, order',
  [JOURNAL_TABLES.prompts]: 'id, order',
};

export type Mood = 1 | 2 | 3 | 4 | 5;

/** Ein Texteintrag. Pro Tag kann es beliebig viele geben. */
export interface JournalEntry {
  id: string;
  date: DateKey;
  text: string;
  /** Gesetzt, wenn der Text eine Antwort auf die Frage des Tages ist. */
  promptId: string | null;
  /** Kopie der Frage, damit sie auch nach Umbenennen/Löschen erhalten bleibt. */
  promptText: string | null;
  createdAt: number;
  updatedAt: number;
}

/** Werte, die für einen ganzen Tag gelten. */
export interface JournalDay {
  date: DateKey;
  mood: Mood | null;
  activityIds: string[];
  updatedAt: number;
}

export interface JournalActivity {
  id: string;
  name: string;
  /** Emoji */
  icon: string;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface JournalPrompt {
  id: string;
  text: string;
  active: boolean;
  order: number;
  updatedAt: number;
}

export const MOODS: { value: Mood; emoji: string; label: string }[] = [
  { value: 1, emoji: '😫', label: 'Mies' },
  { value: 2, emoji: '😕', label: 'Schlecht' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Gut' },
  { value: 5, emoji: '😄', label: 'Super' },
];

export const JOURNAL_SETTINGS = {
  seeded: 'journal.seeded',
  showPrompt: 'journal.showPrompt',
  /** Datum, an dem die Frage für heute weggeklickt wurde. */
  promptDismissedOn: 'journal.promptDismissedOn',
} as const;
