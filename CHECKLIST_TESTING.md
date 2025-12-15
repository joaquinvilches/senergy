# ✅ CHECKLIST DE TESTING - SENERGY

**Objetivo:** Probar todas las funcionalidades de la aplicación en dispositivos reales (iPhone y Android) antes del lanzamiento.

**Duración estimada:** 6-8 horas (3-4 horas por plataforma)

---

## 📱 PREPARACIÓN

### Requisitos:
- [ ] Dispositivo iPhone físico (iOS 13 o superior)
- [ ] Dispositivo Android físico (Android 8 o superior)
- [ ] App Expo Go instalada en ambos dispositivos
- [ ] Computadora conectada a la misma red WiFi que los dispositivos
- [ ] Aplicación corriendo con `npx expo start`

### Antes de Empezar:
- [ ] Crear 2 cuentas de prueba:
  - Cuenta 1: `test1@senergy.cl` (o tu email + 1)
  - Cuenta 2: `test2@senergy.cl` (para probar upgrade/downgrade)
- [ ] Tener a mano tu factura eléctrica para ingresar datos reales
- [ ] Bloc de notas para anotar bugs encontrados

---

## 🚀 SECCIÓN 1: AUTENTICACIÓN (15-20 min)

### 1.1 Registro de Usuario
- [ ] **iOS:** Abrir la app y tap en "Registrarse"
- [ ] **Android:** Abrir la app y tap en "Registrarse"
- [ ] Intentar registrarse sin llenar campos → Debe mostrar error
- [ ] Intentar con email inválido → Debe mostrar error
- [ ] Intentar con contraseña corta (< 6 caracteres) → Debe mostrar error
- [ ] Registrarse con datos válidos → Debe crear cuenta y entrar a la app
- [ ] Verificar que el nombre aparece correctamente en Profile

### 1.2 Login
- [ ] Cerrar sesión desde Perfil
- [ ] Intentar login con email incorrecto → Debe mostrar error
- [ ] Intentar login con contraseña incorrecta → Debe mostrar error
- [ ] Login con credenciales correctas → Debe entrar a la app
- [ ] Verificar que los datos persisten (no vuelve a pedir login al reabrir)

### 1.3 Persistencia de Sesión
- [ ] Cerrar la app completamente (swipe up)
- [ ] Reabrir la app → Debe mantener sesión iniciada
- [ ] Esperar 5 minutos con la app cerrada y reabrir → Debe mantener sesión

---

## ⚡ SECCIÓN 2: GESTIÓN DE MEDIDORES (30-40 min)

### 2.1 Agregar Primer Medidor (Usuario FREE)
- [ ] Tap en "Agregar Medidor" desde HomeScreen
- [ ] Dejar campos vacíos y tap "Guardar" → Debe mostrar errores
- [ ] Llenar datos válidos:
  - Número de medidor: (ej. 12345678)
  - Compañía eléctrica: Seleccionar de lista
  - Región: Seleccionar de lista
  - Tarifa: 150 (CLP/kWh)
- [ ] Tap "Guardar" → Debe crear medidor y volver a Home
- [ ] Verificar que el medidor aparece en la lista
- [ ] Verificar que muestra "0 lecturas"

### 2.2 Límite FREE - Intentar Agregar Segundo Medidor
- [ ] Tap en "Agregar Medidor" nuevamente
- [ ] **CRÍTICO:** Debe mostrar Paywall bloqueando (máx 1 medidor en FREE)
- [ ] Verificar que el mensaje dice "Plan FREE permite solo 1 medidor"
- [ ] Tap "Ver Planes" → Debe navegar a PricingScreen
- [ ] Volver atrás sin hacer upgrade

### 2.3 Ver Detalle de Medidor
- [ ] Tap en el medidor creado
- [ ] Verificar que muestra:
  - Número de medidor correcto
  - Compañía eléctrica correcta
  - Región correcta
  - Tarifa correcta
  - Lista de lecturas vacía
  - Mensaje "No hay lecturas registradas"

