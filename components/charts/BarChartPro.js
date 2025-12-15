import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import moment from 'moment';
import { formatChileanNumber } from '../../utils/formatHelpers';
import { safeToDate } from '../../utils/dateHelpers';
import { SPACING, TYPOGRAPHY, RADIUS, ELEVATION } from '../../constants/theme';
import Icon from '../Icon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Gráfico de barras profesional con react-native-chart-kit
 * Muestra comparativa de consumo/costo por lectura
 */
export const BarChartPro = ({ data, unit = 'kWh', colors, isDark }) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="chart-bar" size={48} color={colors.TEXT_LIGHT} style={styles.emptyIcon} />
        <Text style={[styles.emptyText, { color: colors.TEXT_LIGHT }]}>
          No hay datos para comparar
        </Text>
      </View>
    );
  }

  // Transformar datos para chart-kit con validación
  const values = data.map(reading => {
    const value = unit === 'kWh' ? reading.consumption : reading.cost;
    // Asegurar que el valor sea un número válido
    return (value && !isNaN(value) && isFinite(value)) ? Number(value) : 0;
  });

  // Validar que haya al menos un valor no-cero
  const hasValidData = values.some(v => v > 0);
  if (!hasValidData) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="chart-bar" size={48} color={colors.TEXT_LIGHT} style={styles.emptyIcon} />
        <Text style={[styles.emptyText, { color: colors.TEXT_LIGHT }]}>
          No hay datos válidos para comparar
        </Text>
      </View>
    );
  }

  const maxValue = Math.max(...values);
  const avgValue = values.reduce((sum, val) => sum + val, 0) / values.length;

  // Generar etiquetas con fechas cortas usando moment
  const labels = data.map((reading, index) => {
    if (data.length <= 7) {
      // Si hay pocas lecturas, mostrar fecha completa
      const date = safeToDate(reading.date);
      if (!date) {
        return `L${index + 1}`;
      }
      // Usar moment para formato consistente
      return moment(date).format('D MMM');
    } else {
      // Si hay muchas, usar L1, L2, etc.
      return `L${index + 1}`;
    }
  });

  const chartData = {
    labels,
    datasets: [{
      data: values,
    }],
  };

  const chartConfig = {
    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    backgroundGradientFrom: isDark ? '#1E293B' : '#FFFFFF',
    backgroundGradientTo: isDark ? '#0F172A' : '#F8FAFC',
    decimalPlaces: 0,
    color: (opacity = 1) => {
      // Gradiente vibrante para las barras
      const baseColor = isDark ? '#10B981' : '#059669';
      const hex = Math.round(opacity * 255).toString(16).padStart(2, '0');
      return `${baseColor}${hex}`;
    },
    labelColor: (opacity = 1) => colors.TEXT_LIGHT,
    formatYLabel: unit === '$' ? (value) => {
      const num = parseFloat(value);
      if (num >= 1000) {
        return `$${formatChileanNumber(num, 0)}`;
      }
      return `$${Math.round(num)}`;
    } : undefined,
    style: {
      borderRadius: RADIUS.lg,
    },
    propsForBackgroundLines: {
      strokeDasharray: '6 6',
      stroke: colors.BORDER,
      strokeOpacity: isDark ? 0.2 : 0.3,
    },
    barPercentage: 0.65,
    fillShadowGradient: isDark ? '#10B981' : '#059669',
    fillShadowGradientOpacity: isDark ? 0.25 : 0.35,
  };

  return (
    <View style={styles.container}>
      {/* Título mejorado con icon background */}
      <View style={styles.titleContainer}>
        <View style={[styles.iconBg, { backgroundColor: `${colors.SUCCESS}15` }]}>
          <Icon name="chart-bar" size={20} color={colors.SUCCESS} />
        </View>
        <View>
          <Text style={[styles.title, { color: colors.TEXT_DARK }]}>
            Comparativa de {unit === 'kWh' ? 'Consumo' : 'Gasto'}
          </Text>
          <Text style={[styles.dataPoints, { color: colors.TEXT_LIGHT }]}>
            {data.length} lectura{data.length > 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      <View style={styles.chartWrapper}>
        <BarChart
          data={chartData}
          width={SCREEN_WIDTH - 64}
          height={240}
          chartConfig={chartConfig}
          style={styles.chart}
          withInnerLines={true}
          withHorizontalLabels={true}
          withVerticalLabels={true}
          fromZero={true}
          showValuesOnTopOfBars={false}
          showBarTops={false}
        />
      </View>

      {/* Stats mejorados con cards */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: `${colors.PRIMARY}08` }]}>
          <Icon name="chart-timeline-variant" size={18} color={colors.PRIMARY} style={styles.statIcon} />
          <View style={styles.statContent}>
            <Text style={[styles.statLabel, { color: colors.TEXT_LIGHT }]}>Promedio</Text>
            <Text style={[styles.statValue, { color: colors.PRIMARY }]}>
              {unit === '$' ? `$${formatChileanNumber(avgValue, 0)}` : `${Math.round(avgValue)} ${unit}`}
            </Text>
          </View>
        </View>
        <View style={[styles.statCard, { backgroundColor: `${colors.ERROR}08` }]}>
          <Icon name="trending-up" size={18} color={colors.ERROR} style={styles.statIcon} />
          <View style={styles.statContent}>
            <Text style={[styles.statLabel, { color: colors.TEXT_LIGHT }]}>Máximo</Text>
            <Text style={[styles.statValue, { color: colors.ERROR }]}>
              {unit === '$' ? `$${formatChileanNumber(maxValue, 0)}` : `${Math.round(maxValue)} ${unit}`}
            </Text>
          </View>
        </View>
      </View>

      {/* Footer con info */}
      <View style={[styles.footer, { backgroundColor: `${colors.SUCCESS}08` }]}>
        <Icon name="information-outline" size={14} color={colors.SUCCESS} style={styles.footerIcon} />
        <Text style={[styles.subtitle, { color: colors.TEXT_LIGHT }]}>
          Comparación entre lecturas del período
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
    marginHorizontal: SPACING.lg,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md + SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.3,
  },
  dataPoints: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  chartWrapper: {
    alignItems: 'center',
  },
  chart: {
    marginVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
  },
  emptyContainer: {
    padding: SPACING['3xl'] + 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.base,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  statIcon: {
    marginRight: SPACING.sm,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginBottom: SPACING.xs / 2,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  footerIcon: {
    marginRight: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});

export default BarChartPro;
