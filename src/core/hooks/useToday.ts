import { useEffect, useState } from 'react';
import { todayKey } from '../lib/date';

/** Das heutige Datum – aktualisiert sich nach Mitternacht und wenn die App wieder geöffnet wird. */
export function useToday(): string {
  const [today, setToday] = useState(todayKey);
  useEffect(() => {
    const update = () => setToday(todayKey());
    const timer = setInterval(update, 60_000);
    document.addEventListener('visibilitychange', update);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);
  return today;
}
