import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useDarkMode } from '../utils/darkModeContext';
import { CONFIG } from '../utils/constants';
import { formatCurrency } from '../utils/calculations';
import moment from 'moment';

export const MeterCard = ({ meter, onPress, onDelete }) => {
  const { colors } = useDarkMode();
  const lastReading = meter.lastReading || 0;
  const lastCost = meter.lastCost || 0;

  // Calcular días desde última lectura
  const lastReadingDate = meter.updatedAt?.toDate?.() || new Date();
  const daysSinceLastReading = moment().diff(moment(lastReadingDate), 'days');

  // Determinar color de alerta
  const getAlertColor = () => {
    if (daysSinceLastReading >= CONFIG.DAYS_WITHOUT_READING_CRITICAL) {
      return '#EF4444'; // Rojo - crítico
    }
    if (daysSinceLastReading >= CONFIG.DAYS_WITHOUT_READING_WARNING) {
      return '#F59E0B'; // Amarillo - alerta
    }
    return colors.ACCENT; // Verde - normal
  };

  const getAlertIcon = () => {
    if (daysSinceLastReading >= CONFIG.DAYS_WITHOUT_READING_CRITICAL) {
      return '🔴';
    }
    if (daysSinceLastReading >= CONFIG.DAYS_WITHOUT_READING_WARNING) {
      return '🟡';
    }
    return '🟢';
  };

  const getAlertText = () => {
    if (daysSinceLastReading === 0) {
      return 'Hoy';
    }
    if (daysSinceLastReading === 1) {
      return 'Ayer';
    }
    return `Hace ${daysSinceLastReading}d`;
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.WHITE,
          borderLeftColor: getAlertColor(),
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={[styles.meterName, { color: colors.PRIMARY }]}>
            {meter.name}
          </Text>
          <Text style={[styles.company, { color: colors.TEXT_LIGHT }]}>
            {meter.company} • {meter.region}
          </Text>
        </View>
        {onDelete && (
          <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
            <Text style={styles.deleteText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Indicador de días sin lectura */}
      <View style={[styles.alertBanner, { backgroundColor: `${getAlertColor()}15` }]}>
        <Text style={styles.alertIcon}>{getAlertIcon()}</Text>
        <Text style={[styles.alertText, { color: getAlertColor() }]}>
          Última lectura: {getAlertText()}
        </Text>
      </View>

      <View style={[styles.stats, { borderTopColor: colors.BACKGROUND }]}>
        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: colors.TEXT_LIGHT }]}>
            Última lectura
          </Text>
          <Text style={[styles.statValue, { color: colors.PRIMARY }]}>
            {lastReading} kWh
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.BACKGROUND }]} />
        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: colors.TEXT_LIGHT }]}>
            Último costo
          </Text>
          <Text style={[styles.statValue, { color: colors.ACCENT }]}>
            {formatCurrency(lastCost)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerContent: {
    flex: 1,
  },
  meterName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  company: {
    fontSize: 12,
    marginTop: 4,
  },
  deleteBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  alertIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  alertText: {
    fontSize: 12,
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    width: 1,
    height: 30,
  },
});