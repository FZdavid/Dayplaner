import { useState } from 'react';
import { PlusIcon } from '../../../core/components/icons';
import { addActivity, toggleActivity, useActivities } from '../repo';
import type { DateKey } from '../../../core/lib/date';
import { ActivityEditor } from './ActivityEditor';

/** Aktivitäten zum Antippen – wie in Daylio. */
export function ActivityGrid({ date, selected }: { date: DateKey; selected: string[] }) {
  const activities = useActivities();
  const [adding, setAdding] = useState(false);

  if (!activities) return null;

  return (
    <>
      <div className="grid grid-cols-4 gap-x-1 gap-y-3">
        {activities.map((a) => {
          const on = selected.includes(a.id);
          return (
            <button
              key={a.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggleActivity(date, a.id)}
              className="flex flex-col items-center gap-1"
            >
              <span
                className={`flex size-14 items-center justify-center rounded-full text-[28px] transition ${
                  on ? 'bg-accent ring-2 ring-accent ring-offset-2 ring-offset-card' : 'bg-bg'
                }`}
              >
                {a.icon}
              </span>
              <span className={`line-clamp-1 text-[12px] ${on ? 'font-semibold' : 'text-muted'}`}>{a.name}</span>
            </button>
          );
        })}
        <button type="button" onClick={() => setAdding(true)} className="flex flex-col items-center gap-1">
          <span className="flex size-14 items-center justify-center rounded-full border-2 border-dashed border-sep text-muted">
            <PlusIcon />
          </span>
          <span className="text-[12px] text-muted">Neu</span>
        </button>
      </div>
      {adding && (
        <ActivityEditor
          title="Neue Aktivität"
          onCancel={() => setAdding(false)}
          onSave={async (name, icon) => {
            const id = await addActivity(name, icon);
            await toggleActivity(date, id);
            setAdding(false);
          }}
        />
      )}
    </>
  );
}
