import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDarkMode } from '../utils/darkModeContext';
import { formatChileanNumber, formatCLP } from '../utils/formatHelpers';
import { SPACING, TYPOGRAPHY, RADIUS, ELEVATION } from '../constants/theme';
import Icon from './Icon';

const AnimatedNumber = ({ value, suffix = '', color, isCurrency = false }) => {
  const [displayValue, setDisplayValue] = useState('0');
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: Math.abs(value),
      tension: 40,
      friction: 8,
      useNativeDriver: false,
    }).start();

    // Listener para actualizar el valor mostrado
    const listenerId = animatedValue.addListener(({ value: animValue }) => {
      if (isCurrency) {
        setDisplayValue(formatCLP(Math.round(animValue)));
      } else {
        setDisplayValue(formatChileanNumber(Math.round(animValue), 1));
      }
    });

    return () => {
      animatedValue.removeListener(listenerId);
    };
  }, [value, animatedValue, isCurrency]);

  return (
    <Text style={[styles.value, { color }]}>
      {displayValue}{suffix}
    </Text>
  );
};

export const SavingsCard = ({ savingsData, loadingMetrics }) => {
  const { colors, isDark } = useDarkMode();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!loadingMetrics && savingsData) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();

      // Bounce en el icono si está ahorrando
      if (savingsData.isSavings) {
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1.2,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(bounceAnim, {
            toValue: 1,
            tension: 50,
            friction: 3,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  }, [loadingMetrics, savingsData, scaleAnim, bounceAnim]);

  if (loadingMetrics || !savingsData) {
    return null;
  }

  const progressPercent = Math.abs(parseFloat(savingsData.savingsPercentage));
  const gradientColors = savingsData.isSavings
    ? (isDark ? ['#10B981', '#059669'] : ['#34D399', '#10B981'])
    : (isDark ? ['#EF4444', '#DC2626'] : ['#F87171', '#EF4444']);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={isDark
          ? ['rgba(31, 41, 55, 0.8)', 'rgba(17, 24, 39, 0.9)']
          : ['#FFFFFF', '#F9FAFB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, { borderColor: colors.BORDER }]}
      >
        {/* Header mejorado */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={[styles.iconBg, { backgroundColor: `${savingsData.isSavings ? colors.SUCCESS : colors.ERROR}15` }]}>
              <Icon
                name={savingsData.isSavings ? "trending-down" : "trending-up"}
                size={20}
                color={savingsData.isSavings ? colors.SUCCESS : colors.ERROR}
              />
            </View>
            <View>
              <Text style={[styles.title, { color: colors.TEXT_DARK }]}>
                Indicador de Ahorro
              </Text>
              <Text style={[styles.subtitle, { color: colors.TEXT_LIGHT }]}>
                Comparación mensual
              </Text>
            </View>
          </View>
          {savingsData.isSavings && (
            <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
              <Icon name="party-popper" size={28} color={colors.SUCCESS} />
            </Animated.View>
          )}
        </View>

        {/* Banner con gradiente */}
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bannerGradient}
        >
          <View style={styles.bannerContent}>
            <Icon
              name={savingsData.isSavings ? "check-circle" : "alert-circle"}
              size={18}
              color="#FFFFFF"
              style={styles.bannerIcon}
            />
            <Text style={[styles.bannerText, { color: '#FFFFFF' }]}>
              {savingsData.isSavings
                ? '¡Excelente! Estás ahorrando este mes'
                : 'Tu consumo aumentó este mes'}
            </Text>
          </View>
        </LinearGradient>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: colors.TEXT_LIGHT }]}>
              Variación respecto al mes anterior
            </Text>
            <Text style={[styles.progressPercent, { color: savingsData.isSavings ? colors.SUCCESS : colors.ERROR }]}>
              {savingsData.isSavings ? '-' : '+'}{savingsData.savingsPercentage}%
            </Text>
          </View>
          <View style={[styles.progressBarBg, { backgroundColor: colors.BACKGROUND }]}>
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBarFill, { width: `${Math.min(progressPercent, 100)}%` }]}
            />
          </View>
        </View>

        {/* Métricas mejoradas */}
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { backgroundColor: colors.BACKGROUND }]}>
            <Icon name="lightning-bolt" size={16} color={colors.PRIMARY} style={styles.metricIcon} />
            <View style={styles.metricContent}>
              <Text style={[styles.metricLabel, { color: colors.TEXT_LIGHT }]}>
                {savingsData.isSavings ? 'Ahorro' : 'Aumento'} energía
              </Text>
              <View style={styles.metricValueRow}>
                <AnimatedNumber
                  value={savingsData.consumptionDiff}
                  suffix=" kWh"
                  color={savingsData.isSavings ? colors.SUCCESS : colors.ERROR}
                />
              </View>
            </View>
          </View>

          <View style={[styles.metricCard, { backgroundColor: colors.BACKGROUND }]}>
            <Icon name="cash" size={16} color={colors.PRIMARY} style={styles.metricIcon} />
            <View style={styles.metricContent}>
              <Text style={[styles.metricLabel, { color: colors.TEXT_LIGHT }]}>
                {savingsData.isSavings ? 'Ahorro' : 'Gasto'} dinero
              </Text>
              <View style={styles.metricValueRow}>
                <AnimatedNumber
                  value={savingsData.costDiff}
                  isCurrency
                  color={savingsData.isSavings ? colors.SUCCESS : colors.ERROR}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Tips mejorados */}
        {!savingsData.isSavings && (
          <View style={[styles.tipsBox, { backgroundColor: `${colors.WARNING}10`, borderLeftColor: colors.WARNING }]}>
            <Icon name="lightbulb-on" size={18} color={colors.WARNING} style={styles.tipsIcon} />
            <View style={styles.tipsContent}>
              <Text style={[styles.tipsTitle, { color: colors.TEXT_DARK }]}>
                Consejos para ahorrar
              </Text>
              <Text style={[styles.tipsText, { color: colors.TEXT_LIGHT }]}>
                Reduce el uso de equipos de climatización y verifica que no haya electrodomésticos defectuosos
              </Text>
            </View>
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  gradient: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    ...ELEVATION.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md + SPACING.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  bannerGradient: {
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
    ...ELEVATION.sm,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md + 2,
    paddingVertical: SPACING.md,
  },
  bannerIcon: {
    marginRight: SPACING.sm,
  },
  bannerText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.3,
  },
  progressSection: {
    marginBottom: SPACING.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  progressPercent: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
  },
  progressBarBg: {
    height: 8,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  metricCard: {
    flex: 1,
    flexDirection: 'row',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  metricIcon: {
    marginRight: SPACING.sm,
  },
  metricContent: {
    flex: 1,
  },
  metricLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginBottom: SPACING.xs / 2,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  tipsBox: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderLeftWidth: 3,
  },
  tipsIcon: {
    marginRight: SPACING.md,
    marginTop: 2,
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.xs,
  },
  tipsText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: TYPOGRAPHY.sizes.sm * 1.5,
  },
});