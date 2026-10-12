import { ComingSoon } from '../../core/components/ComingSoon';
import { ForkKnifeIcon } from '../../core/components/icons';
import type { AppModule } from '../../core/types';

/** Platzhalter – wird in einer späteren Phase gebaut. */
export const foodModule: AppModule = {
  id: 'food',
  label: 'Essen',
  icon: ForkKnifeIcon,
  path: '/food',
  Root: () => <ComingSoon title="Essen" emoji="🥗" />,
};
