import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import moment from 'moment';
import { formatChileanNumber, formatCLP } from '../utils/formatHelpers';
import { safeToDate } from '../utils/dateHelpers';

// BOM (Byte Order Mark) para UTF-8 - necesario para que Excel reconozca tildes y ñ
const UTF8_BOM = '\uFEFF';

// Separador para CSV en Excel español (punto y coma funciona mejor que coma)
const CSV_SEPARATOR = ';';

/**
 * Convierte una fecha de Firestore a Date de manera segura
 * @deprecated Usar safeToDate de dateHelpers en su lugar
 */
const toDate = (date) => {
  const result = safeToDate(date);
  return result || new Date(); // Fallback a fecha actual solo para compatibilidad
};

/**
 * Convierte un array de lecturas a formato CSV
 */
const convertReadingsToCSV = (readings, meterName) => {
  // Encabezados
  const headers = ['Fecha', 'Lectura (kWh)', 'Consumo (kWh)', 'Costo ($)', 'Tarifa ($/kWh)'];

  // Filas de datos con formato chileno
  const rows = readings.map(reading => [
    moment(toDate(reading.date)).format('DD/MM/YYYY HH:mm'),
    formatChileanNumber(reading.value || 0, 0),
    formatChileanNumber(reading.consumption || 0, 0),
    formatChileanNumber(reading.cost || 0, 0),
    formatChileanNumber(reading.costPerKwh || 0, 0)
  ]);

  // Combinar encabezados y filas con BOM para UTF-8
  const csvContent = UTF8_BOM + [
    `Medidor${CSV_SEPARATOR} ${meterName}`,
    `Generado${CSV_SEPARATOR} ${moment().format('DD/MM/YYYY HH:mm')}`,
    '',
    headers.join(CSV_SEPARATOR),
    ...rows.map(row => row.join(CSV_SEPARATOR))
  ].join('\n');

  return csvContent;
};

/**
 * Convierte múltiples medidores y sus lecturas a formato CSV
 */
const convertAllDataToCSV = (meters, allReadings) => {
  const lines = [
    'REPORTE COMPLETO DE CONSUMO - SENERGY',
    `Generado${CSV_SEPARATOR} ${moment().format('DD/MM/YYYY HH:mm')}`,
    '',
    ['Fecha', 'Medidor', 'Lectura (kWh)', 'Consumo (kWh)', 'Costo ($)', 'Tarifa ($/kWh)'].join(CSV_SEPARATOR)
  ];

  // Agregar todas las lecturas de todos los medidores con formato chileno
  meters.forEach(meter => {
    const readings = allReadings[meter.id] || [];
    readings.forEach(reading => {
      lines.push([
        moment(toDate(reading.date)).format('DD/MM/YYYY HH:mm'),
        meter.name,
        formatChileanNumber(reading.value || 0, 0),
        formatChileanNumber(reading.consumption || 0, 0),
        formatChileanNumber(reading.cost || 0, 0),
        formatChileanNumber(reading.costPerKwh || 0, 0)
      ].join(CSV_SEPARATOR));
    });
  });

  return UTF8_BOM + lines.join('\n');
};

/**
 * Genera un reporte de texto formateado (pseudo-PDF)
 */
const generateTextReport = (meters, allReadings, stats) => {
  const lines = [
    '═══════════════════════════════════════════════════',
    '         REPORTE DE CONSUMO ENERGÉTICO - SENERGY',
    '═══════════════════════════════════════════════════',
    '',
    `Fecha de generación: ${moment().format('DD/MM/YYYY HH:mm')}`,
    '',
    '───────────────────────────────────────────────────',
    'RESUMEN GENERAL',
    '───────────────────────────────────────────────────',
    '',
    `Total de medidores: ${meters.length}`,
    `Consumo total: ${formatChileanNumber(stats.totalConsumption || 0, 0)} kWh`,
    `Costo total: ${formatCLP(stats.totalCost || 0)}`,
    `Promedio por lectura: ${formatChileanNumber(stats.avgConsumption || 0, 0)} kWh`,
    '',
    '───────────────────────────────────────────────────',
    'DETALLE POR MEDIDOR',
    '───────────────────────────────────────────────────',
    ''
  ];

  // Agregar detalles de cada medidor con formato chileno
  meters.forEach((meter, index) => {
    const readings = allReadings[meter.id] || [];
    const meterConsumption = readings.reduce((sum, r) => sum + (r.consumption || 0), 0);
    const meterCost = readings.reduce((sum, r) => sum + (r.cost || 0), 0);

    lines.push(`${index + 1}. ${meter.name.toUpperCase()}`);
    lines.push(`   Empresa: ${meter.company}`);
    lines.push(`   Región: ${meter.region}`);
    lines.push(`   Tarifa: $${formatChileanNumber(meter.costPerKwh || 0, 0)}/kWh`);
    lines.push(`   Lecturas registradas: ${readings.length}`);
    lines.push(`   Consumo acumulado: ${formatChileanNumber(meterConsumption, 0)} kWh`);
    lines.push(`   Costo acumulado: ${formatCLP(meterCost)}`);

    if (readings.length > 0) {
      const lastReading = readings[0];
      lines.push(`   Última lectura: ${moment(toDate(lastReading.date)).format('DD/MM/YYYY')}`);
      lines.push(`   - Valor: ${formatChileanNumber(lastReading.value || 0, 0)} kWh`);
      lines.push(`   - Consumo: ${formatChileanNumber(lastReading.consumption || 0, 0)} kWh`);
      lines.push(`   - Costo: ${formatCLP(lastReading.cost || 0)}`);
    }

    lines.push('');
  });

  lines.push('───────────────────────────────────────────────────');
  lines.push('Reporte generado con SENERGY');
  lines.push('App de monitoreo de consumo eléctrico');
  lines.push('═══════════════════════════════════════════════════');

  return UTF8_BOM + lines.join('\n');
};

