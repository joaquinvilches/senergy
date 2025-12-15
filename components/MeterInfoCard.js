import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { formatKWh, formatCLP, parseChileanNumber, getNumberPlaceholder } from '../utils/formatHelpers';
import { ChileanNumberInput } from './ChileanNumberInput';
import { updateMeter } from '../services/meterService';
import { getCurrentUser } from '../services/authService';
import { showToast } from '../utils/toastUtils';
import { SPACING, TYPOGRAPHY, RADIUS, ELEVATION } from '../constants/theme';
import Icon from './Icon';

/**
 * Tarjeta con información básica del medidor seleccionado
 * Incluye opción para editar presupuesto mensual
 */
export const MeterInfoCard = ({ meter, colors, onBudgetUpdated }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [budgetInput, setBudgetInput] = useState(meter?.monthlyBudget?.toString() || '30000');
  const [saving, setSaving] = useState(false);

  if (!meter) return null;

  const handleSaveBudget = async () => {
    try {
      const newBudget = parseChileanNumber(budgetInput);

      if (newBudget === null || newBudget < 0) {
        Alert.alert('Error', 'Ingresa un presupuesto válido. Ejemplo: 30.000');
        return;
      }

      setSaving(true);
      const user = getCurrentUser();

      await updateMeter(user.uid, meter.id, {
        monthlyBudget: newBudget
      });

      setIsModalVisible(false);
      showToast('Presupuesto actualizado correctamente');

      // Llamar callback para actualizar la vista
      if (onBudgetUpdated) {
        onBudgetUpdated();
      }
    } catch (error) {
      console.error('Error al actualizar presupuesto:', error);
      Alert.alert('Error', 'No se pudo actualizar el presupuesto');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { borderColor: colors.BORDER }]}>
      <View style={[styles.infoBox, { backgroundColor: colors.CARD, borderLeftColor: colors.PRIMARY }]}>
        <View>
          <Text style={[styles.infoLabel, { color: colors.TEXT_LIGHT }]}>
            {meter.company} • {meter.region}
          </Text>
          <Text style={[styles.infoValue, { color: colors.PRIMARY }]}>
            Última lectura: {formatKWh(meter.lastReading, 0)}
          </Text>
        </View>
        <View style={styles.infoRight}>
          <Text style={[styles.infoCost, { color: colors.ACCENT }]}>
            {formatCLP(meter.lastCost)}
          </Text>
          <Text style={[styles.infoCostLabel, { color: colors.TEXT_LIGHT }]}>
            Último costo
          </Text>
        </View>
      </View>

      {/* Mostrar presupuesto mensual */}
      <View style={[styles.budgetInfo, { backgroundColor: colors.BACKGROUND }]}>
        <View style={styles.budgetRow}>
          <View style={styles.budgetHeader}>
            <Icon name="cash" size={14} color={colors.TEXT_LIGHT} style={styles.budgetIcon} />
            <Text style={[styles.budgetLabel, { color: colors.TEXT_LIGHT }]}>
              Presupuesto mensual:
            </Text>
          </View>
          <Text style={[styles.budgetValue, { color: colors.PRIMARY }]}>
            {meter.monthlyBudget ? formatCLP(meter.monthlyBudget) : 'No definido'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: colors.ACCENT }]}
          onPress={() => {
            setBudgetInput(meter.monthlyBudget?.toString() || '30000');
            setIsModalVisible(true);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.editButtonContent}>
            <Icon name="pencil-outline" size={12} color="#FFFFFF" style={styles.editButtonIcon} />
            <Text style={styles.editButtonText}>Editar</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Modal de edición de presupuesto */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.CARD }]}>
            <Text style={[styles.modalTitle, { color: colors.TEXT_DARK }]}>
              Editar Presupuesto Mensual
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.TEXT_LIGHT }]}>
              {meter.name}
            </Text>

            <View style={styles.inputContainer}>
              <ChileanNumberInput
                style={[styles.input, {
                  color: colors.TEXT_DARK,
                  borderColor: colors.BORDER,
                  backgroundColor: colors.BACKGROUND
                }]}
                value={budgetInput}
                onChangeValue={setBudgetInput}
                decimals={0}
                placeholder={getNumberPlaceholder('currency')}
                placeholderTextColor={colors.TEXT_LIGHT}
                autoFocus
                editable={!saving}
              />
              <Text style={[styles.inputUnit, { color: colors.TEXT_LIGHT }]}>CLP</Text>
            </View>

            <Text style={[styles.hint, { color: colors.TEXT_LIGHT }]}>
              Define el presupuesto máximo que deseas gastar al mes en este medidor
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { borderColor: colors.BORDER }]}
                onPress={() => setIsModalVisible(false)}
                disabled={saving}
                activeOpacity={0.7}
              >
                <Text style={[styles.cancelButtonText, { color: colors.TEXT_DARK }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.PRIMARY }]}
                onPress={handleSaveBudget}
                disabled={saving}
                activeOpacity={0.7}
              >
                <Text style={styles.saveButtonText}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
  },
  infoBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderLeftWidth: 4,
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginBottom: SPACING.xs,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  infoRight: {
    alignItems: 'flex-end',
  },
  infoCost: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.xs,
  },
  infoCostLabel: {
    fontSize: 10,
  },
  budgetInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  budgetRow: {
    flex: 1,
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetIcon: {
    marginRight: SPACING.xs,
  },
  budgetLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.xs,
  },
  budgetValue: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  editButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    marginLeft: SPACING.md,
  },
  editButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButtonIcon: {
    marginRight: SPACING.xs - 2,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    borderRadius: RADIUS.xl,
    padding: SPACING['2xl'],
    ...ELEVATION.lg,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.xs + 2,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    marginBottom: SPACING['2xl'],
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  input: {
    borderWidth: 2,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md + 2,
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    textAlign: 'center',
  },
  inputUnit: {
    fontSize: TYPOGRAPHY.sizes.base,
    textAlign: 'center',
    marginTop: SPACING.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  hint: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    marginBottom: SPACING['2xl'],
    lineHeight: TYPOGRAPHY.sizes.sm * TYPOGRAPHY.lineHeights.relaxed,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: SPACING.md + 2,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 2,
  },
  cancelButtonText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  saveButton: {},
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});