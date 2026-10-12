import { useDeferredValue, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SearchIcon, XIcon } from '../../../core/components/icons';
import { EmptyState, PageHeader, SegmentedControl } from '../../../core/components/ui';
import { formatDayRelative, type DateKey } from '../../../core/lib/date';
import { CalendarView } from '../components/CalendarView';
import { EntryCard } from '../components/EntryCard';
import { JournalNav } from '../components/JournalNav';
import { moodEmoji } from '../components/MoodPicker';
import { useActivities, useAllDays, useAllEntries } from '../repo';
import type { JournalActivity, JournalDay, JournalEntry } from '../schema';

type View = 'list' | 'calendar';
const PAGE_SIZE = 30;

interface DayGroup {
  date: DateKey;
  day?: JournalDay;
  entries: JournalEntry[];
}

const VIEW_KEY = 'journal.historyView';

function readView(): View {
  try {
    return localStorage.getItem(VIEW_KEY) === 'calendar' ? 'calendar' : 'list';
  } catch {
    return 'list';
  }
}

export function HistoryPage() {
  const [view, setViewState] = useState<View>(readView);
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const searching = deferredQuery.trim().length > 0;

  const setView = (v: View) => {
    setViewState(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {
      // egal
    }
  };

  return (
    <>
      <PageHeader title="Verlauf" />
      <JournalNav />
      <div className="space-y-3 px-4 pt-3">
        <label className="flex items-center gap-2 rounded-[10px] bg-sep/70 px-2.5 py-2">
          <SearchIcon className="size-5 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Suchen"
            className="flex-1 bg-transparent text-[17px] outline-none placeholder:text-muted"
          />
          {query && (
            <button type="button" aria-label="Suche löschen" onClick={() => setQuery('')} className="text-muted">
              <XIcon className="size-5" />
            </button>
          )}
        </label>
        {!searching && (
          <SegmentedControl
            value={view}
            onChange={setView}
            options={[
              { value: 'list', label: 'Liste' },
              { value: 'calendar', label: 'Kalender' },
            ]}
          />
        )}
        {searching || view === 'list' ? <DayList query={deferredQuery} /> : <CalendarView />}
      </div>
    </>
  );
}

function DayList({ query }: { query: string }) {
  const entries = useAllEntries();
  const days = useAllDays();
  const activities = useActivities();
  const [limit, setLimit] = useState(PAGE_SIZE);

  const activityMap = useMemo(() => new Map(activities?.map((a) => [a.id, a])), [activities]);

  const groups = useMemo(() => {
    if (!entries || !days) return null;
    const map = new Map<DateKey, DayGroup>();
    const group = (date: DateKey) => {
      let g = map.get(date);
      if (!g) map.set(date, (g = { date, entries: [] }));
      return g;
    };
    for (const d of days) group(d.date).day = d;
    for (const e of entries) group(e.date).entries.push(e);
    let list = [...map.values()].sort((a, b) => (a.date < b.date ? 1 : -1));
    for (const g of list) g.entries.sort((a, b) => b.createdAt - a.createdAt);

    const q = query.trim().toLocaleLowerCase('de');
    if (q) {
      const has = (text: string | null) => text?.toLocaleLowerCase('de').includes(q) ?? false;
      list = list.flatMap((g) => {
        // Passt eine Aktivität des Tages, bleibt der ganze Tag sichtbar.
        if ((g.day?.activityIds ?? []).some((id) => has(activityMap.get(id)?.name ?? null))) return [g];
        const matching = g.entries.filter((e) => has(e.text) || has(e.promptText));
        return matching.length > 0 ? [{ ...g, entries: matching }] : [];
      });
    }
    return list;
  }, [entries, days, query, activityMap]);

  if (!groups) return null;

  if (groups.length === 0) {
    return query.trim() ? (
      <EmptyState icon="🔍" title="Nichts gefunden" text={`Keine Einträge zu „${query.trim()}“.`} />
    ) : (
      <EmptyState icon="📓" title="Noch keine Einträge" text="Unter „Heute“ kannst du gleich losschreiben." />
    );
  }

  return (
    <div className="space-y-5 pb-4">
      {query.trim() && (
        <p className="px-1 text-[13px] text-muted">
          {groups.length === 1 ? '1 Tag gefunden' : `${groups.length} Tage gefunden`}
        </p>
      )}
      {groups.slice(0, limit).map((g) => (
        <DayGroupView key={g.date} group={g} activityMap={activityMap} query={query} />
      ))}
      {groups.length > limit && (
        <button
          type="button"
          onClick={() => setLimit((l) => l + PAGE_SIZE)}
          className="w-full rounded-xl bg-card py-3 text-[17px] text-accent"
        >
          Ältere Tage anzeigen
        </button>
      )}
    </div>
  );
}

function DayGroupView({
  group,
  activityMap,
  query,
}: {
  group: DayGroup;
  activityMap: Map<string, JournalActivity>;
  query: string;
}) {
  const acts = (group.day?.activityIds ?? []).map((id) => activityMap.get(id)).filter((a) => a !== undefined);
  const mood = moodEmoji(group.day?.mood ?? null);
  return (
    <section>
      <Link to={`/journal/day/${group.date}`} className="flex items-center gap-2 px-1 pb-1.5 active:opacity-60">
        {mood && <span className="text-[22px]">{mood}</span>}
        <h2 className="text-[15px] font-semibold">{formatDayRelative(group.date)}</h2>
        <span className="ml-auto text-[13px] text-accent">Öffnen</span>
      </Link>
      {acts.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5 px-1">
          {acts.map((a) => (
            <span key={a.id} className="rounded-full bg-card px-2.5 py-0.5 text-[13px]">
              {a.icon} {a.name}
            </span>
          ))}
        </div>
      )}
      <div className="space-y-2">
        {group.entries.map((e) => (
          <EntryCard key={e.id} entry={e} highlight={query} />
        ))}
      </div>
    </section>
  );
}
