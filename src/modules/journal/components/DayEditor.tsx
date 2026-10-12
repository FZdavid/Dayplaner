import { useRef, useState } from 'react';
import { setSetting, useSetting } from '../../../core/db/settings';
import { todayKey, type DateKey } from '../../../core/lib/date';
import { pickPromptForDay, setMood, useDay, useEntriesForDay, usePrompts } from '../repo';
import { JOURNAL_SETTINGS, type JournalPrompt } from '../schema';
import { ActivityGrid } from './ActivityGrid';
import { Composer, type ComposerHandle } from './Composer';
import { EntryCard } from './EntryCard';
import { MoodPicker } from './MoodPicker';
import { PromptCard } from './PromptCard';

/** Alles zu einem Tag: Schreibfeld (immer ganz oben), Frage, Stimmung, Aktivitäten, Einträge. */
export function DayEditor({ date, autoFocus }: { date: DateKey; autoFocus?: boolean }) {
  const day = useDay(date);
  const entries = useEntriesForDay(date);
  const prompts = usePrompts();
  const showPrompt = useSetting(JOURNAL_SETTINGS.showPrompt, true);
  const dismissedOn = useSetting<string | null>(JOURNAL_SETTINGS.promptDismissedOn, null);

  const [promptOffset, setPromptOffset] = useState(0);
  const [attached, setAttached] = useState<JournalPrompt | null>(null);
  const composer = useRef<ComposerHandle>(null);

  const isToday = date === todayKey();
  const answeredIds = new Set(entries?.map((e) => e.promptId).filter(Boolean));
  const dailyPrompt = prompts ? pickPromptForDay(date, prompts, promptOffset) : null;
  const promptVisible =
    isToday &&
    showPrompt === true &&
    dismissedOn !== undefined &&
    dismissedOn !== date &&
    dailyPrompt !== null &&
    !answeredIds.has(dailyPrompt.id) &&
    attached === null;

  return (
    <div className="space-y-4">
      <Composer
        key={date}
        ref={composer}
        date={date}
        autoFocus={autoFocus}
        prompt={attached}
        onClearPrompt={() => setAttached(null)}
      />

      {promptVisible && dailyPrompt && (
        <PromptCard
          prompt={dailyPrompt}
          canCycle={(prompts?.filter((p) => p.active).length ?? 0) > 1}
          onAnswer={() => {
            setAttached(dailyPrompt);
            composer.current?.focus();
          }}
          onNext={() => setPromptOffset((o) => o + 1)}
          onDismiss={() => setSetting(JOURNAL_SETTINGS.promptDismissedOn, date)}
        />
      )}

      <div className="rounded-xl bg-card p-3">
        <h2 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-muted">Stimmung</h2>
        {day && <MoodPicker value={day.mood} onChange={(m) => setMood(date, m)} />}
      </div>

      <div className="rounded-xl bg-card p-3">
        <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-muted">Aktivitäten</h2>
        {day && <ActivityGrid date={date} selected={day.activityIds} />}
      </div>

      {entries && entries.length > 0 && (
        <div className="space-y-2">
          <h2 className="px-1 text-[13px] font-semibold uppercase tracking-wide text-muted">
            {entries.length === 1 ? '1 Eintrag' : `${entries.length} Einträge`}
          </h2>
          {[...entries].reverse().map((e) => (
            <EntryCard key={e.id} entry={e} />
          ))}
        </div>
      )}
    </div>
  );
}
