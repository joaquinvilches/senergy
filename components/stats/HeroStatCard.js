import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDarkMode } from '../../utils/darkModeContext';
import { SPACING, TYPOGRAPHY, RADIUS, ELEVATION } from '../../constants/theme';
import Icon from '../Icon';

export const HeroStatCard = ({ value, label, comparison, unit, animatedValue }) => {
  const { colors, isDark } = useDarkMode();
  const counterValue = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Determinar color y icono según la comparación
  const getComparisonStyle = () => {
    if (!comparison) return null;

    const change = parseFloat(comparison);
    if (change > 0) {
      return {
        icon: 'trending-up',
        color: '#FF6B6B',
        text: `+${Math.abs(change).toFixed(1)}%`,
        label: 'vs período anterior',
      };
    } else if (change < 0) {
      return {
        icon: 'trending-down',
        color: '#51CF66',
        text: `${change.toFixed(1)}%`,
        label: 'vs período anterior',
      };
    }
    return {
      icon: 'arrow-right',
      color: colors.TEXT_LIGHT,
      text: 'Sin cambios',
      label: 'vs período anterior',
    };
  };

  const comparisonStyle = getComparisonStyle();

  // Pulso sutil para dar vida a la card
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  // Gradientes según el modo
  const gradientColors = isDark
    ? ['#3B82F6', '#2563EB', '#1E40AF'] // Azul profundo para dark
    : ['#60A5FA', '#3B82F6', '#2563EB']; // Azul vibrante para light

  const scaleAnim = animatedValue?.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  }) || 1;

  const opacityAnim = animatedValue?.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  }) || 1;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }],
          opacity: opacityAnim,
        },
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Decoración con círculos flotantes */}
        <View style={[styles.decoration, { backgroundColor: 'rgba(255,255,255,0.08)' }]} />
        <View style={[styles.decoration2, { backgroundColor: 'rgba(255,255,255,0.05)' }]} />

        {/* Label con icono */}
        <View style={styles.labelContainer}>
          <Icon
            name={unit === 'kWh' ? 'lightning-bolt' : 'cash-multiple'}
            size={20}
            color="rgba(255,255,255,0.9)"
            style={styles.labelIcon}
          />
          <Text style={[styles.label, { color: 'rgba(255,255,255,0.95)' }]}>
            {label}
          </Text>
        </View>

        {/* Valor principal con sombra */}
        <View style={styles.valueContainer}>
          <Text style={[styles.value, { color: '#FFFFFF' }]}>
            {value}
          </Text>
        </View>

        {/* Unidad */}
        <Text style={[styles.unit, { color: 'rgba(255,255,255,0.85)' }]}>
          {unit === 'kWh' ? 'kilovatios-hora' : 'pesos chilenos'}
        </Text>

        {/* Comparación con período anterior - mejorada */}
        {comparisonStyle && (
          <View style={[styles.comparisonContainer, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
            <View style={[styles.comparisonIconBg, { backgroundColor: `${comparisonStyle.color}25` }]}>
              <Icon
                name={comparisonStyle.icon}
                size={16}
                color={comparisonStyle.color}
              />
            </View>
            <View style={styles.comparisonTextContainer}>
              <Text style={[styles.comparisonText, { color: '#FFFFFF' }]}>
                {comparisonStyle.text}
              </Text>
              <Text style={[styles.comparisonLabel, { color: 'rgba(255,255,255,0.8)' }]}>
                {comparisonStyle.label}
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
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.xl + 4,
    overflow: 'hidden',
    ...ELEVATION.lg,
  },
  gradient: {
    padding: SPACING.xl,
    paddingVertical: SPACING.xl + SPACING.md,
    position: 'relative',
    overflow: 'hidden',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  labelIcon: {
    marginRight: SPACING.xs,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  valueContainer: {
    marginBottom: SPACING.xs,
  },
  value: {
    fontSize: 56,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: -2,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  unit: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginBottom: SPACING.lg + SPACING.xs,
    letterSpacing: 0.5,
  },
  comparisonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.lg,
    gap: SPACING.sm,
  },
  comparisonIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comparisonTextContainer: {
    flexDirection: 'column',
  },
  comparisonText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
  },
  comparisonLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginTop: 2,
  },
  decoration: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    top: -100,
    right: -80,
  },
  decoration2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    bottom: -60,
    left: -40,
  },
});
