import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useDarkMode } from '../utils/darkModeContext';
import { SPACING, TYPOGRAPHY, RADIUS, ELEVATION } from '../constants/theme';
import { PLAN_LIMITS, SUBSCRIPTION_PLANS } from '../constants/pricing';
import { updateUserSubscription } from '../services/subscriptionService';
import { getCurrentUser } from '../services/authService';
import { useSubscription } from '../hooks/useSubscription';
import Icon from '../components/Icon';
import { logger } from '../utils/logger';

export const PricingScreen = ({ navigation, route }) => {
  const { colors, isDark } = useDarkMode();
  const styles = createStyles(colors);
  const { subscription, refreshSubscription } = useSubscription();

  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Parámetros opcionales
  const { feature, onUpgrade } = route?.params || {};

  const handleSelectPlan = async (planType) => {
    if (loading) return;

    // Si ya tiene ese plan
    if (subscription === planType) {
      Alert.alert('Info', `Ya tienes el plan ${PLAN_LIMITS[planType].name}`);
      return;
    }

    // Si selecciona FREE (downgrade)
    if (planType === SUBSCRIPTION_PLANS.FREE) {
      Alert.alert(
        'Cancelar Premium',
        '¿Estás seguro de que quieres volver al plan gratuito?',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Sí, cancelar',
            style: 'destructive',
            onPress: () => downgradeToPremium(),
          },
        ]
      );
      return;
    }

    // Upgrade a Premium
    setSelectedPlan(planType);
    Alert.alert(
      'Activar Premium',
      `¿Deseas activar el plan Premium por $1.000 CLP/mes?\n\nEsto es una demo, se activará automáticamente sin pago real.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Activar',
          onPress: () => upgradeToPremium(),
        },
      ]
    );
  };

  const upgradeToPremium = async () => {
    try {
      setLoading(true);

      const user = getCurrentUser();
      if (!user) throw new Error('No autenticado');

      // Actualizar suscripción (1 mes)
      const success = await updateUserSubscription(
        user.uid,
        SUBSCRIPTION_PLANS.PREMIUM,
        1
      );

      if (!success) throw new Error('Error al actualizar suscripción');

      logger.info('User upgraded to PREMIUM', { userId: user.uid });

      // Refrescar estado
      await refreshSubscription();

      Alert.alert(
        '¡Bienvenido a Premium! 🎉',
        'Ahora tienes acceso a todas las funciones premium:\n\n• Medidores ilimitados\n• Lecturas ilimitadas\n• Captura de fotos\n• Exportación a Excel',
        [
          {
            text: 'Continuar',
            onPress: () => {
              if (onUpgrade) {
                onUpgrade();
              }
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      logger.error('Error upgrading to premium', { error });
      Alert.alert('Error', 'No se pudo activar Premium. Intenta nuevamente.');
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const downgradeToPremium = async () => {
    try {
      setLoading(true);

      const user = getCurrentUser();
      if (!user) throw new Error('No autenticado');

      const success = await updateUserSubscription(
        user.uid,
        SUBSCRIPTION_PLANS.FREE
      );

      if (!success) throw new Error('Error al cancelar suscripción');

      logger.info('User downgraded to FREE', { userId: user.uid });

      await refreshSubscription();

      Alert.alert('Premium Cancelado', 'Has vuelto al plan gratuito.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      logger.error('Error downgrading to free', { error });
      Alert.alert('Error', 'No se pudo cancelar. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderPlanCard = (planType) => {
    const plan = PLAN_LIMITS[planType];
    const isCurrentPlan = subscription === planType;
    const isPremium = planType === SUBSCRIPTION_PLANS.PREMIUM;

    const gradientColors = isPremium
      ? isDark
        ? ['#F59E0B', '#D97706', '#B45309']
        : ['#FCD34D', '#F59E0B', '#D97706']
      : isDark
      ? ['#4B5563', '#374151', '#1F2937']
      : ['#E5E7EB', '#D1D5DB', '#9CA3AF'];

    return (
      <View style={[styles.planCard, isCurrentPlan && styles.currentPlanCard]}>
        <LinearGradient
          colors={gradientColors}
          style={styles.planHeader}
        >
          {isPremium && (
            <View style={styles.premiumBadge}>
              <Icon name="star" size={12} color="#FFF" />
              <Text style={styles.premiumBadgeText}>MÁS POPULAR</Text>
            </View>
          )}

          <Text style={styles.planName}>{plan.name}</Text>

          <View style={styles.priceContainer}>
            {plan.price === 0 ? (
              <Text style={styles.priceText}>Gratis</Text>
            ) : (
              <>
                <Text style={styles.priceSymbol}>$</Text>
                <Text style={styles.priceText}>
                  {plan.price.toLocaleString('es-CL')}
                </Text>
                <Text style={styles.priceUnit}>/mes</Text>
              </>
            )}
          </View>
        </LinearGradient>

        <View style={[styles.planBody, { backgroundColor: colors.CARD }]}>
          {/* Features incluidas */}
          <View style={styles.featuresSection}>
            <Text style={[styles.featuresSectionTitle, { color: colors.TEXT_DARK }]}>
              ✓ Incluido:
            </Text>
            {plan.features.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <Icon name="check-circle" size={18} color={colors.SUCCESS} />
                <Text style={[styles.featureText, { color: colors.TEXT_DARK }]}>
                  {feature}
                </Text>
              </View>
            ))}
          </View>

          {/* Features NO incluidas (solo para FREE) */}
          {plan.featuresDisabled.length > 0 && (
            <View style={styles.featuresSection}>
              <Text style={[styles.featuresSectionTitle, { color: colors.TEXT_LIGHT }]}>
                ✗ No incluido:
              </Text>
              {plan.featuresDisabled.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <Icon name="close-circle" size={18} color={colors.TEXT_LIGHT} />
                  <Text style={[styles.featureTextDisabled, { color: colors.TEXT_LIGHT }]}>
                    {feature}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Botón */}
          <TouchableOpacity
            style={[
              styles.selectButton,
              isCurrentPlan && styles.currentButton,
              { backgroundColor: isPremium ? colors.PRIMARY : colors.BACKGROUND },
            ]}
            onPress={() => handleSelectPlan(planType)}
            disabled={loading || isCurrentPlan}
          >
            {loading && selectedPlan === planType ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text
                style={[
                  styles.selectButtonText,
                  { color: isPremium ? '#FFF' : colors.TEXT_DARK },
                  isCurrentPlan && { color: colors.TEXT_LIGHT },
                ]}
              >
                {isCurrentPlan ? 'Plan Actual' : isPremium ? 'Activar Premium' : 'Cambiar a Gratis'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.TEXT_DARK }]}>
            Elige tu Plan
          </Text>
          <Text style={[styles.subtitle, { color: colors.TEXT_LIGHT }]}>
            {feature
              ? `Para usar ${feature}, necesitas Premium`
              : 'Desbloquea todas las funciones con Premium'}
          </Text>
        </View>

        {/* Plans */}
        <View style={styles.plansContainer}>
          {renderPlanCard(SUBSCRIPTION_PLANS.FREE)}
          {renderPlanCard(SUBSCRIPTION_PLANS.PREMIUM)}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.TEXT_LIGHT }]}>
            💡 Esto es una demo. En producción se integraría con pasarela de pagos real.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.BACKGROUND,
    },
    scrollContent: {
      padding: SPACING.lg,
    },
    header: {
      marginBottom: SPACING.xl,
      alignItems: 'center',
    },
    title: {
      fontSize: TYPOGRAPHY.sizes['3xl'],
      fontWeight: TYPOGRAPHY.weights.bold,
      marginBottom: SPACING.sm,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: TYPOGRAPHY.sizes.base,
      textAlign: 'center',
      lineHeight: TYPOGRAPHY.sizes.base * TYPOGRAPHY.lineHeights.relaxed,
    },
    plansContainer: {
      gap: SPACING.lg,
    },
    planCard: {
      borderRadius: RADIUS.xl,
      overflow: 'hidden',
      ...ELEVATION.md,
    },
    currentPlanCard: {
      borderWidth: 2,
      borderColor: colors.PRIMARY,
    },
    planHeader: {
      padding: SPACING.xl,
      alignItems: 'center',
    },
    premiumBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs / 2,
      borderRadius: RADIUS.full,
      marginBottom: SPACING.md,
    },
    premiumBadgeText: {
      fontSize: TYPOGRAPHY.sizes.xs,
      fontWeight: TYPOGRAPHY.weights.bold,
      color: '#FFF',
    },
    planName: {
      fontSize: TYPOGRAPHY.sizes['2xl'],
      fontWeight: TYPOGRAPHY.weights.bold,
      color: '#FFF',
      marginBottom: SPACING.sm,
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    priceSymbol: {
      fontSize: TYPOGRAPHY.sizes.xl,
      fontWeight: TYPOGRAPHY.weights.bold,
      color: '#FFF',
    },
    priceText: {
      fontSize: TYPOGRAPHY.sizes['4xl'],
      fontWeight: TYPOGRAPHY.weights.bold,
      color: '#FFF',
    },
    priceUnit: {
      fontSize: TYPOGRAPHY.sizes.base,
      color: 'rgba(255, 255, 255, 0.9)',
      marginLeft: SPACING.xs,
    },
    planBody: {
      padding: SPACING.xl,
    },
    featuresSection: {
      marginBottom: SPACING.lg,
    },
    featuresSectionTitle: {
      fontSize: TYPOGRAPHY.sizes.sm,
      fontWeight: TYPOGRAPHY.weights.semibold,
      marginBottom: SPACING.md,
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      marginBottom: SPACING.sm,
    },
    featureText: {
      fontSize: TYPOGRAPHY.sizes.base,
      flex: 1,
    },
    featureTextDisabled: {
      fontSize: TYPOGRAPHY.sizes.base,
      flex: 1,
      textDecorationLine: 'line-through',
    },
    selectButton: {
      paddingVertical: SPACING.md,
      borderRadius: RADIUS.lg,
      alignItems: 'center',
      marginTop: SPACING.md,
    },
    currentButton: {
      opacity: 0.6,
    },
    selectButtonText: {
      fontSize: TYPOGRAPHY.sizes.base,
      fontWeight: TYPOGRAPHY.weights.semibold,
    },
    footer: {
      marginTop: SPACING['2xl'],
      padding: SPACING.lg,
      backgroundColor: colors.CARD,
      borderRadius: RADIUS.lg,
    },
    footerText: {
      fontSize: TYPOGRAPHY.sizes.sm,
      textAlign: 'center',
      lineHeight: TYPOGRAPHY.sizes.sm * TYPOGRAPHY.lineHeights.relaxed,
    },
  });
