import type { JournalActivity, JournalPrompt } from './schema';

/**
 * Startdaten beim ersten Öffnen. Die IDs sind fest vergeben, damit ein
 * zurückgespieltes Backup sie wiedererkennt statt sie zu verdoppeln.
 * `updatedAt: 0` sorgt dafür, dass beim Zusammenführen die eigene Version gewinnt.
 */
const activity = (id: string, icon: string, name: string, order: number): JournalActivity => ({
  id: `default-${id}`,
  icon,
  name,
  order,
  createdAt: 0,
  updatedAt: 0,
});

export const DEFAULT_ACTIVITIES: JournalActivity[] = [
  activity('sport', '🏃', 'Sport', 0),
  activity('friends', '👯', 'Freunde', 1),
  activity('family', '👨‍👩‍👧', 'Familie', 2),
  activity('work', '💼', 'Arbeit', 3),
  activity('reading', '📖', 'Lesen', 4),
  activity('nature', '🌳', 'Natur', 5),
  activity('cooking', '🍳', 'Kochen', 6),
  activity('sleep', '😴', 'Gut geschlafen', 7),
  activity('gaming', '🎮', 'Gaming', 8),
  activity('relax', '🛋️', 'Entspannen', 9),
];

const prompt = (id: string, text: string, order: number): JournalPrompt => ({
  id: `default-${id}`,
  text,
  active: true,
  order,
  updatedAt: 0,
});

export const DEFAULT_PROMPTS: JournalPrompt[] = [
  prompt('busy', 'Was hat dich heute beschäftigt?', 0),
  prompt('grateful', 'Wofür bist du heute dankbar?', 1),
  prompt('best', 'Was war der schönste Moment des Tages?', 2),
  prompt('learned', 'Was hast du heute gelernt?', 3),
  prompt('energy', 'Was hat dir heute Energie gegeben – und was hat sie dir geraubt?', 4),
  prompt('tomorrow', 'Worauf freust du dich morgen?', 5),
  prompt('proud', 'Worauf bist du heute stolz?', 6),
];

/** Vorschläge im Emoji-Picker für eigene Aktivitäten. */
export const EMOJI_SUGGESTIONS = [
  '🏃', '🏋️', '🚴', '🧘', '🏊', '⚽', '🎾', '🥾',
  '👯', '👨‍👩‍👧', '❤️', '🎉', '☕', '🍻', '🍕', '🍳',
  '💼', '💻', '📚', '📖', '✍️', '🎨', '🎸', '🎮',
  '🌳', '☀️', '🌧️', '✈️', '🚗', '🛒', '🧹', '🛋️',
  '😴', '🎬', '📺', '🎧', '🐶', '💊', '🤒', '🧠',
];
