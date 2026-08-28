import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initEmbedHeight } from './lib/embed';
import './styles.css';

initEmbedHeight();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
