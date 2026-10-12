import { ComingSoon } from '../../core/components/ComingSoon';
import { DumbbellIcon } from '../../core/components/icons';
import type { AppModule } from '../../core/types';

/** Platzhalter – wird in einer späteren Phase gebaut. */
export const gymModule: AppModule = {
  id: 'gym',
  label: 'Gym',
  icon: DumbbellIcon,
  path: '/gym',
  Root: () => <ComingSoon title="Gym" emoji="🏋️" />,
};
