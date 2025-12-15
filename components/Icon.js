import React from 'react';
import {
  MaterialCommunityIcons,
  Ionicons,
  FontAwesome5,
  Feather,
  AntDesign
} from '@expo/vector-icons';
import { ICON_SIZES } from '../constants/theme';

/**
 * Componente Icon - Wrapper unificado para @expo/vector-icons
 *
 * @param {string} name - Nombre del icono
 * @param {string} family - Familia de iconos ('MaterialCommunityIcons', 'Ionicons', 'FontAwesome5', 'Feather', 'AntDesign')
 * @param {number|string} size - Tamaño del icono (número o 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl')
 * @param {string} color - Color del icono
 * @param {object} style - Estilos adicionales
 */
const Icon = ({
  name,
  family = 'MaterialCommunityIcons',
  size = 'md',
  color = '#000',
  style,
  ...props
}) => {
  // Convertir size string a número
  const iconSize = typeof size === 'string' ? ICON_SIZES[size] || ICON_SIZES.md : size;

  // Seleccionar familia de iconos
  let IconComponent;
  switch (family) {
    case 'Ionicons':
      IconComponent = Ionicons;
      break;
    case 'FontAwesome5':
      IconComponent = FontAwesome5;
      break;
    case 'Feather':
      IconComponent = Feather;
      break;
    case 'AntDesign':
      IconComponent = AntDesign;
      break;
    case 'MaterialCommunityIcons':
    default:
      IconComponent = MaterialCommunityIcons;
      break;
  }

  return (
    <IconComponent
      name={name}
      size={iconSize}
      color={color}
      style={style}
      {...props}
    />
  );
};

export default Icon;
