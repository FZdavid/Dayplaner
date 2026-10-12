import type { ReactNode } from 'react';

/** Von unten einfahrendes Blatt (iOS Sheet). Tipp außerhalb schließt. */
export function Sheet({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end bg-black/40" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl bg-card p-4 pb-[max(env(safe-area-inset-bottom),1rem)]"
      >
        {children}
      </div>
    </div>
  );
}
