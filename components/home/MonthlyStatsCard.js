import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import moment from 'moment';
import { useDarkMode } from '../../utils/darkModeContext';
import { SPACING, TYPOGRAPHY, RADIUS, ELEVATION } from '../../constants/theme';
import { formatKWh, formatCLP } from '../../utils/formatHelpers';
import Icon from '../Icon';

/**
 * Tarjeta de estadísticas mensuales en HomeScreen
 */
export const MonthlyStatsCard = ({ totalConsumption, totalCost, animValue }) => {
  const { colors } = useDarkMode();

  return (
    <Animated.View
      style={{
        opacity: animValue,
        transform: [{
          scale: animValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0.9, 1],
          }),
        }],
      }}
    >
      <View style={[styles.statsCard, { backgroundColor: colors.CARD, borderColor: colors.BORDER }]}>
        {/* Header */}
        <View style={styles.statsHeader}>
          <View style={[styles.statsIconBg, { backgroundColor: `${colors.SUCCESS}15` }]}>
            <Icon name="chart-timeline-variant" size={18} color={colors.SUCCESS} />
          </View>
          <View>
            <Text style={[styles.statsTitle, { color: colors.TEXT_DARK }]}>
              Resumen de {moment().format('MMMM')}
            </Text>
            <Text style={[styles.statsSubtitle, { color: colors.TEXT_LIGHT }]}>
              Consumo total de tus medidores
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Consumo */}
          <View style={[styles.statBox, { backgroundColor: colors.BACKGROUND }]}>
            <View style={[styles.statIconBg, { backgroundColor: `${colors.PRIMARY}15` }]}>
              <Icon name="lightning-bolt" size={20} color={colors.PRIMARY} />
            </View>
            <View style={styles.statContent}>
              <Text style={[styles.statLabel, { color: colors.TEXT_LIGHT }]}>
                Consumo
              </Text>
              <Text style={[styles.statValue, { color: colors.PRIMARY }]}>
                {formatKWh(totalConsumption, 1)}
              </Text>
            </View>
          </View>

          {/* Gasto */}
          <View style={[styles.statBox, { backgroundColor: colors.BACKGROUND }]}>
            <View style={[styles.statIconBg, { backgroundColor: `${colors.ACCENT}15` }]}>
              <Icon name="cash" size={20} color={colors.ACCENT} />
            </View>
            <View style={styles.statContent}>
              <Text style={[styles.statLabel, { color: colors.TEXT_LIGHT }]}>
                Gasto
              </Text>
              <Text style={[styles.statValue, { color: colors.ACCENT }]}>
                {formatCLP(totalCost)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  statsCard: {
    marginHorizontal: SPACING.md,
    marginTop: -SPACING['2xl'],
    marginBottom: SPACING.md,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    ...ELEVATION.md,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  statsIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  statsTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  statsSubtitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginBottom: SPACING.xs / 2,
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});
