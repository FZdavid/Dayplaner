import { BookIcon } from '../../core/components/icons';
import type { AppModule } from '../../core/types';
import { JournalSettings } from './components/JournalSettings';
import JournalRoot from './JournalRoot';
import { seedJournal } from './repo';

export const journalModule: AppModule = {
  id: 'journal',
  label: 'Journal',
  icon: BookIcon,
  path: '/journal',
  Root: JournalRoot,
  SettingsSection: JournalSettings,
  seed: seedJournal,
};
