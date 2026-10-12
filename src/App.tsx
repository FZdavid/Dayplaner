import { Navigate, Route, Routes } from 'react-router-dom';
import { TabBar } from './core/components/TabBar';
import { MODULES } from './core/modules';
import { SettingsPage } from './core/settings/SettingsPage';

export default function App() {
  return (
    <>
      <main className="mx-auto max-w-2xl pb-[calc(env(safe-area-inset-bottom)+5rem)]">
        <Routes>
          <Route path="/" element={<Navigate to={MODULES[0].path} replace />} />
          {MODULES.map(({ id, path, Root }) => (
            <Route key={id} path={`${path}/*`} element={<Root />} />
          ))}
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <TabBar />
    </>
  );
}
