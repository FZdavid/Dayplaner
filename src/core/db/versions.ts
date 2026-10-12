import { coreStores } from './coreSchema';
import { journalStores } from '../../modules/journal/schema';

/**
 * Alle Schema-Versionen der Datenbank.
 *
 * Neue Module (Gym, Essen …) bekommen eine NEUE Version, die nur ihre eigenen
 * Tabellen enthält. Dexie übernimmt alle Tabellen der früheren Versionen
 * automatisch – vorhandene Daten bleiben unangetastet.
 *
 * Beispiel Phase 2:
 *   { version: 2, stores: gymStores },
 */
export const DB_NAME = 'dayplaner';

export const DB_VERSIONS: { version: number; stores: Record<string, string | null> }[] = [
  { version: 1, stores: { ...coreStores, ...journalStores } },
];

export const CURRENT_DB_VERSION = DB_VERSIONS[DB_VERSIONS.length - 1].version;
