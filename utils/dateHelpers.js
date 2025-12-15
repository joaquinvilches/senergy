/**
 * Utilidades centralizadas para manejo seguro de fechas de Firestore
 * Previene crashes por fechas null/undefined o formatos inconsistentes
 */

/**
 * Convierte una fecha de Firestore a objeto Date de manera segura
 * @param {any} firestoreDate - Fecha en formato de Firestore (Timestamp, objeto con seconds, o Date)
 * @param {Date|null} fallback - Valor de retorno si la fecha es inválida (default: null)
 * @returns {Date|null} Objeto Date válido o el fallback especificado
 */
export const safeToDate = (firestoreDate, fallback = null) => {
  // Caso 1: fecha es null, undefined o inválida
  if (!firestoreDate) {
    return fallback;
  }

  try {
    // Caso 2: Firestore Timestamp con método toDate()
    if (typeof firestoreDate.toDate === 'function') {
      const date = firestoreDate.toDate();
      return isValidDate(date) ? date : fallback;
    }

    // Caso 3: Objeto con propiedad seconds (formato Firestore serializado)
    if (firestoreDate.seconds !== undefined) {
      const date = new Date(firestoreDate.seconds * 1000);
      return isValidDate(date) ? date : fallback;
    }

    // Caso 4: Ya es un objeto Date
    if (firestoreDate instanceof Date) {
      return isValidDate(firestoreDate) ? firestoreDate : fallback;
    }

    // Caso 5: String o número que puede ser parseado
    const date = new Date(firestoreDate);
    return isValidDate(date) ? date : fallback;
  } catch (error) {
    console.warn('Error al convertir fecha de Firestore:', error);
    return fallback;
  }
};

/**
 * Valida si una fecha es válida
 * @param {Date} date - Fecha a validar
 * @returns {boolean} true si la fecha es válida
 */
export const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Convierte fecha de Firestore a Date con fallback a fecha actual
 * Útil cuando DEBE retornar una fecha válida
 * @param {any} firestoreDate - Fecha de Firestore
 * @returns {Date} Fecha válida (nunca null)
 */
export const toDateOrNow = (firestoreDate) => {
  return safeToDate(firestoreDate, new Date());
};

/**
 * Convierte fecha de Firestore a timestamp (milisegundos)
 * @param {any} firestoreDate - Fecha de Firestore
 * @param {number|null} fallback - Valor de retorno si la fecha es inválida
 * @returns {number|null} Timestamp en milisegundos
 */
export const toTimestamp = (firestoreDate, fallback = null) => {
  const date = safeToDate(firestoreDate);
  return date ? date.getTime() : fallback;
};

/**
 * Compara dos fechas de Firestore
 * @param {any} date1 - Primera fecha
 * @param {any} date2 - Segunda fecha
 * @returns {number} -1 si date1 < date2, 0 si son iguales, 1 si date1 > date2, null si alguna es inválida
 */
export const compareDates = (date1, date2) => {
  const d1 = safeToDate(date1);
  const d2 = safeToDate(date2);

  if (!d1 || !d2) return null;

  const t1 = d1.getTime();
  const t2 = d2.getTime();

  if (t1 < t2) return -1;
  if (t1 > t2) return 1;
  return 0;
};

/**
 * Obtiene el mes y año en formato YYYY-MM de una fecha de Firestore
 * @param {any} firestoreDate - Fecha de Firestore
 * @param {string|null} fallback - Valor de retorno si la fecha es inválida
 * @returns {string|null} Mes en formato YYYY-MM
 */
export const getMonthYear = (firestoreDate, fallback = null) => {
  const date = safeToDate(firestoreDate);
  if (!date) return fallback;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * Formatea una fecha de Firestore según el formato especificado
 * Requiere moment si se usa, pero también funciona con formato nativo
 * @param {any} firestoreDate - Fecha de Firestore
 * @param {string} format - Formato deseado (e.g., 'DD/MM/YYYY', 'YYYY-MM-DD')
 * @param {string|null} fallback - Valor de retorno si la fecha es inválida
 * @returns {string|null} Fecha formateada o fallback
 */
export const formatFirestoreDate = (firestoreDate, format = 'DD/MM/YYYY', fallback = null) => {
  const date = safeToDate(firestoreDate);
  if (!date) return fallback;

  // Formatos básicos sin dependencia de moment
  if (format === 'DD/MM/YYYY') {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  if (format === 'DD/MM/YYYY HH:mm') {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  if (format === 'YYYY-MM-DD') {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }

  if (format === 'YYYY-MM') {
    return getMonthYear(date);
  }

  // Para otros formatos, retornar ISO string o usar moment si está disponible
  return date.toISOString();
};

/**
 * Obtiene la fecha más reciente entre varias fechas de Firestore
 * @param {...any} dates - Fechas de Firestore
 * @returns {Date|null} La fecha más reciente o null si todas son inválidas
 */
export const getLatestDate = (...dates) => {
  const validDates = dates
    .map(d => safeToDate(d))
    .filter(d => d !== null);

  if (validDates.length === 0) return null;

  return new Date(Math.max(...validDates.map(d => d.getTime())));
};

/**
 * Calcula la diferencia en días entre dos fechas de Firestore
 * @param {any} date1 - Primera fecha
 * @param {any} date2 - Segunda fecha
 * @returns {number|null} Diferencia en días (puede ser negativa) o null si alguna fecha es inválida
 */
export const getDaysDifference = (date1, date2) => {
  const d1 = safeToDate(date1);
  const d2 = safeToDate(date2);

  if (!d1 || !d2) return null;

  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};
