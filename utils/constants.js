// Colores SENERGY
export const COLORS = {
  PRIMARY: '#1B7D4A',
  SECONDARY: '#4CAF50',
  ACCENT: '#10B981',
  BACKGROUND: '#F5F9F7',
  TEXT_DARK: '#1F2937',
  TEXT_LIGHT: '#6B7280',
  WHITE: '#FFFFFF',
  ERROR: '#EF4444',
  SUCCESS: '#10B981',
};

// Empresas de electricidad por región
export const ELECTRICITY_COMPANIES = {
  // Región Metropolitana
  ENEL_RM: {
    name: 'ENEL (Metropolitana)',
    region: 'Metropolitana',
    costPerKwh: 215,
  },
  CGE_RM: {
    name: 'CGE (Metropolitana)',
    region: 'Metropolitana',
    costPerKwh: 220,
  },
  EEPA: {
    name: 'EEPA (Puente Alto)',
    region: 'Metropolitana',
    costPerKwh: 218,
  },
  // Arica y Parinacota
  ELIQSA_AP: {
    name: 'Eliqsa (CGE)',
    region: 'Arica y Parinacota',
    costPerKwh: 225,
  },
  // Tarapacá
  ELIQSA_T: {
    name: 'Eliqsa (CGE)',
    region: 'Tarapacá',
    costPerKwh: 225,
  },
  // Antofagasta
  ELECDA: {
    name: 'Elecda (CGE)',
    region: 'Antofagasta',
    costPerKwh: 225,
  },
  // Atacama
  EMELAT: {
    name: 'Emelat (CGE)',
    region: 'Atacama',
    costPerKwh: 225,
  },
  // Coquimbo
  CONAFE_C: {
    name: 'Conafe (Chilquinta)',
    region: 'Coquimbo',
    costPerKwh: 225,
  },
  // Valparaíso
  CHILQUINTA_V: {
    name: 'Chilquinta',
    region: 'Valparaíso',
    costPerKwh: 225,
  },
  CONAFE_V: {
    name: 'Conafe',
    region: 'Valparaíso',
    costPerKwh: 225,
  },
  // O'Higgins
  CGE_OH: {
    name: 'CGE',
    region: "O'Higgins",
    costPerKwh: 225,
  },
  // Maule
  CGE_M: {
    name: 'CGE',
    region: 'Maule',
    costPerKwh: 225,
  },
  LUZPARRAL_M: {
    name: 'LuzParral',
    region: 'Maule',
    costPerKwh: 225,
  },
  // Ñuble
  CGE_N: {
    name: 'CGE',
    region: 'Ñuble',
    costPerKwh: 225,
  },
  COPELEC: {
    name: 'Copelec',
    region: 'Ñuble',
    costPerKwh: 225,
  },
  FRONTEL_N: {
    name: 'Frontel',
    region: 'Ñuble',
    costPerKwh: 225,
  },
  LUZPARRAL_N: {
    name: 'LuzParral',
    region: 'Ñuble',
    costPerKwh: 225,
  },
  // Biobío
  CGE_B: {
    name: 'CGE',
    region: 'Biobío',
    costPerKwh: 225,
  },
  FRONTEL_B: {
    name: 'Frontel (Saesa)',
    region: 'Biobío',
    costPerKwh: 225,
  },
  // La Araucanía
  FRONTEL_LA: {
    name: 'Frontel (Saesa)',
    region: 'La Araucanía',
    costPerKwh: 225,
  },
  // Los Ríos
  SAESA_LR: {
    name: 'Saesa',
    region: 'Los Ríos',
    costPerKwh: 225,
  },
  // Los Lagos
  SAESA_LL: {
    name: 'Saesa',
    region: 'Los Lagos',
    costPerKwh: 225,
  },
  LUZ_OSORNO: {
    name: 'Luz Osorno',
    region: 'Los Lagos',
    costPerKwh: 225,
  },
  // Aysén
  EDELAYSEN: {
    name: 'Edelaysén (Saesa)',
    region: 'Aysén',
    costPerKwh: 235,
  },
  // Magallanes
  EDELMAG: {
    name: 'Edelmag',
    region: 'Magallanes',
    costPerKwh: 235,
  },
};

// Regiones de Chile
export const REGIONS = {
  ARICA: 'Arica y Parinacota',
  TARAPACA: 'Tarapacá',
  ANTOFAGASTA: 'Antofagasta',
  ATACAMA: 'Atacama',
  COQUIMBO: 'Coquimbo',
  VALPARAISO: 'Valparaíso',
  METROPOLITANA: 'Metropolitana',
  OHIGGINS: "O'Higgins",
  MAULE: 'Maule',
  NABLE: 'Ñuble',
  BIOBIO: 'Biobío',
  ARAUCANIA: 'La Araucanía',
  LOS_RIOS: 'Los Ríos',
  LOS_LAGOS: 'Los Lagos',
  AYSEN: 'Aysén',
  MAGALLANES: 'Magallanes',
};

// Función para obtener empresas por región
export const getCompaniesByRegion = (region) => {
  return Object.entries(ELECTRICITY_COMPANIES)
    .filter(([key, company]) => company.region === region)
    .map(([key, company]) => ({
      key,
      ...company,
    }));
};

// Unidades de medida
export const UNITS = {
  KWH: 'kWh',
  PESOS: '$ CLP',
};

// Constantes de configuración
export const CONFIG = {
  ALERT_CONSUMPTION_THRESHOLD: 0.2, // 20% más alto que el promedio
  DAYS_WITHOUT_READING_WARNING: 30,
  DAYS_WITHOUT_READING_CRITICAL: 60,
  MIN_CONSUMPTION_FOR_STATS: 2, // Mínimo de lecturas para mostrar estadísticas
};