/**
 * Exporta las lecturas de un medidor específico a CSV
 */
export const exportMeterReadingsToCSV = async (meterName, readings) => {
  try {
    if (!readings || readings.length === 0) {
      throw new Error('No hay lecturas para exportar');
    }

    const csvContent = convertReadingsToCSV(readings, meterName);
    const fileName = `senergy_${meterName.replace(/\s+/g, '_')}_${moment().format('YYYYMMDD_HHmmss')}.csv`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: 'utf8',
    });

    // Verificar si se puede compartir
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Exportar lecturas',
        UTI: 'public.comma-separated-values-text'
      });
    } else {
      throw new Error('La función de compartir no está disponible en este dispositivo');
    }

    return { success: true, fileName };
  } catch (error) {
    console.error('Error al exportar CSV:', error);
    throw error;
  }
};

/**
 * Exporta todos los datos a CSV
 */
export const exportAllDataToCSV = async (meters, allReadings) => {
  try {
    if (!meters || meters.length === 0) {
      throw new Error('No hay medidores para exportar');
    }

    const csvContent = convertAllDataToCSV(meters, allReadings);
    const fileName = `senergy_reporte_completo_${moment().format('YYYYMMDD_HHmmss')}.csv`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: 'utf8',
    });

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Exportar datos completos',
        UTI: 'public.comma-separated-values-text'
      });
    } else {
      throw new Error('La función de compartir no está disponible en este dispositivo');
    }

    return { success: true, fileName };
  } catch (error) {
    console.error('Error al exportar todos los datos:', error);
    throw error;
  }
};

/**
 * Genera y exporta un reporte de texto formateado
 */
export const exportTextReport = async (meters, allReadings, stats = {}) => {
  try {
    if (!meters || meters.length === 0) {
      throw new Error('No hay datos para generar el reporte');
    }

    const reportContent = generateTextReport(meters, allReadings, stats);
    const fileName = `senergy_reporte_${moment().format('YYYYMMDD_HHmmss')}.txt`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(fileUri, reportContent, {
      encoding: 'utf8',
    });

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/plain',
        dialogTitle: 'Exportar reporte',
        UTI: 'public.plain-text'
      });
    } else {
      throw new Error('La función de compartir no está disponible en este dispositivo');
    }

    return { success: true, fileName };
  } catch (error) {
    console.error('Error al exportar reporte de texto:', error);
    throw error;
  }
};

/**
 * Exporta estadísticas del período seleccionado
 */
export const exportStatsToCSV = async (filteredReadings, selectedPeriod, stats) => {
  try {
    if (!filteredReadings || filteredReadings.length === 0) {
      throw new Error('No hay datos para exportar');
    }

    const lines = [
      `ESTADÍSTICAS - PERÍODO${CSV_SEPARATOR} ${selectedPeriod}`,
      `Generado${CSV_SEPARATOR} ${moment().format('DD/MM/YYYY HH:mm')}`,
      '',
      '=== RESUMEN ===',
      `Consumo total${CSV_SEPARATOR} ${formatChileanNumber(stats.totalConsumption || 0, 0)} kWh`,
      `Costo total${CSV_SEPARATOR} ${formatCLP(stats.totalCost || 0)}`,
      `Promedio${CSV_SEPARATOR} ${formatChileanNumber(stats.averageConsumption || 0, 0)} kWh`,
      '',
      '=== DETALLE DE LECTURAS ===',
      ['Fecha', 'Medidor', 'Consumo (kWh)', 'Costo ($)'].join(CSV_SEPARATOR)
    ];

    filteredReadings.forEach(reading => {
      lines.push([
        moment(toDate(reading.date)).format('DD/MM/YYYY HH:mm'),
        reading.meterName || 'N/A',
        formatChileanNumber(reading.consumption || 0, 0),
        formatChileanNumber(reading.cost || 0, 0)
      ].join(CSV_SEPARATOR));
    });

    const csvContent = UTF8_BOM + lines.join('\n');
    const fileName = `senergy_stats_${selectedPeriod}_${moment().format('YYYYMMDD_HHmmss')}.csv`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: 'utf8',
    });

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Exportar estadísticas',
        UTI: 'public.comma-separated-values-text'
      });
    } else {
      throw new Error('La función de compartir no está disponible en este dispositivo');
    }

    return { success: true, fileName };
  } catch (error) {
    console.error('Error al exportar estadísticas:', error);
    throw error;
  }
};
