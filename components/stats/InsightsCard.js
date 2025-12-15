import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDarkMode } from '../../utils/darkModeContext';
import { SPACING, TYPOGRAPHY, RADIUS, ELEVATION } from '../../constants/theme';
import Icon from '../Icon';

export const InsightsCard = ({ insights, animatedValue }) => {
  const { colors, isDark } = useDarkMode();
  const staggerAnimations = useRef([]).current;

  // Inicializar animaciones para cada insight
  useEffect(() => {
    if (!insights) return;

    // Crear animaciones para cada insight con delay
    staggerAnimations.forEach((anim, index) => {
      if (anim) {
        anim.setValue(0);
        Animated.spring(anim, {
          toValue: 1,
          delay: index * 100, // 100ms entre cada uno
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }).start();
      }
    });
  }, [insights, staggerAnimations]);

  if (!insights || insights.length === 0) {
    return null;
  }

  // Asegurar que tengamos suficientes animaciones
  while (staggerAnimations.length < insights.length) {
    staggerAnimations.push(new Animated.Value(0));
  }

  const opacityAnim = animatedValue?.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  }) || 1;

  const getColorForType = (type) => {
    switch (type) {
      case 'warning':
        return colors.WARNING;
      case 'success':
        return colors.SUCCESS;
      case 'error':
        return colors.ERROR;
      case 'info':
      default:
        return colors.ACCENT;
    }
  };

  const getColorForColorName = (colorName) => {
    return colors[colorName] || colors.PRIMARY;
  };

  // Colores de gradiente para el header según modo
  const headerGradientColors = isDark
    ? ['rgba(251, 191, 36, 0.15)', 'rgba(251, 191, 36, 0.05)']
    : ['rgba(251, 191, 36, 0.12)', 'rgba(251, 191, 36, 0.02)'];

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: colors.CARD, borderColor: colors.BORDER, opacity: opacityAnim },
      ]}
    >
      {/* Header con gradiente */}
      <LinearGradient
        colors={headerGradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={[styles.headerIconBg, { backgroundColor: 'rgba(251, 191, 36, 0.2)' }]}>
            <Icon name="lightbulb-on" size={22} color="#FBBF24" />
          </View>
          <View>
            <Text style={[styles.headerText, { color: colors.TEXT_DARK }]}>
              Análisis Inteligente
            </Text>
            <Text style={[styles.headerSubtext, { color: colors.TEXT_LIGHT }]}>
              {insights.length} insight{insights.length > 1 ? 's' : ''} detectado{insights.length > 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Insights con animación escalonada */}
      <View style={styles.insightsContainer}>
        {insights.map((insight, index) => {
          const insightColor = insight.color
            ? getColorForColorName(insight.color)
            : getColorForType(insight.type);

          const staggerAnim = staggerAnimations[index];
          const translateY = staggerAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0],
          });

          // Prioridad visual - insights críticos más destacados
          const isHighPriority = insight.priority <= 2;

          return (
            <Animated.View
              key={insight.id}
              style={[
                styles.insightRow,
                {
                  backgroundColor: isHighPriority
                    ? `${insightColor}08`
                    : colors.BACKGROUND,
                  borderLeftColor: insightColor,
                  borderLeftWidth: isHighPriority ? 4 : 3,
                  marginBottom: index === insights.length - 1 ? 0 : SPACING.md,
                  opacity: staggerAnim,
                  transform: [{ translateY }],
                },
              ]}
            >
              <View style={[
                styles.iconContainer,
                {
                  backgroundColor: `${insightColor}${isHighPriority ? '25' : '15'}`,
                  width: isHighPriority ? 48 : 40,
                  height: isHighPriority ? 48 : 40,
                  borderRadius: isHighPriority ? 24 : 20,
                },
              ]}>
                <Icon
                  name={insight.icon}
                  size={isHighPriority ? 24 : 20}
                  color={insightColor}
                />
              </View>

              <View style={styles.textContainer}>
                <Text style={[
                  styles.insightTitle,
                  {
                    color: colors.TEXT_DARK,
                    fontSize: isHighPriority ? TYPOGRAPHY.sizes.base + 1 : TYPOGRAPHY.sizes.base,
                  },
                ]}>
                  {insight.title}
                </Text>
                <Text style={[styles.insightMessage, { color: colors.TEXT_LIGHT }]}>
                  {insight.message}
                </Text>
              </View>

              {/* Indicador de prioridad */}
              {isHighPriority && (
                <View style={[styles.priorityDot, { backgroundColor: insightColor }]} />
              )}
            </Animated.View>
          );
        })}
      </View>

      {/* Footer hint mejorado */}
      <View style={[styles.footer, { backgroundColor: `${colors.PRIMARY}05` }]}>
        <Icon name="star-outline" size={14} color={colors.PRIMARY} style={styles.footerIcon} />
        <Text style={[styles.footerText, { color: colors.TEXT_LIGHT }]}>
          Análisis automático en base a tu consumo
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg + 2,
    borderWidth: 1,
    overflow: 'hidden',
    ...ELEVATION.md,
  },
  headerGradient: {
    borderTopLeftRadius: RADIUS.lg + 2,
    borderTopRightRadius: RADIUS.lg + 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md + 2,
    paddingBottom: SPACING.md,
  },
  headerIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  headerText: {
    fontSize: TYPOGRAPHY.sizes.base + 1,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.3,
  },
  headerSubtext: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  insightsContainer: {
    padding: SPACING.md,
    paddingTop: SPACING.sm,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md + 2,
    borderRadius: RADIUS.lg,
    position: 'relative',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  textContainer: {
    flex: 1,
  },
  insightTitle: {
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.xs - 2,
    letterSpacing: 0.2,
  },
  insightMessage: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: TYPOGRAPHY.sizes.sm * 1.6,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    paddingTop: SPACING.sm,
    marginTop: SPACING.xs,
    borderBottomLeftRadius: RADIUS.lg + 2,
    borderBottomRightRadius: RADIUS.lg + 2,
  },
  footerIcon: {
    marginRight: SPACING.sm,
  },
  footerText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    flex: 1,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});
