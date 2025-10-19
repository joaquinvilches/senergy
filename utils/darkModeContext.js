// utils/darkModeContext.js
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';

const DarkModeContext = React.createContext(null);

export const DarkModeProvider = ({ children }) => {
  const sysPref = Appearance.getColorScheme(); // 'light' | 'dark' | null
  const [isDark, setIsDark] = useState(sysPref === 'dark');

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setIsDark(colorScheme === 'dark');
    });
    return () => sub?.remove?.();
  }, []);

  const colors = useMemo(() => {
    // paleta accesible con buen contraste
    return isDark
      ? {
          BACKGROUND: '#0B1220',
          WHITE: '#0F172A',
          PRIMARY: '#60A5FA',
          ACCENT: '#06B6D4',
          TEXT_DARK: '#E5E7EB',
          TEXT_LIGHT: '#94A3B8',
          CARD: '#111827',
        }
      : {
          BACKGROUND: '#F4F6FA',
          WHITE: '#FFFFFF',
          PRIMARY: '#3B82F6',
          ACCENT: '#06B6D4',
          TEXT_DARK: '#111827',
          TEXT_LIGHT: '#6B7280',
          CARD: '#FFFFFF',
        };
  }, [isDark]);

  const value = useMemo(() => ({ isDark, setIsDark, colors }), [isDark, colors]);

  return <DarkModeContext.Provider value={value}>{children}</DarkModeContext.Provider>;
};

export const useDarkMode = () => useContext(DarkModeContext);
