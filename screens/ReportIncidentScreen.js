import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDarkMode } from '../utils/darkModeContext';
import { getCurrentUser } from '../services/authService';
import { getUserMeters } from '../services/meterService';
import { createIncident } from '../services/incidentsService';
import { showToast } from '../utils/toastUtils';
import { SPACING, TYPOGRAPHY, RADIUS } from '../constants/theme';
import Icon from '../components/Icon';
import Button from '../components/ui/Button';
import moment from 'moment';

export const ReportIncidentScreen = ({ navigation }) => {
  const { colors } = useDarkMode();
  const [loading, setLoading] = useState(false);
  const [meters, setMeters] = useState([]);

  // Datos del incidente
  const [selectedMeter, setSelectedMeter] = useState(null);
  const [incidentType, setIncidentType] = useState('corte');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');

  const incidentTypes = [
    { id: 'corte', label: 'Corte de Luz', icon: 'power-off', color: colors.ERROR },
    { id: 'baja_tension', label: 'Baja Tensión', icon: 'arrow-down-circle', color: colors.WARNING },
    { id: 'sobre_tension', label: 'Sobretensión', icon: 'arrow-up-circle', color: colors.WARNING },
    { id: 'fluctuacion', label: 'Fluctuaciones', icon: 'pulse', color: colors.ACCENT },
    { id: 'otro', label: 'Otro', icon: 'alert-circle-outline', color: colors.TEXT_LIGHT },
  ];

  useEffect(() => {
    loadMeters();
  }, []);

  const loadMeters = async () => {
    try {
      const user = getCurrentUser();
      const metersList = await getUserMeters(user.uid);
      setMeters(metersList);
    } catch (error) {
      console.error('Error loading meters:', error);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const validateForm = () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Por favor describe el inconveniente');
      return false;
    }

    if (description.trim().length < 10) {
      Alert.alert('Error', 'La descripción debe tener al menos 10 caracteres');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const user = getCurrentUser();

      const incidentData = {
        meterId: selectedMeter?.id || null,
        meterName: selectedMeter?.name || 'General',
        date,
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        description: description.trim(),
        type: incidentType,
      };

      await createIncident(user.uid, incidentData);

      showToast('Incidente registrado correctamente', 'success');

      // Limpiar formulario
      setSelectedMeter(null);
      setIncidentType('corte');
      setDate(new Date());
      setStartTime('');
      setEndTime('');
      setDescription('');

      // Volver a la lista
      setTimeout(() => {
        navigation.navigate('IncidentsListScreen');
      }, 500);
    } catch (error) {
      console.error('Error creating incident:', error);
      showToast('Error al registrar el incidente', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.CARD }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="chevron-left" size={24} color={colors.PRIMARY} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Icon name="alert-circle" size={32} color={colors.ERROR} style={styles.headerIcon} />
            <View>
              <Text style={[styles.title, { color: colors.TEXT_DARK }]}>
                Reportar Inconveniente
              </Text>
              <Text style={[styles.subtitle, { color: colors.TEXT_LIGHT }]}>
                Registra problemas con el servicio eléctrico
              </Text>
            </View>
          </View>
        </View>

        {/* Tipo de Incidente */}
        <View style={[styles.section, { backgroundColor: colors.CARD }]}>
          <Text style={[styles.sectionTitle, { color: colors.PRIMARY }]}>
            Tipo de Inconveniente
          </Text>
          <View style={styles.typesGrid}>
            {incidentTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeCard,
                  {
                    backgroundColor: incidentType === type.id
                      ? `${type.color}20`
                      : colors.BACKGROUND,
                    borderColor: incidentType === type.id ? type.color : colors.BORDER,
                    borderWidth: 2,
                  },
                ]}
                onPress={() => setIncidentType(type.id)}
                activeOpacity={0.7}
              >
                <Icon
                  name={type.icon}
                  size={24}
                  color={incidentType === type.id ? type.color : colors.TEXT_LIGHT}
                />
                <Text
                  style={[
                    styles.typeLabel,
                    {
                      color: incidentType === type.id ? type.color : colors.TEXT_DARK,
                      fontWeight: incidentType === type.id ? '700' : '500',
                    },
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Medidor (Opcional) */}
        <View style={[styles.section, { backgroundColor: colors.CARD }]}>
          <Text style={[styles.sectionTitle, { color: colors.PRIMARY }]}>
            Medidor Afectado (Opcional)
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.metersScroll}>
            <TouchableOpacity
              style={[
                styles.meterOption,
                {
                  backgroundColor: !selectedMeter ? colors.PRIMARY : colors.BACKGROUND,
                  borderColor: colors.BORDER,
                },
              ]}
              onPress={() => setSelectedMeter(null)}
            >
              <Text
                style={[
                  styles.meterText,
                  { color: !selectedMeter ? '#FFFFFF' : colors.TEXT_DARK },
                ]}
              >
                General
              </Text>
            </TouchableOpacity>
            {meters.map((meter) => (
              <TouchableOpacity
                key={meter.id}
                style={[
                  styles.meterOption,
                  {
                    backgroundColor: selectedMeter?.id === meter.id
                      ? colors.PRIMARY
                      : colors.BACKGROUND,
                    borderColor: colors.BORDER,
                  },
                ]}
                onPress={() => setSelectedMeter(meter)}
              >
                <Text
                  style={[
                    styles.meterText,
                    {
                      color: selectedMeter?.id === meter.id ? '#FFFFFF' : colors.TEXT_DARK,
                    },
                  ]}
                >
                  {meter.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Fecha */}
        <View style={[styles.section, { backgroundColor: colors.CARD }]}>
          <Text style={[styles.sectionTitle, { color: colors.PRIMARY }]}>
            Fecha del Inconveniente
          </Text>
          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: colors.BACKGROUND, borderColor: colors.BORDER }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Icon name="calendar" size={20} color={colors.PRIMARY} style={styles.dateIcon} />
            <Text style={[styles.dateText, { color: colors.TEXT_DARK }]}>
              {moment(date).format('DD/MM/YYYY')}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>

        {/* Horarios */}
        <View style={[styles.section, { backgroundColor: colors.CARD }]}>
          <Text style={[styles.sectionTitle, { color: colors.PRIMARY }]}>
            Horario (Opcional)
          </Text>
          <View style={styles.timeRow}>
            <View style={styles.timeField}>
              <Text style={[styles.timeLabel, { color: colors.TEXT_LIGHT }]}>
                Hora Inicio
              </Text>
              <TextInput
                style={[
                  styles.timeInput,
                  { color: colors.TEXT_DARK, backgroundColor: colors.BACKGROUND, borderColor: colors.BORDER },
                ]}
                value={startTime}
                onChangeText={setStartTime}
                placeholder="Ej: 19:00"
                placeholderTextColor={colors.TEXT_LIGHT}
              />
            </View>
            <View style={styles.timeField}>
              <Text style={[styles.timeLabel, { color: colors.TEXT_LIGHT }]}>
                Hora Fin
              </Text>
              <TextInput
                style={[
                  styles.timeInput,
                  { color: colors.TEXT_DARK, backgroundColor: colors.BACKGROUND, borderColor: colors.BORDER },
                ]}
                value={endTime}
                onChangeText={setEndTime}
                placeholder="Ej: 22:00"
                placeholderTextColor={colors.TEXT_LIGHT}
              />
            </View>
          </View>
        </View>

        {/* Descripción */}
        <View style={[styles.section, { backgroundColor: colors.CARD }]}>
          <Text style={[styles.sectionTitle, { color: colors.PRIMARY }]}>
            Descripción del Problema
          </Text>
          <TextInput
            style={[
              styles.textArea,
              { color: colors.TEXT_DARK, backgroundColor: colors.BACKGROUND, borderColor: colors.BORDER },
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe lo que sucedió. Ej: Se cortó la luz a las 19:00 y volvió a las 22:00. Afectó toda la casa."
            placeholderTextColor={colors.TEXT_LIGHT}
            multiline
            numberOfLines={6}
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={[styles.charCount, { color: colors.TEXT_LIGHT }]}>
            {description.length}/500 caracteres
          </Text>
        </View>

        {/* Botón Guardar */}
        <View style={styles.submitContainer}>
          <Button
            title="Registrar Inconveniente"
            onPress={handleSubmit}
            variant="primary"
            size="lg"
            iconLeft="check-circle"
            loading={loading}
            disabled={loading}
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  backButton: {
    marginBottom: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  section: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.md,
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  typeCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
  },
  typeLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  metersScroll: {
    flexGrow: 0,
  },
  meterOption: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginRight: SPACING.sm,
  },
  meterText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md + 2,
    borderRadius: RADIUS.md,
    borderWidth: 2,
  },
  dateIcon: {
    marginRight: SPACING.md,
  },
  dateText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  timeRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  timeField: {
    flex: 1,
  },
  timeLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: SPACING.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  timeInput: {
    borderWidth: 2,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.base,
    textAlign: 'center',
  },
  textArea: {
    borderWidth: 2,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.base,
    minHeight: 120,
  },
  charCount: {
    fontSize: TYPOGRAPHY.sizes.xs,
    textAlign: 'right',
    marginTop: SPACING.sm,
  },
  submitContainer: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xl,
  },
});
