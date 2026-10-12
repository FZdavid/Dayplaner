import { MOODS, type Mood } from '../schema';

export function MoodPicker({ value, onChange }: { value: Mood | null; onChange: (mood: Mood | null) => void }) {
  return (
    <div className="flex justify-between gap-1" role="radiogroup" aria-label="Stimmung">
      {MOODS.map((m) => {
        const selected = value === m.value;
        return (
          <button
            key={m.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(selected ? null : m.value)}
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 transition ${
              selected ? `${moodBg(m.value)} scale-105` : value !== null ? 'opacity-40' : ''
            }`}
          >
            <span className="text-[34px] leading-none">{m.emoji}</span>
            <span className={`text-[11px] ${selected ? 'font-semibold' : 'text-muted'}`}>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Hintergrundfarbe je Stimmung (auch für den Kalender). */
export function moodBg(mood: Mood): string {
  return ['', 'bg-mood-1/25', 'bg-mood-2/25', 'bg-mood-3/25', 'bg-mood-4/25', 'bg-mood-5/25'][mood];
}

export function moodSolid(mood: Mood): string {
  return ['', 'bg-mood-1', 'bg-mood-2', 'bg-mood-3', 'bg-mood-4', 'bg-mood-5'][mood];
}

export function moodEmoji(mood: Mood | null): string | null {
  return mood ? MOODS[mood - 1].emoji : null;
}
