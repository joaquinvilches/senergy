import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import moment from 'moment';
import { formatChileanNumber } from '../../utils/formatHelpers';
import { safeToDate } from '../../utils/dateHelpers';
import { SPACING, TYPOGRAPHY, RADIUS } from '../../constants/theme';
import Icon from '../Icon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Gráfico de línea profesional con react-native-chart-kit
 * Muestra la evolución del consumo/costo a lo largo del tiempo
 */
export const LineChartPro = ({ data, unit = 'kWh', colors, isDark }) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="chart-line" size={48} color={colors.TEXT_LIGHT} style={styles.emptyIcon} />
        <Text style={[styles.emptyText, { color: colors.TEXT_LIGHT }]}>
          No hay suficientes datos para mostrar el gráfico
        </Text>
      </View>
    );
  }

  // Transformar datos para chart-kit
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
        <Icon name="chart-line" size={48} color={colors.TEXT_LIGHT} style={styles.emptyIcon} />
        <Text style={[styles.emptyText, { color: colors.TEXT_LIGHT }]}>
          No hay datos válidos para mostrar en el gráfico
        </Text>
      </View>
    );
  }

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
      strokeWidth: 3,
    }],
  };

  const chartConfig = {
    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    backgroundGradientFrom: isDark ? '#1E293B' : '#FFFFFF',
    backgroundGradientTo: isDark ? '#0F172A' : '#F8FAFC',
    decimalPlaces: 0,
    color: (opacity = 1) => {
      const baseColor = isDark ? '#60A5FA' : '#3B82F6';
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
    propsForDots: {
      r: 6,
      strokeWidth: 3,
      stroke: isDark ? '#60A5FA' : '#3B82F6',
      fill: isDark ? '#1E293B' : '#FFFFFF',
    },
    propsForBackgroundLines: {
      strokeDasharray: '6 6',
      stroke: colors.BORDER,
      strokeOpacity: isDark ? 0.2 : 0.3,
    },
    fillShadowGradient: isDark ? '#60A5FA' : '#3B82F6',
    fillShadowGradientOpacity: isDark ? 0.15 : 0.25,
    fillShadowGradientFrom: isDark ? '#60A5FA' : '#3B82F6',
    fillShadowGradientFromOpacity: isDark ? 0.3 : 0.4,
    fillShadowGradientTo: isDark ? '#1E40AF' : '#60A5FA',
    fillShadowGradientToOpacity: 0.05,
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <View style={[styles.iconBg, { backgroundColor: `${colors.PRIMARY}15` }]}>
          <Icon name="chart-line-variant" size={20} color={colors.PRIMARY} />
        </View>
        <View>
          <Text style={[styles.title, { color: colors.TEXT_DARK }]}>
            Evolución de {unit === 'kWh' ? 'Consumo' : 'Costo'}
          </Text>
          <Text style={[styles.dataPoints, { color: colors.TEXT_LIGHT }]}>
            {data.length} punto{data.length > 1 ? 's' : ''} de datos
          </Text>
        </View>
      </View>

      <View style={styles.chartWrapper}>
        <LineChart
          data={chartData}
          width={SCREEN_WIDTH - 64}
          height={240}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withInnerLines={true}
          withOuterLines={false}
          withVerticalLines={false}
          withHorizontalLines={true}
          withDots={true}
          withShadow={true}
          fromZero={false}
          segments={4}
        />
      </View>

      <View style={[styles.footer, { backgroundColor: `${colors.ACCENT}08` }]}>
        <Icon name="information-outline" size={14} color={colors.ACCENT} style={styles.footerIcon} />
        <Text style={[styles.subtitle, { color: colors.TEXT_LIGHT }]}>
          Datos ordenados cronológicamente
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
});

export default LineChartPro;
