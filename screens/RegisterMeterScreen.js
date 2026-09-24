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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { useDarkMode } from '../utils/darkModeContext';
import { showToast } from '../utils/toastUtils';
import { REGIONS, ELECTRICITY_COMPANIES, getCompaniesByRegion } from '../utils/constants';
import { createMeter, addReading } from '../services/meterService';
import { getCurrentUser } from '../services/authService';
import { parseChileanNumber, getNumberPlaceholder, formatChileanNumber } from '../utils/formatHelpers';
import { ChileanNumberInput } from '../components/ChileanNumberInput';
import { HelpIcon } from '../components/HelpIcon';
import { SPACING, TYPOGRAPHY, RADIUS } from '../constants/theme';
import Icon from '../components/Icon';
import Button from '../components/ui/Button';
import { useSubscription } from '../hooks/useSubscription';
import { Paywall } from '../components/Paywall';

export const RegisterMeterScreen = ({ navigation }) => {
  const { colors } = useDarkMode();
  const { checkCanCreateMeter } = useSubscription();
  const [meterName, setMeterName] = useState('');
  const [initialReading, setInitialReading] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('Metropolitana');
  const [selectedCompanyKey, setSelectedCompanyKey] = useState('ENEL_RM');
  const [monthlyBudget, setMonthlyBudget] = useState('30000'); // Presupuesto mensual en CLP
  const [loading, setLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallReason, setPaywallReason] = useState('');

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
    // Validar campos obligatorios
    if (!meterName.trim()) {
      showToast('Ingresa un nombre para identificar tu medidor (ej: "Medidor Casa", "Departamento 101")', 'error');
      return;
    }

    if (!initialReading.trim()) {
      showToast('Ingresa la lectura actual de tu medidor (el número que aparece en la pantalla)', 'error');
      return;
    }

    // Parsear lectura inicial con formato chileno
    const parsedInitialReading = parseChileanNumber(initialReading);
    if (parsedInitialReading === null || parsedInitialReading < 0) {
      showToast('La lectura inicial debe ser un número entero mayor o igual a 0. Ejemplo: 38245 o 38.245', 'error');
      return;
    }

    // Validar rango razonable para lectura inicial
    if (parsedInitialReading > 999999) {
      showToast('La lectura inicial parece demasiado alta. Verifica el valor ingresado.', 'error');
      return;
    }

    // Parsear presupuesto mensual
    const parsedBudget = monthlyBudget.trim() ? parseChileanNumber(monthlyBudget) : 30000;
    if (parsedBudget === null || parsedBudget < 0) {
      showToast('El presupuesto mensual debe ser un número válido mayor o igual a 0', 'error');
      return;
    }

    if (parsedBudget < 1000) {
      showToast('El presupuesto mensual parece muy bajo. ¿Estás seguro? El mínimo recomendado es $1.000', 'warning');
    }

    // VERIFICAR LÍMITE DE PLAN
    const canCreate = await checkCanCreateMeter();
    if (!canCreate.canCreate) {
      setPaywallReason(canCreate.reason);
      setShowPaywall(true);
      return;
    }

    setLoading(true);

    try {
      const user = getCurrentUser();

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
        initialReading: parsedInitialReading,
        lastReading: parsedInitialReading,
        lastCost: 0,
        monthlyBudget: parsedBudget,
      };

      // Crear el medidor
      const meterId = await createMeter(user.uid, meterData);

      // CRÍTICO: Guardar la lectura inicial como primer documento en readings
      // Esto permite tener historial completo desde el inicio
      await addReading(user.uid, meterId, {
        value: parsedInitialReading,
        consumption: 0, // La primera lectura no tiene consumo previo
        cost: 0,
        costPerKwh: selectedCompany.costPerKwh,
      });

      showToast('¡Medidor creado! Ya puedes registrar lecturas', 'success', 4000);
      navigation.goBack();
    } catch (error) {
      console.error('Error creating meter:', error);
      showToast(`Error al crear medidor: ${error.message}`, 'error');
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
              <View style={styles.labelRow}>
                <Icon name="pencil-outline" size={16} color={colors.PRIMARY} style={styles.labelIcon} />
                <Text style={[styles.label, { color: colors.TEXT_DARK }]}>
                  Nombre del medidor
                </Text>
              </View>
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
                Dale un nombre para identificarlo fácilmente
              </Text>
            </View>

            {/* Lectura Inicial */}
            <View style={styles.section}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="lightning-bolt" size={16} color={colors.PRIMARY} style={styles.labelIcon} />
                <Text style={[styles.label, { color: colors.TEXT_DARK }]}>
                  Valor inicial del medidor (punto de partida)
                </Text>
                <HelpIcon
                  title="¿Qué es la lectura inicial?"
                  message="La lectura inicial es el número ENTERO que aparece HOY en la pantalla de tu medidor de luz. Este valor es tu punto de partida. A partir de aquí, la app calculará cuánta electricidad consumes cada vez que registres una nueva lectura.\n\nEjemplo: Si tu medidor marca 38245, escribe ese número (puedes usar punto para miles: 38.245)."
                />
              </View>
              <ChileanNumberInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.WHITE,
                    color: colors.TEXT_DARK,
                    borderColor: colors.ACCENT,
                  },
                ]}
                placeholder={getNumberPlaceholder('kwh')}
                placeholderTextColor={colors.TEXT_LIGHT}
                value={initialReading}
                onChangeValue={setInitialReading}
                decimals={1}
                editable={!loading}
              />
              <Text style={[styles.hint, { color: colors.TEXT_LIGHT }]}>
                Este es el número que ves HOY en la pantalla de tu medidor de luz.{'\n'}
                A partir de este valor se calculará tu consumo.
              </Text>
            </View>

            {/* Región */}
            <View style={styles.section}>
              <View style={styles.labelRow}>
                <Icon name="map-marker-outline" size={16} color={colors.PRIMARY} style={styles.labelIcon} />
                <Text style={[styles.label, { color: colors.TEXT_DARK }]}>
                  Región de Chile
                </Text>
              </View>
              <View style={[styles.pickerContainer, { backgroundColor: colors.WHITE }]}>
                <Picker
                  selectedValue={selectedRegion}
                  onValueChange={setSelectedRegion}
                  enabled={!loading}
                  style={{ color: colors.TEXT_DARK }}
                  dropdownIconColor={colors.TEXT_DARK}
                  itemStyle={{ color: colors.TEXT_DARK }}
                >
                  {Object.values(REGIONS).map((region) => (
                    <Picker.Item
                      key={region}
                      label={region}
                      value={region}
                      color={colors.TEXT_DARK}
                      style={{ backgroundColor: colors.WHITE }}
                    />
                  ))}
                </Picker>
              </View>
              <Text style={[styles.hint, { color: colors.TEXT_LIGHT }]}>
                Selecciona la región donde está ubicado el medidor
              </Text>
            </View>

            {/* Empresa */}
            <View style={styles.section}>
              <View style={styles.labelRow}>
                <Icon name="office-building-outline" size={16} color={colors.PRIMARY} style={styles.labelIcon} />
                <Text style={[styles.label, { color: colors.TEXT_DARK }]}>
                  Compañía eléctrica
                </Text>
              </View>
              <View style={[styles.pickerContainer, { backgroundColor: colors.WHITE }]}>
                <Picker
                  selectedValue={selectedCompanyKey}
                  onValueChange={setSelectedCompanyKey}
                  enabled={!loading}
                  style={{ color: colors.TEXT_DARK }}
                  dropdownIconColor={colors.TEXT_DARK}
                  itemStyle={{ color: colors.TEXT_DARK }}
                >
                  {companiesForRegion.map((company) => (
                    <Picker.Item
                      key={company.key}
                      label={company.name}
                      value={company.key}
                      color={colors.TEXT_DARK}
                      style={{ backgroundColor: colors.WHITE }}
                    />
                  ))}
                </Picker>
              </View>
              <Text style={[styles.hint, { color: colors.TEXT_LIGHT }]}>
                Tarifa actual: $
                {selectedCompanyKey && ELECTRICITY_COMPANIES[selectedCompanyKey]
                  ? formatChileanNumber(ELECTRICITY_COMPANIES[selectedCompanyKey].costPerKwh)
                  : '220'}{' '}
                por cada kWh consumido
              </Text>
            </View>

            {/* Presupuesto Mensual */}
            <View style={styles.section}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="cash" size={16} color={colors.PRIMARY} style={styles.labelIcon} />
                <Text style={[styles.label, { color: colors.TEXT_DARK }]}>
                  Presupuesto mensual (opcional)
                </Text>
                <HelpIcon
                  title="¿Para qué sirve el presupuesto?"
                  message="Define cuánto dinero quieres gastar como máximo al mes en electricidad. La app te avisará si te estás acercando a este límite o si lo superas, ayudándote a controlar tus gastos."
                />
              </View>
              <ChileanNumberInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.WHITE,
                    color: colors.TEXT_DARK,
                    borderColor: colors.ACCENT,
                  },
                ]}
                placeholder={getNumberPlaceholder('currency')}
                placeholderTextColor={colors.TEXT_LIGHT}
                value={monthlyBudget}
                onChangeValue={setMonthlyBudget}
                decimals={0}
                editable={!loading}
              />
              <Text style={[styles.hint, { color: colors.TEXT_LIGHT }]}>
                ¿Cuánto quieres gastar como máximo al mes? Te avisaremos si te pasas.{'\n'}
                Déjalo vacío si no quieres poner un límite.
              </Text>
            </View>
          </View>

          {/* Botones */}
          <View style={styles.buttons}>
            <View style={styles.buttonWrapper}>
              <Button
                title="Cancelar"
                onPress={() => navigation.goBack()}
                variant="outline"
                size="md"
                disabled={loading}
                fullWidth
              />
            </View>

            <View style={styles.buttonWrapper}>
              <Button
                title="Crear medidor"
                onPress={handleCreateMeter}
                variant="primary"
                size="md"
                iconLeft="plus-circle-outline"
                loading={loading}
                disabled={loading}
                fullWidth
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Paywall para upgrade a Premium */}
      <Paywall
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onUpgrade={() => {
          setShowPaywall(false);
          navigation.navigate('Pricing', {
            feature: 'medidores ilimitados',
            onUpgrade: () => {
              // Después de activar premium, cerrar Pricing
              navigation.goBack();
            },
          });
        }}
        feature="medidores ilimitados"
        reason={paywallReason}
      />
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
    padding: SPACING.lg,
    paddingBottom: SPACING['4xl'],
  },
  header: {
    marginBottom: SPACING['2xl'],
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['3xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
  },
  form: {
    marginBottom: SPACING['2xl'],
  },
  section: {
    marginBottom: SPACING.xl,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  labelIcon: {
    marginRight: SPACING.xs,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.sm,
  },
  input: {
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md + 2,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.lg,
    borderWidth: 1,
    marginBottom: SPACING.xs + 2,
  },
  pickerContainer: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    marginBottom: SPACING.xs + 2,
  },
  hint: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontStyle: 'italic',
  },
  buttons: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  buttonWrapper: {
    flex: 1,
  },
});