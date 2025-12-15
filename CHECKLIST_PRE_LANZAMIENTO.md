# 🚀 CHECKLIST PRE-LANZAMIENTO - SENERGY

## 📊 ESTADO GENERAL: 80% COMPLETO

---

## ⚠️ BLOQUEANTES CRÍTICOS - HACER ANTES DE LANZAR

### 🔴 SEGURIDAD CRÍTICA (30-60 min)

#### 1. GIRAR CREDENCIALES COMPROMETIDAS
**Problema:** API Keys y secrets están expuestos en el repositorio público

**Archivos afectados:**
- `.env` - Contiene Firebase API Key real
- `serviceAccountKey.json` - Credenciales completas de Admin SDK

**Acción INMEDIATA:**
```bash
# 1. Firebase API Key
# Ir a: https://console.firebase.google.com/project/senergy-46b1e/settings/general
# Sección: Web API Key
# Eliminar clave actual y generar nueva

# 2. Service Account Key
# Ir a: https://console.cloud.google.com/iam-admin/serviceaccounts?project=senergy-46b1e
# Crear nueva clave privada
# Descargar el JSON NUEVO
# NUNCA commitear este archivo

# 3. Cloudinary
# Ir a: https://cloudinary.com/console
# Settings > Security
# Regenerar API Key y API Secret

# 4. Actualizar .env con nuevas credenciales
# IMPORTANTE: .env NO debe estar en Git
git rm --cached .env
git rm --cached serviceAccountKey.json
git commit -m "Remove sensitive credentials"
```

**Tiempo estimado:** 30 minutos

---

#### 2. LIMPIAR REPOSITORIO (5 min)

**Archivos a ELIMINAR:**
```bash
# Archivos backup innecesarios
rm App.updated.js
rm screens/HomeScreen.backup.js
rm services/imageService.updated.js
rm nul

git add .
git commit -m "Remove backup files"
```

**Archivo a DECIDIR:**
- `screens/HomeScreen.refactored.js` - Si es mejor versión, reemplazar HomeScreen.js actual

**Tiempo estimado:** 5 minutos

---

#### 3. DESPLEGAR CLOUD FUNCTIONS (20 min)

**Problema:** La función para eliminar fotos de Cloudinary existe pero NO está desplegada

**Pasos:**

```bash
# 1. Crear functions/index.js
cd functions
npm init -y
npm install cloudinary firebase-functions firebase-admin

# 2. Crear index.js con el contenido de cloudinaryDelete.js
# (Copiar todo el código de cloudinaryDelete.js a index.js)

# 3. Configurar variables de Cloudinary en Firebase
firebase functions:config:set cloudinary.cloud_name="TU_NUEVO_CLOUD_NAME"
firebase functions:config:set cloudinary.api_key="TU_NUEVO_API_KEY"
firebase functions:config:set cloudinary.api_secret="TU_NUEVO_API_SECRET"

# 4. Desplegar
firebase deploy --only functions

# 5. Verificar que se desplegó
firebase functions:log
```

**Tiempo estimado:** 20 minutos

---

#### 4. DESPLEGAR ÍNDICES DE FIRESTORE (10 min)

**Problema:** Índices están definidos pero no desplegados = queries lentas

```bash
firebase deploy --only firestore:indexes

# Esperar a que terminen de crearse (puede tomar 5-10 min)
# Verificar en: https://console.firebase.google.com/project/senergy-46b1e/firestore/indexes
```

**Tiempo estimado:** 10 minutos

---

### 📄 LEGAL OBLIGATORIO (4-6 horas)

#### 5. CREAR TÉRMINOS DE SERVICIO

**Ubicación:** `docs/TERMS_OF_SERVICE.md`

