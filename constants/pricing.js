/**
 * Configuración de planes de suscripción SENERGY
 */

export const SUBSCRIPTION_PLANS = {
  FREE: 'FREE',
  PREMIUM: 'PREMIUM',
};

export const PLAN_LIMITS = {
  FREE: {
    name: 'Gratuito',
    price: 0,
    currency: 'CLP',
    maxMeters: 1,
    maxReadingsPerMonth: 20,
    canTakePhotos: false,
    canExport: false,
    features: [
      '1 medidor',
      '20 lecturas mensuales',
      'Estadísticas básicas',
      'Gráficos simples',
    ],
    featuresDisabled: [
      'Captura de fotos',
      'Exportación de reportes',
      'Medidores ilimitados',
      'Lecturas ilimitadas',
    ],
  },
  PREMIUM: {
    name: 'Premium',
    price: 1000,
    currency: 'CLP',
    maxMeters: Infinity,
    maxReadingsPerMonth: Infinity,
    canTakePhotos: true,
    canExport: true,
    features: [
      'Medidores ilimitados',
      'Lecturas ilimitadas',
      'Captura de fotos del medidor',
      'Exportación a Excel',
      'Estadísticas avanzadas',
      'Todos los gráficos',
      'Insights inteligentes',
      'Sin anuncios',
      'Soporte prioritario',
    ],
    featuresDisabled: [],
  },
};

/**
 * Obtiene la configuración del plan
 * @param {string} planType - 'FREE' o 'PREMIUM'
 * @returns {Object} Configuración del plan
 */
export const getPlanConfig = (planType = 'FREE') => {
  return PLAN_LIMITS[planType] || PLAN_LIMITS.FREE;
};

/**
 * Verifica si una característica está disponible en el plan
 * @param {string} planType - 'FREE' o 'PREMIUM'
 * @param {string} feature - Nombre de la característica
 * @returns {boolean}
 */
export const hasFeature = (planType, feature) => {
  const config = getPlanConfig(planType);

  switch (feature) {
    case 'TAKE_PHOTOS':
      return config.canTakePhotos;
    case 'EXPORT':
      return config.canExport;
    case 'UNLIMITED_METERS':
      return config.maxMeters === Infinity;
    case 'UNLIMITED_READINGS':
      return config.maxReadingsPerMonth === Infinity;
    default:
      return false;
  }
};

/**
 * Formatea el precio del plan
 * @param {string} planType - 'FREE' o 'PREMIUM'
 * @returns {string} Precio formateado
 */
export const formatPlanPrice = (planType) => {
  const config = getPlanConfig(planType);

  if (config.price === 0) {
    return 'Gratis';
  }

  return `$${config.price.toLocaleString('es-CL')} ${config.currency}/mes`;
};
