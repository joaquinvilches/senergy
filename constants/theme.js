// Sistema de Diseño SENERGY - Minimalista Profesional

// Paleta de colores mejorada con gradientes
export const COLORS = {
  // Paleta verde mejorada (minimalista pero vibrante)
  primary: {
    50: '#ECFDF5',   // Muy claro (backgrounds sutiles)
    100: '#D1FAE5',  // Claro (hover states)
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',  // Accent mejorado
    500: '#10B981',  // Primary principal
    600: '#059669',  // Primary dark
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',  // Muy oscuro
  },

  // Grises neutrales (minimalista)
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',  // Background light
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',  // Text dark
  },

  // Colores semánticos
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Colores para gráficos
  chart: {
    blue: '#3B82F6',
    green: '#10B981',
    yellow: '#F59E0B',
    purple: '#8B5CF6',
    pink: '#EC4899',
    cyan: '#06B6D4',
    orange: '#F97316',
    indigo: '#6366F1',
  },

  // Dark mode
  dark: {
    background: '#0B0F14',
    card: '#111827',
    cardElevated: '#1F2937',
    border: 'rgba(249,250,251,0.08)',
    borderLight: 'rgba(249,250,251,0.05)',
  },
};

// Tipografía (sistema claro y minimalista)
export const TYPOGRAPHY = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },

  sizes: {
    xs: 11,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 28,
    '5xl': 32,
    '6xl': 36,
  },

  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Espaciado (escala 4px, minimalista generoso)
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 56,
  '7xl': 64,
};

// Border radius (minimalista, no muy redondeado)
export const RADIUS = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
};

// Elevación/sombras (sutiles pero visibles)
export const ELEVATION = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },

  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },

  '2xl': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.20,
    shadowRadius: 24,
    elevation: 12,
  },
};

// Tamaños de iconos estándar
export const ICON_SIZES = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
};

// Breakpoints para responsive
export const BREAKPOINTS = {
  sm: 576,
  md: 768,
  lg: 1024,
  xl: 1280,
};

// Opacidades estándar
export const OPACITY = {
  disabled: 0.5,
  hover: 0.8,
  pressed: 0.6,
  subtle: 0.6,
  semiTransparent: 0.8,
};

// Duraciones de animación
export const ANIMATION_DURATION = {
  fast: 100,
  normal: 200,
  slow: 300,
  slower: 400,
};

// Default export
export default {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  RADIUS,
  ELEVATION,
  ICON_SIZES,
  BREAKPOINTS,
  OPACITY,
  ANIMATION_DURATION,
};
