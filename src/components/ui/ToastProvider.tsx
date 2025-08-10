import React from 'react';
import { Toaster } from 'react-hot-toast';

const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
          },
          success: {
            iconTheme: {
              primary: '#4CAF50',
              secondary: '#FFFFFF',
            },
          },
          error: {
            iconTheme: {
              primary: '#E53E3E',
              secondary: '#FFFFFF',
            },
          },
        }}
      />
    </>
  );
};

export default ToastProvider;