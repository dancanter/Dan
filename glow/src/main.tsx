import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App';
import { startCloud } from './cloud';
import { startBridge } from './bridge';

// Inside The Good Life, Glow mounts into a shadow root on the tracker's own
// page (frames are not allowed there), with its stylesheet sealed inside so
// the two designs never touch. On its own, it mounts into #root as usual.
function mountPoint(): HTMLElement {
  const host = document.getElementById('glow-host');
  if (!host) return document.getElementById('root')!;
  const shadow = host.shadowRoot ?? host.attachShadow({ mode: 'open' });
  const w = window as unknown as { __GLOW_CSS__?: string };
  if (w.__GLOW_CSS__) {
    const st = document.createElement('style');
    st.textContent = w.__GLOW_CSS__;
    shadow.appendChild(st);
  }
  const div = document.createElement('div');
  div.className = 'glow-app';
  shadow.appendChild(div);
  return div;
}

createRoot(mountPoint()).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

void startCloud().finally(startBridge);
