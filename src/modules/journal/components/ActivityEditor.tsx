import { useState } from 'react';
import { Button } from '../../../core/components/ui';
import { Sheet } from '../../../core/components/Sheet';
import { EmojiInput } from './EmojiInput';

/** Formular zum Anlegen/Umbenennen einer Aktivität (als Bottom-Sheet). */
export function ActivityEditor({
  initial,
  title,
  onSave,
  onCancel,
  onDelete,
}: {
  initial?: { name: string; icon: string };
  title: string;
  onSave: (name: string, icon: string) => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [icon, setIcon] = useState(initial?.icon ?? '⭐');
  const valid = name.trim().length > 0 && icon.length > 0;

  return (
    <Sheet onClose={onCancel}>
      <div className="flex items-center justify-between">
        <button type="button" onClick={onCancel} className="text-[17px] text-accent">
          Abbrechen
        </button>
        <h2 className="text-[17px] font-semibold">{title}</h2>
        <button
          type="button"
          disabled={!valid}
          onClick={() => onSave(name, icon)}
          className="text-[17px] font-semibold text-accent disabled:opacity-40"
        >
          Fertig
        </button>
      </div>
      <form
        className="mt-5 space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) onSave(name, icon);
        }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name, z. B. Yoga"
          autoFocus
          maxLength={40}
          className="w-full rounded-xl bg-bg px-4 py-3 text-[17px] outline-none"
        />
        <EmojiInput value={icon} onChange={setIcon} />
        {onDelete && (
          <Button variant="plain" className="w-full !text-danger" onClick={onDelete}>
            Aktivität löschen
          </Button>
        )}
      </form>
    </Sheet>
  );
}
