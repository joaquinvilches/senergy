import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import moment from 'moment';
import { SPACING, TYPOGRAPHY, RADIUS, ELEVATION } from '../constants/theme';
import Icon from './Icon';

/**
 * Panel de alertas de consumo alto
 *
 * @param {array} alerts - Array de alertas detectadas
 * @param {object} colors - Colores del tema
 * @param {object} animatedValue - Valor animado para transiciones
 */
export const AlertsPanel = ({ alerts, colors, animatedValue }) => {
  if (alerts.length === 0) return null;

  return (
    <Animated.View
      style={[
        styles.alertsContainer,
        {
          backgroundColor: colors.CARD,
          borderLeftColor: colors.ERROR,
          borderColor: colors.BORDER,
          transform: [{ scale: animatedValue }],
          opacity: animatedValue,
        },
      ]}
    >
      <View style={styles.alertHeader}>
        <View style={styles.alertHeaderLeft}>
          <View style={[styles.alertIconContainer, { backgroundColor: `${colors.ERROR}20` }]}>
            <Icon name="alert" size={16} color={colors.ERROR} />
          </View>
          <Text style={[styles.alertsTitle, { color: colors.ERROR }]}>
            Consumo Alto Detectado
          </Text>
        </View>
      </View>

      {alerts.map((alert) => (
        <View key={alert.id} style={[styles.alertItem, { borderTopColor: colors.BORDER }]}>
          <View style={styles.alertContent}>
            <Text style={[styles.alertMeterName, { color: colors.TEXT_DARK }]}>
              {alert.meterName}
            </Text>
            <Text style={[styles.alertDate, { color: colors.TEXT_LIGHT }]}>
              {alert.date && moment(alert.date).isValid()
                ? moment(alert.date).format('DD/MM/YYYY • HH:mm')
                : 'Fecha no disponible'}
            </Text>
          </View>
          <View style={styles.alertRight}>
            <Text style={[styles.alertConsumption, { color: colors.ERROR }]}>
              {alert.consumption} kWh
            </Text>
            <View style={[styles.alertBadge, { backgroundColor: colors.ERROR }]}>
              <Text style={styles.alertBadgeText}>+{alert.percentageOver}%</Text>
            </View>
          </View>
        </View>
      ))}

      <Text style={[styles.helperTextSmall, { color: colors.TEXT_LIGHT }]}>
        Tip: revisa electrodomésticos encendidos y horarios de mayor consumo.
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  alertsContainer: {
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderWidth: 1,
    ...ELEVATION.md,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm + 2,
  },
  alertHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIconContainer: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm + 2,
  },
  alertsTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  alertItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm + 2,
    borderTopWidth: 1,
  },
  alertContent: {
    flex: 1,
  },
  alertMeterName: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.xs,
  },
  alertDate: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  alertRight: {
    alignItems: 'flex-end',
  },
  alertConsumption: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.xs + 2,
  },
  alertBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm + 2,
  },
  alertBadgeText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  helperTextSmall: {
    marginTop: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: TYPOGRAPHY.sizes.sm * TYPOGRAPHY.lineHeights.relaxed,
  },
});