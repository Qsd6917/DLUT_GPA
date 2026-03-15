import React from 'react';
import ReactDOM from 'react-dom/client';
import '../assets/styles/theme.css';
import '../assets/styles/force-dark-mode-fix.css';
import App from './App';
import { LanguageProvider } from '../contexts/LanguageContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { LoadingProvider } from '../contexts/LoadingContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <LoadingProvider>
          <App />
        </LoadingProvider>
      </LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>
);
