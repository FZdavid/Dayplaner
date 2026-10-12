import type { ComponentType } from 'react';

/**
 * Vertrag zwischen einem Modul und dem App-Kern.
 * Jedes Modul exportiert in seiner `index.ts` genau ein `AppModule`.
 */
export interface AppModule {
  /** Eindeutige ID, gleichzeitig Präfix der Tabellen (`journal_…`). */
  id: string;
  /** Beschriftung in der Tab-Leiste. */
  label: string;
  /** Icon in der Tab-Leiste. */
  icon: ComponentType<{ className?: string }>;
  /** Basis-Pfad, z. B. `/journal`. Das Modul bekommt alle Unterpfade (`/journal/*`). */
  path: string;
  /** Wurzel-Komponente des Moduls; sie definiert ihre Unterseiten selbst. */
  Root: ComponentType;
  /** Optionaler Abschnitt auf der Einstellungsseite. */
  SettingsSection?: ComponentType;
  /** Wird bei jedem App-Start aufgerufen und muss idempotent sein (Startdaten anlegen). */
  seed?: () => Promise<void>;
}
