// src/utils/themeHelpers.js

/**
 * Convierte hex a rgba. Soporta:
 *  - #rgb
 *  - #rrggbb
 *  - #rrggbbaa (alfa embebido)
 * Si llega algo inválido, retorna negro con la opacidad indicada.
 */
export const hexToRgba = (hex, opacity = 1) => {
  if (!hex || typeof hex !== 'string') return `rgba(0,0,0,${opacity})`;

  let h = hex.replace('#', '').trim();

  // #rgb -> #rrggbb
  if (h.length === 3) {
    h = h.split('').map(c => c + c).join('');
  }

  // #rrggbbaa (alfa al final)
  if (h.length === 8) {
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    const a = parseInt(h.slice(6, 8), 16) / 255;
    const alpha = Number.isFinite(opacity) ? (opacity * a) : a;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // #rrggbb
  if (h.length === 6) {
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  return `rgba(0,0,0,${opacity})`;
};

/** Restringe un número al rango [min, max] */
export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/** Formatea 1200 -> 1.2k, 1_200_000 -> 1.2M */
export const formatNumberShort = (num, decimals = 1) => {
  const n = Number(num || 0);
  if (n >= 1e9) return `${(n / 1e9).toFixed(decimals)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(decimals)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(decimals)}k`;
  return `${n}`;
};
