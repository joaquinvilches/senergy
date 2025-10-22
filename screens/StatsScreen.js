// screens/StatsScreen.js
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';
import { useDarkMode } from '../utils/darkModeContext';
import { CONFIG } from '../utils/constants';
import { getUserMeters, getMeterReadings } from '../services/meterService';
import { getCurrentUser } from '../services/authService';
import { formatCurrency } from '../utils/calculations';
import moment from 'moment';
import 'moment/locale/es';
import { hexToRgba, clamp, formatNumberShort } from '../utils/themeHelpers';

moment.locale('es');

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 32;
const toJSDate = (d) => (d?.toDate ? d.toDate() : new Date(d));

const PALETTE_LIGHT = [
  '#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#14B8A6', '#F97316', '#22C55E', '#3B82F6', '#E11D48'
];
const PALETTE_DARK = [
  '#93C5FD', '#6EE7B7', '#FCD34D', '#FCA5A5', '#C4B5FD',
  '#5EEAD4', '#FDBA74', '#86EFAC', '#A5B4FC', '#F87171'
];

const WINDOW_DAYS = { week: 7, month: 30, year: 365 };
const PERIODS = ['week', 'month', 'year'];
const PERIOD_LABELS = { week: '7 Días', month: '30 Días', year: 'Año' };
const CHART_TYPES = { line: 'Ritmo diario de consumo', bar: 'Distribución (kWh/día)', pie: 'Distribución por medidor' };

// ——— Helpers de visualización ———
const thinLabels = (labels, maxLabels = 8) => {
  if (!labels?.length) return [];
  const step = Math.max(1, Math.ceil(labels.length / maxLabels));
  return labels.map((l, i) => (i % step === 0 ? l : ''));
};

const calculatePerDayMetrics = (reading, previousReading) => {
  const d1 = previousReading ? moment(toJSDate(previousReading.date)) : null;
  const d2 = moment(toJSDate(reading.date));
  const days = d1 ? Math.max(1, d2.diff(d1, 'days')) : 1;
  const consumption = Number(reading.consumption || 0);
  const perDay = consumption > 0 ? consumption / days : 0;
  
  return { perDay, days };
};

const getPreviousReading = (meterId, readingId, readingsByMeterAsc) => {
  const arr = readingsByMeterAsc.get(meterId) || [];
  const idx = arr.findIndex((x) => x.id === readingId);
  return idx > 0 ? arr[idx - 1] : null;
};

