import { useMemo } from 'react';
import {
  transformToLineChartData,
  transformToPieChartData,
  transformToBarChartData,
} from '../utils/chartTransformers';
import { calculateAggregatedStats, calculateBudgetProgress } from '../utils/statsCalculations';

const MONTHLY_BUDGET_CLP = 30000; // Presupuesto referencial

/**
 * Hook personalizado para transformar datos en formatos de gráficos
 *
 * @param {array} filteredReadings - Lecturas filtradas
 * @param {string} selectedPeriod - 'week' | 'month' | 'year'
 * @param {string} selectedMeter - 'all' | meterId
 * @param {string} unit - 'kWh' | '$'
 * @param {object} colors - Tema de colores
 * @returns {object} { lineData, pieData, barData, kpis, budgetProgress }
 */
export const useChartData = (filteredReadings, selectedPeriod, selectedMeter, unit, colors) => {
  // Gráfico de línea (evolución temporal)
  const lineData = useMemo(() => {
    return transformToLineChartData(filteredReadings, selectedPeriod, unit, colors.PRIMARY);
  }, [filteredReadings, selectedPeriod, unit, colors.PRIMARY]);

  // Gráfico de torta (distribución por medidor)
  const pieData = useMemo(() => {
    return transformToPieChartData(filteredReadings, colors.TEXT_DARK);
  }, [filteredReadings, colors.TEXT_DARK]);

  // Gráfico de barras (comparativa por día/mes)
  const barData = useMemo(() => {
    return transformToBarChartData(filteredReadings, selectedPeriod, unit);
  }, [filteredReadings, selectedPeriod, unit]);

  // KPIs y estadísticas agregadas
  const kpis = useMemo(() => {
    return calculateAggregatedStats(filteredReadings);
  }, [filteredReadings]);

  // Progreso del presupuesto mensual
  const budgetProgress = useMemo(() => {
    return calculateBudgetProgress(filteredReadings, MONTHLY_BUDGET_CLP);
  }, [filteredReadings]);

  // Verificar si hay datos válidos
  const hasLineData = lineData?.datasets?.[0]?.data?.length > 0 && lineData.datasets[0].data.some((v) => v > 0);
  const showPie = pieData.length > 1 && selectedMeter === 'all';

  return {
    lineData,
    pieData,
    barData,
    kpis,
    budgetProgress,
    hasLineData,
    showPie,
    MONTHLY_BUDGET_CLP,
  };
};
