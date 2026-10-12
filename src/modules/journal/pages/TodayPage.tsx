import { PageHeader } from '../../../core/components/ui';
import { formatDayLong } from '../../../core/lib/date';
import { useToday } from '../../../core/hooks/useToday';
import { DayEditor } from '../components/DayEditor';
import { JournalNav } from '../components/JournalNav';

/** Startbildschirm: App öffnen → sofort schreiben. */
export function TodayPage() {
  const today = useToday();
  return (
    <>
      <PageHeader title="Heute" subtitle={formatDayLong(today)} />
      <JournalNav />
      <div className="px-4 pt-4">
        <DayEditor date={today} autoFocus />
      </div>
    </>
  );
}
