import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BackupError,
  deliverBackup,
  importBackup,
  parseBackup,
  prepareBackup,
  type BackupFile,
  type ImportMode,
  type PreparedBackup,
} from '../db/backup';
import { isStoragePersisted, requestPersistentStorage } from '../db/db';
import { SETTING_KEYS, useSetting } from '../db/settings';
import { formatDateTime } from '../lib/date';
import { MODULES } from '../modules';
import { Button, PageHeader, Row, Section } from '../components/ui';
import { Sheet } from '../components/Sheet';

export function SettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  // Direkt geöffnet (kein Verlauf) → zurück zum Journal
  const close = () => (location.key === 'default' ? navigate('/journal') : navigate(-1));
  return (
    <>
      <PageHeader
        title="Einstellungen"
        showSettings={false}
        right={
          <button type="button" onClick={close} className="text-[17px] font-semibold text-accent">
            Fertig
          </button>
        }
      />
      <div className="px-4 pb-8">
        {MODULES.map((m) => (m.SettingsSection ? <m.SettingsSection key={m.id} /> : null))}
        <BackupSection />
        <StorageSection />
      </div>
    </>
  );
}

function BackupSection() {
  const lastBackupAt = useSetting<number | null>(SETTING_KEYS.lastBackupAt, null);
  const [status, setStatus] = useState<string | null>(null);
  const [pendingShare, setPendingShare] = useState<PreparedBackup | null>(null);
  const [pendingImport, setPendingImport] = useState<{ name: string; backup: BackupFile } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function deliver(prepared: PreparedBackup) {
    const result = await deliverBackup(prepared);
    if (result === 'needs-gesture') {
      // Safari will einen frischen Tipp für das Teilen-Menü
      setPendingShare(prepared);
      return;
    }
    setPendingShare(null);
    setStatus(result === 'cancelled' ? null : 'Sicherung erstellt.');
  }

  async function onExport() {
    setStatus(null);
    try {
      await deliver(await prepareBackup());
    } catch (err) {
      setStatus(`Export fehlgeschlagen: ${String(err)}`);
    }
  }

  async function onFile(file: File) {
    setStatus(null);
    try {
      const backup = parseBackup(await file.text());
      setPendingImport({ name: file.name, backup });
    } catch (err) {
      setStatus(err instanceof BackupError ? err.message : `Datei konnte nicht gelesen werden: ${String(err)}`);
    }
  }

  async function runImport(mode: ImportMode) {
    if (!pendingImport) return;
    if (mode === 'replace' && !confirm('Alle vorhandenen Daten werden durch die Sicherung ersetzt. Fortfahren?')) return;
    try {
      const result = await importBackup(pendingImport.backup, mode);
      const imported = result.tables.reduce((n, t) => n + t.imported, 0);
      const skipped = result.tables.reduce((n, t) => n + t.skipped, 0);
      setStatus(
        `Import abgeschlossen: ${imported} Datensätze übernommen` +
          (skipped ? `, ${skipped} übersprungen (hier neuer)` : '') +
          '.',
      );
    } catch (err) {
      setStatus(`Import fehlgeschlagen: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setPendingImport(null);
    }
  }

  const counts = pendingImport
    ? Object.values(pendingImport.backup.tables).reduce((n, rows) => n + rows.length, 0)
    : 0;

  return (
    <>
      <Section
        title="Datensicherung"
        footer={
          <>
            Alle Daten liegen nur auf diesem Gerät. Sichere sie regelmäßig als Datei, z. B. in „Dateien“ oder iCloud Drive.
            <br />
            {lastBackupAt ? `Letzte Sicherung: ${formatDateTime(lastBackupAt)}` : 'Noch keine Sicherung erstellt.'}
          </>
        }
      >
        <Row onClick={onExport}>
          <span className="text-accent">Daten exportieren (JSON)</span>
        </Row>
        {pendingShare && (
          <Row onClick={() => deliver(pendingShare)}>
            <span className="font-semibold text-accent">Sicherung jetzt teilen/speichern</span>
          </Row>
        )}
        <Row onClick={() => fileInput.current?.click()}>
          <span className="text-accent">Daten importieren …</span>
        </Row>
      </Section>
      {status && <p className="mt-2 px-4 text-[15px]">{status}</p>}
      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) onFile(file);
        }}
      />
      {pendingImport && (
        <Sheet onClose={() => setPendingImport(null)}>
          <h2 className="text-center text-[17px] font-semibold">Sicherung einspielen</h2>
          <p className="mt-2 text-center text-[15px] text-muted">
            {pendingImport.name}
            <br />
            vom {formatDateTime(Date.parse(pendingImport.backup.exportedAt))} · {counts} Datensätze
          </p>
          <div className="mt-5 space-y-2">
            <Button className="w-full" onClick={() => runImport('merge')}>
              Zusammenführen
            </Button>
            <p className="px-2 text-[13px] text-muted">
              Neue Einträge kommen dazu, bei Doppelten gewinnt die neuere Version. Nichts wird gelöscht.
            </p>
            <Button variant="secondary" className="w-full !text-danger" onClick={() => runImport('replace')}>
              Alles ersetzen
            </Button>
            <p className="px-2 text-[13px] text-muted">
              Die Daten auf diesem Gerät werden durch die Sicherung ersetzt.
            </p>
            <Button variant="plain" className="w-full" onClick={() => setPendingImport(null)}>
              Abbrechen
            </Button>
          </div>
        </Sheet>
      )}
    </>
  );
}

function StorageSection() {
  const [persisted, setPersisted] = useState<boolean | null>(null);
  useEffect(() => {
    isStoragePersisted().then(setPersisted);
  }, []);
  return (
    <Section
      title="Speicher"
      footer={
        persisted
          ? 'Der Browser hat zugesagt, die Daten nicht automatisch zu löschen.'
          : 'Tipp: Installiere die App über Safari → Teilen → „Zum Home-Bildschirm“. Mache trotzdem regelmäßig Sicherungen.'
      }
    >
      <Row detail={persisted === null ? '…' : persisted ? 'Ja' : 'Nein'}>Dauerhafter Speicher</Row>
      {persisted === false && (
        <Row onClick={async () => setPersisted(await requestPersistentStorage())}>
          <span className="text-accent">Dauerhaften Speicher anfragen</span>
        </Row>
      )}
      <Row detail={__APP_VERSION__}>Version</Row>
    </Section>
  );
}
