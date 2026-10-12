import { Row, Section, Toggle } from '../../../core/components/ui';
import { setSetting, useSetting } from '../../../core/db/settings';
import { useActivities, usePrompts } from '../repo';
import { JOURNAL_SETTINGS } from '../schema';

/** Abschnitt „Journal“ auf der Einstellungsseite. */
export function JournalSettings() {
  const showPrompt = useSetting(JOURNAL_SETTINGS.showPrompt, true);
  const activities = useActivities();
  const prompts = usePrompts();
  const activeCount = prompts?.filter((p) => p.active).length ?? 0;

  return (
    <Section title="Journal">
      <Row to="/journal/activities" detail={activities?.length}>
        Aktivitäten
      </Row>
      <Row>
        <span className="flex-1">Frage des Tages anzeigen</span>
        <Toggle
          label="Frage des Tages anzeigen"
          checked={showPrompt ?? true}
          onChange={(v) => setSetting(JOURNAL_SETTINGS.showPrompt, v)}
        />
      </Row>
      <Row to="/journal/prompts" detail={prompts ? `${activeCount} aktiv` : undefined}>
        Fragen bearbeiten
      </Row>
    </Section>
  );
}
