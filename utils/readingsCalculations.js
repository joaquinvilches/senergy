import moment from 'moment';
import { calculateConsumption } from './calculations';
import { getMonthYear, safeToDate } from './dateHelpers';

/**
 * Calcula el consumo de cada lectura basado en la anterior
 */
export const calculateReadingsConsumption = (readings) => {
  return readings.map((reading, index) => {
    let consumption = 0;
    if (index > 0) {
      consumption = calculateConsumption(readings[index - 1].value, reading.value);
    }
    return {
      ...reading,
      consumption,
      costPerKwh: reading.costPerKwh || 220,
    };
  });
};

/**
 * Agrupa lecturas por mes y calcula estadísticas
 */
export const groupReadingsByMonth = (readings) => {
  const monthlyMap = {};

  readings.forEach((reading) => {
    if (reading.consumption && reading.consumption > 0) {
      const month = getMonthYear(reading.date);
      if (!month) {
        console.warn('⚠️ Lectura con fecha inválida ignorada en groupReadingsByMonth:', reading.id);
        return;
      }
      if (!monthlyMap[month]) {
        monthlyMap[month] = {
          consumption: 0,
          cost: 0,
          count: 0,
        };
      }
      monthlyMap[month].consumption += reading.consumption;
      monthlyMap[month].cost += reading.cost || 0;
      monthlyMap[month].count += 1;
    }
  });

  return monthlyMap;
};

/**
 * Compara estadísticas de dos meses
 */
export const compareMonths = (monthlyStats, currentMonth, previousMonth) => {
  const currentData = monthlyStats[currentMonth] || { consumption: 0, cost: 0 };
  const previousData = monthlyStats[previousMonth] || { consumption: 0, cost: 0 };

  const consumptionDiff = currentData.consumption - previousData.consumption;
  const costDiff = currentData.cost - previousData.cost;
  const percentageDiff = previousData.consumption > 0
    ? ((consumptionDiff / previousData.consumption) * 100).toFixed(1)
    : '0.0';

  return {
    currentMonth: currentData,
    previousMonth: previousData,
    consumptionDiff,
    costDiff,
    percentageDiff,
  };
};

/**
 * Filtra lecturas por mes específico
 */
export const filterReadingsByMonth = (readings, selectedMonth) => {
  return readings.filter((r) => {
    const month = getMonthYear(r.date);
    return month === selectedMonth;
  });
};