import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useDarkMode } from '../utils/darkModeContext';
import { showToast } from '../utils/toastUtils';
import { CONFIG } from '../utils/constants';
import { addReading, updateMeter, getUserMeters } from '../services/meterService';
import { getCurrentUser } from '../services/authService';
import { calculateConsumption, calculateCost, formatCurrency } from '../utils/calculations';
import moment from 'moment';

export const NewReadingScreen = ({ route, navigation }) => {
  const { meterId } = route.params;
  const { colors } = useDarkMode();
  const [readingValue, setReadingValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [meterData, setMeterData] = useState(null);

  React.useEffect(() => {
    loadMeterData();
  }, []);

  const loadMeterData = async () => {
    try {
      const user = getCurrentUser();
      const userMeters = await getUserMeters(user.uid);
      const meter = userMeters.find(m => m.id === meterId);
      setMeterData(meter);
    } catch (error) {
      console.log('Error loading meter data:', error);
    }
  };

  const validateReading = (value) => {
    if (!value.trim()) {
      showToast('Por favor ingresa la lectura', 'error');
      return false;
    }

    if (isNaN(value)) {
      showToast('La lectura debe ser un número válido', 'error');
      return false;
    }

    const reading = parseFloat(value);

    if (reading <= 0) {
      showToast('La lectura debe ser mayor a 0', 'error');
      return false;
    }

    if (meterData && reading <= meterData.lastReading) {
      showToast(
        `La lectura debe ser mayor a ${meterData.lastReading} kWh (lectura anterior)`,
        'error'
      );
      return false;
    }

    if (reading > meterData.lastReading + 5000) {
      showToast('La lectura parece demasiado alta. ¿Estás seguro?', 'warning');
      return false;
    }

    return true;
  };

  const handleAddReading = async () => {
    if (!validateReading(readingValue)) {
      return;
    }

    setLoading(true);

    try {
      const user = getCurrentUser();
      const userMeters = await getUserMeters(user.uid);
      const meter = userMeters.find(m => m.id === meterId);

      if (!meter) {
        showToast('Medidor no encontrado', 'error');
        return;
      }

      const currentReading = parseFloat(readingValue);
      const consumption = calculateConsumption(meter.lastReading, currentReading);
      const cost = calculateCost(consumption, meter.costPerKwh);

      const readingData = {
        value: currentReading,
        consumption,
        cost,
        costPerKwh: meter.costPerKwh,
      };

      await addReading(user.uid, meterId, readingData);
      await updateMeter(user.uid, meterId, {
        lastReading: currentReading,
        lastCost: cost,
      });

      showToast('Lectura registrada correctamente', 'success');
      navigation.goBack();
    } catch (error) {
      showToast(`Error: ${error.message}`, 'error');
      console.log('Error adding reading:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!validateReading(readingValue)) {
      return;
    }

    try {
      const user = getCurrentUser();
      const userMeters = await getUserMeters(user.uid);
      const meter = userMeters.find(m => m.id === meterId);

      if (!meter) return;

      const currentReading = parseFloat(readingValue);
      const consumption = calculateConsumption(meter.lastReading, currentReading);
      const cost = calculateCost(consumption, meter.costPerKwh);

      setPreview({
        lastReading: meter.lastReading,
        currentReading,
        consumption,
        cost,
        costPerKwh: meter.costPerKwh,
      });
    } catch (error) {
      console.log('Error generating preview:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.PRIMARY }]}>Nueva Lectura</Text>
            <Text style={[styles.subtitle, { color: colors.TEXT_LIGHT }]}>
              Ingresa el valor actual del medidor
            </Text>
          </View>

          {meterData && (
            <View style={[styles.infoBox, { backgroundColor: colors.WHITE }]}>
              <Text style={[styles.infoLabel, { color: colors.TEXT_LIGHT }]}>
                Última lectura registrada:
              </Text>
              <Text style={[styles.infoValue, { color: colors.PRIMARY }]}>
                {meterData.lastReading} kWh
              </Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.TEXT_DARK }]}>
              Lectura actual (kWh)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.WHITE,
                  color: colors.TEXT_DARK,
                  borderColor: colors.ACCENT,
                },
              ]}
              placeholder="Ej: 12500"
              placeholderTextColor={colors.TEXT_LIGHT}
              value={readingValue}
              onChangeText={setReadingValue}
              keyboardType="decimal-pad"
              editable={!loading}
            />
            <Text style={[styles.hint, { color: colors.TEXT_LIGHT }]}>
              Lectura tomada: {moment().format('DD/MM/YYYY HH:mm')}
            </Text>
          </View>

          {preview && (
            <View style={[styles.previewContainer, { backgroundColor: colors.WHITE }]}>
              <Text style={[styles.previewTitle, { color: colors.PRIMARY }]}>
                📊 Vista Previa del Cálculo
              </Text>

              <View style={styles.previewRow}>
                <Text style={[styles.previewLabel, { color: colors.TEXT_LIGHT }]}>
                  Lectura anterior:
                </Text>
                <Text style={[styles.previewValue, { color: colors.TEXT_DARK }]}>
                  {preview.lastReading} kWh
                </Text>
              </View>

              <View style={styles.previewRow}>
                <Text style={[styles.previewLabel, { color: colors.TEXT_LIGHT }]}>
                  Lectura actual:
                </Text>
                <Text style={[styles.previewValue, { color: colors.TEXT_DARK }]}>
                  {preview.currentReading} kWh
                </Text>
              </View>

              <View style={[styles.divider, { borderColor: colors.BACKGROUND }]} />

              <View style={styles.previewRow}>
                <Text style={[styles.previewLabel, { color: colors.TEXT_LIGHT }]}>
                  Consumo:
                </Text>
                <Text style={[styles.previewValue, { color: colors.ACCENT, fontWeight: 'bold' }]}>
                  {preview.consumption} kWh
                </Text>
              </View>

              <View style={styles.previewRow}>
                <Text style={[styles.previewLabel, { color: colors.TEXT_LIGHT }]}>
                  Tarifa:
                </Text>
                <Text style={[styles.previewValue, { color: colors.TEXT_DARK }]}>
                  ${preview.costPerKwh}/kWh
                </Text>
              </View>

              <View style={styles.previewRow}>
                <Text style={[styles.previewLabel, { color: colors.TEXT_LIGHT }]}>
                  Costo total:
                </Text>
                <Text
                  style={[
                    styles.previewValue,
                    { color: colors.PRIMARY, fontSize: 18, fontWeight: 'bold' },
                  ]}
                >
                  {formatCurrency(preview.cost)}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.previewButton, { backgroundColor: colors.SECONDARY }]}
              onPress={handlePreview}
              disabled={loading}
            >
              <Text style={styles.previewButtonText}>👁️ Ver cálculo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: colors.PRIMARY },
                loading && styles.buttonDisabled,
              ]}
              onPress={handleAddReading}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.saveButtonText}>✓ Guardar lectura</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: colors.PRIMARY }]}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={[styles.cancelButtonText, { color: colors.PRIMARY }]}>
              Cancelar
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
  },
  infoBox: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 18,
    borderWidth: 2,
    marginBottom: 6,
    fontWeight: 'bold',
  },
  hint: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  previewContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  divider: {
    borderBottomWidth: 1,
    marginVertical: 8,
  },
  previewLabel: {
    fontSize: 13,
  },
  previewValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  previewButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  previewButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cancelButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});