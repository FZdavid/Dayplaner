import { XIcon } from '../../../core/components/icons';
import type { JournalPrompt } from '../schema';

/** Die geführte Frage des Tages – nie Pflicht, jederzeit wegklickbar. */
export function PromptCard({
  prompt,
  onAnswer,
  onNext,
  onDismiss,
  canCycle,
}: {
  prompt: JournalPrompt;
  onAnswer: () => void;
  onNext: () => void;
  onDismiss: () => void;
  canCycle: boolean;
}) {
  return (
    <div className="rounded-xl bg-card p-4">
      <div className="flex items-start gap-2">
        <span className="text-[13px] font-semibold uppercase tracking-wide text-muted">Frage des Tages</span>
        <button type="button" aria-label="Für heute ausblenden" onClick={onDismiss} className="ml-auto text-muted">
          <XIcon className="size-5" />
        </button>
      </div>
      <p className="mt-1 text-[19px] font-semibold leading-snug">{prompt.text}</p>
      <div className="mt-3 flex gap-4">
        <button type="button" onClick={onAnswer} className="text-[15px] font-semibold text-accent">
          Beantworten
        </button>
        {canCycle && (
          <button type="button" onClick={onNext} className="text-[15px] text-accent">
            Andere Frage
          </button>
        )}
      </div>
    </div>
  );
}
