import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { XIcon } from '../../../core/components/icons';
import type { DateKey } from '../../../core/lib/date';
import { addEntry } from '../repo';
import type { JournalPrompt } from '../schema';

export interface ComposerHandle {
  focus: () => void;
}

const draftKey = (date: DateKey) => `journal.draft.${date}`;

function readDraft(date: DateKey): string {
  try {
    return localStorage.getItem(draftKey(date)) ?? '';
  } catch {
    return '';
  }
}

function writeDraft(date: DateKey, text: string) {
  try {
    if (text) localStorage.setItem(draftKey(date), text);
    else localStorage.removeItem(draftKey(date));
  } catch {
    // Entwurf ist nur Komfort – ohne Speicher geht es auch.
  }
}

/** Das Schreibfeld (mit `key={date}` einbinden). Ein Entwurf wird lokal gemerkt, falls die App zwischendurch geschlossen wird. */
export const Composer = forwardRef<
  ComposerHandle,
  {
    date: DateKey;
    autoFocus?: boolean;
    prompt: JournalPrompt | null;
    onClearPrompt: () => void;
    placeholder?: string;
  }
>(function Composer({ date, autoFocus, prompt, onClearPrompt, placeholder }, ref) {
  const [text, setText] = useState(() => readDraft(date));
  const [saved, setSaved] = useState(false);
  const area = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({ focus: () => area.current?.focus() }), []);

  useEffect(() => writeDraft(date, text), [date, text]);

  // Höhe automatisch an den Text anpassen
  useEffect(() => {
    const el = area.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, 120)}px`;
  }, [text]);

  const canSave = text.trim().length > 0;

  async function save() {
    if (!canSave) return;
    await addEntry({ date, text, prompt });
    setText('');
    onClearPrompt();
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="rounded-xl bg-card p-3">
      {prompt && (
        <div className="mb-2 flex items-start gap-2 rounded-lg bg-accent/10 px-3 py-2 text-[15px] text-accent">
          <span className="flex-1">{prompt.text}</span>
          <button type="button" aria-label="Frage entfernen" onClick={onClearPrompt}>
            <XIcon className="size-5" />
          </button>
        </div>
      )}
      <textarea
        ref={area}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) save();
        }}
        autoFocus={autoFocus}
        placeholder={placeholder ?? 'Was ist los? Einfach losschreiben …'}
        className="block w-full resize-none bg-transparent text-[17px] leading-relaxed outline-none placeholder:text-muted"
      />
      <div className="mt-2 flex items-center justify-end gap-3">
        {saved && <span className="text-[15px] text-success">✓ Gespeichert</span>}
        <button
          type="button"
          onClick={save}
          disabled={!canSave}
          className="rounded-full bg-accent px-5 py-2 text-[15px] font-semibold text-white active:opacity-60 disabled:opacity-30"
        >
          Speichern
        </button>
      </div>
    </div>
  );
});
