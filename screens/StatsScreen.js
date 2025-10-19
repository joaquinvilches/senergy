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
import { LineChart, PieChart, BarChart, ProgressChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';
import { useDarkMode } from '../utils/darkModeContext';
import { CONFIG } from '../utils/constants';
import { getUserMeters, getMeterReadings } from '../services/meterService';
import { getCurrentUser } from '../services/authService';
import { formatCurrency } from '../utils/calculations';
import moment from 'moment';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 32;
const hexToRgba = (hex, opacity = 1) => {
  const h = hex.replace('#', '');
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const toJSDate = (d) => (d?.toDate ? d.toDate() : new Date(d));
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const COLORS_FALLBACK = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];
const getRandomColor = () => COLORS_FALLBACK[Math.floor(Math.random() * COLORS_FALLBACK.length)];

// === Agregados de UX ===
const MONTHLY_BUDGET_CLP = Number(CONFIG?.MONTHLY_BUDGET_CLP ?? 30000); // Presupuesto referencial para ProgressChart

export const StatsScreen = () => {
  const { colors } = useDarkMode();

  // Datos base
  const [meters, setMeters] = useState([]);
  const [allReadings, setAllReadings] = useState([]); // cache global
  const [selectedPeriod, setSelectedPeriod] = useState('month'); // 'week' | 'month' | 'year'
  const [selectedMeter, setSelectedMeter] = useState('all');     // 'all' | meterId
  const [unit, setUnit] = useState('kWh'); // 'kWh' | '$'

  // UI state
  const [loading, setLoading] = useState(true);        // primera carga
  const [isFetching, setIsFetching] = useState(false); // cambios de período/medidor
  const [alerts, setAlerts] = useState([]);

  // Derivados puntuales
  const [pieChartData, setPieChartData] = useState([]);

  // KPIs
  const [totalStats, setTotalStats] = useState({
    totalConsumption: 0,
    totalCost: 0,
    averageConsumption: 0,
    trend: 0,
  });

  // Animación
  const animatedValue = useRef(new Animated.Value(0)).current;
  const animateEntry = useCallback(() => {
    animatedValue.setValue(0);
    Animated.spring(animatedValue, {
      toValue: 1,
      tension: 25,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [animatedValue]);

  const initialLoadRef = useRef(true);

  // =========================
  // 1) Carga inicial (UID, medidores y lecturas)
  // =========================
  const fetchAll = useCallback(async () => {
    try {
      if (initialLoadRef.current) setLoading(true);

      const user = getCurrentUser?.();
      if (!user?.uid) {
        if (initialLoadRef.current) setLoading(false);
        return;
      }

      const userMeters = await getUserMeters(user.uid);
      setMeters(userMeters);

      const byMeter = await Promise.all(
        userMeters.map(async (m) => {
          const readings = await getMeterReadings(user.uid, m.id);
          return readings.map((r) => ({
            ...r,
            meterId: m.id,
            meterName: m.name,
            meterColor: m.color || getRandomColor(),
          }));
        })
      );
      const merged = byMeter.flat();
      setAllReadings(merged);
    } catch (e) {
      console.log('Error loading stats:', e);
      Alert.alert('Error', 'No se pudieron cargar las estadísticas');
    } finally {
      setLoading(false);
      initialLoadRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // =========================
  // 2) Filtrado y proyección (en memoria)
  // =========================
  const filteredReadings = useMemo(() => {
    if (!initialLoadRef.current) setIsFetching(true);

    let base = selectedMeter === 'all'
      ? allReadings
      : allReadings.filter((r) => r.meterId === selectedMeter);

    const now = moment();
    const inRange = (days) => (r) => moment(toJSDate(r.date)).isAfter(now.clone().subtract(days, 'days'));

    switch (selectedPeriod) {
      case 'week':
        base = base.filter(inRange(7));
        break;
      case 'month':
        base = base.filter(inRange(30));
        break;
      case 'year':
        base = base.filter(inRange(365));
        break;
      default:
        break;
    }

    // Fallback anti-blanco: usa 2 últimas lecturas del medidor o globales
    if (base.length < 2) {
      const source = selectedMeter === 'all' ? allReadings : allReadings.filter(r => r.meterId === selectedMeter);
      base = [...source].sort((a, b) => toJSDate(a.date) - toJSDate(b.date)).slice(-2);
    }

    setIsFetching(false);
    return base.sort((a, b) => toJSDate(a.date) - toJSDate(b.date));
  }, [allReadings, selectedMeter, selectedPeriod]);

  // =========================
  // 3) Preparación de gráficos y KPIs
  // =========================

  // Línea de evolución (kWh o $)
  const lineData = useMemo(() => {
    const dataPoints = filteredReadings.map((r) => {
      const v = unit === 'kWh' ? Number(r.consumption || 0) : Number(r.cost || 0);
      return Number.isFinite(v) ? v : 0;
    });
    const labels = filteredReadings.map((r) => {
      const d = moment(toJSDate(r.date));
      if (selectedPeriod === 'week') return d.format('ddd');
      if (selectedPeriod === 'month') return d.format('DD/MM');
      return d.format('MMM');
    });

    if (dataPoints.length > 0 && dataPoints.every((d) => d === 0)) {
      dataPoints[dataPoints.length - 1] = 0.1;
    }

    return {
      labels,
      datasets: [
        {
          data: dataPoints,
          color: (opacity = 1) => hexToRgba(colors.PRIMARY, opacity),

          strokeWidth: 3,
        },
      ],
      legend: [selectedMeter === 'all' ? (unit === 'kWh' ? 'Consumo (todos)' : 'Costo (todos)') : (unit === 'kWh' ? 'Consumo' : 'Costo')],
    };
  }, [filteredReadings, selectedPeriod, selectedMeter, unit]);

  // Pie: distribución por medidor (solo cuando 'all')
  const pieData = useMemo(() => {
    const meterMap = {};
    filteredReadings.forEach((r) => {
      const c = Number(r.consumption || 0);
      if (c <= 0) return;
      const key = r.meterName || r.meterId;
      if (!meterMap[key]) {
        meterMap[key] = {
          name: key,
          consumption: 0,
          color: r.meterColor || getRandomColor(),
          legendFontColor: colors.TEXT_DARK,
          legendFontSize: 13,
        };
      }
      meterMap[key].consumption += c;
    });

    const result = Object.values(meterMap).map((m) => ({
      name: m.name,
      population: parseFloat(m.consumption.toFixed(2)),
      color: m.color,
      legendFontColor: m.legendFontColor,
      legendFontSize: m.legendFontSize,
    }));

    setPieChartData(result);
    return result;
  }, [filteredReadings, colors.TEXT_DARK]);

  // KPIs + tendencia
  const kpis = useMemo(() => {
    let totalConsumption = 0;
    let totalCost = 0;
    const consumptions = [];

    filteredReadings.forEach((r) => {
      const c = Number(r.consumption || 0);
      const cost = Number(r.cost || 0);
      if (c > 0) {
        totalConsumption += c;
        totalCost += cost;
        consumptions.push(c);
      }
    });

    const avg = consumptions.length ? totalConsumption / consumptions.length : 0;

    let trend = 0;
    if (consumptions.length >= 6) {
      const recent = consumptions.slice(-3).reduce((a, b) => a + b, 0) / 3;
      const previous = consumptions.slice(-6, -3).reduce((a, b) => a + b, 0) / 3;
      trend = previous > 0 ? ((recent - previous) / previous) * 100 : 0;
    }

    const out = {
      totalConsumption: totalConsumption.toFixed(2),
      totalCost,
      averageConsumption: avg.toFixed(2),
      trend: Number.isFinite(trend) ? Number(trend.toFixed(1)) : 0,
    };
    setTotalStats(out);
    return out;
  }, [filteredReadings]);

  // Alertas
  useEffect(() => {
    const thBase = Number(CONFIG?.ALERT_CONSUMPTION_THRESHOLD ?? 0.3);
    const consumptions = filteredReadings.map((r) => Number(r.consumption || 0)).filter((c) => c > 0);
    if (consumptions.length < 2) {
      setAlerts([]);
      return;
    }

    const avg = consumptions.reduce((a, b) => a + b, 0) / consumptions.length;
    if (avg <= 0) {
      setAlerts([]);
      return;
    }
    const threshold = avg * (1 + thBase);

    const detected = filteredReadings
      .filter((r) => Number(r.consumption || 0) > threshold)
      .map((r) => ({
        id: r.id,
        meterName: r.meterName,
        consumption: Number(r.consumption || 0),
        date: toJSDate(r.date),
        percentageOver: (((Number(r.consumption) - avg) / avg) * 100).toFixed(1),
      }))
      .slice(0, 2);

    setAlerts(detected);
  }, [filteredReadings]);

  // === Gráfico de barras: top días/meses (según período) y según unidad ===
  const barData = useMemo(() => {
    // Agrupa por día (week/month) o por mes (year)
    const map = new Map();
    filteredReadings.forEach((r) => {
      const d = moment(toJSDate(r.date));
      const key =
        selectedPeriod === 'year' ? d.format('YYYY-MM') : d.format('YYYY-MM-DD');
      const value = unit === 'kWh' ? Number(r.consumption || 0) : Number(r.cost || 0);
      map.set(key, (map.get(key) || 0) + (Number.isFinite(value) ? value : 0));
    });

    const entries = Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? -1 : 1));
    // Tomamos últimos 7 días / 12 meses / 30 días según período para legibilidad
    const limited =
      selectedPeriod === 'week'
        ? entries.slice(-7)
        : selectedPeriod === 'month'
        ? entries.slice(-30)
        : entries.slice(-12);

    const labels = limited.map(([k]) =>
      selectedPeriod === 'year' ? moment(k + '-01').format('MMM') : moment(k).format('DD/MM')
    );

    const data = limited.map(([, v]) => v);

    return {
      labels,
      datasets: [{ data }],
    };
  }, [filteredReadings, selectedPeriod, unit]);

  // === ProgressChart: avance del presupuesto mensual ===
  const budgetProgress = useMemo(() => {
    // Solo tiene sentido en 'month' y unidad costo
    const monthNow = moment().format('YYYY-MM');
    const monthCost = filteredReadings
      .filter((r) => moment(toJSDate(r.date)).format('YYYY-MM') === monthNow)
      .reduce((acc, r) => acc + Number(r.cost || 0), 0);

    const progress = Math.max(0, Math.min(1, monthCost / MONTHLY_BUDGET_CLP));
    return { progress, monthCost };
  }, [filteredReadings]);

  // Animación al cambiar visibilidad de datos
  useFocusEffect(
    useCallback(() => {
      animateEntry();
    }, [animateEntry, selectedPeriod, selectedMeter, unit])
  );

  // =========================
  // Render
  // =========================
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

  const hasLineData = lineData?.datasets?.[0]?.data?.length > 0 && lineData.datasets[0].data.some((v) => v > 0);
  const showPie = pieData.length > 1 && selectedMeter === 'all';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Controles */}
        <View style={[styles.controlsRow]}>
          {/* Períodos */}
          <View style={[styles.periodSelector, { backgroundColor: colors.WHITE }]}>
            {['week', 'month', 'year'].map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && { backgroundColor: colors.PRIMARY },
                ]}
                onPress={() => {
                  if (selectedPeriod === period) return;
                  setIsFetching(true);
                  setSelectedPeriod(period);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    { color: selectedPeriod === period ? '#FFFFFF' : colors.TEXT_LIGHT },
                  ]}
                >
                  {period === 'week' ? '7 Días' : period === 'month' ? '30 Días' : 'Año'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Unidad */}
          <View style={[styles.unitToggle, { backgroundColor: colors.WHITE }]}>
            {['kWh', '$'].map((u) => (
              <TouchableOpacity
                key={u}
                style={[
                  styles.unitChip,
                  unit === u && { backgroundColor: colors.ACCENT, borderColor: colors.ACCENT },
                ]}
                onPress={() => setUnit(u)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.unitText,
                    { color: unit === u ? '#FFFFFF' : colors.TEXT_DARK },
                  ]}
                >
                  {u === 'kWh' ? 'Consumo' : 'Costo'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Ayuda contextual */}
        <Text style={[styles.helperText, { color: colors.TEXT_LIGHT }]}>
          Consejo: usa <Text style={{ fontWeight: '700', color: colors.PRIMARY }}>Consumo</Text> para comparar hábitos y{' '}
          <Text style={{ fontWeight: '700', color: colors.PRIMARY }}>Costo</Text> para estimar tu boleta.
        </Text>

        {/* Selector de medidor */}
        <View style={[styles.meterSelector, { backgroundColor: colors.WHITE }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.meterChip,
                selectedMeter === 'all' && {
                  backgroundColor: colors.ACCENT,
                  borderColor: colors.ACCENT,
                },
              ]}
              onPress={() => {
                if (selectedMeter === 'all') return;
                setIsFetching(true);
                setSelectedMeter('all');
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.meterChipText,
                  { color: selectedMeter === 'all' ? '#FFFFFF' : colors.TEXT_DARK },
                ]}
              >
                Todos los medidores
              </Text>
            </TouchableOpacity>

            {meters.map((meter) => (
              <TouchableOpacity
                key={meter.id}
                style={[
                  styles.meterChip,
                  selectedMeter === meter.id && {
                    backgroundColor: colors.ACCENT,
                    borderColor: colors.ACCENT,
                  },
                ]}
                onPress={() => {
                  if (selectedMeter === meter.id) return;
                  setIsFetching(true);
                  setSelectedMeter(meter.id);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.meterChipText,
                    { color: selectedMeter === meter.id ? '#FFFFFF' : colors.TEXT_DARK },
                  ]}
                >
                  {meter.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Loader intermedio suave */}
        {isFetching && (
          <View style={{ paddingVertical: 12, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={colors.PRIMARY} />
          </View>
        )}

        {/* Alertas */}
        {alerts.length > 0 && (
          <Animated.View
            style={[
              styles.alertsContainer,
              {
                backgroundColor: '#FEF2F2',
                transform: [{ scale: animatedValue }],
                opacity: animatedValue,
              },
            ]}
          >
            <View style={styles.alertHeader}>
              <View style={styles.alertHeaderLeft}>
                <View style={styles.alertIconContainer}>
                  <Text style={styles.alertIcon}>⚠</Text>
                </View>
                <Text style={[styles.alertsTitle, { color: '#DC2626' }]}>
                  Consumo Alto Detectado
                </Text>
              </View>
            </View>

            {alerts.map((alert) => (
              <View key={alert.id} style={styles.alertItem}>
                <View style={styles.alertContent}>
                  <Text style={[styles.alertMeterName, { color: colors.TEXT_DARK }]}>
                    {alert.meterName}
                  </Text>
                  <Text style={[styles.alertDate, { color: colors.TEXT_LIGHT }]}>
                    {moment(alert.date).format('DD/MM/YYYY • HH:mm')}
                  </Text>
                </View>
                <View style={styles.alertRight}>
                  <Text style={[styles.alertConsumption, { color: '#DC2626' }]}>
                    {alert.consumption} kWh
                  </Text>
                  <View style={[styles.alertBadge, { backgroundColor: '#DC2626' }]}>
                    <Text style={styles.alertBadgeText}>+{alert.percentageOver}%</Text>
                  </View>
                </View>
              </View>
            ))}
            <Text style={[styles.helperTextSmall, { color: '#991B1B' }]}>
              Tip: revisa electrodomésticos encendidos y horarios de mayor consumo.
            </Text>
          </Animated.View>
        )}

        {/* KPIs */}
        <View style={styles.statsContainer}>
          <StatCard
            colors={colors}
            animatedValue={animatedValue}
            label="Consumo Total"
            value={`${kpis.totalConsumption} kWh`}
            subValue={`Promedio por lectura: ${kpis.averageConsumption} kWh`}
            trend={kpis.trend}
          />
          <StatCard
            colors={colors}
            animatedValue={animatedValue}
            label="Costo Total"
            value={formatCurrency(kpis.totalCost)}
            subValue="Período visible"
          />
        </View>

        {/* Línea de evolución */}
        {hasLineData && (
          <Animated.View
            style={[
              styles.chartContainer,
              {
                backgroundColor: colors.WHITE,
                transform: [{ scale: animatedValue }],
                opacity: animatedValue,
              },
            ]}
          >
            <View style={styles.chartHeader}>
              <Text style={[styles.chartTitle, { color: colors.TEXT_DARK }]}>
                Evolución {unit === 'kWh' ? 'del Consumo' : 'del Costo'}
              </Text>
              <Text style={[styles.chartSubtitle, { color: colors.TEXT_LIGHT }]}>
                {selectedPeriod === 'week'
                  ? 'Últimos 7 días'
                  : selectedPeriod === 'month'
                  ? 'Últimos 30 días'
                  : 'Último año'}
              </Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart
                data={lineData}
                width={Math.max(CHART_WIDTH, lineData.labels.length * 56)}
                height={280}
                yAxisSuffix={unit === 'kWh' ? ' kWh' : ''}
                yAxisLabel={unit === '$' ? '$' : ''}
                chartConfig={{
                  backgroundColor: colors.WHITE,
                  backgroundGradientFrom: colors.WHITE,
                  backgroundGradientTo: colors.WHITE,
                  decimalPlaces: unit === '$' ? 0 : 1,
               color: (opacity = 1) => hexToRgba(colors.PRIMARY, opacity),
labelColor: (opacity = 1) => hexToRgba(colors.TEXT_LIGHT, opacity),
propsForDots: {
  r: '5',
  strokeWidth: '2',
  stroke: colors.PRIMARY,
  fill: colors.BACKGROUND,
},

                  propsForBackgroundLines: {
                    strokeDasharray: '',
                    stroke: '#ECEFF3',
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
                formatYLabel={(y) => {
                  const v = clamp(Number(y), 0, Number(y));
                  return unit === '$' ? `${Math.round(v)}` : `${v}`;
                }}
              />
            </ScrollView>

            <Text style={[styles.helperTextSmall, { color: colors.TEXT_LIGHT }]}>
              Consejo: si ves picos en días específicos, intenta identificar qué actividad los causó.
            </Text>
          </Animated.View>
        )}

        {/* Barras: comparativa por día/mes */}
        <Animated.View
          style={[
            styles.chartContainer,
            {
              backgroundColor: colors.WHITE,
              transform: [{ scale: animatedValue }],
              opacity: animatedValue,
            },
          ]}
        >
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: colors.TEXT_DARK }]}>
              {selectedPeriod === 'year' ? 'Consumo/Costo por Mes' : 'Consumo/Costo por Día'}
            </Text>
            <Text style={[styles.chartSubtitle, { color: colors.TEXT_LIGHT }]}>
              Vista resumida para comparar fácilmente
            </Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              data={barData}
              width={Math.max(CHART_WIDTH, barData.labels.length * 44)}
              height={240}
              yAxisSuffix={unit === 'kWh' ? ' kWh' : ''}
              yAxisLabel={unit === '$' ? '$' : ''}
              chartConfig={{
                backgroundColor: colors.WHITE,
                backgroundGradientFrom: colors.WHITE,
                backgroundGradientTo: colors.WHITE,
                decimalPlaces: unit === '$' ? 0 : 1,
                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                barPercentage: 0.6,
                propsForBackgroundLines: {
                  strokeDasharray: '',
                  stroke: '#ECEFF3',
                  strokeWidth: 1,
                },
              }}
              style={styles.chart}
              fromZero
              showValuesOnTopOfBars
              withInnerLines
            />
          </ScrollView>

          <Text style={[styles.helperTextSmall, { color: colors.TEXT_LIGHT }]}>
            Tip: las barras ayudan a ver rápidamente qué días/meses gastan más.
          </Text>
        </Animated.View>

        {/* Progreso de presupuesto mensual */}
        {unit === '$' && selectedPeriod !== 'year' && (
          <Animated.View
            style={[
              styles.chartContainer,
              {
                backgroundColor: colors.WHITE,
                transform: [{ scale: animatedValue }],
                opacity: animatedValue,
              },
            ]}
          >
            <View style={styles.chartHeader}>
              <Text style={[styles.chartTitle, { color: colors.TEXT_DARK }]}>Avance del Presupuesto Mensual</Text>
              <Text style={[styles.chartSubtitle, { color: colors.TEXT_LIGHT }]}>
                Presupuesto referencial: {formatCurrency(MONTHLY_BUDGET_CLP)}
              </Text>
            </View>

            <View style={{ alignItems: 'center' }}>
              <ProgressChart
                data={{ data: [budgetProgress.progress] }}
                width={CHART_WIDTH * 0.7}
                height={180}
                strokeWidth={12}
                radius={52}
                chartConfig={{
                  backgroundColor: colors.WHITE,
                  backgroundGradientFrom: colors.WHITE,
                  backgroundGradientTo: colors.WHITE,
                  color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                }}
                hideLegend={false}
              />
              <Text style={[styles.progressText, { color: colors.TEXT_DARK }]}>
                Gastado este mes: {formatCurrency(budgetProgress.monthCost)} ({Math.round(budgetProgress.progress * 100)}%)
              </Text>
              <Text style={[styles.helperTextSmall, { color: colors.TEXT_LIGHT }]}>
                Consejo: si superas el 80%, considera reducir consumos en horas punta.
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Distribución por medidor (torta) */}
        {showPie && (
          <Animated.View
            style={[
              styles.chartContainer,
              {
                backgroundColor: colors.WHITE,
                transform: [{ scale: animatedValue }],
                opacity: animatedValue,
              },
            ]}
          >
            <View style={styles.chartHeader}>
              <Text style={[styles.chartTitle, { color: colors.TEXT_DARK }]}>Distribución por Medidor</Text>
              <Text style={[styles.chartSubtitle, { color: colors.TEXT_LIGHT }]}>
                ¿Cuál de tus medidores consume más?
              </Text>
            </View>
            <View style={styles.pieChartWrapper}>
              <PieChart
                data={pieChartData}
                width={CHART_WIDTH}
                height={240}
                chartConfig={{
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="10"
                center={[0, 0]}
                absolute
                hasLegend
              />
            </View>
            <Text style={[styles.helperTextSmall, { color: colors.TEXT_LIGHT }]}>
              Sugerencia: enfoca tus esfuerzos de ahorro en los medidores con mayor participación.
            </Text>
          </Animated.View>
        )}

        {/* Resumen de medidores */}
        <Animated.View
          style={[
            styles.metersContainer,
            {
              backgroundColor: colors.WHITE,
              transform: [{ scale: animatedValue }],
              opacity: animatedValue,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.TEXT_DARK }]}>
            Resumen de Medidores
          </Text>
          {meters.map((meter, index) => (
            <TouchableOpacity
              key={meter.id}
              style={[
                styles.meterRow,
                {
                  borderLeftColor: meter.color || colors.ACCENT,
                  marginBottom: index === meters.length - 1 ? 0 : 12,
                },
              ]}
              onPress={() => {
                if (selectedMeter === meter.id) return;
                setIsFetching(true);
                setSelectedMeter(meter.id);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.meterInfo}>
                <Text style={[styles.meterName, { color: colors.TEXT_DARK }]}>{meter.name}</Text>
                <Text style={[styles.meterCompany, { color: colors.TEXT_LIGHT }]}>{meter.company}</Text>
              </View>
              <View style={styles.meterStats}>
                <Text style={[styles.meterReading, { color: colors.PRIMARY }]}>
                  {meter.lastReading} kWh
                </Text>
                <Text style={[styles.meterCost, { color: colors.TEXT_LIGHT }]}>
                  {formatCurrency(meter.lastCost)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          <Text style={[styles.helperTextSmall, { color: colors.TEXT_LIGHT, marginTop: 8 }]}>
            Tip: toca un medidor para filtrar todos los gráficos con sus datos.
          </Text>
        </Animated.View>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ===== Subcomponentes =====
const StatCard = ({ colors, animatedValue, label, value, subValue, trend }) => (
  <Animated.View
    style={[
      styles.statCard,
      {
        backgroundColor: colors.WHITE,
        transform: [{ scale: animatedValue }],
        opacity: animatedValue,
      },
    ]}
  >
    <View style={styles.statCardHeader}>
      <Text style={[styles.statLabel, { color: colors.TEXT_LIGHT }]}>{label}</Text>
      {typeof trend === 'number' && (
        <View
          style={[
            styles.trendBadge,
            { backgroundColor: trend >= 0 ? '#FEE2E2' : '#D1FAE5' },
          ]}
        >
          <Text
            style={[
              styles.trendText,
              { color: trend >= 0 ? '#EF4444' : '#10B981' },
            ]}
          >
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </Text>
        </View>
      )}
    </View>
    <Text style={[styles.statValue, { color: colors.PRIMARY }]}>{value}</Text>
    {subValue ? (
      <Text style={[styles.statSubValue, { color: colors.TEXT_LIGHT }]}>{subValue}</Text>
    ) : null}
  </Animated.View>
);

// ===== Estilos =====
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  centerContent: {
    flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40,
  },
  loadingText: { marginTop: 16, fontSize: 15, fontWeight: '500' },

  controlsRow: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },

  periodSelector: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 12, padding: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2,
  },
  periodButton: {
    flex: 1, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
  },
  periodButtonText: { fontSize: 13, fontWeight: '600' },

  unitToggle: {
    flexDirection: 'row',
    borderRadius: 12, padding: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2,
  },
  unitChip: {
    paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, marginRight: 6,
    backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB',
  },
  unitText: { fontSize: 13, fontWeight: '700' },

  helperText: {
    marginHorizontal: 16, marginBottom: 8, fontSize: 12, lineHeight: 18,
  },
  helperTextSmall: {
    marginTop: 8, fontSize: 12, lineHeight: 18,
  },

  meterSelector: {
    marginHorizontal: 16, marginBottom: 12, paddingVertical: 12, paddingHorizontal: 12,
    borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2,
    backgroundColor: '#FFF',
  },
  meterChip: {
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, marginRight: 8,
    backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB',
  },
  meterChipText: { fontSize: 13, fontWeight: '600' },

  statsContainer: { paddingHorizontal: 16, gap: 12, marginBottom: 16 },
  statCard: {
    padding: 20, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  statCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statLabel: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  trendBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  trendText: { fontSize: 11, fontWeight: '700' },
  statValue: { fontSize: 28, fontWeight: '700', marginBottom: 4 },
  statSubValue: { fontSize: 13, fontWeight: '500' },

  alertsContainer: {
    marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#DC2626',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  alertHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  alertIconContainer: {
    width: 32, height: 32, borderRadius: 8, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  alertIcon: { fontSize: 16 },
  alertsTitle: { fontSize: 15, fontWeight: '700' },
  alertItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#FEE2E2' },
  alertContent: { flex: 1 },
  alertMeterName: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  alertDate: { fontSize: 12 },
  alertRight: { alignItems: 'flex-end' },
  alertConsumption: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  alertBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  alertBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },

  chartContainer: {
    marginHorizontal: 16, marginBottom: 16, borderRadius: 16, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  chartHeader: { marginBottom: 16 },
  chartTitle: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  chartSubtitle: { fontSize: 13, fontWeight: '500' },
  chart: { marginVertical: 8, borderRadius: 16 },
  pieChartWrapper: { alignItems: 'center' },
  progressText: { marginTop: 10, fontSize: 14, fontWeight: '700' },

  metersContainer: {
    marginHorizontal: 16, marginBottom: 16, borderRadius: 16, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 16 },
  meterRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 16, paddingLeft: 16, paddingRight: 12, borderLeftWidth: 4, borderRadius: 12, backgroundColor: '#F9FAFB',
  },
  meterInfo: { flex: 1 },
  meterName: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  meterCompany: { fontSize: 13, fontWeight: '500' },
  meterStats: { alignItems: 'flex-end' },
  meterReading: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  meterCost: { fontSize: 13, fontWeight: '500' },

  spacer: { height: 32 },
});
