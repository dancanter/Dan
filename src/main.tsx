import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';

// The content library used to be imported here so validateContent() would run
// and print to the dev console. That side effect is compiled away in
// production — but the *import* is not, so it pulled all 111 guides into the
// eager entry graph, where Vite then emitted a modulepreload for them. Every
// first paint downloaded the whole reference section to show one home screen.
// Dynamic and dev-only, so the production build never mentions it.
if (import.meta.env.DEV) void import('./content');

// Vite's BASE_URL always ends in "/" (e.g. "/Dan/"); React Router expects
// a basename with no trailing slash.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
