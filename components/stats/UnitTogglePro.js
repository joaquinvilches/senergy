import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDarkMode } from '../../utils/darkModeContext';
import { SPACING, TYPOGRAPHY, RADIUS, ELEVATION } from '../../constants/theme';
import Icon from '../Icon';

export const UnitTogglePro = ({ selectedUnit, onUnitChange }) => {
  const { colors, isDark } = useDarkMode();
  const slideAnim = useRef(new Animated.Value(selectedUnit === 'kWh' ? 0 : 1)).current;
  const scaleKwh = useRef(new Animated.Value(selectedUnit === 'kWh' ? 1 : 0.95)).current;
  const scaleMoney = useRef(new Animated.Value(selectedUnit === '$' ? 1 : 0.95)).current;

  useEffect(() => {
    // Animar el deslizamiento del fondo
    Animated.spring(slideAnim, {
      toValue: selectedUnit === 'kWh' ? 0 : 1,
      tension: 80,
      friction: 10,
      useNativeDriver: false,
    }).start();

    // Animar escala de las opciones
    Animated.parallel([
      Animated.spring(scaleKwh, {
        toValue: selectedUnit === 'kWh' ? 1 : 0.95,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleMoney, {
        toValue: selectedUnit === '$' ? 1 : 0.95,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [selectedUnit, slideAnim, scaleKwh, scaleMoney]);

  // Calcular la posición del fondo deslizante
  const backgroundPosition = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '50%'],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND, borderColor: colors.BORDER }]}>
      {/* Fondo animado que se desliza */}
      <Animated.View
        style={[
          styles.slidingBackground,
          {
            left: backgroundPosition,
          },
        ]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={selectedUnit === 'kWh'
            ? (isDark ? ['#3B82F6', '#2563EB'] : ['#60A5FA', '#3B82F6'])
            : (isDark ? ['#10B981', '#059669'] : ['#34D399', '#10B981'])}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientSlider}
        />
      </Animated.View>

      {/* Opción kWh */}
      <TouchableOpacity
        style={styles.option}
        onPress={() => onUnitChange('kWh')}
        activeOpacity={0.7}
      >
        <Animated.View style={[styles.optionContent, { transform: [{ scale: scaleKwh }] }]}>
          <View style={[
            styles.iconContainer,
            { backgroundColor: selectedUnit === 'kWh' ? 'rgba(255,255,255,0.2)' : 'transparent' },
          ]}>
            <Icon
              name="lightning-bolt"
              size={28}
              color={selectedUnit === 'kWh' ? '#FFFFFF' : colors.TEXT_LIGHT}
            />
          </View>
          <Text
            style={[
              styles.optionTitle,
              { color: selectedUnit === 'kWh' ? '#FFFFFF' : colors.TEXT_DARK },
            ]}
          >
            Energía
          </Text>
          <Text
            style={[
              styles.optionSubtitle,
              { color: selectedUnit === 'kWh' ? 'rgba(255,255,255,0.9)' : colors.TEXT_LIGHT },
            ]}
          >
            Ver en kWh
          </Text>
        </Animated.View>
      </TouchableOpacity>

      {/* Opción $ */}
      <TouchableOpacity
        style={styles.option}
        onPress={() => onUnitChange('$')}
        activeOpacity={0.7}
      >
        <Animated.View style={[styles.optionContent, { transform: [{ scale: scaleMoney }] }]}>
          <View style={[
            styles.iconContainer,
            { backgroundColor: selectedUnit === '$' ? 'rgba(255,255,255,0.2)' : 'transparent' },
          ]}>
            <Icon
              name="cash-multiple"
              size={28}
              color={selectedUnit === '$' ? '#FFFFFF' : colors.TEXT_LIGHT}
            />
          </View>
          <Text
            style={[
              styles.optionTitle,
              { color: selectedUnit === '$' ? '#FFFFFF' : colors.TEXT_DARK },
            ]}
          >
            Dinero
          </Text>
          <Text
            style={[
              styles.optionSubtitle,
              { color: selectedUnit === '$' ? 'rgba(255,255,255,0.9)' : colors.TEXT_LIGHT },
            ]}
          >
            Ver en pesos
          </Text>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.xs + 2,
    position: 'relative',
    overflow: 'hidden',
    ...ELEVATION.sm,
  },
  slidingBackground: {
    position: 'absolute',
    width: '50%',
    height: '100%',
    padding: SPACING.xs + 2,
  },
  gradientSlider: {
    flex: 1,
    borderRadius: RADIUS.lg,
    ...ELEVATION.md,
  },
  option: {
    flex: 1,
    zIndex: 1,
  },
  optionContent: {
    alignItems: 'center',
    paddingVertical: SPACING.md + 4,
    paddingHorizontal: SPACING.xs,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  optionTitle: {
    fontSize: TYPOGRAPHY.sizes.base + 1,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginTop: SPACING.xs,
    letterSpacing: 0.3,
  },
  optionSubtitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: SPACING.xs / 2,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});
