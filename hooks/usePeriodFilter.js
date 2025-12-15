import { useMemo } from 'react';
import {
  getDateRangeForPeriod,
  getPeriodLabel,
  getPreviousPeriod,
  filterReadingsByDateRange,
  formatDateRange,
  getDaysInPeriod,
} from '../utils/periodUtils';

/**
 * Hook para manejo de filtros de período
 * @param {Array} allReadings - Todas las lecturas disponibles
 * @param {string} selectedPeriod - Período seleccionado
 * @param {object} customRange - Rango personalizado (opcional)
 * @returns {object}
 */
export const usePeriodFilter = (allReadings, selectedPeriod, customRange = null) => {
  // Calcular rango de fechas del período seleccionado
  const dateRange = useMemo(() => {
    return getDateRangeForPeriod(selectedPeriod, customRange);
  }, [selectedPeriod, customRange]);

  // Calcular rango del período anterior para comparación
  const previousDateRange = useMemo(() => {
    return getPreviousPeriod(selectedPeriod);
  }, [selectedPeriod]);

  // Filtrar lecturas del período actual
  const currentPeriodReadings = useMemo(() => {
    if (!allReadings || allReadings.length === 0) return [];
    return filterReadingsByDateRange(allReadings, dateRange.start, dateRange.end);
  }, [allReadings, dateRange]);

  // Filtrar lecturas del período anterior
  const previousPeriodReadings = useMemo(() => {
    if (!allReadings || allReadings.length === 0) return [];
    return filterReadingsByDateRange(allReadings, previousDateRange.start, previousDateRange.end);
  }, [allReadings, previousDateRange]);

  // Label legible del período
  const periodLabel = useMemo(() => {
    return getPeriodLabel(selectedPeriod);
  }, [selectedPeriod]);

  // Label con el rango de fechas
  const dateRangeLabel = useMemo(() => {
    return formatDateRange(dateRange.start, dateRange.end);
  }, [dateRange]);

  // Número de días en el período
  const daysInPeriod = useMemo(() => {
    return getDaysInPeriod(dateRange.start, dateRange.end);
  }, [dateRange]);

  // Calcular comparación con período anterior
  const comparison = useMemo(() => {
    if (previousPeriodReadings.length === 0) {
      return null;
    }

    const currentTotal = currentPeriodReadings.reduce((sum, r) => sum + (r.consumption || 0), 0);
    const previousTotal = previousPeriodReadings.reduce((sum, r) => sum + (r.consumption || 0), 0);
    const currentCost = currentPeriodReadings.reduce((sum, r) => sum + (r.cost || 0), 0);
    const previousCost = previousPeriodReadings.reduce((sum, r) => sum + (r.cost || 0), 0);

    const consumptionChange = previousTotal > 0
      ? ((currentTotal - previousTotal) / previousTotal) * 100
      : 0;

    const costChange = previousCost > 0
      ? ((currentCost - previousCost) / previousCost) * 100
      : 0;

    return {
      consumptionChange: consumptionChange.toFixed(1),
      costChange: costChange.toFixed(1),
      currentTotal,
      previousTotal,
      currentCost,
      previousCost,
    };
  }, [currentPeriodReadings, previousPeriodReadings]);

  return {
    // Lecturas filtradas
    currentPeriodReadings,
    previousPeriodReadings,

    // Información del período
    dateRange,
    previousDateRange,
    periodLabel,
    dateRangeLabel,
    daysInPeriod,

    // Comparación
    comparison,

    // Helpers
    hasCurrentData: currentPeriodReadings.length > 0,
    hasPreviousData: previousPeriodReadings.length > 0,
    canCompare: previousPeriodReadings.length > 0 && currentPeriodReadings.length > 0,
  };
};
