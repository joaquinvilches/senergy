import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDarkMode } from '../../utils/darkModeContext';
import { SPACING, TYPOGRAPHY, RADIUS, ELEVATION } from '../../constants/theme';
import Icon from '../Icon';

export const QuickStatsRow = ({ stats }) => {
  const { colors, isDark } = useDarkMode();
  const animValues = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    // Animar cada card con delay escalonado
    animValues.forEach((anim, index) => {
      Animated.spring(anim, {
        toValue: 1,
        delay: index * 80,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    });
  }, [animValues]);

  const quickStats = [
    {
      icon: 'counter',
      label: 'Lecturas',
      value: stats.count || 0,
      color: isDark ? '#60A5FA' : '#3B82F6',
      gradient: isDark ? ['#3B82F6', '#2563EB'] : ['#60A5FA', '#3B82F6'],
    },
    {
      icon: 'calendar-clock',
      label: 'Frecuencia',
      value: `${stats.avgDaysBetweenReadings || 0}d`,
      color: isDark ? '#A78BFA' : '#8B5CF6',
      gradient: isDark ? ['#8B5CF6', '#7C3AED'] : ['#A78BFA', '#8B5CF6'],
    },
    {
      icon: stats.trend === 'up' ? 'trending-up' : stats.trend === 'down' ? 'trending-down' : 'minus',
      label: 'Tendencia',
      value: stats.trend === 'up' ? '↑' : stats.trend === 'down' ? '↓' : '→',
      color: stats.trend === 'up' ? '#FF6B6B' : stats.trend === 'down' ? '#51CF66' : colors.TEXT_LIGHT,
      gradient: stats.trend === 'up'
        ? ['#FF6B6B', '#EF4444']
        : stats.trend === 'down'
        ? ['#51CF66', '#10B981']
        : isDark ? ['#6B7280', '#4B5563'] : ['#9CA3AF', '#6B7280'],
    },
  ];

  return (
    <View style={styles.container}>
      {quickStats.map((stat, index) => {
        const scale = animValues[index].interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        });

        const translateY = animValues[index].interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.statCard,
              {
                transform: [{ scale }, { translateY }],
                opacity: animValues[index],
              },
            ]}
          >
            <LinearGradient
              colors={[...stat.gradient, `${stat.gradient[1]}CC`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientBackground}
            >
              {/* Círculo decorativo */}
              <View style={[styles.decorCircle, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]} />

              {/* Icono con fondo */}
              <View style={[styles.iconBg, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                <Icon name={stat.icon} size={20} color="#FFFFFF" />
              </View>

              {/* Valor con sombra */}
              <Text style={[styles.value, { color: '#FFFFFF' }]}>
                {stat.value}
              </Text>

              {/* Label */}
              <Text style={[styles.label, { color: 'rgba(255, 255, 255, 0.9)' }]}>
                {stat.label}
              </Text>
            </LinearGradient>
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...ELEVATION.sm,
  },
  gradientBackground: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  decorCircle: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    top: -30,
    right: -20,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  value: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.xs / 2,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.xs,
    textAlign: 'center',
    fontWeight: TYPOGRAPHY.weights.semibold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
