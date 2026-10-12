import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '../../../core/components/icons';
import { formatMonth, toDateKey, todayKey } from '../../../core/lib/date';
import { useDaysInRange, useEntryDatesInRange } from '../repo';
import { moodEmoji, moodSolid } from './MoodPicker';

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

/** Monatskalender: Farbe = Stimmung, Punkt = Texteintrag vorhanden. */
export function CalendarView() {
  const now = new Date();
  const [month, setMonth] = useState({ year: now.getFullYear(), month: now.getMonth() });

  const first = new Date(month.year, month.month, 1);
  const daysInMonth = new Date(month.year, month.month + 1, 0).getDate();
  const from = toDateKey(first);
  const to = toDateKey(new Date(month.year, month.month, daysInMonth));
  const days = useDaysInRange(from, to);
  const entryDates = useEntryDatesInRange(from, to);
  const byDate = new Map(days?.map((d) => [d.date, d]));
  const today = todayKey();

  // Montag = 0
  const leading = (first.getDay() + 6) % 7;
  const cells: (string | null)[] = [
    ...Array<null>(leading).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => toDateKey(new Date(month.year, month.month, i + 1))),
  ];

  const shift = (delta: number) =>
    setMonth(({ year, month: m }) => {
      const d = new Date(year, m + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  return (
    <div className="rounded-xl bg-card p-3">
      <div className="mb-3 flex items-center justify-between">
        <button type="button" aria-label="Vorheriger Monat" onClick={() => shift(-1)} className="p-1 text-accent">
          <ChevronLeftIcon />
        </button>
        <h2 className="text-[17px] font-semibold">{formatMonth(month.year, month.month)}</h2>
        <button type="button" aria-label="Nächster Monat" onClick={() => shift(1)} className="p-1 text-accent">
          <ChevronRightIcon />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((w) => (
          <div key={w} className="pb-1 text-[11px] font-semibold text-muted">
            {w}
          </div>
        ))}
        {cells.map((date, i) => {
          if (!date) return <div key={`e${i}`} />;
          const day = byDate.get(date);
          const hasEntry = entryDates?.has(date) ?? false;
          const isFuture = date > today;
          return (
            <Link
              key={date}
              to={isFuture ? '#' : `/journal/day/${date}`}
              aria-disabled={isFuture}
              onClick={(e) => isFuture && e.preventDefault()}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-lg text-[15px] ${
                day?.mood ? `${moodSolid(day.mood)} text-white` : isFuture ? 'text-muted/50' : 'bg-bg'
              } ${date === today ? 'ring-2 ring-accent' : ''}`}
            >
              {day?.mood ? (
                <span className="text-[20px] leading-none">{moodEmoji(day.mood)}</span>
              ) : (
                <span>{Number(date.slice(8))}</span>
              )}
              {hasEntry && (
                <span
                  className={`absolute bottom-1 size-1.5 rounded-full ${day?.mood ? 'bg-white' : 'bg-accent'}`}
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
