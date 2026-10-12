import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import { CORE_TABLES, type SettingRow } from './coreSchema';

const settings = () => db.table<SettingRow, string>(CORE_TABLES.settings);

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const row = await settings().get(key);
  return row === undefined ? fallback : (row.value as T);
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  await settings().put({ key, value, updatedAt: Date.now() });
}

/** Reaktiver Wert aus der Settings-Tabelle. `undefined`, solange noch geladen wird. */
export function useSetting<T>(key: string, fallback: T): T | undefined {
  return useLiveQuery(async () => {
    const row = await settings().get(key);
    return row === undefined ? fallback : (row.value as T);
  }, [key]);
}

export const SETTING_KEYS = {
  lastBackupAt: 'core.lastBackupAt',
} as const;
