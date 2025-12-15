import React, { useState, useEffect } from 'react';
import { TextInput } from 'react-native';
import { formatChileanNumber, parseChileanNumber } from '../utils/formatHelpers';

/**
 * TextInput que formatea automáticamente números al estilo chileno
 * Mientras escribes "30000" → se muestra "30.000"
 * Mientras escribes "38245,5" → se muestra "38.245,5"
 *
 * Props:
 * - value: El valor sin formatear (string)
 * - onChangeValue: Callback que recibe el valor parseado (number)
 * - decimals: Cantidad de decimales permitidos (default: 0)
 * - ...rest: Todas las props de TextInput normal
 */
export const ChileanNumberInput = ({
  value,
  onChangeValue,
  decimals = 0,
  ...rest
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Sincronizar valor externo con display
  useEffect(() => {
    if (!isFocused && value) {
      const parsed = parseChileanNumber(value);
      if (parsed !== null) {
        setDisplayValue(formatChileanNumber(parsed, decimals));
      } else {
        setDisplayValue(value);
      }
    }
  }, [value, isFocused, decimals]);

  const handleChangeText = (text) => {
    // Permitir campo vacío
    if (!text || text === '') {
      setDisplayValue('');
      onChangeValue?.('');
      return;
    }

    // Remover todo excepto números, puntos y comas
    let cleaned = text.replace(/[^\d.,]/g, '');

    // Prevenir múltiples comas (solo 1 coma permitida)
    const commaCount = (cleaned.match(/,/g) || []).length;
    if (commaCount > 1) {
      return; // No permitir entrada
    }

    // Si hay coma, validar decimales
    if (cleaned.includes(',')) {
      const [intPart, decPart] = cleaned.split(',');
      if (decPart && decPart.length > decimals) {
        return; // No permitir más decimales de los especificados
      }
    }

    // Mientras está enfocado, permitir escribir libremente sin formateo
    // Solo validar que sea parseable
    const parsed = parseChileanNumber(cleaned);

    if (parsed !== null || cleaned.endsWith(',') || cleaned.endsWith('.')) {
      setDisplayValue(cleaned);
      onChangeValue?.(cleaned);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Al enfocar, remover formato para edición más fácil
    if (displayValue) {
      // Remover todos los puntos (separadores de miles)
      const withoutThousands = displayValue.replace(/\./g, '');
      setDisplayValue(withoutThousands);
    }
    rest.onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Al desenfocar, formatear completamente
    if (displayValue) {
      const parsed = parseChileanNumber(displayValue);
      if (parsed !== null) {
        setDisplayValue(formatChileanNumber(parsed, decimals));
      }
    }
    rest.onBlur?.();
  };

  return (
    <TextInput
      {...rest}
      value={displayValue}
      onChangeText={handleChangeText}
      onFocus={handleFocus}
      onBlur={handleBlur}
      keyboardType="decimal-pad"
    />
  );
};

export default ChileanNumberInput;