### 2.4 Editar Medidor
- [ ] Desde MeterDetailScreen, tap en "Editar" (ícono lápiz)
- [ ] Cambiar tarifa a 180 CLP/kWh
- [ ] Guardar cambios
- [ ] Verificar que el cambio se reflejó

### 2.5 Eliminar Medidor
- [ ] Desde MeterDetailScreen, tap en "Eliminar" (ícono basurero)
- [ ] Confirmar eliminación
- [ ] Verificar que vuelve a HomeScreen
- [ ] Verificar que el medidor ya no aparece en la lista
- [ ] **IMPORTANTE:** Crear el medidor nuevamente para continuar testing

---

## 📊 SECCIÓN 3: GESTIÓN DE LECTURAS (45-60 min)

### 3.1 Agregar Primera Lectura
- [ ] Desde MeterDetailScreen, tap "Nueva Lectura"
- [ ] Intentar guardar sin llenar → Debe mostrar errores
- [ ] Llenar datos:
  - Lectura actual: 1000 kWh
  - Fecha: Hoy
  - Nota: "Lectura de prueba 1" (opcional)
- [ ] Intentar capturar foto → **CRÍTICO:** Debe bloquearse (Premium only)
- [ ] Verificar mensaje "Captura de fotos solo en Premium"
- [ ] Tap "Guardar" sin foto → Debe crear lectura
- [ ] Verificar que aparece en la lista
- [ ] Verificar que muestra "Lectura inicial" (sin consumo calculado)

### 3.2 Agregar Segunda Lectura con Consumo
- [ ] Tap "Nueva Lectura" nuevamente
- [ ] Llenar datos:
  - Lectura actual: 1150 kWh (150 kWh más que la anterior)
  - Fecha: Hoy + 30 días (o usar selector)
  - Nota: "Lectura de prueba 2"
- [ ] Guardar
- [ ] **VERIFICAR CÁLCULOS:**
  - Consumo: Debe mostrar 150 kWh
  - Costo estimado: Debe mostrar ~$22,500 (150 kWh × 150 CLP)
  - Promedio diario: Debe calcular consumo/días
- [ ] Verificar que los números hacen sentido

### 3.3 Agregar Lecturas hasta Alcanzar Límite FREE
- [ ] Agregar lecturas adicionales con valores incrementales:
  - Lectura 3: 1300 kWh
  - Lectura 4: 1450 kWh
  - ... (continuar hasta lectura 20)
- [ ] **ATAJO:** Puedes usar un script o hacerlo manual
- [ ] Contar que tengas exactamente 20 lecturas

### 3.4 Límite FREE - Intentar Agregar Lectura 21
- [ ] Tap "Nueva Lectura"
- [ ] **CRÍTICO:** Debe mostrar Paywall bloqueando (máx 20 lecturas/mes en FREE)
- [ ] Verificar mensaje "Has alcanzado el límite de 20 lecturas mensuales"
- [ ] Tap "Actualizar a Premium" → Debe ir a PricingScreen
- [ ] Volver atrás

### 3.5 Editar Lectura
- [ ] Tap en cualquier lectura de la lista
- [ ] Cambiar valor (ej. de 1150 a 1200)
- [ ] Guardar
- [ ] Verificar que los cálculos se actualizaron correctamente

### 3.6 Eliminar Lectura
- [ ] Tap en la lectura recién editada
- [ ] Tap "Eliminar"
- [ ] Confirmar eliminación
- [ ] Verificar que desapareció de la lista
- [ ] Verificar que la cuenta de lecturas disminuyó

---

## 📈 SECCIÓN 4: ESTADÍSTICAS (30-40 min)

### 4.1 Ver Estadísticas Básicas (FREE)
- [ ] Ir a tab "Estadísticas"
- [ ] Verificar que muestra:
  - Selector de período (Mes, Trimestre, Año)
  - Gráfico de líneas (consumo por mes)
  - Estadísticas numéricas:
    - Consumo total
    - Promedio mensual
    - Costo estimado
