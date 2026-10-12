import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import { requestPersistentStorage } from './core/db/db';
import { seedModules } from './core/modules';
import './index.css';

registerSW({ immediate: true });
void requestPersistentStorage();

const root = createRoot(document.getElementById('root')!);

seedModules()
  .catch((err) => console.error('Startdaten konnten nicht angelegt werden', err))
  .finally(() => {
    root.render(
      <StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </StrictMode>,
    );
  });
