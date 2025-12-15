import moment from 'moment';
import { safeToDate } from './dateHelpers';

/**
 * Convierte un color hexadecimal a RGBA
 */
export const hexToRgba = (hex, opacity = 1) => {
  const h = hex.replace('#', '');
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Calcula estadísticas agregadas de un conjunto de lecturas
 */
export const calculateAggregatedStats = (readings) => {
  let totalConsumption = 0;
  let totalCost = 0;
  const consumptions = [];

  readings.forEach((r) => {
    const c = Number(r.consumption || 0);
    const cost = Number(r.cost || 0);
    if (c > 0) {
      totalConsumption += c;
      totalCost += cost;
      consumptions.push(c);
    }
  });

  const avg = consumptions.length ? totalConsumption / consumptions.length : 0;

  // Calcular tendencia (últimas 3 vs 3 anteriores)
  let trend = 0;
  if (consumptions.length >= 6) {
    const recent = consumptions.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const previous = consumptions.slice(-6, -3).reduce((a, b) => a + b, 0) / 3;
    trend = previous > 0 ? ((recent - previous) / previous) * 100 : 0;
  }

  return {
    totalConsumption: totalConsumption.toFixed(2),
    totalCost,
    averageConsumption: avg.toFixed(2),
    trend: Number.isFinite(trend) ? Number(trend.toFixed(1)) : 0,
  };
};

/**
 * Detecta lecturas con consumo anormalmente alto
 */
export const detectHighConsumption = (readings, config) => {
  const thBase = Number(config?.ALERT_CONSUMPTION_THRESHOLD ?? 0.3);
  const consumptions = readings.map((r) => Number(r.consumption || 0)).filter((c) => c > 0);

  if (consumptions.length < 2) {
    return [];
  }

  const avg = consumptions.reduce((a, b) => a + b, 0) / consumptions.length;
  if (avg <= 0) {
    return [];
  }

  const threshold = avg * (1 + thBase);

  const detected = readings
    .filter((r) => Number(r.consumption || 0) > threshold)
    .map((r) => ({
      readingId: r.id, // Cambio de 'id' a 'readingId' para consistencia con useAlerts
      id: r.id, // Mantener 'id' por compatibilidad
      meterName: r.meterName || 'Medidor',
      consumption: Number(r.consumption || 0),
      averageConsumption: Number(avg.toFixed(2)), // Agregado para notificaciones
      type: 'high_consumption', // Agregado para filtrado en useAlerts
      date: safeToDate(r.date, new Date()),
      percentageOver: avg > 0
        ? (((Number(r.consumption) - avg) / avg) * 100).toFixed(1)
        : '0',
    }))
    .slice(0, 2);

  return detected;
};

/**
 * Calcula el progreso del presupuesto mensual
 */
export const calculateBudgetProgress = (readings, monthlyBudget) => {
  const monthNow = moment().format('YYYY-MM');
  const monthCost = readings
    .filter((r) => {
      const date = safeToDate(r.date);
      return date && moment(date).format('YYYY-MM') === monthNow;
    })
    .reduce((acc, r) => acc + Number(r.cost || 0), 0);

  const progress = Math.max(0, Math.min(1, monthCost / monthlyBudget));
  return { progress, monthCost };
};