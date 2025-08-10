import React from 'react';
import { X } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onDismiss: () => void;
}

export function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
      <span className="block sm:inline">{message}</span>
      <button
        className="absolute top-0 bottom-0 right-0 px-4 py-3"
        onClick={onDismiss}
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}