**Contenido mínimo:**
```markdown
# Términos de Servicio - SENERGY

Última actualización: [FECHA]

## 1. Aceptación de términos
Al usar SENERGY, aceptas estos términos...

## 2. Descripción del servicio
SENERGY es una aplicación para monitoreo de consumo eléctrico...

## 3. Planes de suscripción
- Plan Gratuito: 1 medidor, 20 lecturas/mes
- Plan Premium: $1.000 CLP/mes, medidores y lecturas ilimitadas

## 4. Limitación de responsabilidad
SENERGY no se hace responsable por errores en mediciones...

## 5. Modificaciones
Nos reservamos el derecho a modificar precios con 30 días de aviso...

## 6. Cancelación
Puedes cancelar Premium en cualquier momento...
```

**Acción:** Crear archivo y agregar pantalla "Términos" en la app

**Tiempo estimado:** 2-3 horas (incluye revisión legal básica)

---

#### 6. CREAR POLÍTICA DE PRIVACIDAD

**Ubicación:** `docs/PRIVACY_POLICY.md`

**Contenido mínimo:**
```markdown
# Política de Privacidad - SENERGY

## Datos que recolectamos
- Email (autenticación)
- Lecturas de medidores eléctricos
- Fotos de medidores (opcional, solo Premium)
- Datos de uso de la app

## Cómo usamos tus datos
- Cálculo de consumo y costos
- Generación de estadísticas
- Mejora del servicio

## Almacenamiento
- Firebase Firestore (encriptado)
- Firebase Storage (fotos encriptadas)
- Cloudinary (fotos respaldo)

## Compartir datos
- NO compartimos datos con terceros comerciales
- Cloudinary: Solo para almacenar fotos
- Firebase: Procesamiento de datos

## Tus derechos (GDPR)
- Derecho a acceso: Solicitar copia de tus datos
- Derecho a eliminación: Borrar tu cuenta
- Derecho a portabilidad: Exportar datos

## Contacto
senergy.app@gmail.com
```

**Acción:** Crear archivo y agregar pantalla "Privacidad" en la app

**Tiempo estimado:** 2-3 horas

---

### 🧪 TESTING OBLIGATORIO (3-5 horas)

#### 7. PROBAR EN DISPOSITIVOS REALES

**iOS (si aplica):**
```bash
# Build y prueba en iPhone real
npx expo run:ios --device

# Verificar:
✓ Login/Register funciona
✓ Crear medidor
✓ Crear 1 lectura (FREE)
✓ Crear 20 lecturas (FREE) -> debe bloquear la 21
✓ Intentar foto (FREE) -> debe bloquear
✓ Activar Premium -> debe desbloquear todo
✓ Capturar foto (Premium)
✓ Exportar datos (Premium)
✓ Modo offline -> debe funcionar
✓ Push notifications (si implementadas)
```

**Android:**
```bash
# Build y prueba en Android real
npx expo run:android --device

# Misma verificación que iOS
```

**Tiempo estimado:** 2-3 horas por plataforma

---

#### 8. VERIFICAR FLUJO COMPLETO DE FOTOS

**Test manual crítico:**
```
1. Usuario Premium sube foto en lectura
   ✓ Foto se comprime correctamente
   ✓ Foto se sube a Cloudinary
   ✓ URL se guarda en Firestore
   ✓ Foto se muestra en detalle de lectura

2. Usuario elimina lectura con foto
   ✓ Foto se elimina de Cloudinary (Cloud Function)
   ✓ Documento se elimina de Firestore
   ✓ No quedan fotos huérfanas

3. Usuario FREE intenta capturar foto
   ✓ Aparece Paywall
   ✓ Puede activar Premium
   ✓ Después puede capturar
```

**Tiempo estimado:** 1 hora

---

## 🟡 MEJORAS RECOMENDADAS - DESPUÉS DE LANZAR

### Firebase Crashlytics (1-2 horas)

**Ubicación actual:** TODOs en `components/ErrorBoundary.js` y `utils/logger.js`

