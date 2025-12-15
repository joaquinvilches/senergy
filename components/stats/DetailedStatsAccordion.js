import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useDarkMode } from '../../utils/darkModeContext';
import { SPACING, TYPOGRAPHY, RADIUS, ELEVATION } from '../../constants/theme';
import Icon from '../Icon';
import { formatKWh, formatCLP } from '../../utils/formatHelpers';

export const DetailedStatsAccordion = ({ stats }) => {
  const { colors } = useDarkMode();
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Valores seguros con fallback
  const safeStats = {
    totalConsumption: stats?.totalConsumption ?? 0,
    totalCost: stats?.totalCost ?? 0,
    averageConsumption: stats?.averageConsumption ?? 0,
    averageCost: stats?.averageCost ?? 0,
    peakConsumption: stats?.peakConsumption ?? 0,
    minConsumption: stats?.minConsumption ?? 0,
    avgDaysBetweenReadings: stats?.avgDaysBetweenReadings ?? 0,
    count: stats?.count ?? 0,
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.CARD, borderColor: colors.BORDER }]}>
      {/* Header (siempre visible) */}
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Icon name="chart-box-outline" size={20} color={colors.PRIMARY} style={styles.headerIcon} />
          <Text style={[styles.headerText, { color: colors.TEXT_DARK }]}>
            Estadísticas Detalladas
          </Text>
        </View>

        <Icon
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color={colors.TEXT_LIGHT}
        />
      </TouchableOpacity>

      {/* Contenido expandible */}
      {isExpanded && (
        <View style={styles.content}>
          {/* Fila 1: Consumo */}
          <View style={styles.row}>
            <View style={[styles.statItem, { backgroundColor: colors.BACKGROUND }]}>
              <View style={[styles.iconContainer, { backgroundColor: `${colors.PRIMARY}20` }]}>
                <Icon name="lightning-bolt" size={20} color={colors.PRIMARY} />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={[styles.statLabel, { color: colors.TEXT_LIGHT }]}>
                  Consumo Total
                </Text>
                <Text style={[styles.statValue, { color: colors.TEXT_DARK }]}>
                  {formatKWh(safeStats.totalConsumption, 0)}
                </Text>
                <Text style={[styles.statSubValue, { color: colors.TEXT_LIGHT }]}>
                  Prom: {formatKWh(safeStats.averageConsumption, 0)}
                </Text>
              </View>
            </View>

            <View style={[styles.statItem, { backgroundColor: colors.BACKGROUND }]}>
              <View style={[styles.iconContainer, { backgroundColor: `${colors.SUCCESS}20` }]}>
                <Icon name="cash" size={20} color={colors.SUCCESS} />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={[styles.statLabel, { color: colors.TEXT_LIGHT }]}>
                  Costo Total
                </Text>
                <Text style={[styles.statValue, { color: colors.TEXT_DARK }]}>
                  {formatCLP(safeStats.totalCost)}
                </Text>
                <Text style={[styles.statSubValue, { color: colors.TEXT_LIGHT }]}>
                  Prom: {formatCLP(safeStats.averageCost)}
                </Text>
              </View>
            </View>
          </View>

          {/* Fila 2: Pico y Mínimo */}
          <View style={styles.row}>
            <View style={[styles.statItem, { backgroundColor: colors.BACKGROUND }]}>
              <View style={[styles.iconContainer, { backgroundColor: `${colors.ERROR}20` }]}>
                <Icon name="arrow-up-circle" size={20} color={colors.ERROR} />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={[styles.statLabel, { color: colors.TEXT_LIGHT }]}>
                  Pico de Consumo
                </Text>
                <Text style={[styles.statValue, { color: colors.TEXT_DARK }]}>
                  {formatKWh(safeStats.peakConsumption, 0)}
                </Text>
              </View>
            </View>

            <View style={[styles.statItem, { backgroundColor: colors.BACKGROUND }]}>
              <View style={[styles.iconContainer, { backgroundColor: `${colors.ACCENT}20` }]}>
                <Icon name="arrow-down-circle" size={20} color={colors.ACCENT} />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={[styles.statLabel, { color: colors.TEXT_LIGHT }]}>
                  Consumo Mínimo
                </Text>
                <Text style={[styles.statValue, { color: colors.TEXT_DARK }]}>
                  {formatKWh(safeStats.minConsumption, 0)}
                </Text>
              </View>
            </View>
          </View>

          {/* Fila 3: Frecuencia y Total de lecturas */}
          <View style={styles.row}>
            <View style={[styles.statItem, { backgroundColor: colors.BACKGROUND }]}>
              <View style={[styles.iconContainer, { backgroundColor: `${colors.WARNING}20` }]}>
                <Icon name="calendar-clock" size={20} color={colors.WARNING} />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={[styles.statLabel, { color: colors.TEXT_LIGHT }]}>
                  Frecuencia de Lectura
                </Text>
                <Text style={[styles.statValue, { color: colors.TEXT_DARK }]}>
                  {safeStats.avgDaysBetweenReadings || 0} días
                </Text>
                <Text style={[styles.statSubValue, { color: colors.TEXT_LIGHT }]}>
                  Promedio entre lecturas
                </Text>
              </View>
            </View>

            <View style={[styles.statItem, { backgroundColor: colors.BACKGROUND }]}>
              <View style={[styles.iconContainer, { backgroundColor: `${colors.ACCENT}20` }]}>
                <Icon name="counter" size={20} color={colors.ACCENT} />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={[styles.statLabel, { color: colors.TEXT_LIGHT }]}>
                  Total de Lecturas
                </Text>
                <Text style={[styles.statValue, { color: colors.TEXT_DARK }]}>
                  {safeStats.count}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
    ...ELEVATION.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    marginRight: SPACING.sm,
  },
  headerText: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  content: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  statTextContainer: {
    flex: 1,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  statSubValue: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: SPACING.xs / 2,
  },
});
