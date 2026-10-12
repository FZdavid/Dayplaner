import type { Table } from 'dexie';
import { db } from './db';
import { CURRENT_DB_VERSION } from './versions';
import { setSetting, SETTING_KEYS } from './settings';

/**
 * Export/Import aller Daten. Arbeitet generisch über alle Tabellen der
 * Datenbank – neue Module sind automatisch im Backup enthalten.
 */

export const BACKUP_APP_ID = 'dayplaner';
export const BACKUP_FORMAT_VERSION = 1;

export interface BackupFile {
  app: typeof BACKUP_APP_ID;
  formatVersion: number;
  dbVersion: number;
  exportedAt: string;
  tables: Record<string, Record<string, unknown>[]>;
}

export type ImportMode = 'merge' | 'replace';

export interface ImportResult {
  tables: { name: string; imported: number; skipped: number }[];
  ignoredTables: string[];
}

export class BackupError extends Error {}

export async function createBackup(): Promise<BackupFile> {
  const tables: BackupFile['tables'] = {};
  await db.transaction('r', db.tables, async () => {
    for (const table of db.tables) {
      tables[table.name] = await table.toArray();
    }
  });
  return {
    app: BACKUP_APP_ID,
    formatVersion: BACKUP_FORMAT_VERSION,
    dbVersion: CURRENT_DB_VERSION,
    exportedAt: new Date().toISOString(),
    tables,
  };
}

export function backupFileName(date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `dayplaner-backup-${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}.json`;
}

export interface PreparedBackup {
  name: string;
  blob: Blob;
  file: File;
}

export async function prepareBackup(): Promise<PreparedBackup> {
  const backup = await createBackup();
  const name = backupFileName();
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  return { name, blob, file: new File([blob], name, { type: 'application/json' }) };
}

export type DeliverResult = 'shared' | 'downloaded' | 'cancelled' | 'needs-gesture';

/**
 * Gibt eine vorbereitete Sicherung weiter: auf dem iPhone über das Teilen-Menü
 * („In Dateien sichern“), sonst als normaler Download.
 * `needs-gesture`: Safari verlangt einen frischen Tipp – dann erneut aufrufen.
 */
export async function deliverBackup(prepared: PreparedBackup): Promise<DeliverResult> {
  const { file, blob, name } = prepared;
  let result: DeliverResult;
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: name });
      result = 'shared';
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled';
      if (err instanceof DOMException && err.name === 'NotAllowedError') return 'needs-gesture';
      downloadBlob(blob, name);
      result = 'downloaded';
    }
  } else {
    downloadBlob(blob, name);
    result = 'downloaded';
  }
  await setSetting(SETTING_KEYS.lastBackupAt, Date.now());
  return result;
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** Prüft eine eingelesene Datei und gibt sie typisiert zurück. */
export function parseBackup(text: string): BackupFile {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new BackupError('Die Datei ist kein gültiges JSON.');
  }
  if (!isRecord(data) || data.app !== BACKUP_APP_ID || !isRecord(data.tables)) {
    throw new BackupError('Das ist keine Dayplaner-Sicherung.');
  }
  if (typeof data.formatVersion !== 'number' || data.formatVersion > BACKUP_FORMAT_VERSION) {
    throw new BackupError('Die Sicherung stammt aus einer neueren App-Version. Bitte zuerst die App aktualisieren.');
  }
  if (typeof data.dbVersion === 'number' && data.dbVersion > CURRENT_DB_VERSION) {
    throw new BackupError('Die Sicherung stammt aus einer neueren App-Version. Bitte zuerst die App aktualisieren.');
  }
  for (const [name, rows] of Object.entries(data.tables)) {
    if (!Array.isArray(rows) || !rows.every(isRecord)) {
      throw new BackupError(`Tabelle „${name}“ in der Sicherung ist beschädigt.`);
    }
  }
  return data as unknown as BackupFile;
}

/**
 * Spielt eine Sicherung ein.
 * - `merge`: Datensätze werden über ihren Schlüssel abgeglichen; bei Konflikten
 *   gewinnt der neuere `updatedAt`. Nichts wird gelöscht.
 * - `replace`: Jede Tabelle, die in der Datei vorkommt, wird vorher geleert.
 * Tabellen, die die Datei nicht enthält, bleiben in beiden Fällen unverändert.
 */
export async function importBackup(backup: BackupFile, mode: ImportMode): Promise<ImportResult> {
  const known = new Map(db.tables.map((t) => [t.name, t] as const));
  const entries = Object.entries(backup.tables).filter(([name]) => known.has(name));
  const ignoredTables = Object.keys(backup.tables).filter((name) => !known.has(name));
  const targets = entries.map(([name]) => known.get(name)!);
  const result: ImportResult = { tables: [], ignoredTables };

  await db.transaction('rw', targets, async () => {
    for (const [name, rows] of entries) {
      const table = known.get(name)!;
      const keyPath = table.schema.primKey.keyPath;
      if (typeof keyPath !== 'string') throw new BackupError(`Tabelle „${name}“ kann nicht importiert werden.`);
      const valid = rows.filter((row) => row[keyPath] !== undefined && row[keyPath] !== null);
      const skippedInvalid = rows.length - valid.length;

      if (mode === 'replace') {
        await table.clear();
        await table.bulkPut(valid);
        result.tables.push({ name, imported: valid.length, skipped: skippedInvalid });
      } else {
        const { imported, skipped } = await mergeRows(table, keyPath, valid);
        result.tables.push({ name, imported, skipped: skipped + skippedInvalid });
      }
    }
  });
  return result;
}

async function mergeRows(table: Table, keyPath: string, rows: Record<string, unknown>[]) {
  const existing = await table.bulkGet(rows.map((r) => r[keyPath] as never));
  const toPut: Record<string, unknown>[] = [];
  rows.forEach((row, i) => {
    const current = existing[i] as Record<string, unknown> | undefined;
    if (!current || updatedAt(row) >= updatedAt(current)) toPut.push(row);
  });
  await table.bulkPut(toPut);
  return { imported: toPut.length, skipped: rows.length - toPut.length };
}

function updatedAt(row: Record<string, unknown>): number {
  return typeof row.updatedAt === 'number' ? row.updatedAt : 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
