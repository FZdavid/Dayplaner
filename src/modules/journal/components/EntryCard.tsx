import { useState } from 'react';
import { formatTime } from '../../../core/lib/date';
import { deleteEntry, updateEntryText } from '../repo';
import type { JournalEntry } from '../schema';

/** Ein gespeicherter Eintrag; antippen zum Bearbeiten. */
export function EntryCard({ entry, highlight }: { entry: JournalEntry; highlight?: string }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(entry.text);

  if (editing) {
    return (
      <div className="rounded-xl bg-card p-3">
        {entry.promptText && <p className="mb-1 text-[15px] font-semibold text-muted">{entry.promptText}</p>}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
          rows={Math.min(12, Math.max(3, text.split('\n').length + 1))}
          className="block w-full resize-none rounded-lg bg-bg p-2 text-[17px] leading-relaxed outline-none"
        />
        <div className="mt-2 flex items-center gap-4">
          <button
            type="button"
            className="text-[15px] text-danger"
            onClick={async () => {
              if (confirm('Eintrag wirklich löschen?')) await deleteEntry(entry.id);
            }}
          >
            Löschen
          </button>
          <button
            type="button"
            className="ml-auto text-[15px] text-accent"
            onClick={() => {
              setText(entry.text);
              setEditing(false);
            }}
          >
            Abbrechen
          </button>
          <button
            type="button"
            disabled={!text.trim()}
            className="text-[15px] font-semibold text-accent disabled:opacity-40"
            onClick={async () => {
              await updateEntryText(entry.id, text);
              setEditing(false);
            }}
          >
            Sichern
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setText(entry.text);
        setEditing(true);
      }}
      className="block w-full rounded-xl bg-card p-3 text-left active:opacity-70"
    >
      {entry.promptText && (
        <p className="mb-1 text-[15px] font-semibold text-muted">
          <Highlight text={entry.promptText} query={highlight} />
        </p>
      )}
      <p className="whitespace-pre-wrap break-words text-[17px] leading-relaxed">
        <Highlight text={entry.text} query={highlight} />
      </p>
      <p className="mt-1 text-[13px] text-muted">{formatTime(entry.createdAt)}</p>
    </button>
  );
}

export function Highlight({ text, query }: { text: string; query?: string }) {
  const q = query?.trim();
  if (!q) return <>{text}</>;
  const lower = text.toLocaleLowerCase('de');
  const needle = q.toLocaleLowerCase('de');
  const parts: React.ReactNode[] = [];
  let pos = 0;
  let idx = lower.indexOf(needle);
  while (idx !== -1) {
    if (idx > pos) parts.push(text.slice(pos, idx));
    parts.push(
      <mark key={idx} className="rounded bg-yellow-300/60 text-inherit">
        {text.slice(idx, idx + needle.length)}
      </mark>,
    );
    pos = idx + needle.length;
    idx = lower.indexOf(needle, pos);
  }
  if (pos < text.length) parts.push(text.slice(pos));
  return <>{parts}</>;
}