```bash
# 1. Instalar
expo install expo-firebase-crashlytics

# 2. Configurar en app.config.js
# 3. Integrar en ErrorBoundary.js
# 4. Integrar en logger.js
```

**Beneficio:** Reportes automáticos de crashes en producción

---

### Tests Unitarios Básicos (4-8 horas)

```bash
npm install --save-dev jest @testing-library/react-native

# Crear tests mínimos:
# - services/subscriptionService.test.js
# - hooks/useSubscription.test.js
# - utils/calculations.test.js
```

**Beneficio:** Detectar bugs antes de lanzar

---

### EAS Build para CI/CD (1-2 horas)

```bash
npm install -g eas-cli
eas login
eas build:configure

# Configurar builds automáticos en eas.json
```

**Beneficio:** Builds automáticos para cada release

---

### Remover console.logs en Producción (30 min)

**Opción 1:** Usar babel plugin
```bash
npm install --save-dev babel-plugin-transform-remove-console

# Configurar en babel.config.js para production
```

**Opción 2:** Wrapper en logger.js
```javascript
// Ya está parcialmente implementado
if (__DEV__) {
  console.log(...);
}
```

---

## 📋 CHECKLIST FINAL ANTES DE LANZAR

### Seguridad
- [ ] Girar Firebase API Key
- [ ] Girar Service Account Key
- [ ] Girar Cloudinary credentials
- [ ] Eliminar .env y serviceAccountKey.json de Git
- [ ] Verificar .gitignore incluye archivos sensibles
- [ ] Verificar Firestore Rules desplegadas
- [ ] Verificar Storage Rules desplegadas

### Deployment
- [ ] Limpiar archivos backup (.updated, .backup, nul)
- [ ] Desplegar Cloud Functions
- [ ] Desplegar Firestore Indexes
- [ ] Configurar Cloudinary environment vars en Firebase
- [ ] Verificar app.config.js tiene versión correcta (1.0.0)
- [ ] Verificar bundle IDs correctos

### Legal
- [ ] Crear Términos de Servicio
- [ ] Crear Política de Privacidad
- [ ] Agregar pantalla "Legal" en app
- [ ] Usuario debe aceptar términos en primer login

### Testing
- [ ] Probar en iPhone real (o simulador)
- [ ] Probar en Android real (o emulador)
- [ ] Probar flujo completo de suscripción
- [ ] Probar flujo completo de fotos
- [ ] Probar modo offline
- [ ] Probar con datos reales (años de lecturas)
- [ ] Verificar performance con 100+ lecturas
- [ ] Verificar límites FREE funcionan
- [ ] Verificar Premium desbloquea todo

### Funcionalidad
- [ ] Login/Register funciona
- [ ] Crear medidor funciona
- [ ] Crear lectura funciona
- [ ] Editar/Eliminar lectura funciona
- [ ] Captura de foto funciona (Premium)
- [ ] Exportar datos funciona (Premium)
- [ ] Estadísticas calculan correctamente
- [ ] Gráficos renderizan correctamente
- [ ] Push notifications funcionan (si aplica)
- [ ] Dark mode funciona

### UX/UI
- [ ] No hay crashes visibles
- [ ] Loading states en todas las operaciones
- [ ] Error messages claros en español
- [ ] Empty states implementados
- [ ] Toasts informativos funcionan
- [ ] Confirmaciones para acciones destructivas
- [ ] Offline banner aparece sin internet

---

## ⏱️ TIEMPO TOTAL ESTIMADO

### Bloqueantes (OBLIGATORIO)
- Seguridad: 30-60 min
- Limpiar repo: 5 min
- Deploy Cloud Functions: 20 min
- Deploy Indexes: 10 min
- Términos de Servicio: 2-3 horas
- Política de Privacidad: 2-3 horas
- Testing iOS: 2-3 horas
- Testing Android: 2-3 horas
- Verificar fotos: 1 hora