- [ ] Cambiar período a "Trimestre" → Gráficos deben actualizarse
- [ ] Cambiar período a "Año" → Gráficos deben actualizarse

### 4.2 Intentar Exportar Datos (bloqueado en FREE)
- [ ] Buscar botón "Exportar" o similar
- [ ] Tap en exportar
- [ ] **CRÍTICO:** Debe mostrar Paywall (exportación solo Premium)
- [ ] Verificar mensaje claro
- [ ] Volver atrás sin hacer upgrade

### 4.3 Insights Inteligentes
- [ ] Verificar si aparecen insights al final de StatsScreen
- [ ] Si aparecen, verificar que hacen sentido (ej. "Tu consumo aumentó 15% este mes")
- [ ] Si no aparecen, está bien (pueden requerir más datos)

---

## 💎 SECCIÓN 5: SISTEMA PREMIUM (30-40 min)

### 5.1 Ver Planes y Comparación
- [ ] Ir a Perfil → Tap en badge "Plan FREE"
- [ ] O navegar a PricingScreen desde cualquier Paywall
- [ ] Verificar tabla comparativa:
  - FREE: 1 medidor, 20 lecturas/mes, sin fotos, sin exportación
  - PREMIUM: Todo ilimitado, fotos, exportación, $1.000/mes
- [ ] Verificar que el diseño se ve bien
- [ ] Verificar colores y badges ("Gratis", "Recomendado")

### 5.2 Upgrade a Premium (MODO DEMO)
- [ ] Tap "Actualizar a Premium"
- [ ] **NOTA:** Como no hay pasarela de pagos real, esto debería:
  - Simular el pago exitoso
  - Actualizar el plan a Premium
  - Mostrar mensaje de éxito
- [ ] Verificar que el badge en Perfil cambió a "Premium"
- [ ] Verificar fecha de expiración (30 días desde hoy)

### 5.3 Verificar Features Premium Desbloqueadas

#### 5.3.1 Medidores Ilimitados
- [ ] Ir a HomeScreen
- [ ] Tap "Agregar Medidor"
- [ ] **CRÍTICO:** NO debe aparecer Paywall
- [ ] Crear segundo medidor con datos diferentes
- [ ] Verificar que se creó exitosamente
- [ ] Repetir para crear medidor 3 → También debe funcionar

#### 5.3.2 Lecturas Ilimitadas
- [ ] Si tenías 20 lecturas en el primer medidor
- [ ] Agregar lectura 21, 22, 23...
- [ ] **CRÍTICO:** NO debe aparecer Paywall
- [ ] Todas las lecturas deben guardarse sin restricción

#### 5.3.3 Captura de Fotos
- [ ] Ir a cualquier medidor → Nueva Lectura
- [ ] Tap en "Capturar Foto"
- [ ] **CRÍTICO:** NO debe bloquearse
- [ ] **iOS:** Permitir acceso a cámara cuando lo pida
- [ ] **Android:** Permitir acceso a cámara cuando lo pida
- [ ] Tomar foto del medidor (o cualquier cosa)
- [ ] Verificar que la foto aparece en preview
- [ ] Guardar lectura con foto
- [ ] Verificar que la foto aparece en el detalle de la lectura
- [ ] **IMPORTANTE:** Verificar que la foto se subió a Cloudinary (debería cargar desde URL)

#### 5.3.4 Exportación de Datos
- [ ] Ir a StatsScreen
- [ ] Buscar botón "Exportar"
- [ ] Tap en exportar
- [ ] **CRÍTICO:** NO debe aparecer Paywall
- [ ] Debe generar y descargar archivo Excel
- [ ] Abrir el archivo Excel descargado
- [ ] Verificar que contiene:
  - Fecha de cada lectura
  - Valor de lectura
  - Consumo calculado
  - Costo estimado

