import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { LanguageProvider } from "./i18n";
import { ThemeProvider } from "./components/ThemeProvider";
import { ToastProvider } from "./components/ToastProvider";
import ErrorBoundary from "./components/ErrorBoundary";

// Register service worker for offline caching (PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (reg) => console.log('✅ Service Worker registered:', reg.scope),
      (err) => console.log('⚠️ SW registration failed:', err)
    );
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <BrowserRouter>
      <LanguageProvider>
        <ThemeProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </ThemeProvider>
      </LanguageProvider>
    </BrowserRouter>
  </ErrorBoundary>
)
