/**
 * Funciones auxiliares para cálculos estadísticos
 */

import { safeToDate } from './dateHelpers';

/**
 * Calcula la tendencia de consumo (up, down, neutral)
 * @param {Array} readings - Lecturas ordenadas cronológicamente
 * @returns {string} - 'up' | 'down' | 'neutral'
 */
export const calculateTrend = (readings) => {
  if (!readings || readings.length < 4) return 'neutral';

  const midpoint = Math.floor(readings.length / 2);
  const firstHalf = readings.slice(0, midpoint);
  const secondHalf = readings.slice(midpoint);

  const firstAvg = calculateAverage(firstHalf.map(r => r.consumption || 0));
  const secondAvg = calculateAverage(secondHalf.map(r => r.consumption || 0));

  if (secondAvg > firstAvg * 1.1) return 'up'; // Subió más del 10%
  if (secondAvg < firstAvg * 0.9) return 'down'; // Bajó más del 10%
  return 'neutral';
};

/**
 * Encuentra la lectura con el consumo máximo
 * @param {Array} readings
 * @returns {object} - {reading, date, value}
 */
export const findPeakReading = (readings) => {
  if (!readings || readings.length === 0) return null;

  const peak = readings.reduce((max, current) => {
    return (current.consumption || 0) > (max.consumption || 0) ? current : max;
  }, readings[0]);

  return {
    reading: peak,
    date: safeToDate(peak.date),
    value: peak.consumption || 0,
  };
};

/**
 * Encuentra la lectura con el consumo mínimo
 * @param {Array} readings
 * @returns {object} - {reading, date, value}
 */
export const findMinReading = (readings) => {
  if (!readings || readings.length === 0) return null;

  // Filtrar lecturas con consumo > 0
  const validReadings = readings.filter(r => (r.consumption || 0) > 0);
  if (validReadings.length === 0) return null;

  const min = validReadings.reduce((min, current) => {
    return (current.consumption || 0) < (min.consumption || 0) ? current : min;
  }, validReadings[0]);

  return {
    reading: min,
    date: safeToDate(min.date),
    value: min.consumption || 0,
  };
};

/**
 * Calcula el promedio de un array de números
 * @param {Array} numbers
 * @returns {number}
 */
export const calculateAverage = (numbers) => {
  if (!numbers || numbers.length === 0) return 0;
  const validNumbers = numbers.filter(n => typeof n === 'number' && !isNaN(n) && isFinite(n));
  if (validNumbers.length === 0) return 0;
  const sum = validNumbers.reduce((acc, val) => acc + val, 0);
  return sum / validNumbers.length;
};

/**
 * Calcula el cambio porcentual entre dos valores
 * @param {number} current - Valor actual
 * @param {number} previous - Valor anterior
 * @returns {number} - Porcentaje de cambio
 */
export const calculatePercentageChange = (current, previous) => {
  if (!previous || previous === 0 || !isFinite(previous)) return 0;
  if (!current || !isFinite(current)) return 0;
  const change = ((current - previous) / previous) * 100;
  return isFinite(change) ? change : 0;
};

/**
 * Agrupa lecturas por medidor
 * @param {Array} readings
 * @returns {object} - {meterName: [readings]}
 */
export const groupReadingsByMeter = (readings) => {
  if (!readings || readings.length === 0) return {};

  return readings.reduce((groups, reading) => {
    const meterName = reading.meterName || 'Sin nombre';
    if (!groups[meterName]) {
      groups[meterName] = [];
    }
    groups[meterName].push(reading);
    return groups;
  }, {});
};

/**
 * Proyecta el consumo mensual basado en la tendencia actual
 * @param {Array} readings - Lecturas del mes actual
 * @param {number} daysInMonth - Días totales del mes
 * @returns {number} - Consumo proyectado
 */
export const projectMonthlyConsumption = (readings, daysInMonth = 30) => {
  if (!readings || readings.length === 0) return 0;

  // Calcular consumo total hasta ahora
  const totalConsumption = readings.reduce((sum, r) => sum + (r.consumption || 0), 0);
  if (totalConsumption === 0) return 0;

  // Calcular días transcurridos
  const dates = readings
    .map(r => safeToDate(r.date))
    .filter(d => d !== null)
    .sort((a, b) => a - b);

  if (dates.length === 0) return totalConsumption;

  const firstDate = dates[0];
  const lastDate = dates[dates.length - 1];
  const daysElapsed = Math.max(1, Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)));

  // Proyectar al mes completo
  const dailyAverage = totalConsumption / daysElapsed;
  const projection = dailyAverage * daysInMonth;

  return isFinite(projection) ? projection : totalConsumption;
};

