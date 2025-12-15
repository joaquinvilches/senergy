import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { formatChileanNumber } from '../../utils/formatHelpers';
import { SPACING, TYPOGRAPHY, RADIUS, ELEVATION } from '../../constants/theme';
import Icon from '../Icon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Gráfico de torta profesional con leyenda personalizada
 * Muestra distribución por medidor con porcentajes claros
 */
export const PieChartPro = ({ data, unit = 'kWh', colors, isDark }) => {
  if (!data || data.length <= 1) {
    return null; // Solo mostrar si hay múltiples medidores
  }

  // Colores profesionales
  const CHART_COLORS = isDark
    ? ['#60A5FA', '#34D399', '#FBBF24', '#A78BFA', '#F472B6', '#22D3EE']
    : ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];

  // Calcular total para porcentajes
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Transformar datos para el gráfico (sin leyenda integrada)
  const chartData = data.map((item, index) => ({
    name: item.name,
    value: item.value,
    color: CHART_COLORS[index % CHART_COLORS.length],
    legendFontColor: colors.TEXT_DARK,
    legendFontSize: 0, // Ocultamos la leyenda integrada
  }));

  const chartConfig = {
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => colors.TEXT_DARK,
  };

  return (
    <View style={styles.container}>
      {/* Título mejorado con icon background */}
      <View style={styles.titleContainer}>
        <View style={[styles.iconBg, { backgroundColor: `${colors.ACCENT}15` }]}>
          <Icon name="chart-donut" size={20} color={colors.ACCENT} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.TEXT_DARK }]}>
            Distribución por Medidor
          </Text>
          <Text style={[styles.dataPoints, { color: colors.TEXT_LIGHT }]}>
            {data.length} medidor{data.length > 1 ? 'es' : ''}
          </Text>
        </View>
      </View>

      {/* Gráfico de torta sin leyenda */}
      <View style={styles.chartWrapper}>
        <PieChart
          data={chartData}
          width={SCREEN_WIDTH - 64}
          height={200}
          chartConfig={chartConfig}
          accessor="value"
          backgroundColor="transparent"
          paddingLeft={0}
          center={[(SCREEN_WIDTH - 64) / 4, 0]}
          absolute
          hasLegend={false}
          style={styles.chart}
        />
      </View>

      {/* Leyenda personalizada mejorada con gradientes sutiles */}
      <View style={styles.legendContainer}>
        {data.map((item, index) => {
          const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
          const displayValue = unit === '$'
            ? `$${formatChileanNumber(item.value, 0)}`
            : `${formatChileanNumber(item.value, 0)} kWh`;
          const colorItem = CHART_COLORS[index % CHART_COLORS.length];

          return (
            <View
              key={index}
              style={[
                styles.legendItem,
                {
                  backgroundColor: `${colorItem}10`,
                  borderLeftColor: colorItem,
                  borderLeftWidth: 3,
                },
              ]}
            >
              {/* Indicador de color con gradiente */}
              <LinearGradient
                colors={[colorItem, `${colorItem}CC`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.colorBox}
              />

              {/* Información del medidor */}
              <View style={styles.legendInfo}>
                <View style={styles.legendRow}>
                  <Text style={[styles.meterName, { color: colors.TEXT_DARK }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View style={[styles.percentageBadge, { backgroundColor: colorItem }]}>
                    <Text style={[styles.percentage, { color: '#FFFFFF' }]}>
                      {percentage}%
                    </Text>
                  </View>
                </View>
                <View style={styles.valueRow}>
                  <Icon name={unit === '$' ? 'cash' : 'lightning-bolt'} size={14} color={colors.TEXT_LIGHT} style={styles.valueIcon} />
                  <Text style={[styles.value, { color: colors.TEXT_LIGHT }]}>
                    {displayValue}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* Total mejorado con gradiente */}
      <LinearGradient
        colors={isDark
          ? ['rgba(59, 130, 246, 0.15)', 'rgba(59, 130, 246, 0.05)']
          : ['rgba(59, 130, 246, 0.1)', 'rgba(59, 130, 246, 0.03)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.totalGradient}
      >
        <View style={[styles.totalContainer, { borderColor: colors.BORDER }]}>
          <View style={styles.totalLeft}>
            <Icon name="sigma" size={20} color={colors.PRIMARY} style={styles.totalIcon} />
            <Text style={[styles.totalLabel, { color: colors.TEXT_LIGHT }]}>Total acumulado</Text>
          </View>
          <Text style={[styles.totalValue, { color: colors.PRIMARY }]}>
            {unit === '$'
              ? `$${formatChileanNumber(total, 0)}`
              : `${formatChileanNumber(total, 0)} kWh`}
          </Text>
        </View>
      </LinearGradient>

      {/* Footer con info */}
      <View style={[styles.footer, { backgroundColor: `${colors.ACCENT}08` }]}>
        <Icon name="information-outline" size={14} color={colors.ACCENT} style={styles.footerIcon} />
        <Text style={[styles.subtitle, { color: colors.TEXT_LIGHT }]}>
          Porcentaje relativo al consumo total
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
    marginBottom: SPACING.lg + SPACING.xs,
  },
  chart: {
    borderRadius: RADIUS.lg,
  },
  legendContainer: {
    gap: SPACING.sm + 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  colorBox: {
    width: 20,
    height: 20,
    borderRadius: RADIUS.sm,
    marginRight: SPACING.md,
    ...ELEVATION.xs,
  },
  legendInfo: {
    flex: 1,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  meterName: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
    flex: 1,
    marginRight: SPACING.sm,
    letterSpacing: 0.2,
  },
  percentageBadge: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs / 2,
    borderRadius: RADIUS.md,
    ...ELEVATION.xs,
  },
  percentage: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.3,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueIcon: {
    marginRight: SPACING.xs,
  },
  value: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  totalGradient: {
    marginTop: SPACING.lg,
    borderRadius: RADIUS.lg + 2,
    ...ELEVATION.sm,
  },
  totalContainer: {
    paddingVertical: SPACING.md + 2,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg + 2,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  totalIcon: {
    marginRight: SPACING.sm,
  },
  totalLabel: {
    fontSize: TYPOGRAPHY.sizes.sm + 1,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  totalValue: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: -0.5,
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

export default PieChartPro;
