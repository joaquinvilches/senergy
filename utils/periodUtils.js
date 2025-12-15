/**
 * Utilidades para manejo de períodos y rangos de fechas
 */

/**
 * Obtiene el rango de fechas para un período dado
 * @param {string} period - 'thisMonth' | 'lastMonth' | 'last3Months' | 'last6Months' | 'thisYear' | 'custom'
 * @param {object} customRange - {start: Date, end: Date} para período custom
 * @returns {object} - {start: Date, end: Date}
 */
export const getDateRangeForPeriod = (period, customRange = null) => {
  const now = new Date();
  const start = new Date();
  const end = new Date();

  switch (period) {
    case 'thisMonth':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case 'lastMonth':
      start.setMonth(now.getMonth() - 1);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(now.getMonth());
      end.setDate(0); // Último día del mes anterior
      end.setHours(23, 59, 59, 999);
      break;

    case 'last3Months':
      start.setMonth(now.getMonth() - 3);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case 'last6Months':
      start.setMonth(now.getMonth() - 6);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case 'thisYear':
      start.setMonth(0); // Enero
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case 'custom':
      if (customRange && customRange.start && customRange.end) {
        return {
          start: new Date(customRange.start),
          end: new Date(customRange.end),
        };
      }
      // Fallback a este mes si no hay custom range
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;

    default:
      // Default: este mes
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
  }

  return { start, end };
};

/**
 * Obtiene el label legible para un período
 * @param {string} period
 * @returns {string}
 */
export const getPeriodLabel = (period) => {
  const labels = {
    thisMonth: 'Este mes',
    lastMonth: 'Mes pasado',
    last3Months: 'Últimos 3 meses',
    last6Months: 'Últimos 6 meses',
    thisYear: 'Este año',
    custom: 'Personalizado',
  };
  return labels[period] || 'Este mes';
};

/**
 * Obtiene el período anterior equivalente para comparación
 * @param {string} period
 * @returns {object} - {start: Date, end: Date}
 */
export const getPreviousPeriod = (period) => {
  const { start, end } = getDateRangeForPeriod(period);
  const duration = end.getTime() - start.getTime();

  const prevEnd = new Date(start.getTime() - 1); // Un milisegundo antes del período actual
  const prevStart = new Date(prevEnd.getTime() - duration);

  return { start: prevStart, end: prevEnd };
};

/**
 * Filtra lecturas por rango de fechas
 * @param {Array} readings
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Array}
 */
export const filterReadingsByDateRange = (readings, startDate, endDate) => {
  if (!readings || readings.length === 0) return [];

  return readings.filter((reading) => {
    const readingDate = reading.date?.toDate ? reading.date.toDate() : new Date(reading.date);
    return readingDate >= startDate && readingDate <= endDate;
  });
};

/**
 * Obtiene el mes actual
 * @returns {object} - {start: Date, end: Date}
 */
export const getCurrentMonth = () => {
  return getDateRangeForPeriod('thisMonth');
};

/**
 * Obtiene el mes pasado
 * @returns {object} - {start: Date, end: Date}
 */
export const getLastMonth = () => {
  return getDateRangeForPeriod('lastMonth');
};

/**
 * Obtiene los últimos N meses
 * @param {number} n - Número de meses
 * @returns {object} - {start: Date, end: Date}
 */
export const getLastNMonths = (n) => {
  const now = new Date();
  const start = new Date();
  start.setMonth(now.getMonth() - n);
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

/**
 * Formatea un rango de fechas para mostrar
 * @param {Date} start
 * @param {Date} end
 * @returns {string}
 */
export const formatDateRange = (start, end) => {
  const months = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];

  const startMonth = months[start.getMonth()];
  const endMonth = months[end.getMonth()];
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  // Mismo mes y año
  if (start.getMonth() === end.getMonth() && startYear === endYear) {
    return `${startMonth} ${startYear}`;
  }

  // Mismo año, diferentes meses
  if (startYear === endYear) {
    return `${startMonth}-${endMonth} ${startYear}`;
  }

  // Diferentes años
  return `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
};

/**
 * Calcula el número de días en un período
 * @param {Date} start
 * @param {Date} end
 * @returns {number}
 */
export const getDaysInPeriod = (start, end) => {
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};
