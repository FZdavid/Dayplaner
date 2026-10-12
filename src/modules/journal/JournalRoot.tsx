import { Navigate, Route, Routes } from 'react-router-dom';
import { ActivitiesPage } from './pages/ActivitiesPage';
import { DayPage } from './pages/DayPage';
import { HistoryPage } from './pages/HistoryPage';
import { PromptsPage } from './pages/PromptsPage';
import { TodayPage } from './pages/TodayPage';

export default function JournalRoot() {
  return (
    <Routes>
      <Route index element={<TodayPage />} />
      <Route path="history" element={<HistoryPage />} />
      <Route path="day/:date" element={<DayPage />} />
      <Route path="activities" element={<ActivitiesPage />} />
      <Route path="prompts" element={<PromptsPage />} />
      <Route path="*" element={<Navigate to="/journal" replace />} />
    </Routes>
  );
}
