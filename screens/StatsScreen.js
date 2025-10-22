import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LineChart, PieChart, BarChart, ProgressChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';
import { useDarkMode } from '../utils/darkModeContext';
import { formatCurrency } from '../utils/calculations';
import { hexToRgba, clamp } from '../utils/statsCalculations';

// Hooks personalizados
import { useStatsData } from '../hooks/useStatsData';
import { useChartData } from '../hooks/useChartData';
import { useAlerts } from '../hooks/useAlerts';

// Componentes
import { StatCard } from '../components/StatCard';
import { AlertsPanel } from '../components/AlertsPanel';
import { ChartContainer } from '../components/ChartContainer';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 32;

export const StatsScreen = () => {
  const { colors } = useDarkMode();

  // Estados de UI
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMeter, setSelectedMeter] = useState('all');
  const [unit, setUnit] = useState('kWh');

  // Hooks personalizados
  const { meters, filteredReadings, loading, isFetching } = useStatsData(selectedPeriod, selectedMeter);
  const { lineData, pieData, barData, kpis, budgetProgress, hasLineData, showPie, MONTHLY_BUDGET_CLP } =
    useChartData(filteredReadings, selectedPeriod, selectedMeter, unit, colors);
  const alerts = useAlerts(filteredReadings);

  // Animación de entrada
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

  useFocusEffect(
    useCallback(() => {
      animateEntry();
    }, [animateEntry, selectedPeriod, selectedMeter, unit])
  );

  // Loading inicial
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.PRIMARY} />
          <Text style={[styles.loadingText, { color: colors.TEXT_LIGHT }]}>
            Cargando estadísticas...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Controles de período y unidad */}
        <View style={styles.controlsRow}>
          {/* Selector de período */}
          <View style={[styles.periodSelector, { backgroundColor: colors.WHITE }]}>
            {['week', 'month', 'year'].map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && { backgroundColor: colors.PRIMARY },
                ]}
                onPress={() => setSelectedPeriod(period)}
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

          {/* Selector de unidad */}
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

        {/* Texto de ayuda */}
        <Text style={[styles.helperText, { color: colors.TEXT_LIGHT }]}>
          Consejo: usa <Text style={{ fontWeight: '700', color: colors.PRIMARY }}>Consumo</Text> para
          comparar hábitos y <Text style={{ fontWeight: '700', color: colors.PRIMARY }}>Costo</Text> para
          estimar tu boleta.
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
              onPress={() => setSelectedMeter('all')}
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
                onPress={() => setSelectedMeter(meter.id)}
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

        {/* Indicador de carga intermedio */}
        {isFetching && (
          <View style={{ paddingVertical: 12, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={colors.PRIMARY} />
          </View>
        )}

        {/* Alertas de consumo alto */}
        <AlertsPanel alerts={alerts} colors={colors} animatedValue={animatedValue} />

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

        {/* Gráfico de línea: Evolución */}
        {hasLineData && (
          <ChartContainer
            title={`Evolución ${unit === 'kWh' ? 'del Consumo' : 'del Costo'}`}
            subtitle={
              selectedPeriod === 'week'
                ? 'Últimos 7 días'
                : selectedPeriod === 'month'
                ? 'Últimos 30 días'
                : 'Último año'
            }
            helperText="Consejo: si ves picos en días específicos, intenta identificar qué actividad los causó."
            colors={colors}
            animatedValue={animatedValue}
          >
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
          </ChartContainer>
        )}

        {/* Gráfico de barras: Comparativa por día/mes */}
        <ChartContainer
          title={selectedPeriod === 'year' ? 'Consumo/Costo por Mes' : 'Consumo/Costo por Día'}
          subtitle="Vista resumida para comparar fácilmente"
          helperText="Tip: las barras ayudan a ver rápidamente qué días/meses gastan más."
          colors={colors}
          animatedValue={animatedValue}
        >
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
        </ChartContainer>

        {/* Gráfico de progreso: Presupuesto mensual */}
        {unit === '$' && selectedPeriod !== 'year' && (
          <ChartContainer
            title="Avance del Presupuesto Mensual"
            subtitle={`Presupuesto referencial: ${formatCurrency(MONTHLY_BUDGET_CLP)}`}
            helperText="Consejo: si superas el 80%, considera reducir consumos en horas punta."
            colors={colors}
            animatedValue={animatedValue}
          >
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
                Gastado este mes: {formatCurrency(budgetProgress.monthCost)} (
                {Math.round(budgetProgress.progress * 100)}%)
              </Text>
            </View>
          </ChartContainer>
        )}

        {/* Gráfico de torta: Distribución por medidor */}
        {showPie && (
          <ChartContainer
            title="Distribución por Medidor"
            subtitle="¿Cuál de tus medidores consume más?"
            helperText="Sugerencia: enfoca tus esfuerzos de ahorro en los medidores con mayor participación."
            colors={colors}
            animatedValue={animatedValue}
          >
            <View style={styles.pieChartWrapper}>
              <PieChart
                data={pieData}
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
          </ChartContainer>
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
              onPress={() => setSelectedMeter(meter.id)}
              activeOpacity={0.7}
            >
              <View style={styles.meterInfo}>
                <Text style={[styles.meterName, { color: colors.TEXT_DARK }]}>{meter.name}</Text>
                <Text style={[styles.meterCompany, { color: colors.TEXT_LIGHT }]}>
                  {meter.company}
                </Text>
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
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
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodButtonText: { fontSize: 13, fontWeight: '600' },
  unitToggle: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  unitChip: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 6,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  unitText: { fontSize: 13, fontWeight: '700' },
  helperText: {
    marginHorizontal: 16,
    marginBottom: 8,
    fontSize: 12,
    lineHeight: 18,
  },
  meterSelector: {
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  meterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  meterChipText: { fontSize: 13, fontWeight: '600' },
  statsContainer: { paddingHorizontal: 16, gap: 12, marginBottom: 16 },
  chart: { marginVertical: 8, borderRadius: 16 },
  pieChartWrapper: { alignItems: 'center' },
  progressText: { marginTop: 10, fontSize: 14, fontWeight: '700' },
  metersContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 16 },
  meterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingLeft: 16,
    paddingRight: 12,
    borderLeftWidth: 4,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  meterInfo: { flex: 1 },
  meterName: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  meterCompany: { fontSize: 13, fontWeight: '500' },
  meterStats: { alignItems: 'flex-end' },
  meterReading: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  meterCost: { fontSize: 13, fontWeight: '500' },
  helperTextSmall: { fontSize: 12, lineHeight: 18 },
  spacer: { height: 32 },
});
