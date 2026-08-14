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
// Tarifa BT1 residencial — electricidad consumida c/IVA (CLP/kWh). Fuente: CNE, publicaciones oficiales 2025-2026.
export const ELECTRICITY_COMPANIES = {
  // Región Metropolitana
  ENEL_RM: {
    name: 'Enel Distribución',
    region: 'Metropolitana',
    costPerKwh: 218, // ~183 neto × 1.19 IVA — ago 2025
  },
  CGE_RM: {
    name: 'CGE Distribución',
    region: 'Metropolitana',
    costPerKwh: 191, // 160,556 neto × 1.19 — dic 2025
  },
  EEPA: {
    name: 'EEPA (Puente Alto)',
    region: 'Metropolitana',
    costPerKwh: 193, // estimado en base a CGE RM — dic 2025
  },
  // Arica y Parinacota
  ELIQSA_AP: {
    name: 'Eliqsa (CGE)',
    region: 'Arica y Parinacota',
    costPerKwh: 202, // 169,774 neto × 1.19 — dic 2025
  },
  // Tarapacá
  ELIQSA_T: {
    name: 'Eliqsa (CGE)',
    region: 'Tarapacá',
    costPerKwh: 202, // 169,774 neto × 1.19 — dic 2025
  },
  // Antofagasta
  ELECDA: {
    name: 'Elecda (CGE)',
    region: 'Antofagasta',
    costPerKwh: 226, // 189,964 neto × 1.19 — dic 2025
  },
  // Atacama
  EMELAT: {
    name: 'Emelat (CGE)',
    region: 'Atacama',
    costPerKwh: 218, // 183,512 neto × 1.19 — dic 2025
  },
  // Coquimbo
  CONAFE_C: {
    name: 'Conafe (Coquimbo)',
    region: 'Coquimbo',
    costPerKwh: 226, // 189,964 neto × 1.19 — dic 2025
  },
  // Valparaíso
  CHILQUINTA_V: {
    name: 'Chilquinta Energía',
    region: 'Valparaíso',
    costPerKwh: 198, // 166,072 neto × 1.19 — feb 2025
  },
  CONAFE_V: {
    name: 'Conafe (Valparaíso)',
    region: 'Valparaíso',
    costPerKwh: 226, // 189,964 neto × 1.19 — dic 2025
  },
  // O'Higgins
  CGE_OH: {
    name: 'CGE Distribución',
    region: "O'Higgins",
    costPerKwh: 191, // 160,556 neto × 1.19 — dic 2025
  },
  // Maule
  CGE_M: {
    name: 'CGE Distribución',
    region: 'Maule',
    costPerKwh: 191, // 160,556 neto × 1.19 — dic 2025
  },
  LUZPARRAL_M: {
    name: 'LuzParral',
    region: 'Maule',
    costPerKwh: 307, // 257,636 neto × 1.19 — may 2026 (cooperativa rural)
  },
  // Ñuble
  CGE_N: {
    name: 'CGE Distribución',
    region: 'Ñuble',
    costPerKwh: 191, // 160,556 neto × 1.19 — dic 2025
  },
  COPELEC: {
    name: 'Copelec',
    region: 'Ñuble',
    costPerKwh: 229, // 192,796 neto × 1.19 — feb 2025
  },
  FRONTEL_N: {
    name: 'Frontel (Saesa)',
    region: 'Ñuble',
    costPerKwh: 142, // 118,961 neto × 1.19 — jun 2026
  },
  LUZPARRAL_N: {
    name: 'LuzParral',
    region: 'Ñuble',
    costPerKwh: 307, // 257,636 neto × 1.19 — may 2026 (cooperativa rural)
  },
  // Biobío
  CGE_B: {
    name: 'CGE Distribución',
    region: 'Biobío',
    costPerKwh: 191, // 160,556 neto × 1.19 — dic 2025
  },
  FRONTEL_B: {
    name: 'Frontel (Saesa)',
    region: 'Biobío',
    costPerKwh: 142, // 118,961 neto × 1.19 — jun 2026
  },
  // La Araucanía
  FRONTEL_LA: {
    name: 'Frontel (Saesa)',
    region: 'La Araucanía',
    costPerKwh: 142, // 118,961 neto × 1.19 — jun 2026
  },
  // Los Ríos
  SAESA_LR: {
    name: 'Saesa',
    region: 'Los Ríos',
    costPerKwh: 134, // 112,593 neto prom × 1.19 — jun 2026
  },
  // Los Lagos
  SAESA_LL: {
    name: 'Saesa',
    region: 'Los Lagos',
    costPerKwh: 134, // 112,593 neto prom × 1.19 — jun 2026
  },
  LUZ_OSORNO: {
    name: 'Luz Osorno',
    region: 'Los Lagos',
    costPerKwh: 124, // 103,855 neto × 1.19 — jun 2026
  },
  // Aysén
  EDELAYSEN: {
    name: 'Edelaysén (Saesa)',
    region: 'Aysén',
    costPerKwh: 212, // 178,126 neto × 1.19 — jun 2026
  },
  // Magallanes
  EDELMAG: {
    name: 'Edelmag',
    region: 'Magallanes',
    costPerKwh: 145, // 121,62 neto × 1.19 (ETR tramos medios) — abr 2026
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