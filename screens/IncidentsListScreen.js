import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useDarkMode } from '../utils/darkModeContext';
import { getCurrentUser } from '../services/authService';
import {
  getUserIncidents,
  deleteIncident,
  getIncidentStats,
  formatIncidentsForExport,
} from '../services/incidentsService';
import { showToast } from '../utils/toastUtils';
import { SPACING, TYPOGRAPHY, RADIUS, ELEVATION } from '../constants/theme';
import Icon from '../components/Icon';
import Button from '../components/ui/Button';
import moment from 'moment';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

export const IncidentsListScreen = ({ navigation }) => {
  const { colors } = useDarkMode();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadIncidents();
    }, [])
  );

  const loadIncidents = async () => {
    try {
      setLoading(true);
      const user = getCurrentUser();
      const data = await getUserIncidents(user.uid);
      setIncidents(data);
      setStats(getIncidentStats(data));
    } catch (error) {
      console.error('Error loading incidents:', error);
      showToast('Error al cargar los inconvenientes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (incident) => {
    Alert.alert(
      'Eliminar Inconveniente',
      '¿Estás seguro de que deseas eliminar este registro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteIncident(incident.id);
              showToast('Inconveniente eliminado', 'success');
              loadIncidents();
            } catch (error) {
              showToast('Error al eliminar', 'error');
            }
          },
        },
      ]
    );
  };

  const handleExport = async () => {
    try {
      if (incidents.length === 0) {
        Alert.alert('Sin datos', 'No hay inconvenientes para exportar');
        return;
      }

      const csvContent = formatIncidentsForExport(incidents);
      const fileName = `inconvenientes_${moment().format('YYYY-MM-DD')}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Exportar Inconvenientes',
          UTI: 'public.comma-separated-values-text',
        });
        showToast('Archivo exportado correctamente', 'success');
      } else {
        Alert.alert(
          'Archivo Creado',
          `El archivo se ha guardado en: ${fileUri}`
        );
      }
    } catch (error) {
      console.error('Error exporting:', error);
      showToast('Error al exportar', 'error');
    }
  };

  const getIncidentTypeInfo = (type) => {
    const types = {
      corte: { label: 'Corte de Luz', icon: 'power-off', color: colors.ERROR },
      baja_tension: { label: 'Baja Tensión', icon: 'arrow-down-circle', color: colors.WARNING },
      sobre_tension: { label: 'Sobretensión', icon: 'arrow-up-circle', color: colors.WARNING },
      fluctuacion: { label: 'Fluctuaciones', icon: 'pulse', color: colors.ACCENT },
      otro: { label: 'Otro', icon: 'alert-circle-outline', color: colors.TEXT_LIGHT },
    };
    return types[type] || types.otro;
  };

  const renderIncident = ({ item, index }) => {
    const date = item.date?.toDate?.() || new Date(item.date);
    const typeInfo = getIncidentTypeInfo(item.type);

    return (
      <View style={[styles.incidentCard, { backgroundColor: colors.CARD, borderLeftColor: typeInfo.color }]}>
        <View style={styles.incidentHeader}>
          <View style={styles.incidentHeaderLeft}>
            <View style={[styles.typeIconContainer, { backgroundColor: `${typeInfo.color}20` }]}>
              <Icon name={typeInfo.icon} size={20} color={typeInfo.color} />
            </View>
            <View>
              <Text style={[styles.incidentType, { color: typeInfo.color }]}>
                {typeInfo.label}
              </Text>
              <Text style={[styles.incidentDate, { color: colors.TEXT_LIGHT }]}>
                {moment(date).format('DD/MM/YYYY')}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item)}
          >
            <Icon name="delete-outline" size={20} color={colors.ERROR} />
          </TouchableOpacity>
        </View>

        {item.meterName && item.meterName !== 'General' && (
          <View style={[styles.meterBadge, { backgroundColor: colors.BACKGROUND }]}>
            <Icon name="lightning-bolt" size={14} color={colors.PRIMARY} style={styles.badgeIcon} />
            <Text style={[styles.meterBadgeText, { color: colors.PRIMARY }]}>
              {item.meterName}
            </Text>
          </View>
        )}

        {(item.startTime || item.endTime) && (
          <View style={styles.timeRow}>
            {item.startTime && (
              <View style={styles.timeInfo}>
                <Icon name="clock-start" size={14} color={colors.TEXT_LIGHT} style={styles.timeIcon} />
                <Text style={[styles.timeText, { color: colors.TEXT_LIGHT }]}>
                  Inicio: {item.startTime}
                </Text>
              </View>
            )}
            {item.endTime && (
              <View style={styles.timeInfo}>
                <Icon name="clock-end" size={14} color={colors.TEXT_LIGHT} style={styles.timeIcon} />
                <Text style={[styles.timeText, { color: colors.TEXT_LIGHT }]}>
                  Fin: {item.endTime}
                </Text>
              </View>
            )}
          </View>
        )}

        <Text style={[styles.description, { color: colors.TEXT_DARK }]}>
          {item.description}
        </Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="alert-circle-outline" size={64} color={colors.TEXT_LIGHT} style={styles.emptyIcon} />
      <Text style={[styles.emptyTitle, { color: colors.TEXT_DARK }]}>
        Sin inconvenientes registrados
      </Text>
      <Text style={[styles.emptyText, { color: colors.TEXT_LIGHT }]}>
        Registra problemas con el servicio eléctrico para llevar un control
      </Text>
      <Button
        title="Reportar Primer Inconveniente"
        onPress={() => navigation.navigate('ReportIncidentScreen')}
        variant="primary"
        size="md"
        iconLeft="plus"
        style={styles.emptyButton}
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.PRIMARY} />
          <Text style={[styles.loadingText, { color: colors.TEXT_LIGHT }]}>
            Cargando inconvenientes...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.CARD }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="chevron-left" size={24} color={colors.PRIMARY} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.title, { color: colors.TEXT_DARK }]}>
              Inconvenientes Registrados
            </Text>
            <Text style={[styles.subtitle, { color: colors.TEXT_LIGHT }]}>
              {incidents.length} {incidents.length === 1 ? 'registro' : 'registros'}
            </Text>
          </View>
        </View>

        {/* Estadísticas */}
        {stats && incidents.length > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.PRIMARY }]}>
                {stats.currentMonth}
              </Text>
              <Text style={[styles.statLabel, { color: colors.TEXT_LIGHT }]}>
                Este mes
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.ACCENT }]}>
                {stats.total}
              </Text>
              <Text style={[styles.statLabel, { color: colors.TEXT_LIGHT }]}>
                Total
              </Text>
            </View>
          </View>
        )}

        {/* Botones de acción */}
        {incidents.length > 0 && (
          <View style={styles.actionsRow}>
            <Button
              title="Nuevo Inconveniente"
              onPress={() => navigation.navigate('ReportIncidentScreen')}
              variant="primary"
              size="md"
              iconLeft="plus"
              style={styles.actionButton}
            />
            <Button
              title="Exportar"
              onPress={handleExport}
              variant="outline"
              size="md"
              iconLeft="download"
              style={styles.actionButton}
            />
          </View>
        )}
      </View>

      {/* Lista */}
      <FlatList
        data={incidents}
        renderItem={renderIncident}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  backButton: {
    marginRight: SPACING.md,
  },
  headerTitleContainer: {
    flex: 1,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: SPACING.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: SPACING.xs,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionButton: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  incidentCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    ...ELEVATION.sm,
  },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  incidentHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  incidentType: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  incidentDate: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: SPACING.xs,
  },
  deleteButton: {
    padding: SPACING.sm,
  },
  meterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },
  badgeIcon: {
    marginRight: SPACING.xs,
  },
  meterBadgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  timeRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIcon: {
    marginRight: SPACING.xs,
  },
  timeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: TYPOGRAPHY.sizes.sm * 1.5,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING['3xl'],
  },
  emptyIcon: {
    marginBottom: SPACING.lg,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  emptyButton: {
    minWidth: 250,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
});
