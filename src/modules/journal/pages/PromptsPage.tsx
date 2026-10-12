import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, TrashIcon } from '../../../core/components/icons';
import { PageHeader, Section, Toggle } from '../../../core/components/ui';
import { addPrompt, deletePrompt, movePrompt, updatePrompt, usePrompts } from '../repo';
import type { JournalPrompt } from '../schema';

/** Fragen des Tages verwalten. */
export function PromptsPage() {
  const prompts = usePrompts();
  const [draft, setDraft] = useState('');

  return (
    <>
      <PageHeader title="Fragen" back={{ to: '/settings', label: 'Einstellungen' }} showSettings={false} />
      <div className="px-4 pb-6">
        <Section footer="Jeden Tag wird eine der aktiven Fragen vorgeschlagen. Ausgeschaltete Fragen werden übersprungen.">
          {prompts?.map((p, i) => (
            <PromptRow key={p.id} prompt={p} first={i === 0} last={i === prompts.length - 1} />
          ))}
        </Section>
        <Section title="Neue Frage">
          <form
            className="flex items-center gap-2 px-4 py-2"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!draft.trim()) return;
              await addPrompt(draft);
              setDraft('');
            }}
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="z. B. Was möchtest du loslassen?"
              className="flex-1 bg-transparent py-1.5 text-[17px] outline-none placeholder:text-muted"
            />
            <button type="submit" disabled={!draft.trim()} className="text-[17px] font-semibold text-accent disabled:opacity-40">
              Hinzufügen
            </button>
          </form>
        </Section>
      </div>
    </>
  );
}

function PromptRow({ prompt, first, last }: { prompt: JournalPrompt; first: boolean; last: boolean }) {
  const [text, setText] = useState(prompt.text);
  const save = () => {
    if (text.trim() && text.trim() !== prompt.text) updatePrompt(prompt.id, { text });
    else setText(prompt.text);
  };
  return (
    <div className="border-b border-sep px-4 py-2 last:border-b-0">
      <textarea
        value={text}
        rows={2}
        onChange={(e) => setText(e.target.value)}
        onBlur={save}
        className={`block w-full resize-none bg-transparent text-[17px] outline-none ${prompt.active ? '' : 'text-muted'}`}
      />
      <div className="mt-1 flex items-center gap-2">
        <Toggle label="Aktiv" checked={prompt.active} onChange={(active) => updatePrompt(prompt.id, { active })} />
        <span className="ml-auto" />
        <button type="button" aria-label="Nach oben" disabled={first} onClick={() => movePrompt(prompt.id, -1)} className="p-1 text-accent disabled:opacity-20">
          <ChevronUpIcon className="size-5" />
        </button>
        <button type="button" aria-label="Nach unten" disabled={last} onClick={() => movePrompt(prompt.id, 1)} className="p-1 text-accent disabled:opacity-20">
          <ChevronDownIcon className="size-5" />
        </button>
        <button
          type="button"
          aria-label="Frage löschen"
          onClick={() => confirm('Diese Frage löschen?') && deletePrompt(prompt.id)}
          className="p-1 text-danger"
        >
          <TrashIcon className="size-5" />
        </button>
      </div>
    </div>
  );
}