**TOTAL: 10-15 horas de trabajo**

### Mejoras (OPCIONAL post-lanzamiento)
- Crashlytics: 1-2 horas
- Tests: 4-8 horas
- EAS Build: 1-2 horas
- Console.logs: 30 min

**TOTAL OPCIONAL: 6-12 horas**

---

## 🎯 PLAN DE ACCIÓN RECOMENDADO

### DÍA 1: Seguridad y Deployment (4-5 horas)
1. ✅ Girar todas las credenciales (30 min)
2. ✅ Limpiar repositorio (5 min)
3. ✅ Desplegar Cloud Functions (20 min)
4. ✅ Desplegar Firestore Indexes (10 min)
5. ✅ Crear functions/index.js (1 hora)
6. ✅ Verificar deployment funcionando (1 hora)

### DÍA 2: Legal (4-6 horas)
1. ✅ Crear Términos de Servicio (2-3 horas)
2. ✅ Crear Política de Privacidad (2-3 horas)
3. ✅ Agregar pantalla Legal en app (1 hora)

### DÍA 3: Testing iOS (3-4 horas)
1. ✅ Build en dispositivo iOS
2. ✅ Probar todos los flujos
3. ✅ Documentar bugs encontrados
4. ✅ Arreglar bugs críticos

### DÍA 4: Testing Android (3-4 horas)
1. ✅ Build en dispositivo Android
2. ✅ Probar todos los flujos
3. ✅ Documentar bugs encontrados
4. ✅ Arreglar bugs críticos

### DÍA 5: Pulir y Lanzar (2-3 horas)
1. ✅ Arreglar últimos bugs
2. ✅ Verificar checklist completo
3. ✅ Hacer builds finales
4. ✅ Subir a App Store / Play Store

---

## 📞 SOPORTE DESPUÉS DEL LANZAMIENTO

### Métricas clave a monitorear:
1. **Crashes**: Con Crashlytics (después de implementar)
2. **Conversiones**: FREE → PREMIUM
3. **Feature más bloqueada**: ¿Qué paywall aparece más?
4. **Retención**: ¿Usuarios vuelven después de 7 días?
5. **Cancelaciones**: ¿Por qué cancelan Premium?

### Canales de soporte:
- Email: senergy.app@gmail.com (crear)
- Feedback in-app: Ya implementado ✅
- GitHub Issues: Para bugs técnicos

---

## ✅ RESUMEN EJECUTIVO

**Estado actual: 80% completo**

### ✅ LO QUE ESTÁ BIEN
- Funcionalidad core completa
- UI/UX pulida
- Dark mode
- Sistema de suscripción funcionando
- Firestore y Storage rules robustas
- Arquitectura sólida
- Documentación técnica completa

### ⚠️ LO QUE FALTA (BLOQUEANTE)
- Credenciales comprometidas (CRÍTICO)
- Cloud Functions sin desplegar
- Índices Firestore sin desplegar
- Sin Términos de Servicio
- Sin Política de Privacidad
- Sin testing en dispositivos reales

### 🔄 LO QUE PUEDE ESPERAR
- Tests unitarios
- Crashlytics
- EAS Build
- Optimizaciones de performance

---

## 🚀 CONCLUSIÓN

**SENERGY está MUY cerca del lanzamiento.**

Las funcionalidades están implementadas profesionalmente. Los bloqueantes son principalmente:
1. **Seguridad** (30 min para girar keys)
2. **Deployment** (30 min para Cloud Functions + Indexes)
3. **Legal** (4-6 horas para docs)
4. **Testing** (6-8 horas en dispositivos)

**Tiempo total hasta lanzamiento: 2-3 días de trabajo**

Una vez resueltos estos items, la app estará lista para producción. Los demás son mejoras que pueden venir después del lanzamiento inicial.

---

¿Quieres que te ayude con algún paso específico? ¡Podemos empezar ahora mismo!