### 5.4 Downgrade a FREE
- [ ] Ir a Perfil → Tap en badge "Premium"
- [ ] O ir a PricingScreen
- [ ] Tap "Cancelar Suscripción" o "Volver a FREE"
- [ ] Confirmar cancelación
- [ ] Verificar que el badge vuelve a "FREE"
- [ ] **VERIFICAR RESTRICCIONES VUELVEN:**
  - Intentar agregar medidor 4 → Debe bloquearse
  - Intentar capturar foto → Debe bloquearse
  - Intentar exportar → Debe bloquearse
- [ ] **IMPORTANTE:** Los medidores y lecturas creadas en Premium deben seguir existiendo

---

## 🎨 SECCIÓN 6: DARK MODE (15-20 min)

### 6.1 Cambiar a Dark Mode
- [ ] Ir a Perfil
- [ ] Buscar toggle de Dark Mode en SettingsSection
- [ ] Activar Dark Mode
- [ ] **VERIFICAR EN TODAS LAS PANTALLAS:**
  - [ ] HomeScreen - fondo oscuro, tarjetas visibles
  - [ ] MeterDetailScreen - texto legible, colores invertidos
  - [ ] NewReadingScreen - formulario legible
  - [ ] StatsScreen - gráficos visibles, colores apropiados
  - [ ] ProfileScreen - todo legible
  - [ ] PricingScreen - tarjetas visibles, texto claro

### 6.2 Persistencia de Dark Mode
- [ ] Dejar Dark Mode activado
- [ ] Cerrar la app completamente
- [ ] Reabrir la app
- [ ] Verificar que sigue en Dark Mode

### 6.3 Volver a Light Mode
- [ ] Desactivar Dark Mode
- [ ] Verificar que todo vuelve a colores claros

---

## 🔄 SECCIÓN 7: NAVEGACIÓN Y UX (20-30 min)

### 7.1 Navegación entre Tabs
- [ ] Ir a tab "Medidores" → Debe mostrar HomeScreen
- [ ] Ir a tab "Estadísticas" → Debe mostrar StatsScreen
- [ ] Ir a tab "Perfil" → Debe mostrar ProfileScreen
- [ ] Verificar que los íconos cambian correctamente (filled vs outline)
- [ ] Verificar que el tab activo está destacado

### 7.2 Navegación Stack
- [ ] Desde Home → Tap medidor → MeterDetail → Nueva Lectura
- [ ] Usar botón "Atrás" del header
- [ ] Verificar que vuelve a la pantalla anterior
- [ ] Verificar que el botón "Atrás" funciona en todas las pantallas

### 7.3 Pull to Refresh
- [ ] En HomeScreen, hacer swipe down desde arriba
- [ ] Debe aparecer spinner de refresh
- [ ] Lista de medidores debe recargarse
- [ ] Probar también en MeterDetailScreen

### 7.4 Empty States
- [ ] Eliminar todos los medidores
- [ ] Verificar que HomeScreen muestra empty state bonito
- [ ] Verificar mensaje de bienvenida
- [ ] Tap en CTA del empty state → Debe ir a RegisterMeter

### 7.5 Loading States
- [ ] Al entrar a cada pantalla, verificar que muestra loaders apropiados
- [ ] No deben verse pantallas en blanco
- [ ] Loaders deben ser consistentes (mismo color, tamaño)

---

## 🆘 SECCIÓN 8: FEATURES ADICIONALES (20-30 min)

### 8.1 Feedback
- [ ] Ir a Perfil → Tap "Enviar Feedback"
- [ ] Intentar enviar sin llenar → Debe mostrar error
- [ ] Seleccionar tipo: "Sugerencia"
- [ ] Escribir mensaje: "Esta es una prueba de feedback"
- [ ] Enviar
- [ ] Verificar mensaje de éxito
- [ ] **BACKEND:** Verificar que el feedback llegó a Firestore

