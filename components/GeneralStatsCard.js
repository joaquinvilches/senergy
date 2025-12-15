import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatChileanNumber } from '../utils/formatHelpers';
import { SPACING, TYPOGRAPHY, RADIUS } from '../constants/theme';

/**
 * Tarjeta con estadísticas generales del medidor
 */
export const GeneralStatsCard = ({ stats, colors }) => {
  if (!stats) return null;

  return (
    <View style={[styles.statsContainer, { backgroundColor: colors.CARD, borderColor: colors.BORDER }]}>
      <Text style={[styles.statsTitle, { color: colors.PRIMARY }]}>
        Estadísticas Generales
      </Text>
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={[styles.statLabel, { color: colors.TEXT_LIGHT }]}>
            Total
          </Text>
          <Text style={[styles.statValue, { color: colors.PRIMARY }]}>
            {formatChileanNumber(stats.totalConsumption, 1)}
          </Text>
          <Text style={[styles.statUnit, { color: colors.TEXT_LIGHT }]}>kWh</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statLabel, { color: colors.TEXT_LIGHT }]}>
            Promedio
          </Text>
          <Text style={[styles.statValue, { color: colors.ACCENT }]}>
            {formatChileanNumber(stats.averageConsumption, 1)}
          </Text>
          <Text style={[styles.statUnit, { color: colors.TEXT_LIGHT }]}>kWh</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statLabel, { color: colors.TEXT_LIGHT }]}>
            Máximo
          </Text>
          <Text style={[styles.statValue, { color: colors.PRIMARY }]}>
            {formatChileanNumber(stats.maxConsumption, 1)}
          </Text>
          <Text style={[styles.statUnit, { color: colors.TEXT_LIGHT }]}>kWh</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
  },
  statsTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  statUnit: {
    fontSize: 10,
    marginTop: SPACING.xs,
  },
});