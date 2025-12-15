import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDarkMode } from '../utils/darkModeContext';
import { CONFIG } from '../utils/constants';
import { formatKWh, formatCLP } from '../utils/formatHelpers';
import { toDateOrNow } from '../utils/dateHelpers';
import { SPACING, RADIUS, TYPOGRAPHY, ELEVATION } from '../constants/theme';
import { fadeIn, springBounce } from '../utils/animations';
import StatusIndicator from './ui/StatusIndicator';
import IconButton from './ui/IconButton';
import Icon from './Icon';
import moment from 'moment';

export const MeterCard = ({ meter, onPress, onDelete, index = 0 }) => {
  const { colors, isDark } = useDarkMode();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const lastReading = meter.lastReading || 0;
  const lastCost = meter.lastCost || 0;
  const monthlyBudget = meter.monthlyBudget || 30000;

  // Calcular días desde última lectura
  const lastReadingDate = toDateOrNow(meter.updatedAt);
  const daysSinceLastReading = moment().diff(moment(lastReadingDate), 'days');

  // Determinar status y color de alerta
  const getAlertStatus = () => {
    if (daysSinceLastReading >= CONFIG.DAYS_WITHOUT_READING_CRITICAL) {
      return { status: 'error', color: colors.ERROR };
    }
    if (daysSinceLastReading >= CONFIG.DAYS_WITHOUT_READING_WARNING) {
      return { status: 'warning', color: colors.WARNING };
    }
    return { status: 'success', color: colors.SUCCESS };
  };

  const alertInfo = getAlertStatus();
  const needsReading = daysSinceLastReading >= CONFIG.DAYS_WITHOUT_READING_WARNING;

  const getAlertText = () => {
    if (daysSinceLastReading === 0) {
      return 'Hoy';
    }
    if (daysSinceLastReading === 1) {
      return 'Ayer';
    }
    return `Hace ${daysSinceLastReading}d`;
  };

  // Calcular progreso de presupuesto
  const budgetProgress = monthlyBudget > 0 ? (lastCost / monthlyBudget) * 100 : 0;
  const isOverBudget = budgetProgress > 100;

  // Gradiente de fondo sutil
  const cardGradient = isDark
    ? ['rgba(59, 130, 246, 0.03)', 'rgba(37, 99, 235, 0.05)']
    : ['rgba(96, 165, 250, 0.03)', 'rgba(59, 130, 246, 0.05)'];

  // Gradiente de progress bar
  const progressGradient = isOverBudget
    ? [colors.ERROR, colors.WARNING]
    : budgetProgress > 80
    ? [colors.WARNING, colors.ACCENT]
    : [colors.SUCCESS, colors.PRIMARY];

  // Animación de entrada con delay basado en índice
  useEffect(() => {
    const delay = index * 100;
    setTimeout(() => {
      Animated.parallel([
        fadeIn(fadeAnim, 400),
        springBounce(scaleAnim, 1),
      ]).start();
    }, delay);
  }, []);

  // Animación de pulso si necesita lectura
  useEffect(() => {
    if (needsReading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [needsReading]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [
          { scale: Animated.multiply(scaleAnim, pulseAnim) }
        ]
      }}
    >
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: colors.CARD,
            borderLeftColor: alertInfo.color,
          },
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Gradiente de fondo sutil */}
        <LinearGradient
          colors={cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={[styles.meterIconBg, { backgroundColor: `${alertInfo.color}15` }]}>
                <Icon name="gauge" size={24} color={alertInfo.color} />
              </View>
              <View style={styles.meterInfo}>
                <Text style={[styles.meterName, { color: colors.TEXT_DARK }]}>
                  {meter.name}
                </Text>
                <View style={styles.companyRow}>
                  <Icon name="office-building" size={12} color={colors.TEXT_LIGHT} />
                  <Text style={[styles.company, { color: colors.TEXT_LIGHT }]}>
                    {meter.company}
                  </Text>
                </View>
              </View>
            </View>
            {onDelete && (
              <IconButton
                icon="close"
                onPress={onDelete}
                variant="solid"
                color="error"
                size="sm"
              />
            )}
          </View>

          {/* Indicador de días sin lectura */}
          <View style={[styles.alertBanner, { backgroundColor: `${alertInfo.color}10` }]}>
            <StatusIndicator status={alertInfo.status} size={10} style={styles.statusDot} />
            <Text style={[styles.alertText, { color: alertInfo.color }]}>
              Última lectura: {getAlertText()}
            </Text>
            {needsReading && (
              <View style={[styles.alertBadge, { backgroundColor: alertInfo.color }]}>
                <Icon name="alert" size={12} color="#FFFFFF" />
              </View>
            )}
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.BACKGROUND }]}>
              <Icon name="lightning-bolt" size={16} color={colors.PRIMARY} style={styles.statIcon} />
              <Text style={[styles.statLabel, { color: colors.TEXT_LIGHT }]}>
                Última lectura
              </Text>
              <Text style={[styles.statValue, { color: colors.PRIMARY }]}>
                {formatKWh(lastReading, 0)}
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.BACKGROUND }]}>
              <Icon name="cash" size={16} color={colors.ACCENT} style={styles.statIcon} />
              <Text style={[styles.statLabel, { color: colors.TEXT_LIGHT }]}>
                Último costo
              </Text>
              <Text style={[styles.statValue, { color: colors.ACCENT }]}>
                {formatCLP(lastCost)}
              </Text>
            </View>
          </View>

          {/* Progress Bar de Presupuesto */}
          {monthlyBudget > 0 && (
            <View style={styles.budgetSection}>
              <View style={styles.budgetHeader}>
                <View style={styles.budgetLabelContainer}>
                  <Icon name="target" size={14} color={colors.TEXT_LIGHT} />
                  <Text style={[styles.budgetLabel, { color: colors.TEXT_LIGHT }]}>
                    Presupuesto mensual
                  </Text>
                </View>
                <Text style={[styles.budgetPercentage, { color: isOverBudget ? colors.ERROR : colors.TEXT_DARK }]}>
                  {budgetProgress.toFixed(0)}%
                </Text>
              </View>

              {/* Progress Bar */}
              <View style={[styles.progressBarBg, { backgroundColor: colors.BORDER }]}>
                <LinearGradient
                  colors={progressGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressBarFill, { width: `${Math.min(budgetProgress, 100)}%` }]}
                />
              </View>

              {/* Budget Info */}
              <View style={styles.budgetInfo}>
                <Text style={[styles.budgetText, { color: colors.TEXT_LIGHT }]}>
                  {formatCLP(lastCost)} de {formatCLP(monthlyBudget)}
                </Text>
                {isOverBudget && (
                  <View style={[styles.overBudgetBadge, { backgroundColor: `${colors.ERROR}15` }]}>
                    <Icon name="alert-circle" size={12} color={colors.ERROR} />
                    <Text style={[styles.overBudgetText, { color: colors.ERROR }]}>
                      Sobre presupuesto
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.md,
    borderLeftWidth: 6,
    overflow: 'hidden',
    ...ELEVATION.md,
  },
  content: {
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  meterIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  meterInfo: {
    flex: 1,
  },
  meterName: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.xs / 2,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs / 2,
  },
  company: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  statusDot: {
    marginRight: SPACING.sm,
  },
  alertText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  alertBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  statIcon: {
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginBottom: SPACING.xs / 2,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  budgetSection: {
    marginTop: SPACING.sm,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  budgetLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  budgetLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  budgetPercentage: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  budgetInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  overBudgetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs / 2,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: RADIUS.sm,
  },
  overBudgetText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
