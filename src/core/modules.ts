import { journalModule } from '../modules/journal';
import { gymModule } from '../modules/gym';
import { foodModule } from '../modules/food';
import { statsModule } from '../modules/stats';
import type { AppModule } from './types';

/**
 * Modul-Registry: Reihenfolge = Reihenfolge in der Tab-Leiste.
 * Ein neues Modul wird hier eingetragen – Tabs, Routen, Einstellungen und
 * Startdaten ergeben sich daraus automatisch.
 */
export const MODULES: AppModule[] = [journalModule, gymModule, foodModule, statsModule];

/** Legt beim Start fehlende Startdaten aller Module an. */
export async function seedModules(): Promise<void> {
  for (const m of MODULES) await m.seed?.();
}
