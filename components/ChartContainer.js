import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

/**
 * Contenedor reutilizable para gráficos con título, subtítulo y helper text
 *
 * @param {string} title - Título del gráfico
 * @param {string} subtitle - Subtítulo opcional
 * @param {string} helperText - Texto de ayuda opcional
 * @param {object} colors - Colores del tema
 * @param {object} animatedValue - Valor animado para transiciones
 * @param {node} children - Contenido del gráfico
 */
export const ChartContainer = ({
  title,
  subtitle,
  helperText,
  colors,
  animatedValue,
  children,
}) => (
  <Animated.View
    style={[
      styles.chartContainer,
      {
        backgroundColor: colors.WHITE,
        transform: [{ scale: animatedValue }],
        opacity: animatedValue,
      },
    ]}
  >
    <View style={styles.chartHeader}>
      <Text style={[styles.chartTitle, { color: colors.TEXT_DARK }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.chartSubtitle, { color: colors.TEXT_LIGHT }]}>{subtitle}</Text>
      )}
    </View>

    {children}

    {helperText && (
      <Text style={[styles.helperTextSmall, { color: colors.TEXT_LIGHT }]}>
        {helperText}
      </Text>
    )}
  </Animated.View>
);

const styles = StyleSheet.create({
  chartContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  chartHeader: {
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  helperTextSmall: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 18,
  },
});
