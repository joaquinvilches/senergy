import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useDarkMode } from '../../utils/darkModeContext';
import { SPACING, TYPOGRAPHY, RADIUS, ELEVATION } from '../../constants/theme';
import Icon from '../Icon';

// Importar los gráficos profesionales
import { LineChartPro } from '../charts/LineChartPro';
import { BarChartPro } from '../charts/BarChartPro';
import { PieChartPro } from '../charts/PieChartPro';

const TABS = [
  {
    id: 'evolution',
    label: 'Evolución',
    icon: 'chart-line',
    description: 'Tendencia en el tiempo',
  },
  {
    id: 'comparison',
    label: 'Comparativa',
    icon: 'chart-bar',
    description: 'Comparar lecturas',
  },
  {
    id: 'distribution',
    label: 'Distribución',
    icon: 'chart-donut',
    description: 'Por medidor',
  },
];

export const ChartsTabView = ({ data, pieData, unit, isDark, colors: themeColors, showPieChart = true }) => {
  const { colors } = useDarkMode();
  const [activeTab, setActiveTab] = useState('evolution');

  // Determinar si mostrar el tab de distribución
  const tabs = showPieChart ? TABS : TABS.filter(t => t.id !== 'distribution');

  const renderChart = () => {
    switch (activeTab) {
      case 'evolution':
        return <LineChartPro data={data} unit={unit} colors={colors} isDark={isDark} />;
      case 'comparison':
        return <BarChartPro data={data} unit={unit} colors={colors} isDark={isDark} />;
      case 'distribution':
        if (showPieChart && pieData && pieData.length > 1) {
          return <PieChartPro data={pieData} unit={unit} colors={colors} isDark={isDark} />;
        }
        return (
          <View style={[styles.emptyChart, { backgroundColor: colors.BACKGROUND }]}>
            <Icon name="chart-donut" size={48} color={colors.TEXT_LIGHT} style={styles.emptyIcon} />
            <Text style={[styles.emptyText, { color: colors.TEXT_LIGHT }]}>
              Necesitas múltiples medidores para ver la distribución
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.CARD, borderColor: colors.BORDER }]}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                isActive && {
                  backgroundColor: colors.PRIMARY,
                },
              ]}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.7}
            >
              <Icon
                name={tab.icon}
                size={20}
                color={isActive ? '#FFFFFF' : colors.TEXT_LIGHT}
                style={styles.tabIcon}
              />
              <View style={styles.tabTextContainer}>
                <Text
                  style={[
                    styles.tabLabel,
                    { color: isActive ? '#FFFFFF' : colors.TEXT_DARK },
                  ]}
                >
                  {tab.label}
                </Text>
                <Text
                  style={[
                    styles.tabDescription,
                    { color: isActive ? 'rgba(255,255,255,0.8)' : colors.TEXT_LIGHT },
                  ]}
                >
                  {tab.description}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Chart Content */}
      <View style={styles.chartContainer}>
        {renderChart()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
    ...ELEVATION.sm,
  },
  tabsContainer: {
    flexDirection: 'row',
    padding: SPACING.xs,
    gap: SPACING.xs,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  tabIcon: {
    marginRight: SPACING.xs,
  },
  tabTextContainer: {
    flex: 1,
  },
  tabLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  tabDescription: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
  },
  chartContainer: {
    padding: SPACING.sm,
  },
  emptyChart: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['3xl'],
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
  },
  emptyIcon: {
    marginBottom: SPACING.md,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.sizes.sm * 1.5,
  },
});
