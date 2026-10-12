/** Tabellen, die zu keinem Modul gehören. */

export interface SettingRow {
  key: string;
  value: unknown;
  updatedAt: number;
}

export const CORE_TABLES = {
  settings: 'settings',
} as const;

export const coreStores = {
  [CORE_TABLES.settings]: 'key',
};
