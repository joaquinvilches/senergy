// src/utils/darkModeContext.js
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@app_theme_mode'; // 'light' | 'dark' | 'system'

const lightColors = {
  BACKGROUND: '#F3F4F6',
  CARD: '#FFFFFF',
  WHITE: '#FFFFFF',
  PRIMARY: '#10B981',
  ACCENT: '#22C55E',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR:   '#EF4444',
  TEXT_DARK: '#111827',
  TEXT_LIGHT: '#6B7280',
  BORDER: 'rgba(17,24,39,0.12)',
};

const darkColors = {
  BACKGROUND: '#0B0F14',
  CARD: '#111827',
  WHITE: '#0B0F14',
  PRIMARY: '#10B981',
  ACCENT: '#22C55E',
  SUCCESS: '#34D399',
  WARNING: '#FBBF24',
  ERROR:   '#F87171',
  TEXT_DARK: '#F9FAFB',
  TEXT_LIGHT: '#9CA3AF',
  BORDER: 'rgba(249,250,251,0.12)',
};

const DarkModeContext = createContext(null);

export const DarkModeProvider = ({ children }) => {
  // 'light' | 'dark' | 'system'
  const [mode, setMode] = useState('system');
  const [sysScheme, setSysScheme] = useState(Appearance.getColorScheme());

  // cargar preferencia guardada
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) setMode(saved);
      } catch {}
    })();
  }, []);

  // escuchar cambios del SO
  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSysScheme(colorScheme);
    });
    return () => sub?.remove?.();
  }, []);

  const isDark = useMemo(
    () => (mode === 'system' ? sysScheme === 'dark' : mode === 'dark'),
    [mode, sysScheme]
  );

  const colors = useMemo(() => (isDark ? darkColors : lightColors), [isDark]);

  const persistMode = async (m) => {
    setMode(m);
    try { await AsyncStorage.setItem(STORAGE_KEY, m); } catch {}
  };

  const value = useMemo(
    () => ({
      isDark,
      colors,
      mode,
      setMode: persistMode,

      // Aliases por compatibilidad
      isDarkMode: isDark,
      toggleDarkMode: () => persistMode(isDark ? 'light' : 'dark'),
    }),
    [isDark, colors, mode]
  );

  return <DarkModeContext.Provider value={value}>{children}</DarkModeContext.Provider>;
};

export const useDarkMode = () => {
  const ctx = useContext(DarkModeContext);
  if (!ctx) throw new Error('useDarkMode must be used inside <DarkModeProvider>');
  return ctx;
};
