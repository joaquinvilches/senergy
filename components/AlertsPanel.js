import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import moment from 'moment';

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
            <Text style={styles.alertIcon}>⚠</Text>
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
              {moment(alert.date).format('DD/MM/YYYY • HH:mm')}
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
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  alertHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  alertIcon: {
    fontSize: 16,
  },
  alertsTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  alertItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  alertContent: {
    flex: 1,
  },
  alertMeterName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  alertDate: {
    fontSize: 12,
  },
  alertRight: {
    alignItems: 'flex-end',
  },
  alertConsumption: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  alertBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  alertBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  helperTextSmall: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 18,
  },
});