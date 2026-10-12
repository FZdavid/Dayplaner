import { ComingSoon } from '../../core/components/ComingSoon';
import { ChartIcon } from '../../core/components/icons';
import type { AppModule } from '../../core/types';

/** Platzhalter – wird in einer späteren Phase gebaut. */
export const statsModule: AppModule = {
  id: 'stats',
  label: 'Statistik',
  icon: ChartIcon,
  path: '/stats',
  Root: () => <ComingSoon title="Statistik" emoji="📊" />,
};
