import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useDarkMode } from '../utils/darkModeContext';
import { showToast } from '../utils/toastUtils';
import { REGIONS, ELECTRICITY_COMPANIES, getCompaniesByRegion } from '../utils/constants';
import { createMeter } from '../services/meterService';
import { getCurrentUser } from '../services/authService';

export const RegisterMeterScreen = ({ navigation }) => {
  const { colors } = useDarkMode();
  const [meterName, setMeterName] = useState('');
  const [initialReading, setInitialReading] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('Metropolitana');
  const [selectedCompanyKey, setSelectedCompanyKey] = useState('ENEL_RM');
  const [loading, setLoading] = useState(false);

  // Obtener empresas para la región seleccionada
  const companiesForRegion = getCompaniesByRegion(selectedRegion);

  // Cuando cambia la región, resetear la empresa seleccionada
  React.useEffect(() => {
    const companiesInRegion = getCompaniesByRegion(selectedRegion);
    if (companiesInRegion.length > 0) {
      setSelectedCompanyKey(companiesInRegion[0].key);
    }
  }, [selectedRegion]);

  const handleCreateMeter = async () => {
    console.log('Intentando crear medidor...');

    if (!meterName.trim() || !initialReading.trim()) {
      showToast('Por favor completa todos los campos', 'error');
      return;
    }

    if (isNaN(initialReading)) {
      showToast('La lectura inicial debe ser un número', 'error');
      return;
    }

    setLoading(true);

    try {
      const user = getCurrentUser();
      console.log('Usuario actual:', user?.uid);

      if (!user) {
        showToast('No hay usuario autenticado', 'error');
        setLoading(false);
        return;
      }

      // Obtener datos de la empresa seleccionada
      const selectedCompany = ELECTRICITY_COMPANIES[selectedCompanyKey];

      if (!selectedCompany) {
        showToast('Empresa seleccionada no válida', 'error');
        setLoading(false);
        return;
      }

      const meterData = {
        name: meterName.trim(),
        company: selectedCompany.name,
        region: selectedRegion,
        costPerKwh: selectedCompany.costPerKwh,
        initialReading: parseFloat(initialReading),
        lastReading: parseFloat(initialReading),
        lastCost: 0,
      };

      console.log('Datos del medidor:', meterData);

      const meterId = await createMeter(user.uid, meterData);
      console.log('Medidor creado con ID:', meterId);

      showToast('Medidor creado correctamente', 'success');
      navigation.goBack();
    } catch (error) {
      console.log('Error creating meter:', error);
      showToast(`Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Encabezado */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.PRIMARY }]}>Nuevo Medidor</Text>
            <Text style={[styles.subtitle, { color: colors.TEXT_LIGHT }]}>
              Agrega los datos de tu medidor de electricidad
            </Text>
          </View>

          {/* Formulario */}
          <View style={styles.form}>
            {/* Nombre del medidor */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.TEXT_DARK }]}>
                Nombre del medidor
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
                placeholder="Ej: Casa, Departamento, Oficina"
                placeholderTextColor={colors.TEXT_LIGHT}
                value={meterName}
                onChangeText={setMeterName}
                editable={!loading}
              />
              <Text style={[styles.hint, { color: colors.TEXT_LIGHT }]}>
                Dale un nombre único para identificarlo fácilmente
              </Text>
            </View>

            {/* Lectura Inicial */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.TEXT_DARK }]}>
                Lectura inicial (kWh)
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
                placeholder="Ej: 12345"
                placeholderTextColor={colors.TEXT_LIGHT}
                value={initialReading}
                onChangeText={setInitialReading}
                keyboardType="decimal-pad"
                editable={!loading}
              />
              <Text style={[styles.hint, { color: colors.TEXT_LIGHT }]}>
                Toma esta lectura del medidor analógico
              </Text>
            </View>

            {/* Región */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.TEXT_DARK }]}>Región</Text>
              <View style={[styles.pickerContainer, { backgroundColor: colors.WHITE }]}>
                <Picker
                  selectedValue={selectedRegion}
                  onValueChange={setSelectedRegion}
                  enabled={!loading}
                >
                  {Object.values(REGIONS).map((region) => (
                    <Picker.Item key={region} label={region} value={region} />
                  ))}
                </Picker>
              </View>
              <Text style={[styles.hint, { color: colors.TEXT_LIGHT }]}>
                Selecciona tu región
              </Text>
            </View>

            {/* Empresa */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.TEXT_DARK }]}>
                Empresa de electricidad
              </Text>
              <View style={[styles.pickerContainer, { backgroundColor: colors.WHITE }]}>
                <Picker
                  selectedValue={selectedCompanyKey}
                  onValueChange={setSelectedCompanyKey}
                  enabled={!loading}
                >
                  {companiesForRegion.map((company) => (
                    <Picker.Item
                      key={company.key}
                      label={company.name}
                      value={company.key}
                    />
                  ))}
                </Picker>
              </View>
              <Text style={[styles.hint, { color: colors.TEXT_LIGHT }]}>
                Costo: $
                {selectedCompanyKey && ELECTRICITY_COMPANIES[selectedCompanyKey]
                  ? ELECTRICITY_COMPANIES[selectedCompanyKey].costPerKwh
                  : 220}
                /kWh
              </Text>
            </View>
          </View>

          {/* Botones */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.PRIMARY }]}
              onPress={() => navigation.goBack()}
              disabled={loading}
            >
              <Text style={[styles.cancelButtonText, { color: colors.PRIMARY }]}>
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.createButton,
                { backgroundColor: colors.PRIMARY },
                loading && styles.buttonDisabled,
              ]}
              onPress={handleCreateMeter}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.createButtonText}>Crear medidor</Text>
              )}
            </TouchableOpacity>
          </View>
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
    paddingBottom: 40,
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
  form: {
    marginBottom: 24,
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
    fontSize: 16,
    borderWidth: 1,
    marginBottom: 6,
  },
  pickerContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    marginBottom: 6,
  },
  hint: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 20,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  createButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});