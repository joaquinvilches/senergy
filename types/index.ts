import { Timestamp } from 'firebase/firestore';

/**
 * Tipos globales de SENERGY
 */

// ==================== User ====================

export interface User {
  uid: string;
  email: string;
  createdAt: Timestamp;
  subscription?: 'FREE' | 'PREMIUM' | 'ENTERPRISE';
  subscriptionExpiry?: Timestamp | null;
}

// ==================== Meter ====================

export interface Meter {
  id: string;
  name: string;
  company: string;
  region: string;
  costPerKwh: number;
  initialReading: number;
  lastReading: number;
  lastCost: number;
  monthlyBudget?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string;
}

export type MeterCompany =
  | 'CGE'
  | 'ENEL'
  | 'Chilquinta'
  | 'Saesa'
  | 'Frontel'
  | 'Luz Osorno'
  | 'Otra';

export type ChileanRegion =
  | 'Región de Arica y Parinacota'
  | 'Región de Tarapacá'
  | 'Región de Antofagasta'
  | 'Región de Atacama'
  | 'Región de Coquimbo'
  | 'Región de Valparaíso'
  | 'Región Metropolitana'
  | 'Región del Libertador General Bernardo O\'Higgins'
  | 'Región del Maule'
  | 'Región de Ñuble'
  | 'Región del Biobío'
  | 'Región de La Araucanía'
  | 'Región de Los Ríos'
  | 'Región de Los Lagos'
  | 'Región de Aysén'
  | 'Región de Magallanes';

// ==================== Reading ====================

export interface Reading {
  id: string;
  value: number;
  consumption: number;
  cost: number;
  costPerKwh: number;
  date: Timestamp;
  photoURL?: string;
  meterId: string;
  meterName: string;
  userId: string;
}

export interface ReadingInput {
  value: number;
  costPerKwh: number;
  photoURL?: string;
}

// ==================== Stats ====================

export interface Stats {
  totalConsumption: number;
  totalCost: number;
  averageConsumption: number;
  maxConsumption: number;
  minConsumption: number;
  readingsCount: number;
  averageFrequency: number; // días entre lecturas
}

export interface MonthlyStats {
  [month: string]: {
    consumption: number;
    cost: number;
    readingsCount: number;
    avgConsumption: number;
  };
}

// ==================== Incident ====================

export interface Incident {
  id: string;
  userId: string;
  meterId?: string;
  meterName?: string;
  type: IncidentType;
  date: Timestamp;
  startTime: string;
  endTime: string;
  description: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type IncidentType =
  | 'corte'
  | 'baja_tension'
  | 'sobre_tension'
  | 'fluctuaciones'
  | 'otro';

// ==================== Feedback ====================

export interface Feedback {
  id: string;
  userId: string;
  userEmail: string;
  type: FeedbackType;
  message: string;
  status: FeedbackStatus;
  createdAt: Timestamp;
}

export type FeedbackType = 'suggestion' | 'bug' | 'other';
export type FeedbackStatus = 'pending' | 'reviewed' | 'resolved';

// ==================== Insight ====================

export interface Insight {
  type: InsightType;
  message: string;
  priority: 1 | 2 | 3 | 4 | 5;
  icon: string;
  color: string;
  data?: Record<string, any>;
}

export type InsightType =
  | 'comparison'
  | 'trend'
  | 'peak'
  | 'projection'
  | 'warning'
  | 'success'
  | 'info';

// ==================== Cache ====================

export interface CacheMetadata {
  createdAt: number;
  expiresAt: number;
  ttl: number;
  size: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  removes: number;
  total: number;
  hitRate: string;
}

// ==================== Navigation ====================

export type RootStackParamList = {
  Home: undefined;
  MeterDetail: { meterId: string };
  NewReading: { meterId: string };
  RegisterMeter: undefined;
  Stats: undefined;
  Profile: undefined;
  ReportIncident: undefined;
  IncidentsList: undefined;
  Feedback: undefined;
};

export type AuthStackParamList = {
  Auth: undefined;
};

// ==================== Theme ====================

export interface Colors {
  PRIMARY: string;
  SECONDARY: string;
  ACCENT: string;
  SUCCESS: string;
  WARNING: string;
  DANGER: string;
  INFO: string;
  BACKGROUND: string;
  CARD: string;
  BORDER: string;
  TEXT_DARK: string;
  TEXT_LIGHT: string;
  TEXT_MUTED: string;
}

export interface ThemeContextValue {
  isDark: boolean;
  toggleDarkMode: () => void;
  colors: Colors;
}

// ==================== Utilities ====================

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  status: AsyncStatus;
  error: string | null;
}

// Helper para crear AsyncState inicial
export function createAsyncState<T>(): AsyncState<T> {
  return {
    data: null,
    status: 'idle',
    error: null,
  };
}
