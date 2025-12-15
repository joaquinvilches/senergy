import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { SPACING, TYPOGRAPHY, RADIUS, ELEVATION } from '../constants/theme';
import Icon from './Icon';

/**
 * Componente de tarjeta de estadística con indicador de tendencia
 *
 * @param {object} colors - Colores del tema
 * @param {object} animatedValue - Valor animado para transiciones
 * @param {string} label - Etiqueta de la métrica
 * @param {string} value - Valor principal a mostrar
 * @param {string} subValue - Valor secundario opcional
 * @param {number} trend - Tendencia en porcentaje (opcional)
 */
export const StatCard = ({ colors, animatedValue, label, value, subValue, trend }) => {
  const isPositiveTrend = trend >= 0;

  return (
    <Animated.View
      style={[
        styles.statCard,
        {
          backgroundColor: colors.CARD,
          borderColor: colors.BORDER,
          transform: [{ scale: animatedValue }],
          opacity: animatedValue,
        },
      ]}
    >
      <View style={styles.statCardHeader}>
        <Text
          style={[styles.statLabel, { color: colors.TEXT_LIGHT }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {label}
        </Text>
        {typeof trend === 'number' && (
          <View
            style={[
              styles.trendBadge,
              {
                backgroundColor: isPositiveTrend
                  ? `${colors.ERROR}20`
                  : `${colors.SUCCESS}20`
              },
            ]}
          >
            <Icon
              name={isPositiveTrend ? 'arrow-up' : 'arrow-down'}
              size={10}
              color={isPositiveTrend ? colors.ERROR : colors.SUCCESS}
              style={styles.trendIcon}
            />
            <Text
              style={[
                styles.trendText,
                { color: isPositiveTrend ? colors.ERROR : colors.SUCCESS },
              ]}
            >
              {Math.abs(trend)}%
            </Text>
          </View>
        )}
      </View>
      <Text
        style={[styles.statValue, { color: colors.PRIMARY }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {value}
      </Text>
      {subValue ? (
        <Text
          style={[styles.statSubValue, { color: colors.TEXT_LIGHT }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {subValue}
        </Text>
      ) : null}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  statCard: {
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    ...ELEVATION.sm,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm + 2,
  },
  statLabel: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginRight: SPACING.sm,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm - 1,
    paddingVertical: SPACING.xs - 1,
    borderRadius: RADIUS.sm,
  },
  trendIcon: {
    marginRight: SPACING.xs - 2,
  },
  trendText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.xs,
  },
  statSubValue: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});