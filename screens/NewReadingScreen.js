import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Alert,
  Keyboard,
} from 'react-native';
import { useDarkMode } from '../utils/darkModeContext';
import { showToast } from '../utils/toastUtils';
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

  // --- Util: toast seguro (si no hay Toast montado, usa Alert) ---
  const safeToast = useCallback((message, type = 'info') => {
    try {
      showToast(message, type);
    } catch {
      const title =
        type === 'error' ? 'Error' : type === 'warning' ? 'Atención' : 'Información';
      Alert.alert(title, message);
    }
  }, []);

  useEffect(() => {
    loadMeterData();
  }, []);

  const loadMeterData = useCallback(async () => {
    try {
      const user = getCurrentUser();
      if (!user?.uid) return;
      const userMeters = await getUserMeters(user.uid);
      const meter = userMeters.find((m) => m.id === meterId);
      setMeterData(meter || null);
    } catch (error) {
      console.log('Error loading meter data:', error);
      safeToast('No se pudo cargar el medidor', 'error');
    }
  }, [meterId, safeToast]);

  const validateReading = useCallback(
    (value) => {
      const raw = (value || '').toString().trim();
      if (!raw) {
        safeToast('Por favor ingresa la lectura', 'error');
        return false;
      }

      // Acepta coma decimal
      const parsed = parseFloat(raw.replace(',', '.'));
      if (!Number.isFinite(parsed)) {
        safeToast('La lectura debe ser un número válido', 'error');
        return false;
      }

      if (parsed <= 0) {
        safeToast('La lectura debe ser mayor a 0', 'error');
        return false;
      }

      if (!meterData) {
        safeToast('Medidor no disponible aún', 'warning');
        return false;
      }

      if (parsed <= meterData.lastReading) {
        safeToast(
          `La lectura debe ser mayor a ${meterData.lastReading} kWh (lectura anterior)`,
          'error'
        );
        return false;
      }

      if (parsed > meterData.lastReading + 5000) {
        safeToast('La lectura parece demasiado alta. ¿Estás seguro?', 'warning');
        return false;
      }

      return true;
    },
    [meterData, safeToast]
  );

  const handleAddReading = useCallback(async () => {
    if (!validateReading(readingValue) || !meterData) return;

    // cierra teclado para mejor UX
    Keyboard.dismiss();
    setLoading(true);

    try {
      const user = getCurrentUser();
      if (!user?.uid) throw new Error('Usuario no autenticado');

      const currentReading = parseFloat(readingValue.replace(',', '.'));
      const consumption = calculateConsumption(meterData.lastReading, currentReading);
      const costPerKwh = Number(meterData.costPerKwh || 0);
      const cost = calculateCost(consumption, costPerKwh);

      const readingData = {
        value: currentReading,
        consumption,
        cost,
        costPerKwh,
      };

      await addReading(user.uid, meterId, readingData);
      await updateMeter(user.uid, meterId, {
        lastReading: currentReading,
        lastCost: cost,
      });

      // feedback + volver atrás
      safeToast('Lectura registrada correctamente', 'success');
      setTimeout(() => navigation.goBack(), 250);
    } catch (error) {
      console.log('Error adding reading:', error);
      safeToast(`Error: ${error?.message || 'No se pudo guardar'}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [validateReading, readingValue, meterData, meterId, navigation, safeToast]);

  const handlePreview = useCallback(() => {
    if (!validateReading(readingValue) || !meterData) return;

    const currentReading = parseFloat(readingValue.replace(',', '.'));
    const consumption = calculateConsumption(meterData.lastReading, currentReading);
    const costPerKwh = Number(meterData.costPerKwh || 0);
    const cost = calculateCost(consumption, costPerKwh);

    setPreview({
      lastReading: meterData.lastReading,
      currentReading,
      consumption,
      cost,
      costPerKwh,
    });
  }, [validateReading, readingValue, meterData]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.PRIMARY }]}>Nueva Lectura</Text>
            <Text style={[styles.subtitle, { color: colors.TEXT_LIGHT }]}>
              Ingresa el valor actual del medidor
            </Text>
          </View>

          {meterData && (
            <View
              style={[
                styles.infoBox,
                {
                  backgroundColor: colors.CARD,
                  borderColor: colors.BORDER,
                },
              ]}
            >
              <Text style={[styles.infoLabel, { color: colors.TEXT_LIGHT }]}>
                Última lectura registrada:
              </Text>
              <Text style={[styles.infoValue, { color: colors.PRIMARY }]}>
                {meterData.lastReading} kWh
              </Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.TEXT_DARK }]}>Lectura actual (kWh)</Text>
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
              returnKeyType="done"
              onSubmitEditing={handlePreview}
            />
            <Text style={[styles.hint, { color: colors.TEXT_LIGHT }]}>
              Lectura tomada: {moment().format('DD/MM/YYYY HH:mm')}
            </Text>
          </View>

          {preview && (
            <View
              style={[
                styles.previewContainer,
                {
                  backgroundColor: colors.CARD,
                  borderColor: colors.PRIMARY,
                },
              ]}
            >
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

              <View style={[styles.divider, { borderColor: colors.BORDER }]} />

              <View style={styles.previewRow}>
                <Text style={[styles.previewLabel, { color: colors.TEXT_LIGHT }]}>Consumo:</Text>
                <Text style={[styles.previewValue, { color: colors.ACCENT, fontWeight: 'bold' }]}>
                  {preview.consumption} kWh
                </Text>
              </View>

              <View style={styles.previewRow}>
                <Text style={[styles.previewLabel, { color: colors.TEXT_LIGHT }]}>Tarifa:</Text>
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
              style={[styles.previewButton, { backgroundColor: colors.ACCENT }]}
              onPress={handlePreview}
              disabled={loading || !meterData}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={colors.WHITE} />
              ) : (
                <Text style={[styles.previewButtonText, { color: colors.WHITE }]}>
                  👁️ Ver cálculo
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.PRIMARY }, loading && styles.buttonDisabled]}
              onPress={handleAddReading}
              disabled={loading || !meterData}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={colors.WHITE} />
              ) : (
                <Text style={[styles.saveButtonText, { color: colors.WHITE }]}>✓ Guardar lectura</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: colors.PRIMARY }]}
            onPress={() => navigation.goBack()}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={[styles.cancelButtonText, { color: colors.PRIMARY }]}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  content: { padding: 16 },

  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14 },

  infoBox: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderLeftWidth: 4, // color dinámico por prop (borderColor)
  },
  infoLabel: { fontSize: 12, marginBottom: 6 },
  infoValue: { fontSize: 18, fontWeight: 'bold' },

  section: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 18,
    borderWidth: 2,
    marginBottom: 6,
    fontWeight: 'bold',
  },
  hint: { fontSize: 12, fontStyle: 'italic' },

  previewContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4, // color dinámico por prop (borderColor)
  },
  previewTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 12 },
  previewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  divider: { borderBottomWidth: 1, marginVertical: 8 },
  previewLabel: { fontSize: 13 },
  previewValue: { fontSize: 14, fontWeight: '600' },

  buttons: { flexDirection: 'row', gap: 12, marginBottom: 12 },

  previewButton: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  previewButtonText: { fontSize: 14, fontWeight: 'bold' },

  saveButton: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  saveButtonText: { fontSize: 14, fontWeight: 'bold' },

  cancelButton: { borderWidth: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  cancelButtonText: { fontSize: 14, fontWeight: 'bold' },

  buttonDisabled: { opacity: 0.7 },
});
