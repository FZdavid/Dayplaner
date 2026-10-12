import Dexie from 'dexie';
import { DB_NAME, DB_VERSIONS } from './versions';

/**
 * Die eine Datenbank der App. Module greifen über `db.table<T>(name)` in ihrer
 * eigenen `repo.ts` auf ihre Tabellen zu – der Kern kennt ihre Typen nicht.
 */
export const db = new Dexie(DB_NAME);

for (const { version, stores } of DB_VERSIONS) {
  db.version(version).stores(stores);
}

/** Bittet den Browser, die Daten nicht automatisch zu löschen (Safari/iOS). */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (!navigator.storage?.persist) return false;
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

export async function isStoragePersisted(): Promise<boolean> {
  try {
    return (await navigator.storage?.persisted?.()) ?? false;
  } catch {
    return false;
  }
}
