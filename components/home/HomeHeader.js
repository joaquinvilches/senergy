import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDarkMode } from '../../utils/darkModeContext';
import { SPACING, TYPOGRAPHY, RADIUS, ELEVATION } from '../../constants/theme';
import Icon from '../Icon';

/**
 * Header del HomeScreen con gradiente y botón de agregar
 */
export const HomeHeader = ({ metersCount, onAddPress, animValue }) => {
  const { colors, isDark } = useDarkMode();

  const gradientColors = isDark
    ? ['#3B82F6', '#2563EB', '#1E40AF']
    : ['#60A5FA', '#3B82F6', '#2563EB'];

  return (
    <Animated.View
      style={{
        opacity: animValue,
        transform: [{
          translateY: animValue.interpolate({
            inputRange: [0, 1],
            outputRange: [-20, 0],
          }),
        }],
      }}
    >
      <LinearGradient colors={gradientColors} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Mis Medidores</Text>
            <Text style={styles.subtitle}>
              {metersCount} {metersCount === 1 ? 'medidor' : 'medidores'} registrados
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: '#FFFFFF' }]}
            onPress={onAddPress}
            activeOpacity={0.8}
          >
            <Icon name="plus" size={20} color={colors.PRIMARY} />
          </TouchableOpacity>
        </View>

        {/* Círculos decorativos */}
        <View style={[styles.decorCircle1, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
        <View style={[styles.decorCircle2, { backgroundColor: 'rgba(255,255,255,0.05)' }]} />
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING['2xl'],
    position: 'relative',
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    zIndex: 2,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['4xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: SPACING.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...ELEVATION.md,
  },
  decorCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -100,
    right: -50,
  },
  decorCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    bottom: -75,
    left: -30,
  },
});
