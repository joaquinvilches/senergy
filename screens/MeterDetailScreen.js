import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
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

// --- Helpers ---
const toJSDate = (d) => (d?.toDate ? d.toDate() : new Date(d || Date.now()));

export const MeterDetailScreen = ({ navigation }) => {
  const { colors } = useDarkMode();

  const [meters, setMeters] = useState([]);
  const [selectedMeterId, setSelectedMeterId] = useState(null);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(moment().format('YYYY-MM'));

  // Cargar medidores al enfocar
  useFocusEffect(
    useCallback(() => {
      loadMeters();
    }, [])
  );

  const loadMeters = async () => {
    try {
      setLoading(true);
      const user = getCurrentUser();
      if (!user?.uid) return;
      const userMeters = await getUserMeters(user.uid);
      setMeters(userMeters);
      if (userMeters.length > 0) {
        const firstId = userMeters[0].id;
        setSelectedMeterId(firstId);
        await loadReadings(firstId);
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

      // Ordena por fecha ascendente para calcular consumo correctamente
      const sorted = [...meterReadings].sort((a, b) => toJSDate(a.date) - toJSDate(b.date));

      const readingsWithConsumption = sorted.map((reading, index) => {
        const prev = sorted[index - 1];
        let consumption = 0;
        if (prev) {
          // si el medidor se "reseteó" (value menor), tratamos como inicial
          consumption = reading.value >= prev.value ? reading.value - prev.value : reading.value;
        }
        return {
          ...reading,
          consumption,
          costPerKwh: reading.costPerKwh || 220,
        };
      });

      setReadings(readingsWithConsumption);
      // para stats generales omitimos la primera (inicial)
      setStats(calculateStats(readingsWithConsumption.slice(1)));
      calculateMonthlyStats(readingsWithConsumption);
      setSelectedMonth(moment().format('YYYY-MM'));
    } catch (error) {
      console.log('Error loading readings:', error);
      Alert.alert('Error', 'No se pudieron cargar las lecturas');
    }
  };

  const handleSelectMeter = async (meterId) => {
    if (meterId === selectedMeterId) return;
    setSelectedMeterId(meterId);
    await loadReadings(meterId);
  };

  const calculateMonthlyStats = (readingsData) => {
    const monthlyMap = {};
    readingsData.forEach((reading) => {
      const c = Number(reading.consumption || 0);
      if (c <= 0) return;
      const month = moment(toJSDate(reading.date)).format('YYYY-MM');
      if (!monthlyMap[month]) {
        monthlyMap[month] = { consumption: 0, cost: 0, count: 0 };
      }
      monthlyMap[month].consumption += c;
      monthlyMap[month].cost += Number(reading.cost || c * (reading.costPerKwh || 0));
      monthlyMap[month].count += 1;
    });
    setMonthlyStats(monthlyMap);
  };

  const getMonthlyComparison = useCallback(() => {
    const currentMonth = selectedMonth;
    const previousMonth = moment(selectedMonth).subtract(1, 'month').format('YYYY-MM');

    const currentData = monthlyStats[currentMonth] || { consumption: 0, cost: 0 };
    const previousData = monthlyStats[previousMonth] || { consumption: 0, cost: 0 };

    const consumptionDiff = (currentData.consumption || 0) - (previousData.consumption || 0);
    const costDiff = (currentData.cost || 0) - (previousData.cost || 0);
    const percentageDiff = previousData.consumption
      ? Number(((consumptionDiff / previousData.consumption) * 100).toFixed(1))
      : 0;

    return { currentMonth: currentData, previousMonth: previousData, consumptionDiff, costDiff, percentageDiff };
  }, [selectedMonth, monthlyStats]);

  const selectedMeter = meters.find((m) => m.id === selectedMeterId);

  const availableMonths = useMemo(
    () => Object.keys(monthlyStats).sort().reverse(),
    [monthlyStats]
  );

  // Lecturas del mes seleccionado (ordenadas desc para UI)
  const monthReadings = useMemo(() => {
    const list = readings.filter((r) => moment(toJSDate(r.date)).format('YYYY-MM') === selectedMonth);
    // más recientes primero
    return list.sort((a, b) => toJSDate(b.date) - toJSDate(a.date));
  }, [readings, selectedMonth]);

  const comparison = getMonthlyComparison();
  const currentMonthData = monthlyStats[selectedMonth] || { consumption: 0, cost: 0 };

  // ---- Render item de lectura ----
  const renderReadingItem = ({ item }) => {
    // "Inicial" = primera del mes en orden asc
    const sameMonthAsc = monthReadings.slice().sort((a, b) => toJSDate(a.date) - toJSDate(b.date));
    const isInitial = sameMonthAsc[0]?.id === item.id;

    const cost = Number(item.consumption || 0) * Number(item.costPerKwh || 0);
    const readingDate = moment(toJSDate(item.date));
    const dayName = readingDate.format('dddd');
    const formattedDate = readingDate.format('DD/MM/YYYY');
    const formattedTime = readingDate.format('HH:mm');

    return (
      <View
        style={[
          styles.readingItem,
          {
            backgroundColor: colors.CARD,
            shadowColor: colors.TEXT_DARK,
            borderColor: colors.BORDER,
            borderWidth: 1,
          },
        ]}
      >
        <View style={[styles.dateSection, { backgroundColor: colors.BACKGROUND }]}>
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
              <Text style={[styles.badgeText, { color: colors.WHITE }]}>Inicial</Text>
            </View>
          )}
        </View>

        <View style={[styles.readingSection, { borderTopColor: colors.BORDER }]}>
          <View style={styles.readingBox}>
            <Text style={[styles.readingLabel, { color: colors.TEXT_LIGHT }]}>Lectura del medidor</Text>
            <Text style={[styles.readingValue, { color: colors.PRIMARY }]}>{item.value}</Text>
            <Text style={[styles.readingUnit, { color: colors.TEXT_LIGHT }]}>kWh</Text>
          </View>

          {!isInitial && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.BORDER }]} />
              <View style={styles.readingBox}>
                <Text style={[styles.readingLabel, { color: colors.TEXT_LIGHT }]}>Consumo desde última lectura</Text>
                <Text style={[styles.readingValue, { color: colors.ACCENT }]}>{item.consumption}</Text>
                <Text style={[styles.readingUnit, { color: colors.TEXT_LIGHT }]}>kWh</Text>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.BORDER }]} />
              <View style={styles.readingBox}>
                <Text style={[styles.readingLabel, { color: colors.TEXT_LIGHT }]}>Costo por consumo</Text>
                <Text style={[styles.costValue, { color: colors.PRIMARY }]}>{formatCurrency(cost)}</Text>
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

  // ---- Header de la lista (todo el contenido que estaba arriba del ScrollView) ----
  const ListHeader = () => (
    <View>
      {/* Selector de medidor */}
      <MeterSelector meters={meters} selectedMeterId={selectedMeterId} onSelectMeter={handleSelectMeter} />

      {/* Información del medidor */}
      {selectedMeter && (
        <View
          style={[
            styles.infoBox,
            {
              backgroundColor: colors.CARD,
              borderColor: colors.BORDER,
              shadowColor: colors.TEXT_DARK,
            },
          ]}
        >
          <View>
            <Text style={[styles.infoLabel, { color: colors.TEXT_LIGHT }]}>
              {selectedMeter.company} • {selectedMeter.region}
            </Text>
            <Text style={[styles.infoValue, { color: colors.PRIMARY }]}>
              Última lectura: {selectedMeter.lastReading} kWh
            </Text>
          </View>
          <View style={styles.infoRight}>
            <Text style={[styles.infoCost, { color: colors.ACCENT }]}>{formatCurrency(selectedMeter.lastCost)}</Text>
            <Text style={[styles.infoCostLabel, { color: colors.TEXT_LIGHT }]}>Último costo</Text>
          </View>
        </View>
      )}

      {/* Estadísticas generales */}
      {stats && readings.length > 1 && (
        <View style={[styles.statsContainer, { backgroundColor: colors.CARD, borderColor: colors.BORDER, borderWidth: 1 }]}>
          <Text style={[styles.statsTitle, { color: colors.PRIMARY }]}>Estadísticas Generales</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.TEXT_LIGHT }]}>Total</Text>
              <Text style={[styles.statValue, { color: colors.PRIMARY }]}>{stats.totalConsumption}</Text>
              <Text style={[styles.statUnit, { color: colors.TEXT_LIGHT }]}>kWh</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.TEXT_LIGHT }]}>Promedio</Text>
              <Text style={[styles.statValue, { color: colors.ACCENT }]}>{stats.averageConsumption}</Text>
              <Text style={[styles.statUnit, { color: colors.TEXT_LIGHT }]}>kWh</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.TEXT_LIGHT }]}>Máximo</Text>
              <Text style={[styles.statValue, { color: colors.PRIMARY }]}>{stats.maxConsumption}</Text>
              <Text style={[styles.statUnit, { color: colors.TEXT_LIGHT }]}>kWh</Text>
            </View>
          </View>
        </View>
      )}

      {/* Selector de mes */}
      {availableMonths.length > 0 && (
        <View style={[styles.monthSelectorContainer, { backgroundColor: colors.CARD, borderColor: colors.BORDER, borderWidth: 1 }]}>
          <Text style={[styles.monthSelectorTitle, { color: colors.TEXT_DARK }]}>Selecciona mes:</Text>
          <View style={styles.monthScroll}>
            {availableMonths.map((month) => {
              const isSelected = month === selectedMonth;
              return (
                <TouchableOpacity
                  key={month}
                  style={[
                    styles.monthButton,
                    {
                      backgroundColor: isSelected ? colors.PRIMARY : colors.BACKGROUND,
                      borderColor: isSelected ? colors.PRIMARY : colors.BORDER,
                    },
                  ]}
                  onPress={() => setSelectedMonth(month)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.monthButtonText, { color: isSelected ? colors.WHITE : colors.TEXT_DARK }]}>
                    {moment(month).format('MMM YYYY')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Estadísticas del mes */}
      <View style={[styles.monthStatsContainer, { backgroundColor: colors.CARD, borderColor: colors.BORDER, borderWidth: 1 }]}>
        <Text style={[styles.monthStatsTitle, { color: colors.PRIMARY }]}>{moment(selectedMonth).format('MMMM YYYY')}</Text>

        <View style={styles.monthStatRow}>
          <Text style={[styles.monthStatLabel, { color: colors.TEXT_LIGHT }]}>Consumo:</Text>
          <Text style={[styles.monthStatValue, { color: colors.PRIMARY }]}>{currentMonthData.consumption || 0} kWh</Text>
        </View>

        <View style={styles.monthStatRow}>
          <Text style={[styles.monthStatLabel, { color: colors.TEXT_LIGHT }]}>Costo:</Text>
          <Text style={[styles.monthStatValue, { color: colors.ACCENT }]}>{formatCurrency(currentMonthData.cost || 0)}</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.BORDER }]} />

        {/* Comparativa con mes anterior */}
        {monthlyStats[moment(selectedMonth).subtract(1, 'month').format('YYYY-MM')] && (
          <>
            <Text style={[styles.comparisonTitle, { color: colors.TEXT_LIGHT }]}>Comparado con mes anterior</Text>

            <View style={styles.monthStatRow}>
              <Text style={[styles.monthStatLabel, { color: colors.TEXT_LIGHT }]}>Diferencia:</Text>
              <Text style={[styles.monthStatValue, { color: comparison.consumptionDiff > 0 ? colors.ERROR : colors.SUCCESS }]}>
                {comparison.consumptionDiff > 0 ? '+' : ''}{comparison.consumptionDiff} kWh
              </Text>
            </View>

            <View style={styles.monthStatRow}>
              <Text style={[styles.monthStatLabel, { color: colors.TEXT_LIGHT }]}>Porcentaje:</Text>
              <Text style={[styles.monthStatValue, { color: comparison.percentageDiff > 0 ? colors.ERROR : colors.SUCCESS }]}>
                {comparison.percentageDiff > 0 ? '+' : ''}{comparison.percentageDiff}%
              </Text>
            </View>

            {comparison.percentageDiff < 0 && (
              <View style={[styles.celebrationBanner, { backgroundColor: colors.SUCCESS + '22' }]}>
                <Text style={styles.celebrationEmoji}>🎉</Text>
                <Text style={[styles.celebrationText, { color: colors.SUCCESS }]}>¡Excelente! Estás ahorrando</Text>
              </View>
            )}
          </>
        )}
      </View>

      {/* Título de lista */}
      <View style={styles.readingsHeader}>
        <Text style={[styles.readingsTitle, { color: colors.PRIMARY }]}>
          Lecturas de {moment(selectedMonth).format('MMMM')}
        </Text>
      </View>
    </View>
  );

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
      <FlatList
        data={monthReadings}
        keyExtractor={(item) => item.id}
        renderItem={renderReadingItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <View style={styles.noReadingsBox}>
            <Text style={[styles.noReadingsText, { color: colors.TEXT_LIGHT }]}>
              No hay lecturas registradas en este mes
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Botón flotante */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.PRIMARY, shadowColor: colors.TEXT_DARK }]}
        onPress={() => navigation.navigate('NewReading', { meterId: selectedMeterId })}
        activeOpacity={0.9}
      >
        <Text style={[styles.fabIcon, { color: colors.WHITE }]}>➕</Text>
        <Text style={[styles.fabText, { color: colors.WHITE }]}>Nueva lectura</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  infoBox: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginHorizontal: 12, marginVertical: 12, paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  infoLabel: { fontSize: 11, marginBottom: 4 },
  infoValue: { fontSize: 16, fontWeight: 'bold' },
  infoRight: { alignItems: 'flex-end' },
  infoCost: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  infoCostLabel: { fontSize: 10 },

  statsContainer: { marginHorizontal: 12, marginVertical: 8, borderRadius: 12, padding: 16 },
  statsTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 12 },
  statsGrid: { flexDirection: 'row', gap: 8 },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  statLabel: { fontSize: 11, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: 'bold' },
  statUnit: { fontSize: 10, marginTop: 4 },

  monthSelectorContainer: { marginHorizontal: 12, marginVertical: 8, borderRadius: 12, padding: 12 },
  monthSelectorTitle: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
  monthScroll: { flexDirection: 'row', flexWrap: 'nowrap' },
  monthButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1 },
  monthButtonText: { fontSize: 12, fontWeight: '600' },

  monthStatsContainer: { marginHorizontal: 12, marginVertical: 8, borderRadius: 12, padding: 16 },
  monthStatsTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  monthStatRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  monthStatLabel: { fontSize: 14 },
  monthStatValue: { fontSize: 16, fontWeight: 'bold' },
  comparisonTitle: { fontSize: 12, fontWeight: '600', marginTop: 12, marginBottom: 8 },

  celebrationBanner: { flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  celebrationEmoji: { fontSize: 20, marginRight: 8 },
  celebrationText: { fontSize: 12, fontWeight: '600' },

  divider: { height: 1, marginVertical: 8 },

  readingsHeader: { paddingHorizontal: 12, paddingTop: 16, paddingBottom: 8 },
  readingsTitle: { fontSize: 14, fontWeight: 'bold' },

  readingItem: {
    borderRadius: 16, marginHorizontal: 12, marginBottom: 12, overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 3,
  },
  dateSection: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  dateContent: { flex: 1 },
  dayName: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  date: { fontSize: 12 },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '600' },

  readingSection: { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1 },
  readingBox: { alignItems: 'center', paddingVertical: 8 },
  readingLabel: { fontSize: 12, marginBottom: 8, textAlign: 'center' },
  readingValue: { fontSize: 24, fontWeight: 'bold' },
  readingUnit: { fontSize: 12, marginTop: 4 },
  costValue: { fontSize: 20, fontWeight: '700' },
  costDetail: { fontSize: 11, marginTop: 4, textAlign: 'center' },

  noReadingsBox: { marginHorizontal: 12, paddingVertical: 24, alignItems: 'center' },
  noReadingsText: { fontSize: 13 },

  fab: {
    position: 'absolute', bottom: 20, right: 20,
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 50, paddingHorizontal: 20, paddingVertical: 14,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 8,
  },
  fabIcon: { fontSize: 18, marginRight: 8 },
  fabText: { fontWeight: 'bold', fontSize: 14 },
});