### 8.2 Reportar Incidentes
- [ ] Ir a Perfil → Tap "Reportar Incidente"
- [ ] Seleccionar tipo: "Corte de suministro"
- [ ] Escribir descripción (mín 10 caracteres)
- [ ] Enviar
- [ ] Verificar mensaje de éxito
- [ ] Ir a "Ver Incidentes" → Debe aparecer en la lista

### 8.3 Ver Incidentes
- [ ] Ir a Perfil → Tap "Ver Incidentes"
- [ ] Verificar que aparece el incidente recién creado
- [ ] Verificar filtros por tipo (si existen)
- [ ] Tap en un incidente → Debe mostrar detalles

### 8.4 Términos y Privacidad
- [ ] Ir a Perfil → Scroll hasta el footer
- [ ] Tap "Términos y Privacidad"
- [ ] Verificar que abre LegalScreen
- [ ] Cambiar tab a "Política de Privacidad"
- [ ] Scroll y leer contenido → Debe ser legible
- [ ] Cambiar tab a "Términos de Servicio"
- [ ] Verificar que el contenido es correcto
- [ ] Tap botón "Atrás" → Debe volver a Perfil

---

## 🌐 SECCIÓN 9: CONECTIVIDAD (15-20 min)

### 9.1 Modo Offline
- [ ] Activar modo avión en el dispositivo
- [ ] **DEBE APARECER:** Banner "Sin conexión" en la parte superior
- [ ] Intentar navegar por la app
- [ ] Verificar qué funciona offline (lecturas cacheadas)
- [ ] Intentar crear nuevo medidor → Debe mostrar error de conexión
- [ ] Desactivar modo avión
- [ ] Banner debe desaparecer

### 9.2 Reconexión
- [ ] Con la app abierta, desactivar WiFi del dispositivo
- [ ] Esperar 5 segundos
- [ ] Reactivar WiFi
- [ ] Verificar que la app se reconecta automáticamente
- [ ] Intentar crear medidor → Debe funcionar

---

## 🐛 SECCIÓN 10: EDGE CASES Y BUGS (30-40 min)

### 10.1 Validaciones de Formularios

#### RegisterMeter:
- [ ] Intentar número de medidor con letras → Debe rechazar o limpiar
- [ ] Intentar tarifa negativa → Debe rechazar
- [ ] Intentar tarifa = 0 → Debe rechazar
- [ ] Intentar tarifa muy alta (ej. 999999) → Debe aceptar o mostrar warning

#### NewReading:
- [ ] Intentar lectura menor a la última → Debe mostrar warning o error
- [ ] Intentar fecha futura muy lejana (ej. 2030) → Debe mostrar warning
- [ ] Intentar lectura negativa → Debe rechazar
- [ ] Intentar lectura = 0 → Debe aceptar

### 10.2 Cálculos Incorrectos
- [ ] Crear lectura inicial: 1000 kWh
- [ ] Crear lectura 2: 1100 kWh (30 días después)
- [ ] **VERIFICAR:**
  - Consumo = 100 kWh ✅
  - Si tarifa es 150 CLP/kWh → Costo = $15,000 ✅
  - Promedio diario = 100/30 = 3.33 kWh/día ✅
- [ ] Si algo no cuadra → ANOTAR BUG

### 10.3 Límites de Plan
- [ ] Estando en FREE con 1 medidor, hacer upgrade a Premium
- [ ] Crear medidor 2
- [ ] Hacer downgrade a FREE
- [ ] **VERIFICAR:** Los 2 medidores siguen visibles (no se borran)
- [ ] **PERO:** No puedo crear medidor 3 (límite FREE)

### 10.4 Memoria y Performance
- [ ] Crear 10+ medidores (en Premium)
- [ ] Cada medidor con 50+ lecturas
- [ ] Navegar entre pantallas
- [ ] **VERIFICAR:**
  - App no se crashea
  - Scrolling fluido
  - Gráficos cargan rápido
  - No hay lag notable

### 10.5 Rotación de Pantalla
- [ ] Rotar dispositivo a landscape (horizontal)
- [ ] Verificar que las pantallas siguen viéndose bien
- [ ] Especialmente gráficos en StatsScreen
- [ ] Volver a portrait (vertical)

