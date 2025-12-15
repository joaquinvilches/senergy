import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDarkMode } from '../../utils/darkModeContext';
import { SPACING, TYPOGRAPHY, RADIUS, ELEVATION } from '../../constants/theme';
import Icon from '../Icon';

const PERIODS = [
  { id: 'thisMonth', label: 'Este mes', icon: 'calendar' },
  { id: 'lastMonth', label: 'Mes pasado', icon: 'calendar-minus' },
  { id: 'last3Months', label: '3 meses', icon: 'calendar-range' },
  { id: 'last6Months', label: '6 meses', icon: 'calendar-range' },
  { id: 'thisYear', label: 'Este año', icon: 'calendar-star' },
];

const AnimatedPeriodChip = ({ period, isSelected, onPress, colors, isDark, index }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const entryAnim = useRef(new Animated.Value(0)).current;

  // Animación de entrada con stagger
  useEffect(() => {
    Animated.spring(entryAnim, {
      toValue: 1,
      delay: index * 60,
      tension: 60,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [entryAnim, index]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      tension: 100,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 100,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const translateY = entryAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  const gradientColors = isSelected
    ? (isDark ? ['#3B82F6', '#2563EB'] : ['#60A5FA', '#3B82F6'])
    : [colors.BACKGROUND, colors.BACKGROUND];

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }, { translateY }],
          opacity: entryAnim,
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => {
          handlePressOut();
          onPress();
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.periodChip,
            {
              borderColor: isSelected ? (isDark ? '#60A5FA' : '#3B82F6') : colors.BORDER,
              ...(!isSelected ? {} : ELEVATION.sm),
            },
          ]}
        >
          {/* Fondo del icono con animación */}
          <View
            style={[
              styles.iconBg,
              {
                backgroundColor: isSelected
                  ? 'rgba(255, 255, 255, 0.2)'
                  : `${colors.PRIMARY}10`,
              },
            ]}
          >
            <Icon
              name={period.icon}
              size={16}
              color={isSelected ? '#FFFFFF' : colors.PRIMARY}
            />
          </View>
          <Text
            style={[
              styles.chipText,
              {
                color: isSelected ? '#FFFFFF' : colors.TEXT_DARK,
                fontWeight: isSelected
                  ? TYPOGRAPHY.weights.bold
                  : TYPOGRAPHY.weights.semibold,
              },
            ]}
          >
            {period.label}
          </Text>
          {/* Indicador de selección */}
          {isSelected && (
            <View style={[styles.selectedDot, { backgroundColor: '#FFFFFF' }]} />
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const PeriodSelector = ({ selectedPeriod, onPeriodChange }) => {
  const { colors, isDark } = useDarkMode();

  return (
    <View style={[styles.container, { backgroundColor: colors.CARD, borderColor: colors.BORDER }]}>
      {/* Header mejorado con gradiente sutil */}
      <LinearGradient
        colors={isDark
          ? ['rgba(59, 130, 246, 0.08)', 'transparent']
          : ['rgba(96, 165, 250, 0.06)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={[styles.headerIconBg, { backgroundColor: `${colors.PRIMARY}15` }]}>
            <Icon name="calendar-clock" size={18} color={colors.PRIMARY} />
          </View>
          <View>
            <Text style={[styles.headerText, { color: colors.TEXT_DARK }]}>
              Período de tiempo
            </Text>
            <Text style={[styles.headerSubtext, { color: colors.TEXT_LIGHT }]}>
              Selecciona el rango a visualizar
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {PERIODS.map((period, index) => (
          <AnimatedPeriodChip
            key={period.id}
            period={period}
            isSelected={selectedPeriod === period.id}
            onPress={() => onPeriodChange(period.id)}
            colors={colors}
            isDark={isDark}
            index={index}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg + 2,
    borderWidth: 1,
    overflow: 'hidden',
    ...ELEVATION.sm,
  },
  headerGradient: {
    borderTopLeftRadius: RADIUS.lg + 2,
    borderTopRightRadius: RADIUS.lg + 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md + 2,
    paddingTop: SPACING.md + 2,
    paddingBottom: SPACING.md,
  },
  headerIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  headerText: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.2,
  },
  headerSubtext: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md + 2,
    gap: SPACING.sm,
  },
  periodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm + 4,
    paddingHorizontal: SPACING.md + 2,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    marginRight: SPACING.xs,
    position: 'relative',
  },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  chipText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    letterSpacing: 0.3,
  },
  selectedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: SPACING.xs,
  },
});
