import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDarkMode } from '../../utils/darkModeContext';
import { SPACING, TYPOGRAPHY, RADIUS, ELEVATION } from '../../constants/theme';
import Icon from '../Icon';

/**
 * Componente de Empty State premium para estadísticas
 * Muestra un mensaje elegante cuando no hay datos disponibles
 */
export const EmptyState = ({
  variant = 'no-readings', // 'no-readings' | 'no-period-data' | 'no-meter-data'
  onAction,
  actionLabel,
}) => {
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
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulso sutil continuo
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

  // Configuración según variante
  const getConfig = () => {
    switch (variant) {
      case 'no-readings':
        return {
          icon: 'chart-box-outline',
          title: 'No hay lecturas registradas',
          message: 'Registra tu primera lectura desde la pantalla principal para comenzar a visualizar tus estadísticas de consumo.',
          gradientColors: isDark
            ? ['rgba(59, 130, 246, 0.15)', 'rgba(59, 130, 246, 0.05)']
            : ['rgba(59, 130, 246, 0.12)', 'rgba(59, 130, 246, 0.03)'],
          iconColor: colors.PRIMARY,
        };
      case 'no-period-data':
        return {
          icon: 'calendar-remove-outline',
          title: 'Sin datos en este período',
          message: 'No se encontraron lecturas para el período seleccionado. Intenta con un rango de fechas diferente.',
          gradientColors: isDark
            ? ['rgba(251, 191, 36, 0.15)', 'rgba(251, 191, 36, 0.05)']
            : ['rgba(251, 191, 36, 0.12)', 'rgba(251, 191, 36, 0.03)'],
          iconColor: colors.WARNING,
        };
      case 'no-meter-data':
        return {
          icon: 'gauge-empty',
          title: 'Sin lecturas para este medidor',
          message: 'Este medidor no tiene lecturas en el período seleccionado. Prueba seleccionando otro medidor o período.',
          gradientColors: isDark
            ? ['rgba(168, 85, 247, 0.15)', 'rgba(168, 85, 247, 0.05)']
            : ['rgba(168, 85, 247, 0.12)', 'rgba(168, 85, 247, 0.03)'],
          iconColor: colors.ACCENT,
        };
      default:
        return getConfig();
    }
  };

  const config = getConfig();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* Card con gradiente */}
      <LinearGradient
        colors={config.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <View style={[styles.card, { backgroundColor: colors.CARD, borderColor: colors.BORDER }]}>
          {/* Círculo decorativo */}
          <View style={[styles.decorCircle, { backgroundColor: `${config.iconColor}08` }]} />

          {/* Icono animado */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                backgroundColor: `${config.iconColor}15`,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <Icon name={config.icon} size={48} color={config.iconColor} />
          </Animated.View>

          {/* Contenido */}
          <View style={styles.content}>
            <Text style={[styles.title, { color: colors.TEXT_DARK }]}>
              {config.title}
            </Text>
            <Text style={[styles.message, { color: colors.TEXT_LIGHT }]}>
              {config.message}
            </Text>
          </View>

          {/* Acción opcional */}
          {onAction && actionLabel && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: config.iconColor }]}
              onPress={onAction}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonText}>{actionLabel}</Text>
              <Icon name="arrow-right" size={18} color="#FFFFFF" style={styles.actionIcon} />
            </TouchableOpacity>
          )}

          {/* Tips */}
          <View style={[styles.tipsContainer, { backgroundColor: `${config.iconColor}05` }]}>
            <Icon name="lightbulb-on-outline" size={16} color={config.iconColor} style={styles.tipIcon} />
            <Text style={[styles.tipText, { color: colors.TEXT_LIGHT }]}>
              {variant === 'no-readings'
                ? 'Tip: Añade lecturas regularmente para obtener insights más precisos'
                : variant === 'no-period-data'
                ? 'Tip: Prueba seleccionando un período más amplio'
                : 'Tip: Verifica que el medidor tenga lecturas registradas'}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING['3xl'],
  },
  cardGradient: {
    borderRadius: RADIUS.xl + 4,
    padding: 2,
    ...ELEVATION.lg,
  },
  card: {
    borderRadius: RADIUS.xl + 2,
    borderWidth: 1,
    padding: SPACING.xl + SPACING.md,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  decorCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -80,
    right: -60,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
    ...ELEVATION.sm,
  },
  content: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    textAlign: 'center',
    marginBottom: SPACING.md,
    letterSpacing: 0.3,
  },
  message: {
    fontSize: TYPOGRAPHY.sizes.base,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.sizes.base * 1.6,
    paddingHorizontal: SPACING.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
    ...ELEVATION.md,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginRight: SPACING.sm,
    letterSpacing: 0.5,
  },
  actionIcon: {
    marginLeft: SPACING.xs,
  },
  tipsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    alignSelf: 'stretch',
  },
  tipIcon: {
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: TYPOGRAPHY.sizes.sm * 1.5,
    fontStyle: 'italic',
  },
});

export default EmptyState;
