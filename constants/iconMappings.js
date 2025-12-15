/**
 * Mapeo completo de emojis a iconos profesionales
 * Todos los iconos usan MaterialCommunityIcons por defecto (parte de @expo/vector-icons)
 */

export const ICON_MAP = {
  // Navegación principal
  home: 'lightning-bolt-outline',
  homeActive: 'lightning-bolt',
  stats: 'chart-line',
  statsActive: 'chart-box',
  profile: 'account-circle-outline',
  profileActive: 'account-circle',

  // Acciones comunes
  edit: 'pencil-outline',
  delete: 'trash-can-outline',
  add: 'plus',
  addCircle: 'plus-circle-outline',
  close: 'close',
  closeCircle: 'close-circle',
  check: 'check',
  checkCircle: 'check-circle',
  download: 'download-outline',
  upload: 'upload-outline',
  share: 'share-variant-outline',
  save: 'content-save-outline',
  refresh: 'refresh',

  // Estados y alertas
  success: 'check-circle',
  error: 'close-circle',
  warning: 'alert-circle',
  info: 'information',
  help: 'help-circle-outline',

  // Medidores y energía
  energy: 'flash',
  lightning: 'lightning-bolt',
  meter: 'gauge',
  gauge: 'gauge',
  reading: 'clipboard-text-outline',
  power: 'power',

  // Finanzas
  money: 'cash',
  wallet: 'wallet-outline',
  budget: 'currency-usd',
  savings: 'piggy-bank-outline',
  cost: 'cash-multiple',

  // Gráficos y estadísticas
  chart: 'chart-line',
  chartBar: 'chart-bar',
  chartPie: 'chart-pie',
  trendUp: 'trending-up',
  trendDown: 'trending-down',
  trendNeutral: 'minus',
  analytics: 'google-analytics',

  // Calendario y tiempo
  calendar: 'calendar-outline',
  clock: 'clock-outline',
  time: 'clock-time-four-outline',
  history: 'history',
  date: 'calendar-today',

  // Documentos y formularios
  document: 'file-document-outline',
  form: 'form-textbox',
  clipboard: 'clipboard-outline',
  note: 'note-outline',
  text: 'text',

  // Ubicación y empresa
  location: 'map-marker-outline',
  pin: 'pin-outline',
  building: 'office-building-outline',
  company: 'domain',
  home_building: 'home-outline',
  city: 'city',

  // Comunicación
  message: 'message-outline',
  chat: 'chat-outline',
  email: 'email-outline',
  send: 'send',
  feedback: 'comment-quote-outline',

  // Usuario y perfil
  user: 'account-outline',
  userCircle: 'account-circle-outline',
  users: 'account-group-outline',
  logout: 'logout',
  login: 'login',

  // Configuración y ayuda
  settings: 'cog-outline',
  darkMode: 'weather-night',
  lightMode: 'white-balance-sunny',
  about: 'information-outline',
  question: 'help-circle-outline',

  // Navegación y dirección
  arrowUp: 'arrow-up',
  arrowDown: 'arrow-down',
  arrowLeft: 'arrow-left',
  arrowRight: 'arrow-right',
  chevronUp: 'chevron-up',
  chevronDown: 'chevron-down',
  chevronLeft: 'chevron-left',
  chevronRight: 'chevron-right',

  // Media y contenido
  image: 'image-outline',
  camera: 'camera-outline',
  video: 'video-outline',
  file: 'file-outline',
  folder: 'folder-outline',

  // Misc
  star: 'star-outline',
  starFilled: 'star',
  heart: 'heart-outline',
  heartFilled: 'heart',
  eye: 'eye-outline',
  eyeOff: 'eye-off-outline',
  search: 'magnify',
  filter: 'filter-outline',
  sort: 'sort',
  menu: 'menu',
  dots: 'dots-vertical',
  dotsHorizontal: 'dots-horizontal',

  // Feedback types
  suggestion: 'lightbulb-outline',
  bug: 'bug-outline',
  feature: 'star-plus-outline',
  other: 'help-circle-outline',

  // Estados de medidor (reemplazo de 🔴🟡🟢)
  statusError: 'alert-circle',
  statusWarning: 'alert',
  statusSuccess: 'check-circle',
  statusInfo: 'information',

  // Números (reemplazo de emojis numéricos)
  number1: 'numeric-1-circle-outline',
  number2: 'numeric-2-circle-outline',
  number3: 'numeric-3-circle-outline',
  number4: 'numeric-4-circle-outline',
  number5: 'numeric-5-circle-outline',

  // Varios
  sparkle: 'shimmer',
  confetti: 'party-popper',
  celebration: 'party-popper',
  gift: 'gift-outline',
  trophy: 'trophy-outline',
  fire: 'fire',
  leaf: 'leaf',
  eco: 'leaf',
  recycle: 'recycle',
  earth: 'earth',
};

/**
 * Helper para obtener el nombre del icono desde el mapeo
 * @param {string} key - Clave del icono en ICON_MAP
 * @returns {string} - Nombre del icono para MaterialCommunityIcons
 */
export const getIconName = (key) => {
  return ICON_MAP[key] || 'help-circle-outline';
};

/**
 * Categorías de iconos para fácil referencia
 */
export const ICON_CATEGORIES = {
  navigation: ['home', 'stats', 'profile'],
  actions: ['edit', 'delete', 'add', 'save', 'share', 'download'],
  status: ['success', 'error', 'warning', 'info'],
  energy: ['energy', 'lightning', 'meter', 'reading'],
  financial: ['money', 'wallet', 'budget', 'savings'],
  charts: ['chart', 'chartBar', 'chartPie', 'trendUp', 'trendDown'],
};

export default ICON_MAP;
