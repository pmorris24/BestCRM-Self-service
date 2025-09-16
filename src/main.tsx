// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { ThemeProvider as CustomThemeProvider } from './ThemeService';

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <CustomThemeProvider>
        <App />
      </CustomThemeProvider>
    </React.StrictMode>
  );
} else {
  console.error('Fatal Error: Root element not found in the document.');
}
