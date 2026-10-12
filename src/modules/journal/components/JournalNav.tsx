import { useLocation, useNavigate } from 'react-router-dom';
import { SegmentedControl } from '../../../core/components/ui';

/** Umschalter „Heute | Verlauf“ oben im Journal. */
export function JournalNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const value = pathname.startsWith('/journal/history') ? 'history' : 'today';
  return (
    <div className="px-4 pt-3">
      <SegmentedControl
        value={value}
        onChange={(v) => navigate(v === 'history' ? '/journal/history' : '/journal')}
        options={[
          { value: 'today', label: 'Heute' },
          { value: 'history', label: 'Verlauf' },
        ]}
      />
    </div>
  );
}
