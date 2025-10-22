import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

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
export const StatCard = ({ colors, animatedValue, label, value, subValue, trend }) => (
  <Animated.View
    style={[
      styles.statCard,
      {
        backgroundColor: colors.WHITE,
        transform: [{ scale: animatedValue }],
        opacity: animatedValue,
      },
    ]}
  >
    <View style={styles.statCardHeader}>
      <Text style={[styles.statLabel, { color: colors.TEXT_LIGHT }]}>{label}</Text>
      {typeof trend === 'number' && (
        <View
          style={[
            styles.trendBadge,
            { backgroundColor: trend >= 0 ? '#FEE2E2' : '#D1FAE5' },
          ]}
        >
          <Text
            style={[
              styles.trendText,
              { color: trend >= 0 ? '#EF4444' : '#10B981' },
            ]}
          >
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </Text>
        </View>
      )}
    </View>
    <Text style={[styles.statValue, { color: colors.PRIMARY }]}>{value}</Text>
    {subValue ? (
      <Text style={[styles.statSubValue, { color: colors.TEXT_LIGHT }]}>{subValue}</Text>
    ) : null}
  </Animated.View>
);

const styles = StyleSheet.create({
  statCard: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  trendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  statSubValue: {
    fontSize: 13,
    fontWeight: '500',
  },
});
