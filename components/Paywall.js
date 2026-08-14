import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDarkMode } from '../utils/darkModeContext';
import { SPACING, TYPOGRAPHY, RADIUS, ELEVATION } from '../constants/theme';
import Icon from './Icon';

/**
 * Paywall Modal - Bloquea features premium y ofrece upgrade
 *
 * @param {boolean} visible - Si el modal está visible
 * @param {function} onClose - Callback al cerrar modal
 * @param {function} onUpgrade - Callback al presionar "Activar Premium"
 * @param {string} feature - Feature bloqueada (ej: "Captura de fotos")
 * @param {string} reason - Razón del bloqueo (ej: "Has alcanzado el límite de 1 medidor")
 */
export const Paywall = ({
  visible,
  onClose,
  onUpgrade,
  feature = 'esta función',
  reason = null,
}) => {
  const { colors, isDark } = useDarkMode();
  const styles = createStyles(colors);

  const premiumFeatures = [
    { icon: 'infinite', text: 'Medidores ilimitados' },
    { icon: 'calendar', text: 'Lecturas ilimitadas' },
    { icon: 'camera', text: 'Captura de fotos del medidor' },
    { icon: 'download', text: 'Exportación a Excel' },
    { icon: 'analytics', text: 'Estadísticas avanzadas' },
    { icon: 'flash', text: 'Insights inteligentes' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
          {/* Header con gradiente */}
          <LinearGradient
            colors={isDark ? ['#F59E0B', '#D97706'] : ['#FCD34D', '#F59E0B']}
            style={styles.header}
          >
            <View style={styles.iconContainer}>
              <Icon name="lock-closed" size={40} color="#FFF" />
            </View>
            <Text style={styles.headerTitle}>Premium Requerido</Text>
            <Text style={styles.headerSubtitle}>
              Para usar {feature}
            </Text>
          </LinearGradient>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Razón del bloqueo */}
            {reason && (
              <View style={[styles.reasonBox, { backgroundColor: colors.CARD }]}>
                <Icon name="information-circle" size={20} color={colors.WARNING} />
                <Text style={[styles.reasonText, { color: colors.TEXT_DARK }]}>
                  {reason}
                </Text>
              </View>
            )}

            {/* Título */}
            <Text style={[styles.sectionTitle, { color: colors.TEXT_DARK }]}>
              Desbloquea Premium y obtén:
            </Text>

            {/* Features Premium */}
            <View style={styles.featuresContainer}>
              {premiumFeatures.map((feat, index) => (
                <View key={index} style={styles.featureRow}>
                  <View style={[styles.featureIcon, { backgroundColor: colors.SUCCESS + '20' }]}>
                    <Icon name={feat.icon} size={20} color={colors.SUCCESS} />
                  </View>
                  <Text style={[styles.featureText, { color: colors.TEXT_DARK }]}>
                    {feat.text}
                  </Text>
                </View>
              ))}
            </View>

            {/* Precio */}
            <View style={[styles.priceBox, { backgroundColor: colors.CARD }]}>
              <Text style={[styles.priceLabel, { color: colors.TEXT_LIGHT }]}>
                Solo por
              </Text>
              <View style={styles.priceRow}>
                <Text style={[styles.priceAmount, { color: colors.PRIMARY }]}>
                  $2.200
                </Text>
                <Text style={[styles.priceUnit, { color: colors.TEXT_LIGHT }]}>
                  CLP/mes
                </Text>
              </View>
              <Text style={[styles.priceNote, { color: colors.TEXT_LIGHT }]}>
                Cancela cuando quieras
              </Text>
            </View>
          </ScrollView>

          {/* Footer con botones */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.upgradeButton, { backgroundColor: colors.PRIMARY }]}
              onPress={onUpgrade}
            >
              <Icon name="star" size={20} color="#FFF" />
              <Text style={styles.upgradeButtonText}>Activar Premium</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={[styles.closeButtonText, { color: colors.TEXT_LIGHT }]}>
                Ahora no
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'flex-end',
    },
    container: {
      borderTopLeftRadius: RADIUS.xl,
      borderTopRightRadius: RADIUS.xl,
      maxHeight: '90%',
      ...ELEVATION.lg,
    },
    header: {
      padding: SPACING.xl,
      alignItems: 'center',
      borderTopLeftRadius: RADIUS.xl,
      borderTopRightRadius: RADIUS.xl,
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: RADIUS.full,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: SPACING.md,
    },
    headerTitle: {
      fontSize: TYPOGRAPHY.sizes['2xl'],
      fontWeight: TYPOGRAPHY.weights.bold,
      color: '#FFF',
      marginBottom: SPACING.xs,
    },
    headerSubtitle: {
      fontSize: TYPOGRAPHY.sizes.base,
      color: 'rgba(255, 255, 255, 0.9)',
    },
    content: {
      padding: SPACING.xl,
    },
    reasonBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      padding: SPACING.md,
      borderRadius: RADIUS.md,
      marginBottom: SPACING.lg,
    },
    reasonText: {
      flex: 1,
      fontSize: TYPOGRAPHY.sizes.sm,
      lineHeight: TYPOGRAPHY.sizes.sm * TYPOGRAPHY.lineHeights.relaxed,
    },
    sectionTitle: {
      fontSize: TYPOGRAPHY.sizes.lg,
      fontWeight: TYPOGRAPHY.weights.semibold,
      marginBottom: SPACING.lg,
    },
    featuresContainer: {
      gap: SPACING.md,
      marginBottom: SPACING.xl,
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.md,
    },
    featureIcon: {
      width: 40,
      height: 40,
      borderRadius: RADIUS.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    featureText: {
      flex: 1,
      fontSize: TYPOGRAPHY.sizes.base,
      fontWeight: TYPOGRAPHY.weights.medium,
    },
    priceBox: {
      padding: SPACING.lg,
      borderRadius: RADIUS.lg,
      alignItems: 'center',
      marginBottom: SPACING.md,
    },
    priceLabel: {
      fontSize: TYPOGRAPHY.sizes.sm,
      marginBottom: SPACING.xs,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: SPACING.xs,
    },
    priceAmount: {
      fontSize: TYPOGRAPHY.sizes['3xl'],
      fontWeight: TYPOGRAPHY.weights.bold,
    },
    priceUnit: {
      fontSize: TYPOGRAPHY.sizes.base,
    },
    priceNote: {
      fontSize: TYPOGRAPHY.sizes.xs,
      marginTop: SPACING.xs,
    },
    footer: {
      padding: SPACING.xl,
      gap: SPACING.md,
    },
    upgradeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.sm,
      paddingVertical: SPACING.md,
      borderRadius: RADIUS.lg,
      ...ELEVATION.sm,
    },
    upgradeButtonText: {
      fontSize: TYPOGRAPHY.sizes.lg,
      fontWeight: TYPOGRAPHY.weights.semibold,
      color: '#FFF',
    },
    closeButton: {
      paddingVertical: SPACING.sm,
      alignItems: 'center',
    },
    closeButtonText: {
      fontSize: TYPOGRAPHY.sizes.base,
      fontWeight: TYPOGRAPHY.weights.medium,
    },
  });

export default Paywall;