/**
 * Determina si un cambio es significativo (>10%)
 * @param {number} change - Porcentaje de cambio
 * @returns {boolean}
 */
export const isSignificantChange = (change) => {
  return Math.abs(change) >= 10;
};

/**
 * Calcula estadísticas completas de un conjunto de lecturas
 * @param {Array} readings
 * @returns {object}
 */
export const calculateFullStats = (readings) => {
  if (!readings || readings.length === 0) {
    return {
      totalConsumption: 0,
      totalCost: 0,
      averageConsumption: 0,
      averageCost: 0,
      peakConsumption: 0,
      minConsumption: 0,
      count: 0,
      trend: 'neutral',
      avgDaysBetweenReadings: 0,
    };
  }

  const consumptions = readings.map(r => r.consumption || 0).filter(c => c > 0);
  const costs = readings.map(r => r.cost || 0).filter(c => !isNaN(c) && isFinite(c));

  return {
    totalConsumption: consumptions.reduce((sum, c) => sum + c, 0),
    totalCost: costs.reduce((sum, c) => sum + c, 0),
    averageConsumption: calculateAverage(consumptions),
    averageCost: calculateAverage(costs),
    peakConsumption: consumptions.length > 0 ? Math.max(...consumptions) : 0,
    minConsumption: consumptions.length > 0 ? Math.min(...consumptions) : 0,
    count: readings.length,
    trend: calculateTrend(readings),
    avgDaysBetweenReadings: calculateAvgDaysBetweenReadings(readings),
  };
};

/**
 * Encuentra el medidor con mayor consumo
 * @param {Array} readings
 * @returns {object} - {name, consumption, percentage}
 */
export const findTopConsumingMeter = (readings) => {
  if (!readings || readings.length === 0) return null;

  const grouped = groupReadingsByMeter(readings);
  const totals = {};
  let grandTotal = 0;

  Object.keys(grouped).forEach(meterName => {
    const total = grouped[meterName].reduce((sum, r) => sum + (r.consumption || 0), 0);
    totals[meterName] = total;
    grandTotal += total;
  });

  if (grandTotal === 0) return null;

  const topMeter = Object.keys(totals).reduce((max, current) => {
    return totals[current] > totals[max] ? current : max;
  }, Object.keys(totals)[0]);

  return {
    name: topMeter,
    consumption: totals[topMeter],
    percentage: ((totals[topMeter] / grandTotal) * 100).toFixed(1),
  };
};

/**
 * Detecta consumos atípicos (outliers)
 * @param {Array} readings
 * @returns {Array} - Lecturas atípicas
 */
export const detectOutliers = (readings) => {
  if (!readings || readings.length < 4) return [];

  const consumptions = readings.map(r => r.consumption || 0).filter(c => c > 0);
  const avg = calculateAverage(consumptions);

  // Desviación estándar
  const squaredDiffs = consumptions.map(c => Math.pow(c - avg, 2));
  const variance = calculateAverage(squaredDiffs);
  const stdDev = Math.sqrt(variance);

  // Considerar outlier si está a más de 2 desviaciones estándar
  const threshold = avg + (2 * stdDev);

  return readings.filter(r => (r.consumption || 0) > threshold);
};

/**
 * Calcula el promedio de días entre lecturas
 * @param {Array} readings
 * @returns {number}
 */
export const calculateAvgDaysBetweenReadings = (readings) => {
  if (!readings || readings.length < 2) return 0;

  const sortedReadings = [...readings].sort((a, b) => {
    const dateA = safeToDate(a.date);
    const dateB = safeToDate(b.date);
    if (!dateA || !dateB) return 0;
    return dateA.getTime() - dateB.getTime();
  });

  let totalDays = 0;
  let validPairs = 0;

  for (let i = 1; i < sortedReadings.length; i++) {
    const prevDate = safeToDate(sortedReadings[i - 1].date);
    const currDate = safeToDate(sortedReadings[i].date);

    if (!prevDate || !currDate) continue;

    const daysDiff = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24));
    if (daysDiff > 0) {
      totalDays += daysDiff;
      validPairs++;
    }
  }

  return validPairs > 0 ? Math.round(totalDays / validPairs) : 0;
};
