import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDarkMode } from '../utils/darkModeContext';
import { SPACING, TYPOGRAPHY, RADIUS, ELEVATION } from '../constants/theme';
import Icon from './Icon';

export const ProfileHeader = ({ user, totalMeters = 0, totalReadings = 0 }) => {
  const { colors, isDark } = useDarkMode();

  // Animaciones
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animación de entrada
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulso sutil en el avatar
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
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
  }, [scaleAnim, fadeAnim, pulseAnim]);

  // Gradientes según modo
  const gradientColors = isDark
    ? ['#3B82F6', '#2563EB', '#1E40AF']
    : ['#60A5FA', '#3B82F6', '#2563EB'];

  // Obtener nombre del email
  const userName = user.email ? user.email.split('@')[0] : 'Usuario';
  const displayName = userName.charAt(0).toUpperCase() + userName.slice(1);

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      {/* Círculos decorativos */}
      <View style={[styles.decorCircle1, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
      <View style={[styles.decorCircle2, { backgroundColor: 'rgba(255,255,255,0.05)' }]} />

      <View style={styles.header}>
        {/* Avatar animado con borde brillante */}
        <Animated.View
          style={[
            styles.avatarContainer,
            {
              transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }],
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={[styles.avatarGlow, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
          <View style={[styles.avatar, { backgroundColor: colors.ACCENT }]}>
            <Icon name="account-circle" size={48} color="#FFFFFF" />
          </View>
        </Animated.View>

        {/* Información del usuario */}
        <Animated.View style={[styles.userInfo, { opacity: fadeAnim }]}>
          <Text style={[styles.greeting, { color: 'rgba(255,255,255,0.9)' }]}>
            Hola,
          </Text>
          <Text style={[styles.userName, { color: '#FFFFFF' }]}>
            {displayName}
          </Text>
          <Text style={[styles.userEmail, { color: 'rgba(255,255,255,0.85)' }]}>
            {user.email}
          </Text>
        </Animated.View>
      </View>

      {/* Badges de estadísticas */}
      <Animated.View
        style={[
          styles.badgesContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: scaleAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            })}],
          },
        ]}
      >
        <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
          <Icon name="gauge" size={16} color="#FFFFFF" style={styles.badgeIcon} />
          <View>
            <Text style={[styles.badgeValue, { color: '#FFFFFF' }]}>
              {totalMeters}
            </Text>
            <Text style={[styles.badgeLabel, { color: 'rgba(255,255,255,0.9)' }]}>
              Medidor{totalMeters !== 1 ? 'es' : ''}
            </Text>
          </View>
        </View>

        <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
          <Icon name="chart-line" size={16} color="#FFFFFF" style={styles.badgeIcon} />
          <View>
            <Text style={[styles.badgeValue, { color: '#FFFFFF' }]}>
              {totalReadings}
            </Text>
            <Text style={[styles.badgeLabel, { color: 'rgba(255,255,255,0.9)' }]}>
              Lectura{totalReadings !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    position: 'relative',
    overflow: 'hidden',
  },
  decorCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -80,
    right: -60,
  },
  decorCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    bottom: -40,
    left: -30,
  },
  header: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.lg,
  },
  avatarGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    top: -10,
    left: -10,
    opacity: 0.5,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    ...ELEVATION.md,
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginBottom: 2,
  },
  userName: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  userEmail: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: SPACING.xs / 2,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  badgesContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
  },
  badge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    ...ELEVATION.sm,
  },
  badgeIcon: {
    marginRight: SPACING.sm,
  },
  badgeValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.3,
  },
  badgeLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginTop: 2,
  },
});