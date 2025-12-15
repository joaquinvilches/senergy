import { useMemo } from 'react';
import {
  calculateTrend,
  findTopConsumingMeter,
  projectMonthlyConsumption,
  isSignificantChange,
  detectOutliers,
  calculateAverage,
} from '../utils/statsHelpers';
import { formatKWh, formatCLP } from '../utils/formatHelpers';

/**
 * Hook para generar insights automáticos inteligentes
 * @param {Array} currentReadings - Lecturas del período actual
 * @param {object} comparison - Comparación con período anterior
 * @param {number} monthlyBudget - Presupuesto mensual (opcional)
 * @param {number} daysInPeriod - Días en el período
 * @returns {Array} - Array de insights con prioridad
 */
export const useInsights = (currentReadings, comparison, monthlyBudget = null, daysInPeriod = 30) => {
  const insights = useMemo(() => {
    if (!currentReadings || currentReadings.length === 0) {
      return [];
    }

    const generatedInsights = [];

    // 1. INSIGHT: Comparación con período anterior
    if (comparison && comparison.consumptionChange) {
      const change = parseFloat(comparison.consumptionChange);

      if (isSignificantChange(change)) {
        if (change > 0) {
          generatedInsights.push({
            id: 'consumption_increase',
            type: 'warning',
            icon: 'trending-up',
            color: 'ERROR',
            title: 'Consumo en aumento',
            message: `Tu consumo subió ${Math.abs(change).toFixed(0)}% respecto al período anterior. Revisa electrodomésticos y luces innecesarias.`,
            priority: 1,
          });
        } else {
          generatedInsights.push({
            id: 'consumption_decrease',
            type: 'success',
            icon: 'trending-down',
            color: 'SUCCESS',
            title: '¡Excelente ahorro!',
            message: `Tu consumo bajó ${Math.abs(change).toFixed(0)}% respecto al período anterior. Mantén estos buenos hábitos.`,
            priority: 1,
          });
        }
      }
    }

    // 2. INSIGHT: Medidor con mayor consumo (si hay múltiples medidores)
    const uniqueMeters = [...new Set(currentReadings.map(r => r.meterName))];
    if (uniqueMeters.length > 1) {
      const topMeter = findTopConsumingMeter(currentReadings);
      if (topMeter && parseFloat(topMeter.percentage) > 40) {
        generatedInsights.push({
          id: 'top_meter',
          type: 'info',
          icon: 'lightning-bolt',
          color: 'ACCENT',
          title: 'Medidor destacado',
          message: `"${topMeter.name}" consume el ${topMeter.percentage}% del total`,
          priority: 2,
        });
      }
    }

    // 3. INSIGHT: Proyección de gasto mensual
    const now = new Date();
    const isCurrentMonth = daysInPeriod <= 31; // Aproximadamente un mes
    if (isCurrentMonth && currentReadings.length > 0) {
      const projectedConsumption = projectMonthlyConsumption(currentReadings, 30);
      const avgCostPerKwh = calculateAverage(currentReadings.map(r => r.costPerKwh || 0));
      const projectedCost = projectedConsumption * avgCostPerKwh;

      if (projectedCost > 0) {
        generatedInsights.push({
          id: 'monthly_projection',
          type: 'info',
          icon: 'chart-line',
          color: 'PRIMARY',
          title: 'Proyección mensual',
          message: `Vas camino a gastar ${formatCLP(projectedCost)} este mes. Planifica tu consumo para evitar sorpresas.`,
          priority: 3,
        });

        // Si hay presupuesto, comparar
        if (monthlyBudget && projectedCost > monthlyBudget) {
          const excess = projectedCost - monthlyBudget;
          const excessPercent = ((excess / monthlyBudget) * 100).toFixed(0);
          generatedInsights.push({
            id: 'budget_exceeded',
            type: 'warning',
            icon: 'alert-circle',
            color: 'WARNING',
            title: 'Presupuesto en riesgo',
            message: `Proyectas superar tu presupuesto en ${formatCLP(excess)} (${excessPercent}%). Reduce tu consumo ahora.`,
            priority: 1,
          });
        }
      }
    }

    // 4. INSIGHT: Detección de picos de consumo
    const outliers = detectOutliers(currentReadings);
    if (outliers.length > 0) {
      const avgConsumption = calculateAverage(currentReadings.map(r => r.consumption || 0));
      const peakReading = outliers[0];
      const peakPercent = (((peakReading.consumption / avgConsumption) - 1) * 100).toFixed(0);

      generatedInsights.push({
        id: 'consumption_spike',
        type: 'warning',
        icon: 'arrow-up-circle',
        color: 'WARNING',
        title: 'Pico de consumo detectado',
        message: `Hubo ${outliers.length} lectura(s) ${peakPercent}% sobre el promedio. Identifica qué causó estos aumentos.`,
        priority: 2,
      });
    }

    // 5. INSIGHT: Tendencia general
    const trend = calculateTrend(currentReadings);
    if (trend !== 'neutral' && !comparison) {
      // Solo mostrar si no hay comparación con período anterior
      if (trend === 'up') {
        generatedInsights.push({
          id: 'trend_up',
          type: 'info',
          icon: 'trending-up',
          color: 'TEXT_LIGHT',
          title: 'Tendencia al alza',
          message: 'Tu consumo viene aumentando. Considera revisar tus hábitos de consumo energético.',
          priority: 4,
        });
      } else if (trend === 'down') {
        generatedInsights.push({
          id: 'trend_down',
          type: 'success',
          icon: 'trending-down',
          color: 'SUCCESS',
          title: 'Tendencia a la baja',
          message: 'Tu consumo viene disminuyendo. ¡Sigue así!',
          priority: 4,
        });
      }
    }

    // 6. INSIGHT: Pocas lecturas registradas
    if (currentReadings.length < 3 && daysInPeriod > 30) {
      generatedInsights.push({
        id: 'few_readings',
        type: 'info',
        icon: 'information-outline',
        color: 'TEXT_LIGHT',
        title: 'Pocas lecturas registradas',
        message: 'Registra más lecturas para obtener estadísticas más precisas',
        priority: 5,
      });
    }

    // 7. INSIGHT: Consumo estable
    if (comparison && Math.abs(parseFloat(comparison.consumptionChange)) < 5) {
      generatedInsights.push({
        id: 'stable_consumption',
        type: 'success',
        icon: 'check-circle',
        color: 'SUCCESS',
        title: 'Consumo estable',
        message: 'Tu consumo se mantiene consistente. Tus hábitos energéticos son predecibles.',
        priority: 3,
      });
    }

    // Ordenar por prioridad (menor número = mayor prioridad)
    return generatedInsights
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 3); // Máximo 3 insights
  }, [currentReadings, comparison, monthlyBudget, daysInPeriod]);

  return insights;
};
