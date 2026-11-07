import React from 'react';
import ReactDOM from 'react-dom/client';
import '../assets/styles/theme.css';
import '../assets/styles/force-dark-mode-fix.css';
import App from './App';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { LanguageProvider } from '../contexts/LanguageContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { LoadingProvider } from '../contexts/LoadingContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {/* 边界放在 ThemeProvider 外层：Provider 自身抛错时同样能兜住，
        而不是把整棵子树一起变成白屏。 */}
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <LoadingProvider>
            <App />
          </LoadingProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
