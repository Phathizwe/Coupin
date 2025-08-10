import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './components/business-emotional-design/emotionalDesign.css'; // Make sure this is imported
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './contexts/auth/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { initializeNetworkErrorHandler } from './utils/networkErrorHandler';

// Initialize network error handling before anything else
initializeNetworkErrorHandler();

const initializeApp = () => {
  try {
    const rootElement = document.getElementById('root') as HTMLElement;

    if (!rootElement) {
      console.error('Root element not found');
      return;
    }

    const root = ReactDOM.createRoot(rootElement);

    root.render(
      <React.StrictMode>
        <AuthProvider>
          <App />
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </AuthProvider>
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Failed to initialize app:', error);

    // Render a basic error page if initialization fails
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; background-color: #f7fafc;">
          <div style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); max-width: 400px; text-align: center;">
            <h1 style="color: #e53e3e; margin-bottom: 1rem;">Unable to load application</h1>
            <p style="color: #4a5568; margin-bottom: 1.5rem;">We encountered a problem while loading the application. Please try refreshing the page.</p>
            <button
              style="background: #3182ce; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;"
              onclick="window.location.reload()"
            >
              Refresh Page
            </button>
          </div>
        </div>
      `;
    }
  }
};

// Add global unhandled error and promise rejection handlers with better filtering
window.addEventListener('error', (event) => {
  // Filter out network-related errors that are expected
  if (event.error?.message?.includes('google-analytics') ||
    event.error?.message?.includes('gtag') ||
    event.error?.message?.includes('Failed to fetch') ||
    event.error?.message?.includes('NetworkError') ||
    event.error?.message?.includes('blocked')) {
    console.warn('Network error filtered:', event.error?.message);
    return;
  }
  console.error('Global error caught:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  // Filter out network-related promise rejections
  if (event.reason?.message?.includes('google-analytics') ||
    event.reason?.message?.includes('gtag') ||
    event.reason?.message?.includes('Failed to fetch') ||
    event.reason?.message?.includes('NetworkError') ||
    event.reason?.toString().includes('blocked')) {
    console.warn('Network promise rejection filtered:', event.reason);
    event.preventDefault(); // Prevent the default unhandled rejection behavior
    return;
  }
  console.error('Unhandled promise rejection:', event.reason);
});

// Add a safety timeout to ensure the app loads
setTimeout(() => {
  const loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"]');
  if (loadingElements.length > 0) {
    console.warn('App appears to be stuck loading, this may indicate an initialization issue');
  }
}, 10000); // 10 seconds

// Start the application
initializeApp();