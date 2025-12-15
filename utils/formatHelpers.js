/**
 * Helpers para formateo de números estilo chileno
 * Formato: 113.335$ (punto para miles, coma para decimales)
 */

/**
 * Formatea un número con separador de miles (punto) y decimales (coma)
 * Ejemplo: 38245.5 → "38.245,5"
 * @param {number} num - Número a formatear
 * @param {number} decimals - Cantidad de decimales (default: 0)
 * @returns {string} - Número formateado estilo chileno
 */
export const formatChileanNumber = (num, decimals = 0) => {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }

  const fixed = Number(num).toFixed(decimals);
  const [integerPart, decimalPart] = fixed.split('.');

  // Formatear parte entera con puntos cada 3 dígitos
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  // Si hay decimales, agregarlos con coma
  if (decimals > 0 && decimalPart) {
    return `${formattedInteger},${decimalPart}`;
  }

  return formattedInteger;
};

/**
 * Formatea kWh con formato chileno
 * Ejemplo: 38245.5 → "38.245,5 kWh"
 * @param {number} kwh - Cantidad de kWh
 * @param {number} decimals - Decimales a mostrar (default: 1)
 * @returns {string} - kWh formateado
 */
export const formatKWh = (kwh, decimals = 1) => {
  return `${formatChileanNumber(kwh, decimals)} kWh`;
};

/**
 * Formatea pesos chilenos con formato local
 * Ejemplo: 113335 → "$113.335"
 * @param {number} amount - Cantidad en pesos
 * @returns {string} - Pesos formateados
 */
export const formatCLP = (amount) => {
  return `$${formatChileanNumber(amount, 0)}`;
};

/**
 * Parsea entrada de usuario que puede tener puntos y/o comas
 * Convierte formato chileno a número
 * Ejemplos:
 * - "38.245" → 38245 (punto como separador de miles)
 * - "38.245,5" → 38245.5 (punto miles, coma decimal)
 * - "38,5" → 38.5 (coma como decimal)
 * - "38245" → 38245 (sin separadores)
 *
 * @param {string} input - String ingresado por el usuario
 * @returns {number|null} - Número parseado o null si inválido
 */
export const parseChileanNumber = (input) => {
  if (!input || typeof input !== 'string') {
    return null;
  }

  // Remover espacios
  let cleaned = input.trim();

  // Contar puntos y comas
  const dotCount = (cleaned.match(/\./g) || []).length;
  const commaCount = (cleaned.match(/,/g) || []).length;

  // Caso 1: Solo números (sin separadores)
  if (dotCount === 0 && commaCount === 0) {
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }

  // Caso 2: Tiene coma (formato chileno: punto=miles, coma=decimal)
  if (commaCount === 1) {
    // Remover puntos (separadores de miles)
    cleaned = cleaned.replace(/\./g, '');
    // Convertir coma a punto (decimal)
    cleaned = cleaned.replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }

  // Caso 3: Solo puntos (asumir separadores de miles o decimal)
  if (dotCount > 0 && commaCount === 0) {
    // Si hay múltiples puntos, son separadores de miles
    if (dotCount > 1) {
      cleaned = cleaned.replace(/\./g, '');
      const num = parseFloat(cleaned);
      return isNaN(num) ? null : num;
    }

    // Si hay un solo punto, verificar posición
    const parts = cleaned.split('.');

    // Si la parte decimal tiene 3 dígitos, es separador de miles
    if (parts[1] && parts[1].length === 3) {
      cleaned = cleaned.replace('.', '');
      const num = parseFloat(cleaned);
      return isNaN(num) ? null : num;
    }

    // Si la parte decimal tiene 1-2 dígitos, es decimal
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }

  // Caso 4: Tiene ambos (formato chileno completo)
  if (dotCount > 0 && commaCount > 0) {
    // Remover puntos (separadores de miles)
    cleaned = cleaned.replace(/\./g, '');
    // Convertir coma a punto (decimal)
    cleaned = cleaned.replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }

  return null;
};

/**
 * Valida que un string sea un número válido en formato chileno
 * @param {string} input - Input del usuario
 * @returns {boolean} - true si es válido
 */
export const isValidChileanNumber = (input) => {
  return parseChileanNumber(input) !== null;
};

/**
 * Formatea un input mientras el usuario escribe (para TextInput)
 * Convierte automáticamente a formato chileno
 * @param {string} input - Input actual
 * @returns {string} - Input formateado
 */
export const formatInputAsChilean = (input) => {
  const num = parseChileanNumber(input);
  if (num === null) return input;

  // No formatear mientras está escribiendo decimales
  if (input.endsWith(',') || input.endsWith('.')) {
    return input;
  }

  return formatChileanNumber(num, 0);
};

/**
 * Obtiene un placeholder de ejemplo para inputs numéricos
 * @param {string} type - Tipo: 'kwh' | 'currency' | 'number'
 * @returns {string} - Placeholder formateado
 */
export const getNumberPlaceholder = (type = 'number') => {
  switch (type) {
    case 'kwh':
      return 'Ej: 38.245 o 38.245,5';
    case 'currency':
      return 'Ej: 113.335';
    case 'number':
    default:
      return 'Ej: 12.500';
  }
};

/**
 * Formatea tarifa ($/kWh) en formato chileno
 * Ejemplo: 215 → "$215/kWh"
 * @param {number} rate - Tarifa por kWh
 * @returns {string} - Tarifa formateada
 */
export const formatRate = (rate) => {
  return `$${formatChileanNumber(rate, 0)}/kWh`;
};