export const StatsScreen = () => {
  const { colors, isDark } = useDarkMode();

  const [meters, setMeters] = useState([]);
  const [allReadings, setAllReadings] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMeter, setSelectedMeter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState(null);

  const animatedValue = useRef(new Animated.Value(0)).current;
  const initialLoadRef = useRef(true);
  const nowRef = useRef(moment());

  const animateEntry = useCallback(() => {
    animatedValue.setValue(0);
    Animated.spring(animatedValue, {
      toValue: 1,
      tension: 25,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [animatedValue]);

  const fetchAll = useCallback(async () => {
    try {
      setError(null);
      if (initialLoadRef.current) setLoading(true);
      
      const user = getCurrentUser?.();
      if (!user?.uid) {
        if (initialLoadRef.current) setLoading(false);
        return;
      }
      
      const userMeters = await getUserMeters(user.uid);
      setMeters(userMeters || []);

      const readingsPromises = (userMeters || []).map(async (m) => {
        try {
          const readings = await getMeterReadings(user.uid, m.id);
          return (readings || []).map((r) => ({
            ...r,
            meterId: m.id,
            meterName: m.name,
            meterCompany: m.company,
            meterColor: m.color || undefined,
          }));
        } catch (err) {
          console.warn(`Error loading readings for meter ${m.id}:`, err);
          return [];
        }
      });

      const byMeter = await Promise.all(readingsPromises);
      setAllReadings(byMeter.flat());
    } catch (e) {
      console.error('Error loading stats:', e);
      setError('No se pudieron cargar las estadísticas');
      Alert.alert('Error', 'No se pudieron cargar las estadísticas');
    } finally {
      setLoading(false);
      initialLoadRef.current = false;
    }
  }, []);

  useEffect(() => { 
    fetchAll(); 
  }, [fetchAll]);

  useEffect(() => {
    if (!initialLoadRef.current) setIsFetching(true);
  }, [selectedPeriod, selectedMeter]);

  const readingsByMeterAsc = useMemo(() => {
    const map = new Map();
    allReadings.forEach((r) => {
      if (!map.has(r.meterId)) map.set(r.meterId, []);
      map.get(r.meterId).push(r);
    });
    
    for (const [, arr] of map) {
      arr.sort((a, b) => toJSDate(a.date) - toJSDate(b.date));
    }
    return map;
  }, [allReadings]);

  const windowDays = WINDOW_DAYS[selectedPeriod] || 30;
  const windowStart = useMemo(() => nowRef.current.clone().subtract(windowDays, 'days'), [windowDays]);
  const prevWindowStart = useMemo(() => windowStart.clone().subtract(windowDays, 'days'), [windowStart, windowDays]);
  const prevWindowEnd = useMemo(() => windowStart.clone(), [windowStart]);

  const filteredReadings = useMemo(() => {
    const inWindow = (r) => moment(toJSDate(r.date)).isAfter(windowStart);
    const base = selectedMeter === 'all'
      ? allReadings.filter(inWindow)
      : allReadings.filter((r) => r.meterId === selectedMeter && inWindow(r));
    return base.sort((a, b) => toJSDate(a.date) - toJSDate(b.date));
  }, [allReadings, selectedMeter, windowStart]);

  useEffect(() => { 
    setIsFetching(false); 
  }, [filteredReadings]);

  const withPerDay = useMemo(() => {
    return filteredReadings.map((r) => {
      const prev = getPreviousReading(r.meterId, r.id, readingsByMeterAsc);
      const { perDay, days } = calculatePerDayMetrics(r, prev);
      return { ...r, perDay, days };
    });
  }, [filteredReadings, readingsByMeterAsc]);

  const series = useMemo(() => {
    const items = withPerDay;
    const rawLabels = items.map((r) => {
      const d = moment(toJSDate(r.date));
      return selectedPeriod === 'week' ? d.format('ddd')
        : selectedPeriod === 'month' ? d.format('DD/MM')
        : d.format('MMM');
    });
    const labels = thinLabels(rawLabels, 8);
    const dataPoints = items.map((r) => Number(r.perDay.toFixed(2)));

    const inPrevWindow = (r) => {
      const d = moment(toJSDate(r.date));
      return d.isSameOrAfter(prevWindowStart, 'day') && d.isBefore(prevWindowEnd, 'day');
    };

    const prevBase = selectedMeter === 'all'
      ? allReadings.filter(inPrevWindow)
      : allReadings.filter((r) => r.meterId === selectedMeter && inPrevWindow(r));

    const prevPerDay = prevBase
      .sort((a, b) => toJSDate(a.date) - toJSDate(b.date))
      .map((r) => {
        const prev = getPreviousReading(r.meterId, r.id, readingsByMeterAsc);
        const { perDay } = calculatePerDayMetrics(r, prev);
        return { ...r, perDay };
      });

    const N = dataPoints.length;
    const prevDataAll = prevPerDay.map((r) => Number(r.perDay.toFixed(2)));
    const prevData = prevDataAll.length >= N ? prevDataAll.slice(-N) : [];

    return { labels, dataPoints, prevData };
  }, [
    withPerDay,
    selectedPeriod,
    prevWindowStart,
    prevWindowEnd,
    allReadings,
    readingsByMeterAsc,
    selectedMeter,
  ]);

  const kpis = useMemo(() => {
    const items = withPerDay;
    const perDayVals = items.map((r) => r.perDay);
    const consVals = filteredReadings.map((r) => Number(r.consumption || 0));
    const costVals = filteredReadings.map((r) => Number(r.cost || 0));

    const totalConsumption = consVals.reduce((a, b) => a + b, 0);
    const totalCost = costVals.reduce((a, b) => a + b, 0);
    const avgPerDay = perDayVals.length ? perDayVals.reduce((a, b) => a + b, 0) / perDayVals.length : 0;

    let trend = 0;
    if (perDayVals.length >= 6) {
      const half = Math.floor(perDayVals.length / 2);
      const prevAvg = perDayVals.slice(0, half).reduce((a, b) => a + b, 0) / half;
      const lastAvg = perDayVals.slice(-half).reduce((a, b) => a + b, 0) / half;
      trend = prevAvg > 0 ? ((lastAvg - prevAvg) / prevAvg) * 100 : 0;
    }

    let peak = null, valley = null;
    if (filteredReadings.length) {
      const sortedByVal = [...filteredReadings].sort(
        (a, b) => Number(b.consumption || 0) - Number(a.consumption || 0)
      );
      peak = sortedByVal[0] || null;
      valley = sortedByVal[sortedByVal.length - 1] || null;
    }

    let delta2w = 0;
    if (perDayVals.length >= 14) {
      const last7 = perDayVals.slice(-7);
      const prev7 = perDayVals.slice(-14, -7);
      const avgLast = last7.reduce((a, b) => a + b, 0) / 7;
      const avgPrev = prev7.reduce((a, b) => a + b, 0) / 7;
      delta2w = avgPrev > 0 ? ((avgLast - avgPrev) / avgPrev) * 100 : 0;
    }

    return {
      totalConsumption: totalConsumption.toFixed(2),
      totalCost: totalCost.toFixed(2),
      averagePerDay: avgPerDay.toFixed(2),
      trend: Number.isFinite(trend) ? Number(trend.toFixed(1)) : 0,
      peak,
      valley,
      delta2w: Number.isFinite(delta2w) ? Number(delta2w.toFixed(1)) : 0,
    };
  }, [withPerDay, filteredReadings]);

  useEffect(() => {
    const perDay = withPerDay.map((r) => r.perDay).filter((v) => v > 0);
    if (perDay.length < 7) { 
      setAlerts([]); 
      return; 
    }

    const sorted = [...perDay].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const deviations = sorted.map((x) => Math.abs(x - median)).sort((a, b) => a - b);
    const mad = deviations[Math.floor(deviations.length / 2)] || 0;

    const k = Number(CONFIG?.ALERT_K_MAD ?? 3);
    const threshold = median + k * mad;

    const detected = withPerDay
      .filter((r) => r.perDay > threshold)
      .slice(-2)
      .map((r) => ({
        id: r.id,
        meterName: r.meterName,
        perDay: Number(r.perDay.toFixed(2)),
        date: toJSDate(r.date),
        overBy: Number(((r.perDay - median) / (median || 1) * 100).toFixed(1)),
      }));

    setAlerts(detected);
  }, [withPerDay]);

  useFocusEffect(
    useCallback(() => { 
      animateEntry(); 
    }, [animateEntry, selectedPeriod, selectedMeter])
  );

  // -------- Derivados para render --------
  const items = withPerDay;
  const hasData = items.length > 0;
  const showPie = selectedMeter === 'all' && meters.length > 1;

  const totalsByMeter = useMemo(() => {
    const map = new Map();
    filteredReadings.forEach((r) => {
      const key = r.meterId;
      map.set(key, (map.get(key) || 0) + Number(r.consumption || 0));
    });
    return map;
  }, [filteredReadings]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.PRIMARY} />
          <Text style={[styles.loadingText, { color: colors.TEXT_LIGHT }]}>Cargando estadísticas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !hasData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
        <View style={styles.centerContent}>
          <Text style={[styles.loadingText, { color: colors.TEXT_LIGHT }]}>⚠️ {error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ——— Handlers de ayuda ———
  const showAlert = (title, message) => {
    Alert.alert(title, message);
  };

  const helpHandlers = {
    line: () => showAlert(
      'Ritmo diario de consumo',
      'Muestra el promedio de kWh por día entre una lectura y la siguiente. La línea verde es el período actual y la gris el período anterior de la misma duración. Te ayuda a ver si estás consumiendo más o menos por día, aunque registres lecturas en fechas irregulares.'
    ),
    bars: () => showAlert(
      'Distribución (kWh/día)',
      'Comparación rápida del ritmo diario entre días (o meses si elegiste "Año"). Útil para detectar picos o valles de uso.'
    ),
    pie: () => showAlert(
      'Distribución por medidor',
      'Muestra cuánto aporta cada medidor al consumo total del período seleccionado. Ideal cuando tienes varios medidores.'
    ),
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Selector de período */}
        <View style={[styles.periodSelector, { backgroundColor: colors.CARD, borderColor: colors.BORDER }]}>
          {PERIODS.map((period) => (
            <TouchableOpacity
              key={period}
              style={[styles.periodButton, selectedPeriod === period && { backgroundColor: colors.PRIMARY }]}
              onPress={() => { if (selectedPeriod !== period) setSelectedPeriod(period); }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  { color: selectedPeriod === period ? '#FFFFFF' : colors.TEXT_LIGHT },
                ]}
              >
                {PERIOD_LABELS[period]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Selector de medidor */}
        <View style={[styles.meterSelector, { backgroundColor: colors.CARD, borderColor: colors.BORDER }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Chip
              active={selectedMeter === 'all'}
              onPress={() => { if (selectedMeter !== 'all') setSelectedMeter('all'); }}
              colors={colors}
              label="Todos los medidores"
            />
            {meters.map((meter) => (
              <Chip
                key={meter.id}
                active={selectedMeter === meter.id}
                onPress={() => { if (selectedMeter !== meter.id) setSelectedMeter(meter.id); }}
                colors={colors}
                label={meter.name}
              />
            ))}
          </ScrollView>
        </View>

        {/* Loader intermedio */}
        {isFetching && (
          <View style={{ paddingVertical: 16, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={colors.PRIMARY} />
          </View>
        )}

        {/* Alertas */}
        {alerts.length > 0 && (
          <Animated.View
            style={[
              styles.alertsContainer,
              {
                backgroundColor: hexToRgba(colors.PRIMARY, 0.08),
                borderLeftColor: colors.PRIMARY,
                transform: [{ scale: animatedValue }],
                opacity: animatedValue,
              },
            ]}
          >
            <View style={styles.alertHeader}>
              <View style={styles.alertHeaderLeft}>
                <View style={[styles.alertIconContainer, { backgroundColor: hexToRgba(colors.PRIMARY, 0.15) }]}>
                  <Text style={styles.alertIcon}>⚡</Text>
                </View>
                <Text style={[styles.alertsTitle, { color: colors.TEXT_DARK }]}>
                  Consumo inusual detectado
                </Text>
              </View>
            </View>

            {alerts.map((alert, idx) => (
              <View key={alert.id} style={[styles.alertItem, { borderTopColor: colors.BORDER }]}>
                <View style={styles.alertContent}>
                  <Text style={[styles.alertMeterName, { color: colors.TEXT_DARK }]}>
                    {alert.meterName}
                  </Text>
                  <Text style={[styles.alertDate, { color: colors.TEXT_LIGHT }]}>
                    {moment(alert.date).format('DD MMM, HH:mm')}
                  </Text>
                </View>
                <View style={styles.alertRight}>
                  <Text style={[styles.alertConsumption, { color: colors.PRIMARY }]}>
                    {alert.perDay.toFixed(2)} kWh/día
                  </Text>
                  <View style={[styles.alertBadge, { backgroundColor: hexToRgba(colors.PRIMARY, 0.2) }]}>
                    <Text style={[styles.alertBadgeText, { color: colors.PRIMARY }]}>
                      +{alert.overBy}%
                    </Text>
                  </View>
                </View>
              </View>
            ))}

            <Text style={[styles.helpText, { color: colors.TEXT_LIGHT }]}>
              Se detectó consumo por encima de lo normal en los últimos registros
            </Text>
          </Animated.View>
        )}

        {/* KPIs principales */}
        <View style={styles.statsContainer}>
          <StatCard
            colors={colors}
            animatedValue={animatedValue}
            label="Consumo total en período"
            value={`${kpis.totalConsumption} kWh`}
            subValue={`Ritmo medio: ${kpis.averagePerDay} kWh/día`}
            trend={kpis.trend}
          />
          <StatCard
            colors={colors}
            animatedValue={animatedValue}
            label="Costo total en período"
            value={formatCurrency(Number(kpis.totalCost))}
            subValue="Basado en tus lecturas"
          />
        </View>

        {/* Línea (ritmo diario actual vs ventana previa) */}
        <ChartContainer
          colors={colors}
          animatedValue={animatedValue}
          title="Ritmo diario de consumo"
          subtitle={selectedPeriod === 'week' ? 'Últimos 7 días' : selectedPeriod === 'month' ? 'Últimos 30 días' : 'Últimos 12 meses'}
          onHelp={() => helpHandlers.line()}
          hasData={hasData}
          emptyMessage="Agrega al menos 2 lecturas en este período para ver la evolución."
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <LineChart
              data={{
                labels: series.labels,
                datasets: [
                  {
                    data: series.dataPoints,
                    color: (o = 1) => hexToRgba(colors.PRIMARY, o),
                    strokeWidth: 2,
                  },
                  {
                    data: series.prevData?.length === series.dataPoints?.length ? series.prevData : [],
                    color: (o = 1) => hexToRgba(colors.TEXT_LIGHT, 0.35),
                    strokeWidth: 1.5,
                  },
                ],
                legend: ['Actual', 'Previo'],
              }}
              width={Math.max(CHART_WIDTH, (series.labels.length || 1) * 75)}
              height={340}
              yAxisSuffix={' kWh/día'}
              yAxisInterval={1}
              chartConfig={{
                backgroundColor: colors.CARD,
                backgroundGradientFrom: colors.CARD,
                backgroundGradientTo: colors.CARD,
                decimalPlaces: 2,
                color: (o = 1) => hexToRgba(colors.PRIMARY, o),
                labelColor: (o = 1) => hexToRgba(colors.TEXT_LIGHT, o),
                style: { borderRadius: 16 },
                propsForDots: {
                  r: '4',
                  strokeWidth: '1.5',
                  stroke: colors.PRIMARY,
                  fill: colors.BACKGROUND,
                },
                propsForBackgroundLines: {
                  strokeDasharray: '',
                  stroke: hexToRgba(colors.TEXT_LIGHT, 0.15),
                  strokeWidth: 1,
                },
              }}
              bezier
              style={styles.chart}
              withShadow={false}
              withInnerLines
              withHorizontalLabels
              withVerticalLabels
              segments={4}
              formatYLabel={(y) => `${formatNumberShort(clamp(Number(y), 0, Number(y)), 2)}`}
              fromZero
            />
          </ScrollView>
        </ChartContainer>

        {/* Barras (promedio diario) */}
        <ChartContainer
          colors={colors}
          animatedValue={animatedValue}
          title={`Distribución ${selectedPeriod === 'year' ? 'mensual' : 'diaria'} (kWh/día)`}
          subtitle="Identifica mínimos y máximos rápidamente"
          onHelp={() => helpHandlers.bars()}
          hasData={hasData}
          emptyMessage="Sin datos suficientes"
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              data={{
                labels: series.labels,
                datasets: [{ data: series.dataPoints }],
              }}
              width={Math.max(CHART_WIDTH, (series.labels.length || 1) * 65)}
              height={320}
              yAxisSuffix={' kWh/día'}
              chartConfig={{
                backgroundColor: colors.CARD,
                backgroundGradientFrom: colors.CARD,
                backgroundGradientTo: colors.CARD,
                decimalPlaces: 2,
                color: (o = 1) => hexToRgba(colors.ACCENT || colors.PRIMARY, o),
                labelColor: (o = 1) => hexToRgba(colors.TEXT_LIGHT, o),
                propsForBackgroundLines: {
                  stroke: hexToRgba(colors.TEXT_LIGHT, 0.15),
                  strokeWidth: 1,
                },
              }}
              style={styles.chart}
              showValuesOnTopOfBars={false}
              withInnerLines
              withHorizontalLabels
              fromZero
            />
          </ScrollView>
        </ChartContainer>

        {/* Pie/Dona: solo cuando "all" y >1 medidor */}
        {showPie && (
          <ChartContainer
            colors={colors}
            animatedValue={animatedValue}
            title="Distribución por medidor"
            subtitle="Consumo total del período seleccionado"
            onHelp={() => helpHandlers.pie()}
            hasData={true}
          >
            <View style={styles.pieChartWrapper}>
              <PieChart
                data={buildPieData(filteredReadings, colors, isDark)}
                width={CHART_WIDTH}
                height={260}
                chartConfig={{ color: (o = 1) => hexToRgba(colors.TEXT_DARK, o) }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="10"
                center={[0, 0]}
                absolute
                hasLegend
              />
            </View>
          </ChartContainer>
        )}

        {/* Resumen de medidores en el período */}
        <Animated.View
          style={[
            styles.metersContainer,
            { backgroundColor: colors.CARD, transform: [{ scale: animatedValue }], opacity: animatedValue },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.TEXT_DARK }]}>Resumen del período</Text>
          {meters.map((meter, index) => {
            const total = totalsByMeter.get(meter.id) || 0;
            return (
              <TouchableOpacity
                key={meter.id}
                style={[
                  styles.meterRow,
                  {
                    borderLeftColor: meter.color || colors.ACCENT,
                    marginBottom: index === meters.length - 1 ? 0 : 12,
                    borderColor: colors.BORDER,
                  },
                ]}
                onPress={() => { if (selectedMeter !== meter.id) setSelectedMeter(meter.id); }}
                activeOpacity={0.7}
              >
                <View style={styles.meterInfo}>
                  <Text style={[styles.meterName, { color: colors.TEXT_DARK }]} numberOfLines={1}>
                    {meter.name}
                  </Text>
                  <Text style={[styles.meterCompany, { color: colors.TEXT_LIGHT }]} numberOfLines={1}>
                    {meter.company}
                  </Text>
                </View>
                <View style={styles.meterStats}>
                  <Text style={[styles.meterReading, { color: colors.PRIMARY }]}>{total.toFixed(2)} kWh</Text>
                  <Text style={[styles.meterCost, { color: colors.TEXT_LIGHT }]}>
                    {selectedPeriod === 'year' ? 'Año' : selectedPeriod === 'month' ? '30 días' : '7 días'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </Animated.View>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ——— Componentes reutilizables ———
const ChartContainer = ({ colors, animatedValue, title, subtitle, onHelp, hasData, emptyMessage, children }) => (
  <Animated.View
    style={[
      styles.chartContainer,
      { backgroundColor: colors.CARD, transform: [{ scale: animatedValue }], opacity: animatedValue },
    ]}
  >
    <View style={styles.chartHeaderRow}>
      <View style={styles.chartHeaderLeft}>
        <Text style={[styles.chartTitle, { color: colors.TEXT_DARK }]}>{title}</Text>
        <Text style={[styles.chartSubtitle, { color: colors.TEXT_LIGHT }]}>{subtitle}</Text>
      </View>
      <TouchableOpacity style={[styles.helpBtn, { borderColor: colors.BORDER }]} onPress={onHelp}>
        <Text style={[styles.helpBtnText, { color: colors.PRIMARY }]}>¿Qué muestra este gráfico?</Text>
      </TouchableOpacity>
    </View>

    {!hasData ? (
      <View style={{ paddingVertical: 20, alignItems: 'center' }}>
        <Text style={{ color: colors.TEXT_LIGHT, textAlign: 'center' }}>
          {emptyMessage || 'Sin datos suficientes'}
        </Text>
      </View>
    ) : (
      children
    )}
  </Animated.View>
);

const Chip = ({ active, onPress, colors, label }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={[
      styles.meterChip,
      {
        backgroundColor: active ? colors.ACCENT : colors.CARD,
        borderColor: active ? colors.ACCENT : colors.BORDER,
      },
    ]}
  >
    <Text style={[styles.meterChipText, { color: active ? '#FFFFFF' : colors.TEXT_DARK }]} numberOfLines={1}>
      {label}
    </Text>
  </TouchableOpacity>
);

const StatCard = ({ colors, animatedValue, label, value, subValue, trend }) => (
  <Animated.View
    style={[
      styles.statCard,
      { backgroundColor: colors.CARD, transform: [{ scale: animatedValue }], opacity: animatedValue },
    ]}
  >
    <View style={styles.statCardHeader}>
      <Text style={[styles.statLabel, { color: colors.TEXT_LIGHT }]}>{label}</Text>
      {typeof trend === 'number' && (
        <View
          style={[
            styles.trendBadge,
            { backgroundColor: trend >= 0 ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)' },
          ]}
        >
          <Text style={[styles.trendText, { color: trend >= 0 ? '#EF4444' : '#10B981' }]}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </Text>
        </View>
      )}
    </View>
    <Text style={[styles.statValue, { color: colors.PRIMARY }]}>{value}</Text>
    {subValue ? <Text style={[styles.statSubValue, { color: colors.TEXT_LIGHT }]}>{subValue}</Text> : null}
  </Animated.View>
);

// ——— Helpers ———
const buildPieData = (readings, colors, isDark) => {
  const palette = isDark ? PALETTE_DARK : PALETTE_LIGHT;
  const meterOrder = [];
  const totalsByMeter = new Map();

  readings.forEach((r) => {
    const c = Number(r.consumption || 0);
    if (c <= 0) return;
    const key = r.meterName || r.meterId;
    if (!totalsByMeter.has(key)) {
      totalsByMeter.set(key, 0);
      meterOrder.push(key);
    }
    totalsByMeter.set(key, totalsByMeter.get(key) + c);
  });

  return meterOrder.map((name, idx) => ({
    name: name.length > 18 ? name.slice(0, 16) + '…' : name,
    population: parseFloat((totalsByMeter.get(name) || 0).toFixed(2)),
    color: palette[idx % palette.length],
    legendFontColor: colors.TEXT_DARK,
    legendFontSize: 13,
  }));
};

// ——— Estilos ———
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  loadingText: { marginTop: 16, fontSize: 15, fontWeight: '500' },

  periodSelector: { flexDirection: 'row', margin: 16, marginBottom: 12, borderRadius: 12, padding: 4, borderWidth: 1 },
  periodButton: { flex: 1, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  periodButtonText: { fontSize: 13, fontWeight: '600' },

  meterSelector: { marginHorizontal: 16, marginBottom: 16, paddingVertical: 12, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1 },
  meterChip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, marginRight: 8, borderWidth: 1, maxWidth: 220 },
  meterChipText: { fontSize: 13, fontWeight: '600' },

  statsContainer: { paddingHorizontal: 16, gap: 12, marginBottom: 16 },
  statCard: { padding: 20, borderRadius: 16 },
  statCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statLabel: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  trendBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  trendText: { fontSize: 11, fontWeight: '700' },
  statValue: { fontSize: 28, fontWeight: '700', marginBottom: 4 },
  statSubValue: { fontSize: 13, fontWeight: '500' },

  alertsContainer: { marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 16, borderLeftWidth: 4 },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  alertHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  alertIconContainer: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  alertIcon: { fontSize: 16 },
  alertsTitle: { fontSize: 15, fontWeight: '700' },
  alertItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1 },
  alertContent: { flex: 1 },
  alertMeterName: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  alertDate: { fontSize: 12 },
  alertRight: { alignItems: 'flex-end' },
  alertConsumption: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  alertBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  alertBadgeText: { fontSize: 11, fontWeight: '700' },
  helpText: { fontSize: 12, marginTop: 8 },

  chartContainer: { marginHorizontal: 16, marginBottom: 16, borderRadius: 16, padding: 20 },
  chartHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 },
  chartHeaderLeft: { flexShrink: 1 },
  chartTitle: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  chartSubtitle: { fontSize: 13, fontWeight: '500' },
  helpBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1 },
  helpBtnText: { fontSize: 12, fontWeight: '700' },
  chart: { marginVertical: 8, borderRadius: 16 },
  pieChartWrapper: { alignItems: 'center' },

  metersContainer: { marginHorizontal: 16, marginBottom: 16, borderRadius: 16, padding: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 12 },
  meterRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 16, paddingLeft: 16, paddingRight: 12, borderLeftWidth: 4, borderRadius: 12,
    backgroundColor: 'transparent', borderWidth: 1
  },
  meterInfo: { flex: 1 },
  meterName: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  meterCompany: { fontSize: 13, fontWeight: '500' },
  meterStats: { alignItems: 'flex-end' },
  meterReading: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  meterCost: { fontSize: 13, fontWeight: '500' },

  spacer: { height: 32 },
});