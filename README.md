# Dayplaner

Persönliche Lifestyle-App als PWA, gedacht für das iPhone („Zum Home-Bildschirm“).
Kein Server, kein Login: alle Daten liegen lokal in IndexedDB (Dexie).

**Stack:** Vite · React · TypeScript · Tailwind CSS v4 · Dexie.js · vite-plugin-pwa

## Entwicklung

```bash
npm install
npm run dev        # Entwicklungsserver
npm run build      # Typecheck + Produktions-Build nach dist/
npm run preview    # Build lokal ansehen (inkl. Service Worker)
```

## Deployment (Cloudflare Pages)

- Build-Befehl: `npm run build`
- Ausgabeordner: `dist`

Cloudflare Pages liefert bei unbekannten Pfaden automatisch `index.html` aus (SPA), offline übernimmt das der Service Worker.

## Aufbau

```
src/
  core/            Kern: Datenbank, Backup, Modul-Registry, UI-Bausteine, Einstellungen
  modules/
    journal/       Phase 1 – Journal
    gym/           Phase 2 (Platzhalter)
    food/          Phase 3 (Platzhalter)
    stats/         Statistik (Platzhalter)
```

### Neues Modul hinzufügen

1. Ordner `src/modules/<name>/` mit `schema.ts` (Tabellen mit Präfix `<name>_`), `repo.ts` und `index.ts(x)` (exportiert ein `AppModule`).
2. In `src/core/db/versions.ts` eine **neue** Version anhängen, z. B. `{ version: 2, stores: gymStores }`. Bestehende Versionen nie ändern.
3. Das Modul in `src/core/modules.ts` eintragen bzw. den Platzhalter ersetzen.

Tab-Leiste, Routen, Einstellungsseite und Export/Import übernehmen das neue Modul automatisch.

## Datensicherung

Einstellungen → „Daten exportieren“ erstellt eine JSON-Datei mit allen Tabellen; auf dem iPhone öffnet sich das Teilen-Menü („In Dateien sichern“).
Beim Import gibt es zwei Optionen: **Zusammenführen** (bei gleichen IDs gewinnt der neuere `updatedAt`, nichts wird gelöscht) und **Alles ersetzen** (die Tabellen aus der Datei werden vorher geleert).

Die Icons in `public/icons` erzeugt `python3 scripts/make-icons.py` (benötigt Pillow).
