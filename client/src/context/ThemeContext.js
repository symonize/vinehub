import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const defaultTheme = {
  // Colors
  primary: '#722f37',
  primaryDark: '#5a252c',
  primaryLight: '#8b3844',
  secondary: '#f4f1de',
  accent: '#e07a5f',
  success: '#81b29a',
  warning: '#f2cc8f',
  danger: '#e63946',
  textDark: '#2d3142',
  textLight: '#6c757d',
  bgLight: '#f8f9fa',
  bgWhite: '#ffffff',
  border: '#dee2e6',

  // Typography
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  fontSize: '16px',
  lineHeight: '1.6',

  // Headings
  h1Size: '2.5rem',
  h2Size: '2rem',
  h3Size: '1.75rem',
  h4Size: '1.5rem',
  h5Size: '1.25rem',
  h6Size: '1rem',
  headingWeight: '600',
  headingLineHeight: '1.2',

  // Spacing
  spacing: '1rem',
  borderRadius: '0.5rem',

  // Buttons
  btnPadding: '0.75rem 1.5rem',
  btnBorderRadius: '0.375rem',
  btnFontSize: '1rem',
  btnFontWeight: '500',

  // Cards
  cardPadding: '1.5rem',
  cardBorderRadius: '0.5rem',
  cardShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('wineHubTheme');
    return saved ? JSON.parse(saved) : defaultTheme;
  });

  useEffect(() => {
    // Apply theme to CSS variables
    const root = document.documentElement;

    // Colors
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--primary-dark', theme.primaryDark);
    root.style.setProperty('--primary-light', theme.primaryLight);
    root.style.setProperty('--secondary', theme.secondary);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--success', theme.success);
    root.style.setProperty('--warning', theme.warning);
    root.style.setProperty('--danger', theme.danger);
    root.style.setProperty('--text-dark', theme.textDark);
    root.style.setProperty('--text-light', theme.textLight);
    root.style.setProperty('--bg-light', theme.bgLight);
    root.style.setProperty('--bg-white', theme.bgWhite);
    root.style.setProperty('--border', theme.border);

    // Typography
    root.style.setProperty('--font-family', theme.fontFamily);
    root.style.setProperty('--font-size', theme.fontSize);
    root.style.setProperty('--line-height', theme.lineHeight);

    // Headings
    root.style.setProperty('--h1-size', theme.h1Size);
    root.style.setProperty('--h2-size', theme.h2Size);
    root.style.setProperty('--h3-size', theme.h3Size);
    root.style.setProperty('--h4-size', theme.h4Size);
    root.style.setProperty('--h5-size', theme.h5Size);
    root.style.setProperty('--h6-size', theme.h6Size);
    root.style.setProperty('--heading-weight', theme.headingWeight);
    root.style.setProperty('--heading-line-height', theme.headingLineHeight);

    // Spacing
    root.style.setProperty('--spacing', theme.spacing);
    root.style.setProperty('--border-radius', theme.borderRadius);

    // Buttons
    root.style.setProperty('--btn-padding', theme.btnPadding);
    root.style.setProperty('--btn-border-radius', theme.btnBorderRadius);
    root.style.setProperty('--btn-font-size', theme.btnFontSize);
    root.style.setProperty('--btn-font-weight', theme.btnFontWeight);

    // Cards
    root.style.setProperty('--card-padding', theme.cardPadding);
    root.style.setProperty('--card-border-radius', theme.cardBorderRadius);
    root.style.setProperty('--card-shadow', theme.cardShadow);

    // Save to localStorage
    localStorage.setItem('wineHubTheme', JSON.stringify(theme));
  }, [theme]);

  const updateTheme = (updates) => {
    setTheme(prev => ({ ...prev, ...updates }));
  };

  const resetTheme = () => {
    setTheme(defaultTheme);
  };

  const exportTheme = () => {
    return JSON.stringify(theme, null, 2);
  };

  const importTheme = (jsonString) => {
    try {
      const imported = JSON.parse(jsonString);
      setTheme({ ...defaultTheme, ...imported });
      return true;
    } catch (error) {
      return false;
    }
  };

  const value = {
    theme,
    updateTheme,
    resetTheme,
    exportTheme,
    importTheme,
    defaultTheme
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
