import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.fixed';
import { AuthProvider } from './contexts/auth/SafeAuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Initialize the app with error handling
const initializeApp = () => {
  try {
    const root = document.getElementById('root');
    
    if (!root) {
      console.error('Root element not found');
      return;
    }
    
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <AuthProvider>
          <App />
          <ToastContainer position="top-right" autoClose={5000} />
        </AuthProvider>
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Failed to initialize app:', error);
    
    // Render a basic error page if initialization fails
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
          <h1 style="color: #e53e3e;">Unable to load application</h1>
          <p>We encountered a problem while loading the application. Please try refreshing the page.</p>
          <button 
            style="background: #3182ce; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-top: 20px;"
            onclick="window.location.reload()"
          >
            Refresh Page
          </button>
        </div>
      `;
    }
  }
};

// Add global unhandled error and promise rejection handlers
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Start the application
initializeApp();