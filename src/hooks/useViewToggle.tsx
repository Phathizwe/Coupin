import { useState } from 'react';

export const useViewToggle = () => {
  const [view, setView] = useState<'simple' | 'detailed'>('simple');

  const toggleView = () => {
    setView(prev => prev === 'simple' ? 'detailed' : 'simple');
  };

  return { view, toggleView };
};