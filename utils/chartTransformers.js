import moment from 'moment';
import { toJSDate, hexToRgba } from './statsCalculations';

// Colores vibrantes para MODO CLARO
const COLORS_LIGHT = [
  '#3B82F6', // Azul
  '#10B981', // Verde
  '#F59E0B', // Amarillo
  '#8B5CF6', // Púrpura
  '#EC4899', // Rosa
  '#06B6D4', // Cyan
  '#F97316', // Naranja
  '#14B8A6', // Teal
];

// Colores más brillantes para MODO OSCURO
const COLORS_DARK = [
  '#60A5FA', // Azul brillante
  '#34D399', // Verde brillante
  '#FBBF24', // Amarillo brillante
  '#A78BFA', // Púrpura brillante
  '#F472B6', // Rosa brillante
  '#22D3EE', // Cyan brillante
  '#FB923C', // Naranja brillante
  '#2DD4BF', // Teal brillante
];

const getRandomColor = (isDark) => {
  const colors = isDark ? COLORS_DARK : COLORS_LIGHT;
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Transforma lecturas en datos para gráfico de línea (evolución temporal)
 */
export const transformToLineChartData = (readings, selectedPeriod, unit, primaryColor) => {
  const dataPoints = readings.map((r) => {
    const v = unit === 'kWh' ? Number(r.consumption || 0) : Number(r.cost || 0);
    return Number.isFinite(v) ? v : 0;
  });

  const labels = readings.map((r) => {
    const d = moment(toJSDate(r.date));
    if (selectedPeriod === 'week') return d.format('ddd');
    if (selectedPeriod === 'month') return d.format('DD/MM');
    return d.format('MMM');
  });

  // Si todos los valores son 0, poner un mínimo para que el gráfico se vea
  if (dataPoints.length > 0 && dataPoints.every((d) => d === 0)) {
    dataPoints[dataPoints.length - 1] = 0.1;
  }

  return {
    labels,
    datasets: [
      {
        data: dataPoints,
        color: (opacity = 1) => hexToRgba(primaryColor, opacity),
        strokeWidth: 3,
      },
    ],
    legend: [unit === 'kWh' ? 'Consumo' : 'Costo'],
  };
};

/**
 * Transforma lecturas en datos para gráfico de torta (distribución por medidor)
 */
export const transformToPieChartData = (readings, textColor, isDark = false) => {
  const meterMap = {};
  const usedColors = new Set();

  readings.forEach((r) => {
    const c = Number(r.consumption || 0);
    if (c <= 0) return;

    const key = r.meterName || r.meterId;
    if (!meterMap[key]) {
      // Asignar color único para cada medidor según el tema
      let color;
      if (r.meterColor) {
        color = r.meterColor;
      } else {
        // Asignar un color que no se haya usado
        const availableColors = isDark ? COLORS_DARK : COLORS_LIGHT;
        const unusedColors = availableColors.filter(c => !usedColors.has(c));
        color = unusedColors.length > 0 
          ? unusedColors[0] 
          : getRandomColor(isDark);
      }
      usedColors.add(color);

      meterMap[key] = {
        name: key,
        consumption: 0,
        color: color,
        legendFontColor: textColor,
        legendFontSize: 13,
      };
    }
    meterMap[key].consumption += c;
  });

  return Object.values(meterMap).map((m) => ({
    name: m.name,
    population: parseFloat(m.consumption.toFixed(2)),
    color: m.color,
    legendFontColor: m.legendFontColor,
    legendFontSize: m.legendFontSize,
  }));
};

/**
 * Transforma lecturas en datos para gráfico de barras (comparativa por día/mes)
 */
export const transformToBarChartData = (readings, selectedPeriod, unit) => {
  const map = new Map();

  readings.forEach((r) => {
    const d = moment(toJSDate(r.date));
    const key = selectedPeriod === 'year' ? d.format('YYYY-MM') : d.format('YYYY-MM-DD');
    const value = unit === 'kWh' ? Number(r.consumption || 0) : Number(r.cost || 0);
    map.set(key, (map.get(key) || 0) + (Number.isFinite(value) ? value : 0));
  });

  const entries = Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? -1 : 1));

  // Limitar cantidad de barras según período para legibilidad
  const limited =
    selectedPeriod === 'week'
      ? entries.slice(-7)
      : selectedPeriod === 'month'
      ? entries.slice(-30)
      : entries.slice(-12);

  const labels = limited.map(([k]) =>
    selectedPeriod === 'year' ? moment(k + '-01').format('MMM') : moment(k).format('DD/MM')
  );

  const data = limited.map(([, v]) => v);

  return {
    labels,
    datasets: [{ data }],
  };
};      