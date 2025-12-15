import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatChileanNumber, formatCLP } from '../utils/formatHelpers';
import moment from 'moment';
import { SPACING, TYPOGRAPHY, RADIUS } from '../constants/theme';
import Icon from './Icon';

/**
 * Tarjeta con estadísticas del mes seleccionado y comparación
 */
export const MonthStatsCard = ({ selectedMonth, currentMonthData, comparison, colors }) => {
  const hasPreviousMonth = comparison.previousMonth.consumption > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.CARD, borderColor: colors.BORDER }]}>
      <Text style={[styles.title, { color: colors.PRIMARY }]}>
        {moment(selectedMonth).format('MMMM YYYY')}
      </Text>

      <View style={styles.statRow}>
        <Text style={[styles.statLabel, { color: colors.TEXT_LIGHT }]}>
          Consumo:
        </Text>
        <Text style={[styles.statValue, { color: colors.PRIMARY }]}>
          {formatChileanNumber(currentMonthData.consumption || 0, 1)} kWh
        </Text>
      </View>

      <View style={styles.statRow}>
        <Text style={[styles.statLabel, { color: colors.TEXT_LIGHT }]}>
          Costo:
        </Text>
        <Text style={[styles.statValue, { color: colors.ACCENT }]}>
          {formatCLP(currentMonthData.cost || 0)}
        </Text>
      </View>

      {hasPreviousMonth && (
        <>
          <View style={[styles.divider, { backgroundColor: colors.BORDER }]} />

          <Text style={[styles.comparisonTitle, { color: colors.TEXT_LIGHT }]}>
            Comparado con mes anterior
          </Text>

          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.TEXT_LIGHT }]}>
              Diferencia:
            </Text>
            <Text
              style={[
                styles.statValue,
                {
                  color: comparison.consumptionDiff > 0 ? colors.ERROR : colors.SUCCESS,
                },
              ]}
            >
              {comparison.consumptionDiff > 0 ? '+' : ''}{formatChileanNumber(comparison.consumptionDiff, 1)} kWh
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.TEXT_LIGHT }]}>
              Porcentaje:
            </Text>
            <Text
              style={[
                styles.statValue,
                {
                  color: comparison.percentageDiff > 0 ? colors.ERROR : colors.SUCCESS,
                },
              ]}
            >
              {comparison.percentageDiff > 0 ? '+' : ''}{comparison.percentageDiff}%
            </Text>
          </View>

          {comparison.percentageDiff < 0 && (
            <View style={[styles.celebrationBanner, { backgroundColor: `${colors.SUCCESS}20` }]}>
              <Icon name="party-popper" size={18} color={colors.SUCCESS} style={styles.celebrationIcon} />
              <Text style={[styles.celebrationText, { color: colors.SUCCESS }]}>
                ¡Excelente! Estás ahorrando
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm + 2,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.base,
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  divider: {
    height: 1,
    marginVertical: SPACING.sm,
  },
  comparisonTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  celebrationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  celebrationIcon: {
    marginRight: SPACING.sm,
  },
  celebrationText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});