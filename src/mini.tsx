import React from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Mini } from './components/Mini';
import { initEmbedHeight } from './lib/embed';
import './styles.css';

// Its own id so a page can carry the mini and the full tool at once.
initEmbedHeight('wpr-auto-loan-mini');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Mini />
    </ErrorBoundary>
  </React.StrictMode>,
);
