import { Navigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../../core/components/ui';
import { formatDayLong, formatDayRelative, isDateKey } from '../../../core/lib/date';
import { DayEditor } from '../components/DayEditor';

/** Einen beliebigen Tag ansehen und nachtragen. */
export function DayPage() {
  const { date } = useParams();
  if (!date || !isDateKey(date)) return <Navigate to="/journal/history" replace />;
  const relative = formatDayRelative(date);
  return (
    <>
      <PageHeader
        title={relative}
        subtitle={relative !== formatDayLong(date) ? formatDayLong(date) : undefined}
        back={{ to: '/journal/history', label: 'Verlauf' }}
      />
      <div className="px-4 pt-4">
        <DayEditor date={date} />
      </div>
    </>
  );
}
