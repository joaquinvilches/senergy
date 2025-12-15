// src/utils/darkModeContext.js
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/theme';

const STORAGE_KEY = '@app_theme_mode'; // 'light' | 'dark' | 'system'

const lightColors = {
  // Backgrounds
  BACKGROUND: COLORS.neutral[100],
  CARD: '#FFFFFF',
  CARD_ELEVATED: '#FFFFFF',
  WHITE: '#FFFFFF',

  // Brand colors
  PRIMARY: COLORS.primary[500],
  ACCENT: COLORS.primary[400],

  // Semantic colors
  SUCCESS: COLORS.success,
  SUCCESS_LIGHT: '#D1FAE5',
  SUCCESS_DARK: '#047857',
  WARNING: COLORS.warning,
  WARNING_LIGHT: '#FEF3C7',
  WARNING_DARK: '#B45309',
  ERROR: COLORS.error,
  ERROR_LIGHT: '#FEE2E2',
  ERROR_DARK: '#B91C1C',
  INFO: COLORS.info,
  INFO_LIGHT: '#DBEAFE',
  INFO_DARK: '#1E40AF',

  // Text colors
  TEXT_DARK: COLORS.neutral[900],
  TEXT: COLORS.neutral[700],
  TEXT_LIGHT: COLORS.neutral[500],
  TEXT_MUTED: COLORS.neutral[400],

  // Borders
  BORDER: COLORS.neutral[200],
  BORDER_LIGHT: COLORS.neutral[100],

  // Full color palette access
  primary: COLORS.primary,
  neutral: COLORS.neutral,
  chart: COLORS.chart,
};

const darkColors = {
  // Backgrounds
  BACKGROUND: COLORS.dark.background,
  CARD: COLORS.dark.card,
  CARD_ELEVATED: COLORS.dark.cardElevated,
  WHITE: COLORS.dark.background,

  // Brand colors (más brillantes en dark mode)
  PRIMARY: COLORS.primary[400],
  ACCENT: COLORS.primary[300],

  // Semantic colors (más brillantes en dark mode)
  SUCCESS: COLORS.primary[400],
  SUCCESS_LIGHT: 'rgba(16, 185, 129, 0.15)',
  SUCCESS_DARK: '#A7F3D0',
  WARNING: '#FBBF24',
  WARNING_LIGHT: 'rgba(251, 191, 36, 0.15)',
  WARNING_DARK: '#FDE68A',
  ERROR: '#F87171',
  ERROR_LIGHT: 'rgba(248, 113, 113, 0.15)',
  ERROR_DARK: '#FCA5A5',
  INFO: '#60A5FA',
  INFO_LIGHT: 'rgba(96, 165, 250, 0.15)',
  INFO_DARK: '#93C5FD',

  // Text colors
  TEXT_DARK: COLORS.neutral[50],
  TEXT: COLORS.neutral[200],
  TEXT_LIGHT: COLORS.neutral[400],
  TEXT_MUTED: COLORS.neutral[500],

  // Borders
  BORDER: COLORS.dark.border,
  BORDER_LIGHT: COLORS.dark.borderLight,

  // Full color palette access
  primary: COLORS.primary,
  neutral: COLORS.neutral,
  chart: COLORS.chart,
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
      } catch (error) {
        console.error('Error al cargar preferencia de tema:', error);
        // Usar modo sistema por defecto en caso de error
      }
    })();
  }, []);

  // escuchar cambios del SO
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSysScheme(colorScheme);
    });
    return () => {
      if (subscription && typeof subscription.remove === 'function') {
        subscription.remove();
      }
    };
  }, []);

  const isDark = useMemo(
    () => (mode === 'system' ? sysScheme === 'dark' : mode === 'dark'),
    [mode, sysScheme]
  );

  const colors = useMemo(() => (isDark ? darkColors : lightColors), [isDark]);

  const persistMode = useCallback(async (m) => {
    setMode(m);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, m);
    } catch (error) {
      console.error('Error al guardar preferencia de tema:', error);
      // El modo se actualiza en el estado aunque falle el guardado
      // para mejor UX
    }
  }, []);

  const toggleDarkMode = useCallback(() => {
    persistMode(isDark ? 'light' : 'dark');
  }, [isDark, persistMode]);

  const value = useMemo(
    () => ({
      isDark,
      colors,
      mode,
      setMode: persistMode,

      // Aliases por compatibilidad
      isDarkMode: isDark,
      toggleDarkMode,
    }),
    [isDark, colors, mode, persistMode, toggleDarkMode]
  );

  return <DarkModeContext.Provider value={value}>{children}</DarkModeContext.Provider>;
};

export const useDarkMode = () => {
  const ctx = useContext(DarkModeContext);
  if (!ctx) throw new Error('useDarkMode must be used inside <DarkModeProvider>');
  return ctx;
};
