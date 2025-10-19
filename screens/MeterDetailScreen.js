import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDarkMode } from '../utils/darkModeContext';
import { MeterSelector } from '../components/MeterSelector';
import { getMeterReadings, getUserMeters } from '../services/meterService';
import { getCurrentUser } from '../services/authService';
import { formatCurrency, calculateStats } from '../utils/calculations';
import moment from 'moment';
import 'moment/locale/es';

moment.locale('es');

export const MeterDetailScreen = ({ navigation }) => {
  const { colors } = useDarkMode();
  const [meters, setMeters] = useState([]);
  const [selectedMeterId, setSelectedMeterId] = useState(null);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(moment().format('YYYY-MM'));

  useFocusEffect(
    React.useCallback(() => {
      loadMeters();
    }, [])
  );

  const loadMeters = async () => {
    try {
      setLoading(true);
      const user = getCurrentUser();
      if (user) {
        const userMeters = await getUserMeters(user.uid);
        setMeters(userMeters);
        if (userMeters.length > 0) {
          setSelectedMeterId(userMeters[0].id);
          await loadReadings(userMeters[0].id);
        }
      }
    } catch (error) {
      console.log('Error loading meters:', error);
      Alert.alert('Error', 'No se pudieron cargar los medidores');
    } finally {
      setLoading(false);
    }
  };

  const loadReadings = async (meterId) => {
    try {
      const user = getCurrentUser();
      const meterReadings = await getMeterReadings(user.uid, meterId);

      const readingsWithConsumption = meterReadings.map((reading, index) => {
        let consumption = 0;
        if (index > 0) {
          consumption = reading.value - meterReadings[index - 1].value;
        }
        return {
          ...reading,
          consumption,
          costPerKwh: reading.costPerKwh || 220,
        };
      });

      setReadings(readingsWithConsumption);
      setStats(calculateStats(readingsWithConsumption.slice(1)));
      calculateMonthlyStats(readingsWithConsumption);
      setSelectedMonth(moment().format('YYYY-MM'));
    } catch (error) {
      console.log('Error loading readings:', error);
      Alert.alert('Error', 'No se pudieron cargar las lecturas');
    }
  };

  const handleSelectMeter = async (meterId) => {
    setSelectedMeterId(meterId);
    await loadReadings(meterId);
  };

  const calculateMonthlyStats = (readingsData) => {
    const monthlyMap = {};

    readingsData.forEach((reading) => {
      if (reading.consumption && reading.consumption > 0) {
        const month = moment(reading.date.toDate()).format('YYYY-MM');
        if (!monthlyMap[month]) {
          monthlyMap[month] = {
            consumption: 0,
            cost: 0,
            count: 0,
          };
        }
        monthlyMap[month].consumption += reading.consumption;
        monthlyMap[month].cost += reading.cost || 0;
        monthlyMap[month].count += 1;
      }
    });

    setMonthlyStats(monthlyMap);
  };

  const getMonthlyComparison = () => {
    const currentMonth = selectedMonth;
    const previousMonth = moment(selectedMonth).subtract(1, 'month').format('YYYY-MM');

    const currentData = monthlyStats[currentMonth] || { consumption: 0, cost: 0 };
    const previousData = monthlyStats[previousMonth] || { consumption: 0, cost: 0 };

    const consumptionDiff = currentData.consumption - previousData.consumption;
    const costDiff = currentData.cost - previousData.cost;
    const percentageDiff = previousData.consumption
      ? ((consumptionDiff / previousData.consumption) * 100).toFixed(1)
      : 0;

    return {
      currentMonth: currentData,
      previousMonth: previousData,
      consumptionDiff,
      costDiff,
      percentageDiff,
    };
  };

  const selectedMeter = meters.find(m => m.id === selectedMeterId);
  const availableMonths = Object.keys(monthlyStats).sort().reverse();
  const comparison = getMonthlyComparison();
  const currentMonthData = monthlyStats[selectedMonth] || { consumption: 0, cost: 0 };

  const ReadingItem = ({ item, index }) => {
    const isInitial = index === readings.length - 1;
    const cost = item.consumption * item.costPerKwh;
    const readingDate = moment(item.date.toDate());
    const dayName = readingDate.format('dddd');
    const formattedDate = readingDate.format('DD/MM/YYYY');
    const formattedTime = readingDate.format('HH:mm');

    // Filtrar solo lecturas del mes seleccionado
    const readingMonth = readingDate.format('YYYY-MM');
    if (readingMonth !== selectedMonth) {
      return null;
    }

    return (
      <View style={[styles.readingItem, { backgroundColor: colors.WHITE }]}>
        <View style={styles.dateSection}>
          <View style={styles.dateContent}>
            <Text style={[styles.dayName, { color: colors.PRIMARY }]}>
              {dayName.charAt(0).toUpperCase() + dayName.slice(1)}
            </Text>
            <Text style={[styles.date, { color: colors.TEXT_LIGHT }]}>
              {formattedDate} • {formattedTime}
            </Text>
          </View>
          {isInitial && (
            <View style={[styles.badge, { backgroundColor: colors.ACCENT }]}>
              <Text style={styles.badgeText}>Inicial</Text>
            </View>
          )}
        </View>

        <View style={[styles.readingSection, { borderTopColor: colors.BACKGROUND }]}>
          <View style={styles.readingBox}>
            <Text style={[styles.readingLabel, { color: colors.TEXT_LIGHT }]}>
              Lectura del medidor
            </Text>
            <Text style={[styles.readingValue, { color: colors.PRIMARY }]}>
              {item.value}
            </Text>
            <Text style={[styles.readingUnit, { color: colors.TEXT_LIGHT }]}>kWh</Text>
          </View>

          {!isInitial && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.BACKGROUND }]} />

              <View style={styles.readingBox}>
                <Text style={[styles.readingLabel, { color: colors.TEXT_LIGHT }]}>
                  Consumo desde última lectura
                </Text>
                <Text style={[styles.readingValue, { color: colors.ACCENT }]}>
                  {item.consumption}
                </Text>
                <Text style={[styles.readingUnit, { color: colors.TEXT_LIGHT }]}>kWh</Text>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.BACKGROUND }]} />

              <View style={styles.readingBox}>
                <Text style={[styles.readingLabel, { color: colors.TEXT_LIGHT }]}>
                  Costo por consumo
                </Text>
                <Text style={[styles.costValue, { color: colors.PRIMARY }]}>
                  {formatCurrency(cost)}
                </Text>
                <Text style={[styles.costDetail, { color: colors.TEXT_LIGHT }]}>
                  ${item.costPerKwh}/kWh × {item.consumption} kWh
                </Text>
              </View>
            </>
          )}
        </View>
      </View>
    );
  };

  if (loading && meters.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.PRIMARY} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      {/* Selector de medidor */}
      <MeterSelector
        meters={meters}
        selectedMeterId={selectedMeterId}
        onSelectMeter={handleSelectMeter}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Información del medidor */}
        {selectedMeter && (
          <View style={[styles.infoBox, { backgroundColor: colors.WHITE }]}>
            <View>
              <Text style={[styles.infoLabel, { color: colors.TEXT_LIGHT }]}>
                {selectedMeter.company} • {selectedMeter.region}
              </Text>
              <Text style={[styles.infoValue, { color: colors.PRIMARY }]}>
                Última lectura: {selectedMeter.lastReading} kWh
              </Text>
            </View>
            <View style={styles.infoRight}>
              <Text style={[styles.infoCost, { color: colors.ACCENT }]}>
                {formatCurrency(selectedMeter.lastCost)}
              </Text>
              <Text style={[styles.infoCostLabel, { color: colors.TEXT_LIGHT }]}>
                Último costo
              </Text>
            </View>
          </View>
        )}

        {/* Estadísticas generales */}
        {stats && readings.length > 1 && (
          <View style={[styles.statsContainer, { backgroundColor: colors.WHITE }]}>
            <Text style={[styles.statsTitle, { color: colors.PRIMARY }]}>
              Estadísticas Generales
            </Text>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={[styles.statLabel, { color: colors.TEXT_LIGHT }]}>
                  Total
                </Text>
                <Text style={[styles.statValue, { color: colors.PRIMARY }]}>
                  {stats.totalConsumption}
                </Text>
                <Text style={[styles.statUnit, { color: colors.TEXT_LIGHT }]}>kWh</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statLabel, { color: colors.TEXT_LIGHT }]}>
                  Promedio
                </Text>
                <Text style={[styles.statValue, { color: colors.ACCENT }]}>
                  {stats.averageConsumption}
                </Text>
                <Text style={[styles.statUnit, { color: colors.TEXT_LIGHT }]}>kWh</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statLabel, { color: colors.TEXT_LIGHT }]}>
                  Máximo
                </Text>
                <Text style={[styles.statValue, { color: colors.PRIMARY }]}>
                  {stats.maxConsumption}
                </Text>
                <Text style={[styles.statUnit, { color: colors.TEXT_LIGHT }]}>kWh</Text>
              </View>
            </View>
          </View>
        )}

        {/* Selector de mes */}
        {availableMonths.length > 0 && (
          <View style={[styles.monthSelectorContainer, { backgroundColor: colors.WHITE }]}>
            <Text style={[styles.monthSelectorTitle, { color: colors.TEXT_DARK }]}>
              Selecciona mes:
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.monthScroll}
            >
              {availableMonths.map((month) => {
                const isSelected = month === selectedMonth;
                return (
                  <TouchableOpacity
                    key={month}
                    style={[
                      styles.monthButton,
                      {
                        backgroundColor: isSelected ? colors.PRIMARY : colors.BACKGROUND,
                        borderColor: colors.ACCENT,
                      },
                    ]}
                    onPress={() => setSelectedMonth(month)}
                  >
                    <Text
                      style={[
                        styles.monthButtonText,
                        { color: isSelected ? colors.WHITE : colors.TEXT_DARK },
                      ]}
                    >
                      {moment(month).format('MMM YYYY')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Estadísticas del mes */}
        <View style={[styles.monthStatsContainer, { backgroundColor: colors.WHITE }]}>
          <Text style={[styles.monthStatsTitle, { color: colors.PRIMARY }]}>
            {moment(selectedMonth).format('MMMM YYYY')}
          </Text>

          <View style={styles.monthStatRow}>
            <Text style={[styles.monthStatLabel, { color: colors.TEXT_LIGHT }]}>
              Consumo:
            </Text>
            <Text style={[styles.monthStatValue, { color: colors.PRIMARY }]}>
              {currentMonthData.consumption || 0} kWh
            </Text>
          </View>

          <View style={styles.monthStatRow}>
            <Text style={[styles.monthStatLabel, { color: colors.TEXT_LIGHT }]}>
              Costo:
            </Text>
            <Text style={[styles.monthStatValue, { color: colors.ACCENT }]}>
              {formatCurrency(currentMonthData.cost || 0)}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.BACKGROUND }]} />

          {/* Comparativa con mes anterior */}
          {monthlyStats[moment(selectedMonth).subtract(1, 'month').format('YYYY-MM')] && (
            <>
              <Text style={[styles.comparisonTitle, { color: colors.TEXT_LIGHT }]}>
                Comparado con mes anterior
              </Text>

              <View style={styles.monthStatRow}>
                <Text style={[styles.monthStatLabel, { color: colors.TEXT_LIGHT }]}>
                  Diferencia:
                </Text>
                <Text
                  style={[
                    styles.monthStatValue,
                    {
                      color: comparison.consumptionDiff > 0 ? '#EF4444' : '#10B981',
                    },
                  ]}
                >
                  {comparison.consumptionDiff > 0 ? '+' : ''}{comparison.consumptionDiff} kWh
                </Text>
              </View>

              <View style={styles.monthStatRow}>
                <Text style={[styles.monthStatLabel, { color: colors.TEXT_LIGHT }]}>
                  Porcentaje:
                </Text>
                <Text
                  style={[
                    styles.monthStatValue,
                    {
                      color: comparison.percentageDiff > 0 ? '#EF4444' : '#10B981',
                    },
                  ]}
                >
                  {comparison.percentageDiff > 0 ? '+' : ''}{comparison.percentageDiff}%
                </Text>
              </View>

              {comparison.percentageDiff < 0 && (
                <View style={[styles.celebrationBanner, { backgroundColor: '#10B98115' }]}>
                  <Text style={styles.celebrationEmoji}>🎉</Text>
                  <Text style={[styles.celebrationText, { color: '#10B981' }]}>
                    ¡Excelente! Estás ahorrando
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Lista de lecturas del mes */}
        <View style={styles.readingsHeader}>
          <Text style={[styles.readingsTitle, { color: colors.PRIMARY }]}>
            Lecturas de {moment(selectedMonth).format('MMMM')}
          </Text>
        </View>

        {readings.filter(r => moment(r.date.toDate()).format('YYYY-MM') === selectedMonth)
          .length > 0 ? (
          readings
            .filter(r => moment(r.date.toDate()).format('YYYY-MM') === selectedMonth)
            .reverse()
            .map((reading, index) => (
              <ReadingItem
                key={reading.id}
                item={reading}
                index={readings.findIndex(r => r.id === reading.id)}
              />
            ))
        ) : (
          <View style={styles.noReadingsBox}>
            <Text style={[styles.noReadingsText, { color: colors.TEXT_LIGHT }]}>
              No hay lecturas registradas en este mes
            </Text>
          </View>
        )}

        <View style={styles.spacer} />
      </ScrollView>

      {/* Botón flotante */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.PRIMARY }]}
        onPress={() => navigation.navigate('NewReading', { meterId: selectedMeterId })}
      >
        <Text style={styles.fabIcon}>➕</Text>
        <Text style={styles.fabText}>Nueva lectura</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 12,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  infoLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoRight: {
    alignItems: 'flex-end',
  },
  infoCost: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoCostLabel: {
    fontSize: 10,
  },
  statsContainer: {
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  statLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statUnit: {
    fontSize: 10,
    marginTop: 4,
  },
  monthSelectorContainer: {
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 12,
    padding: 12,
  },
  monthSelectorTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  monthScroll: {
    flexGrow: 0,
  },
  monthButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  monthButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  monthStatsContainer: {
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
  },
  monthStatsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  monthStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  monthStatLabel: {
    fontSize: 14,
  },
  monthStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  comparisonTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  celebrationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  celebrationEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  celebrationText: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  readingsHeader: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 8,
  },
  readingsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  readingItem: {
    borderRadius: 16,
    marginHorizontal: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  dateContent: {
    flex: 1,
  },
  dayName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  readingSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  readingBox: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  readingLabel: {
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  readingValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  readingUnit: {
    fontSize: 12,
    marginTop: 4,
  },
  costValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  costDetail: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  noReadingsBox: {
    marginHorizontal: 12,
    paddingVertical: 24,
    alignItems: 'center',
  },
  noReadingsText: {
    fontSize: 13,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  fabText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  spacer: {
    height: 80,
  },
});