---

## 📸 SECCIÓN 11: CLOUDINARY (15-20 min)

### 11.1 Subir Foto
- [ ] (Requiere Premium)
- [ ] Nueva Lectura → Capturar Foto
- [ ] Tomar foto
- [ ] Verificar que se ve el preview
- [ ] Guardar lectura
- [ ] **VERIFICAR EN FIRESTORE:**
  - Debe tener campo `photoURL` con URL de Cloudinary
  - URL debe empezar con `https://res.cloudinary.com/`

### 11.2 Ver Foto
- [ ] Abrir lectura que tiene foto
- [ ] La foto debe cargarse y mostrarse
- [ ] Tap en la foto → Debe abrir en tamaño completo (si implementado)

### 11.3 Eliminar Lectura con Foto
- [ ] Eliminar una lectura que tiene foto
- [ ] Confirmar eliminación
- [ ] **IMPORTANTE:** La foto debería eliminarse de Cloudinary automáticamente
- [ ] **NOTA:** Esto requiere que Cloud Functions estén desplegadas
- [ ] Si las functions NO están desplegadas, la foto quedará huérfana (OK por ahora)

---

## 🔐 SECCIÓN 12: SEGURIDAD (10-15 min)

### 12.1 Aislamiento de Datos
- [ ] Login con cuenta 1 (test1@senergy.cl)
- [ ] Crear medidor y lecturas
- [ ] Cerrar sesión
- [ ] Login con cuenta 2 (test2@senergy.cl)
- [ ] **VERIFICAR:** NO debe ver medidores de cuenta 1
- [ ] Crear medidor diferente
- [ ] Cerrar sesión
- [ ] Login nuevamente con cuenta 1
- [ ] **VERIFICAR:** Solo ve sus propios medidores

### 12.2 Persistencia Segura
- [ ] Verificar que la contraseña NO se muestra en ningún lado
- [ ] Verificar que al editar perfil NO se puede cambiar email/password
- [ ] (Esas features no deberían existir aún)

---

## ✅ SECCIÓN 13: CHECKLIST FINAL

### iOS:
- [ ] Todas las funcionalidades probadas ✅
- [ ] Sin crashes ✅
- [ ] Performance aceptable ✅
- [ ] UI se ve bien en iPhone ✅

### Android:
- [ ] Todas las funcionalidades probadas ✅
- [ ] Sin crashes ✅
- [ ] Performance aceptable ✅
- [ ] UI se ve bien en Android ✅

### Bugs Encontrados:
```
Lista bugs aquí:
1. [Ejemplo] Gráfico de barras no se ve en dark mode → Prioridad ALTA
2. [Ejemplo] Botón exportar muy pequeño en Android → Prioridad BAJA
3. ...
```

### Features Faltantes Críticas:
```
Lista features bloqueantes:
1. [Ejemplo] Recuperación de contraseña NO implementada
2. ...
```

---

## 📋 CONCLUSIÓN

### Criterios para Aprobar Lanzamiento:
- [ ] 0 crashes en flujos principales (registro, login, CRUD medidores/lecturas)
- [ ] Restricciones FREE funcionan correctamente (1 medidor, 20 lecturas)
- [ ] Upgrade/Downgrade Premium funciona
- [ ] Dark mode funciona sin bugs visuales críticos
- [ ] Datos se persisten correctamente
- [ ] Navegación fluida sin bugs

### Si TODO lo anterior está ✅ → **LISTO PARA LANZAR** 🚀

### Si hay bugs encontrados:
- **Prioridad ALTA:** Bloquean el lanzamiento, deben arreglarse
- **Prioridad MEDIA:** Pueden lanzarse con ellos, pero arreglar pronto
- **Prioridad BAJA:** Mejoras futuras, no bloquean

---

**Última actualización:** 15 de diciembre de 2024
**Versión del checklist:** 1.0
