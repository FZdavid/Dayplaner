import { EMOJI_SUGGESTIONS } from '../defaults';

export function EmojiInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <input
          value={value}
          onChange={(e) => {
            // Beim Tippen ersetzt das neue Emoji das alte
            const graphemes = segment(e.target.value);
            onChange(graphemes.length > 1 ? graphemes[graphemes.length - 1] : graphemes[0] ?? '');
          }}
          aria-label="Emoji"
          className="size-14 rounded-xl bg-bg text-center text-[32px] outline-none"
        />
        <p className="text-[13px] text-muted">Emoji eintippen oder unten auswählen</p>
      </div>
      <div className="mt-3 grid grid-cols-8 gap-1">
        {EMOJI_SUGGESTIONS.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => onChange(e)}
            className={`rounded-lg py-1 text-[26px] ${value === e ? 'bg-accent/20' : 'active:bg-sep'}`}
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}

function segment(value: string): string[] {
  const trimmed = value.trim();
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
    return Array.from(seg.segment(trimmed), (s) => s.segment);
  }
  return Array.from(trimmed);
}
