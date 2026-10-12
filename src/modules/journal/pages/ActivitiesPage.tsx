import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, PlusIcon } from '../../../core/components/icons';
import { EmptyState, PageHeader, Section } from '../../../core/components/ui';
import { ActivityEditor } from '../components/ActivityEditor';
import {
  addActivity,
  countDaysWithActivity,
  deleteActivity,
  moveActivity,
  updateActivity,
  useActivities,
} from '../repo';
import type { JournalActivity } from '../schema';

/** Aktivitäten anlegen, umbenennen, sortieren und löschen. */
export function ActivitiesPage() {
  const activities = useActivities();
  const [editing, setEditing] = useState<JournalActivity | 'new' | null>(null);

  async function remove(a: JournalActivity) {
    const used = await countDaysWithActivity(a.id);
    const hint = used > 0 ? `\n\nSie ist an ${used} ${used === 1 ? 'Tag' : 'Tagen'} markiert und wird dort entfernt.` : '';
    if (confirm(`„${a.name}“ löschen?${hint}`)) {
      await deleteActivity(a.id);
      setEditing(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Aktivitäten"
        back={{ to: '/settings', label: 'Einstellungen' }}
        showSettings={false}
        right={
          <button type="button" aria-label="Aktivität hinzufügen" onClick={() => setEditing('new')} className="text-accent">
            <PlusIcon className="size-7" />
          </button>
        }
      />
      <div className="px-4">
        {activities && activities.length === 0 ? (
          <EmptyState icon="🏷️" title="Keine Aktivitäten" text="Tippe auf + um eine anzulegen." />
        ) : (
          <Section footer="Antippen zum Bearbeiten. Mit den Pfeilen änderst du die Reihenfolge.">
            {activities?.map((a, i) => (
              <div key={a.id} className="flex min-h-11 items-center gap-3 border-b border-sep px-4 py-1.5 last:border-b-0">
                <button type="button" onClick={() => setEditing(a)} className="flex flex-1 items-center gap-3 text-left">
                  <span className="text-[26px]">{a.icon}</span>
                  <span className="text-[17px]">{a.name}</span>
                </button>
                <button
                  type="button"
                  aria-label="Nach oben"
                  disabled={i === 0}
                  onClick={() => moveActivity(a.id, -1)}
                  className="p-1 text-accent disabled:opacity-20"
                >
                  <ChevronUpIcon className="size-5" />
                </button>
                <button
                  type="button"
                  aria-label="Nach unten"
                  disabled={i === activities.length - 1}
                  onClick={() => moveActivity(a.id, 1)}
                  className="p-1 text-accent disabled:opacity-20"
                >
                  <ChevronDownIcon className="size-5" />
                </button>
              </div>
            ))}
          </Section>
        )}
      </div>
      {editing === 'new' && (
        <ActivityEditor
          title="Neue Aktivität"
          onCancel={() => setEditing(null)}
          onSave={async (name, icon) => {
            await addActivity(name, icon);
            setEditing(null);
          }}
        />
      )}
      {editing && editing !== 'new' && (
        <ActivityEditor
          title="Bearbeiten"
          initial={editing}
          onCancel={() => setEditing(null)}
          onDelete={() => remove(editing)}
          onSave={async (name, icon) => {
            await updateActivity(editing.id, { name, icon });
            setEditing(null);
          }}
        />
      )}
    </>
  );
}
