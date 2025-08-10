import React, { createContext, useContext, ReactNode } from 'react';
import { BRAND_COLORS } from '../constants/brandConstants';

// Define the theme context type
interface ThemeContextType {
  colors: typeof BRAND_COLORS;
}

// Create the context with default values
const ThemeContext = createContext<ThemeContextType>({
  colors: BRAND_COLORS,
});

// Custom hook for accessing the theme
export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // The value that will be given to the context
  const value = {
    colors: BRAND_COLORS,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;