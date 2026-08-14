import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useDarkMode } from '../utils/darkModeContext';
import { SPACING, TYPOGRAPHY, RADIUS, ELEVATION } from '../constants/theme';
import { PLAN_LIMITS, SUBSCRIPTION_PLANS } from '../constants/pricing';
import { getCurrentUser } from '../services/authService';
import { useSubscription } from '../hooks/useSubscription';
import { purchasePremium, restorePurchases } from '../services/revenueCatService';
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

    // Si selecciona FREE (downgrade): la suscripción real vive en Google Play,
    // así que cancelar significa gestionarla ahí, no editar un campo local.
    if (planType === SUBSCRIPTION_PLANS.FREE) {
      Alert.alert(
        'Cancelar Premium',
        'Para cancelar tu suscripción Premium debes hacerlo desde Google Play. Seguirás teniendo acceso Premium hasta el final del período ya pagado.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Ir a Google Play',
            onPress: () => openSubscriptionManagement(),
          },
        ]
      );
      return;
    }

    // Upgrade a Premium
    setSelectedPlan(planType);
    Alert.alert(
      'Activar Premium',
      `¿Deseas activar el plan Premium por $2.200 CLP/mes?\n\nBeneficios:\n• Fotos de respaldo de tus lecturas\n• Sin anuncios\n• Soporte prioritario\n• Acceso anticipado a nuevas funciones`,
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

      let purchaseResult;
      try {
        purchaseResult = await purchasePremium();
      } catch (rcError) {
        if (rcError.message === 'NO_PRODUCTS') {
          Alert.alert(
            'Próximamente',
            'El plan Premium estará disponible muy pronto en la tienda. ¡Gracias por tu interés en SENERGY!'
          );
          return;
        }
        if (rcError.message === 'REVENUECAT_NOT_READY') {
          Alert.alert('Error', 'El sistema de pagos no está listo. Intenta cerrar y abrir la app.');
          return;
        }
        throw rcError;
      }

      if (purchaseResult.cancelled) return;
      if (!purchaseResult.success) throw new Error('Compra no completada');

      // La compra ya fue verificada por Google Play / RevenueCat. El estado
      // en Firestore lo actualiza el webhook de RevenueCat (server-side) en
      // segundos; hacemos un par de reintentos para reflejarlo en la UI antes
      // de mostrar el mensaje de éxito.
      logger.info('User completed purchase via RevenueCat', { userId: user.uid });
      await waitForPremiumSync();

      Alert.alert(
        '¡Bienvenido a Premium!',
        '¡Gracias por apoyar a SENERGY!\n\nAhora disfrutas de:\n• Sin anuncios en ninguna pantalla\n• Soporte prioritario\n• Acceso anticipado a nuevas funciones',
        [
          {
            text: 'Continuar',
            onPress: () => {
              if (onUpgrade) onUpgrade();
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      logger.error('Error upgrading to premium', { error });
      Alert.alert('Error', 'No se pudo completar la compra. Intenta nuevamente.');
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      setLoading(true);
      const user = getCurrentUser();
      if (!user) return;

      const isPremium = await restorePurchases();
      if (isPremium) {
        // El webhook de RevenueCat sincroniza Firestore server-side.
        await waitForPremiumSync();
        Alert.alert('Compra restaurada', 'Tu suscripción Premium ha sido restaurada correctamente.');
      } else {
        Alert.alert('Sin compras', 'No se encontraron compras anteriores para restaurar.');
      }
    } catch (error) {
      logger.error('Error restoring purchases', { error });
      Alert.alert('Error', 'No se pudo restaurar la compra. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Espera breve para que el webhook de RevenueCat sincronice Firestore
  // antes de refrescar la UI (evita mostrar "FREE" por un instante tras pagar).
  const waitForPremiumSync = async () => {
    for (let attempt = 0; attempt < 5; attempt++) {
      const current = await refreshSubscription();
      if (current === SUBSCRIPTION_PLANS.PREMIUM) return;
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  };

  const openSubscriptionManagement = async () => {
    const url = 'https://play.google.com/store/account/subscriptions?sku=senergy_premium_monthly&package=com.energysaver.senergy';
    try {
      await Linking.openURL(url);
    } catch (error) {
      logger.error('Error opening subscription management', { error });
      Alert.alert('Error', 'No se pudo abrir Google Play. Ábrelo manualmente desde la app de Play Store.');
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
            Puedes cancelar tu suscripción Premium en cualquier momento desde esta pantalla.
          </Text>
          <TouchableOpacity
            onPress={handleRestorePurchases}
            disabled={loading}
            style={{ marginTop: SPACING.md }}
          >
            <Text style={[styles.footerText, { color: colors.PRIMARY, textDecorationLine: 'underline' }]}>
              Restaurar compras anteriores
            </Text>
          </TouchableOpacity>
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
