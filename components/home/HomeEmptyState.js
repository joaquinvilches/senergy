import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDarkMode } from '../../utils/darkModeContext';
import { SPACING, TYPOGRAPHY, RADIUS, ELEVATION } from '../../constants/theme';
import Icon from '../Icon';
import Button from '../ui/Button';

/**
 * Estado vacío del HomeScreen con onboarding
 */
export const HomeEmptyState = ({ onCreateMeter }) => {
  const { colors } = useDarkMode();

  const onboardingSteps = [
    {
      number: '1',
      title: 'Crea tu medidor',
      description: 'Ingresa el nombre y la lectura actual de tu medidor de luz',
      icon: 'plus-circle-outline',
      color: colors.PRIMARY,
    },
    {
      number: '2',
      title: 'Registra lecturas',
      description: 'Cada vez que quieras, anota el valor de tu medidor',
      icon: 'clipboard-text-outline',
      color: colors.ACCENT,
    },
    {
      number: '3',
      title: 'Monitorea y ahorra',
      description: 'Visualiza tu consumo, costos y estadísticas detalladas',
      icon: 'chart-line',
      color: colors.SUCCESS,
    },
  ];

  return (
    <View style={styles.emptyState}>
      {/* Icono principal */}
      <View style={[styles.emptyIconContainer, { backgroundColor: `${colors.PRIMARY}15` }]}>
        <Icon name="lightning-bolt" size={64} color={colors.PRIMARY} />
      </View>

      {/* Título y subtítulo */}
      <Text style={[styles.emptyTitle, { color: colors.TEXT_DARK }]}>
        ¡Bienvenido a SENERGY!
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.TEXT_LIGHT }]}>
        Controla tu consumo eléctrico y ahorra dinero
      </Text>

      {/* Guía rápida */}
      <View style={[styles.onboardingBox, { backgroundColor: colors.CARD, borderColor: colors.BORDER }]}>
        {onboardingSteps.map((step, index) => (
          <View key={index} style={styles.onboardingStep}>
            <View style={[styles.stepIconContainer, { backgroundColor: `${step.color}15` }]}>
              <Icon name={step.icon} size={24} color={step.color} />
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: colors.TEXT_DARK }]}>
                {step.title}
              </Text>
              <Text style={[styles.stepDescription, { color: colors.TEXT_LIGHT }]}>
                {step.description}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Botón CTA */}
      <Button
        title="Crear mi primer medidor"
        onPress={onCreateMeter}
        variant="primary"
        size="lg"
        iconLeft="plus-circle-outline"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING['2xl'],
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes['3xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    textAlign: 'center',
    marginBottom: SPACING['3xl'],
    lineHeight: TYPOGRAPHY.sizes.lg * TYPOGRAPHY.lineHeights.relaxed,
  },
  onboardingBox: {
    width: '100%',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING['3xl'],
    borderWidth: 1,
    ...ELEVATION.sm,
  },
  onboardingStep: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    alignItems: 'flex-start',
  },
  stepIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.xs,
  },
  stepDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: TYPOGRAPHY.sizes.sm * TYPOGRAPHY.lineHeights.relaxed,
  },
});
