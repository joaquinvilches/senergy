# 📖 GUÍA PASO A PASO - Qué Debes Hacer Tú

**Esta guía está diseñada para alguien SIN conocimientos de programación.**
**Sigue cada paso exactamente como se indica. Si algo no funciona, anota el error y contacta al desarrollador.**

---

## 📑 ÍNDICE

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [DÍA 1: Seguridad - Cambiar Credenciales](#día-1-seguridad---cambiar-credenciales) ⚠️ CRÍTICO
3. [DÍA 1: Deploy de Firebase](#día-1-deploy-de-firebase) ⚠️ CRÍTICO
4. [DÍA 2: Personalizar Documentos Legales](#día-2-personalizar-documentos-legales)
5. [DÍA 3: Testing en Dispositivos Reales](#día-3-testing-en-dispositivos-reales)
6. [OPCIONAL: Builds para Tiendas](#opcional-builds-para-tiendas)
7. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## RESUMEN EJECUTIVO

### ✅ Lo que YO (Claude) ya hice por ti:
- ✅ Limpié archivos duplicados
- ✅ Configuré Cloud Functions (solo archivos, falta deploy)
- ✅ Creé templates de Términos y Privacidad
- ✅ Creé pantalla Legal en la app
- ✅ Generé checklist de testing detallado

### ⚠️ Lo que TÚ DEBES hacer (OBLIGATORIO):

**DÍA 1 (1-2 horas):**
1. Cambiar credenciales de Firebase y Cloudinary (SEGURIDAD CRÍTICA)
2. Instalar dependencias de Cloud Functions
3. Hacer deploy de Cloud Functions
4. Hacer deploy de Índices de Firestore

**DÍA 2 (2-3 horas):**
5. Personalizar Términos de Servicio
6. Personalizar Política de Privacidad

**DÍA 3 (6-8 horas):**
7. Probar la app en iPhone real
8. Probar la app en Android real
9. Anotar bugs y arreglarlos

### 💰 Costos involucrados:
- Firebase: GRATIS (plan Spark suficiente por ahora)
- Cloudinary: GRATIS (plan free suficiente)
- Apple Developer (para lanzar en iOS): $99 USD/año
- Google Play (para lanzar en Android): $25 USD one-time

---

## DÍA 1: SEGURIDAD - CAMBIAR CREDENCIALES

**⏱️ Tiempo estimado: 30-60 minutos**
**🚨 CRITICIDAD: MÁXIMA - No puedes lanzar sin hacer esto**

### ¿Por qué es crítico?
Actualmente tus credenciales de Firebase y Cloudinary están expuestas. Aunque las removimos de Git, pueden haber sido vistas. Debes cambiarlas AHORA.

---

### PASO 1: Cambiar Firebase API Key

#### 1.1 Abrir Firebase Console
1. Abre tu navegador (Chrome, Firefox, Safari)
2. Ve a: https://console.firebase.google.com
3. Te pedirá login con Google → Usa tu cuenta de Google
4. Deberías ver tu proyecto "SENERGY" (o el nombre que le pusiste)
5. Click en el nombre del proyecto para abrirlo

#### 1.2 Regenerar Web API Key
1. En el menú lateral izquierdo, click en el ícono de ⚙️ (engranaje)
2. Click en "Configuración del proyecto" (Project Settings)
3. En la pestaña "General" (ya debería estar seleccionada)
4. Scroll hacia abajo hasta ver "Tus apps"
5. Deberías ver una app Web (ícono `</>`)
6. **IMPORTANTE:** Toma nota de:
   - **API Key** (clave API)
   - **Project ID** (ID del proyecto)
   - **Storage Bucket**
   - **Messaging Sender ID**
   - **App ID**

**❗ NOTA IMPORTANTE:** Firebase NO permite "regenerar" la API Key directamente. Esto es normal y seguro porque la API Key de Firebase NO es secreta (se usa en el cliente). Lo crítico es:
- ✅ Firestore Rules (ya configuradas correctamente)
- ✅ Storage Rules (ya configuradas)
- ✅ Service Account (vamos a regenerarlo)

**ACCIÓN:** Copia estos valores y guárdalos en un archivo `.env` NUEVO (paso siguiente)

#### 1.3 Regenerar Service Account Key (CRÍTICO)
1. En Firebase Console, en "Configuración del proyecto"
2. Click en la pestaña "Cuentas de servicio" (Service Accounts)
3. Scroll hacia abajo hasta "Claves de SDK de administrador de Firebase"
4. Deberías ver botón "Generar nueva clave privada"
5. Click en ese botón
6. Aparecerá un diálogo diciendo "¿Estás seguro?"
7. Click "Generar clave"
8. **SE DESCARGARÁ UN ARCHIVO JSON** (algo como `senergy-abc123-firebase-adminsdk.json`)
9. **MUY IMPORTANTE:**
   - Renombra ese archivo a: `serviceAccountKey.json`
   - Muévelo a la carpeta raíz de tu proyecto SENERGY
   - NO lo subas a Git (ya está en .gitignore)
   - Guárdalo en un lugar seguro (Google Drive, contraseña manager)

---

### PASO 2: Cambiar Cloudinary Credentials

#### 2.1 Abrir Cloudinary Dashboard
1. Ve a: https://cloudinary.com
2. Click "Login" (arriba derecha)
3. Inicia sesión con tu cuenta
4. Te llevará al Dashboard

#### 2.2 Regenerar Upload Preset
1. En el menú superior, click "Settings" (⚙️ Configuración)
2. En el menú lateral, click "Upload"
3. Scroll hacia abajo hasta "Upload presets"
4. Deberías ver tu preset actual (por defecto: "ml_default" o uno que creaste)
5. **OPCIÓN A - Crear nuevo preset:**
   - Click "Add upload preset"
   - Signing Mode: **Unsigned**
   - Upload preset name: (deja el auto-generado o pon "senergy_uploads")
   - Folder: "senergy" (opcional)
   - Allowed formats: image (jpg, png, jpeg)
   - Click "Save"
   - **ANOTA EL NOMBRE DEL PRESET** (ej. "ml_default" o "senergy_uploads")

6. **OPCIÓN B - Usar el existente:**
   - Si ya tienes uno funcionando, puedes mantenerlo
   - Solo anota el nombre

#### 2.3 Obtener Cloud Name y API Credentials
1. Vuelve al Dashboard (click en "Dashboard" arriba)
2. Verás una sección "Account Details"
3. **ANOTA ESTOS VALORES:**
   - **Cloud name:** (ej. "dxxxx")
   - **API Key:** (número largo)
   - **API Secret:** (texto alfanumérico) → Click "Reveal" para verlo

---

### PASO 3: Crear nuevo archivo .env

#### 3.1 Abrir editor de texto
1. Abre Visual Studio Code (o cualquier editor de texto)
2. Si no tienes VS Code, puedes usar Notepad (Windows) o TextEdit (Mac)

#### 3.2 Crear archivo .env
1. En la carpeta raíz del proyecto SENERGY
2. Crea un archivo nuevo llamado exactamente: `.env` (con el punto al inicio)
3. **Windows:** Puede que Windows no te deje crear archivos con punto. Si pasa:
   - Crea un archivo llamado `env.txt`
   - Luego renómbralo a `.env` (sin extensión)

4. Copia y pega este contenido EN EL ARCHIVO .env:

```bash
# Firebase Configuration
FIREBASE_API_KEY=TU_API_KEY_DE_FIREBASE
FIREBASE_AUTH_DOMAIN=TU_PROJECT_ID.firebaseapp.com
FIREBASE_PROJECT_ID=TU_PROJECT_ID
FIREBASE_STORAGE_BUCKET=TU_PROJECT_ID.appspot.com
FIREBASE_MESSAGING_SENDER_ID=TU_MESSAGING_SENDER_ID
FIREBASE_APP_ID=TU_APP_ID

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=TU_CLOUD_NAME
CLOUDINARY_UPLOAD_PRESET=TU_UPLOAD_PRESET
```

5. **REEMPLAZA** cada valor con los que anotaste:
   - Busca `TU_API_KEY_DE_FIREBASE` y reemplázalo con el API Key de Firebase
   - Busca `TU_PROJECT_ID` y reemplázalo con el Project ID
   - Busca `TU_MESSAGING_SENDER_ID` y reemplázalo
   - Busca `TU_APP_ID` y reemplázalo
   - Busca `TU_CLOUD_NAME` y reemplázalo con tu Cloud Name de Cloudinary
   - Busca `TU_UPLOAD_PRESET` y reemplázalo con el nombre del preset

6. **EJEMPLO DE CÓMO DEBERÍA VERSE** (con valores de ejemplo):
```bash
# Firebase Configuration
FIREBASE_API_KEY=AIzaSyB1234567890abcdefghijklmnop
FIREBASE_AUTH_DOMAIN=senergy-46b1e.firebaseapp.com
FIREBASE_PROJECT_ID=senergy-46b1e
FIREBASE_STORAGE_BUCKET=senergy-46b1e.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789012
FIREBASE_APP_ID=1:123456789012:web:abc123def456

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dxxxx
CLOUDINARY_UPLOAD_PRESET=ml_default
```

7. **GUARDA EL ARCHIVO** (Ctrl+S o Cmd+S)

---

### PASO 4: Verificar que .env NO esté en Git

#### 4.1 Abrir Terminal/CMD
**Windows:**
1. Presiona tecla Windows
2. Escribe "cmd" o "PowerShell"
3. Presiona Enter
4. Navega a tu proyecto: `cd C:\Users\JOAQUIN\Desktop\SENERGY-17-10\SENERGY`

**Mac:**
1. Presiona Cmd + Espacio
2. Escribe "Terminal"
3. Presiona Enter
4. Navega a tu proyecto: `cd /ruta/a/tu/proyecto/SENERGY`

#### 4.2 Verificar status de Git
Escribe este comando y presiona Enter:
```bash
git status
```

**RESULTADO ESPERADO:**
- `.env` NO debe aparecer en la lista de archivos nuevos
- Si aparece como `?? .env` → PROBLEMA, sigue al paso 4.3
- Si NO aparece → ✅ Todo bien, continúa

#### 4.3 Si .env aparece (problema):
Ejecuta:
```bash
echo .env >> .gitignore
```

Luego verifica de nuevo:
```bash
git status
```

Ahora .env NO debería aparecer.

---

## DÍA 1: DEPLOY DE FIREBASE

**⏱️ Tiempo estimado: 30 minutos**
**🚨 CRITICIDAD: ALTA**

### PASO 5: Instalar Firebase CLI

#### 5.1 Verificar si ya tienes Firebase CLI
En la terminal, escribe:
```bash
firebase --version
```

**Si muestra un número (ej. 13.0.0)** → Ya lo tienes, salta al Paso 6
**Si dice "command not found" o "no se reconoce"** → Continúa con 5.2

#### 5.2 Instalar Firebase CLI
Ejecuta este comando:
```bash
npm install -g firebase-tools
```

Espera a que termine (puede tomar 1-2 minutos)

Verifica que se instaló:
```bash
firebase --version
```

Debe mostrar el número de versión.

---

### PASO 6: Login en Firebase

#### 6.1 Iniciar sesión
Ejecuta:
```bash
firebase login
```

**QUÉ VA A PASAR:**
1. Se abrirá tu navegador
2. Te pedirá que selecciones tu cuenta de Google
3. Te pedirá permisos para Firebase CLI
4. Click "Permitir" o "Allow"
5. Verás mensaje "Success! Logged in as tu-email@gmail.com"
6. Vuelve a la terminal

---

### PASO 7: Instalar Dependencias de Cloud Functions

#### 7.1 Navegar a carpeta functions
Ejecuta:
```bash
cd functions
```

Esto te moverá dentro de la carpeta `functions`.

#### 7.2 Instalar dependencias
Ejecuta:
```bash
npm install
```

**QUÉ VA A PASAR:**
- Verás texto corriendo en la terminal
- Instalará `firebase-admin`, `firebase-functions`, `cloudinary`
- Puede tomar 1-2 minutos
- Al final verá algo como "added X packages"

**SI HAY ERROR:**
- Si dice "npm no se reconoce" → No tienes Node.js instalado
- Descarga Node.js desde: https://nodejs.org
- Instala la versión LTS
- Reinicia la terminal y vuelve a intentar

#### 7.3 Volver a carpeta raíz
Ejecuta:
```bash
cd ..
```

---

### PASO 8: Configurar Cloudinary en Firebase Functions

#### 8.1 Configurar variables de entorno
Ejecuta ESTE COMANDO, pero **REEMPLAZA** los valores con tus credenciales de Cloudinary:

```bash
firebase functions:config:set cloudinary.cloud_name="TU_CLOUD_NAME" cloudinary.api_key="TU_API_KEY" cloudinary.api_secret="TU_API_SECRET"
```

**EJEMPLO (con valores ficticios):**
```bash
firebase functions:config:set cloudinary.cloud_name="dxxxx" cloudinary.api_key="123456789012345" cloudinary.api_secret="abcdefghijklmnopqrstuvwxyz"
```

**IMPORTANTE:**
- Reemplaza `TU_CLOUD_NAME` con tu Cloud Name (ej. "dxxxx")
- Reemplaza `TU_API_KEY` con tu API Key de Cloudinary
- Reemplaza `TU_API_SECRET` con tu API Secret de Cloudinary
- Mantén las comillas dobles ("")

**RESULTADO ESPERADO:**
Verás: "✔ Functions config updated."

#### 8.2 Verificar configuración
Ejecuta:
```bash
firebase functions:config:get
```

Debe mostrar:
```json
{
  "cloudinary": {
    "cloud_name": "tu_cloud_name",
    "api_key": "tu_api_key",
    "api_secret": "tu_api_secret"
  }
}
```

Si es correcto, ✅ continúa.

---

### PASO 9: Deploy de Cloud Functions

#### 9.1 Hacer deploy
Ejecuta:
```bash
firebase deploy --only functions
```

**QUÉ VA A PASAR:**
1. Verás texto en la terminal procesando
2. Puede tomar 2-5 minutos
3. Verás progreso:
   - "Preparing functions directory for uploading..."
   - "Uploading functions..."
   - "Deploying deleteCloudinaryImage..."
   - "Deploying onReadingDeleted..."
4. Al final verá: "✔ Deploy complete!"

**SI HAY ERROR:**
- Lee el mensaje de error
- Errores comunes:
  - "Billing account not configured" → Necesitas activar Blaze plan (pero no te cobrarán si no pasas los límites gratuitos)
  - "Permission denied" → Verifica que hiciste `firebase login`

#### 9.2 Verificar en Firebase Console
1. Ve a: https://console.firebase.google.com
2. Abre tu proyecto
3. En el menú lateral, click "Functions"
4. Deberías ver 2 funciones:
   - `deleteCloudinaryImage`
   - `onReadingDeleted`
5. Ambas deben estar en estado "Active" o "Deployed"

**✅ Si las ves → ÉXITO**

---

### PASO 10: Deploy de Índices Firestore

#### 10.1 Hacer deploy
Ejecuta:
```bash
firebase deploy --only firestore:indexes
```

**QUÉ VA A PASAR:**
1. Verás: "Deploying indexes..."
2. Toma 30 segundos - 1 minuto
3. Al final: "✔ Deploy complete!"

#### 10.2 Verificar en Firebase Console
1. En Firebase Console, ve a "Firestore Database"
2. Click en la pestaña "Indexes" (Índices)
3. Deberías ver varios índices en estado "Building" (construyendo) o "Enabled" (habilitado)
4. **IMPORTANTE:** Los índices pueden tardar 5-10 minutos en construirse
5. Espera hasta que TODOS digan "Enabled"

**✅ Si después de 10 minutos todos dicen "Enabled" → ÉXITO**

---

## DÍA 2: PERSONALIZAR DOCUMENTOS LEGALES

**⏱️ Tiempo estimado: 2-3 horas**

### PASO 11: Personalizar Términos de Servicio

#### 11.1 Abrir el archivo
1. Abre Visual Studio Code (o tu editor)
2. Abre el archivo: `TERMINOS_DE_SERVICIO.md`

#### 11.2 Buscar y reemplazar
Busca (Ctrl+F o Cmd+F) cada uno de estos textos y reemplázalos:

**1. Tu nombre o empresa:**
- Busca: `[TU NOMBRE O NOMBRE DE TU EMPRESA]`
- Reemplaza con: Tu nombre completo o razón social
- Ejemplo: "Juan Pérez Díaz" o "Energía Chile SpA"

**2. Tu RUT:**
- Busca: `[TU RUT]`
- Reemplaza con: Tu RUT personal o de empresa
- Ejemplo: "12.345.678-9" (con puntos y guión)

**3. Tu dirección:**
- Busca: `[TU DIRECCIÓN]`
- Reemplaza con: Tu dirección completa
- Ejemplo: "Av. Providencia 1234, Oficina 56, Providencia, Santiago, Chile"

**4. Tu email:**
- Busca: `[TU EMAIL DE CONTACTO]`
- Reemplaza con: Email de contacto
- Ejemplo: "contacto@senergy.cl" o tu email personal

**5. Tu teléfono (opcional):**
- Busca: `[TU TELÉFONO]`
- Reemplaza con: Teléfono o elimina la línea si no quieres dar teléfono
- Ejemplo: "+56 9 1234 5678"

**6. Fecha:**
- Busca: `[FECHA]`
- Reemplaza con: Fecha de hoy
- Ejemplo: "15 de diciembre de 2024"

**7. Tu ciudad:**
- Busca: `[TU CIUDAD - Ejemplo: Santiago]`
- Reemplaza con: Tu ciudad
- Ejemplo: "Santiago" o "Valparaíso"

#### 11.3 Eliminar instrucciones
1. Busca la sección que dice:
```
## INSTRUCCIONES PARA PERSONALIZAR ESTE DOCUMENTO
```
2. Elimina TODA esa sección (hasta el separador `---`)

#### 11.4 Guardar
- Presiona Ctrl+S (Windows) o Cmd+S (Mac)

---

### PASO 12: Personalizar Política de Privacidad

#### 12.1 Abrir el archivo
Abre: `POLITICA_DE_PRIVACIDAD.md`

#### 12.2 Buscar y reemplazar
**MISMOS PASOS QUE TÉRMINOS:**
Busca y reemplaza:
1. `[TU NOMBRE O NOMBRE DE TU EMPRESA]`
2. `[TU RUT]`
3. `[TU DIRECCIÓN]`
4. `[TU EMAIL DE CONTACTO]`
5. `[TU TELÉFONO]`
6. `[FECHA]`

**ADICIONALES:**

**7. Nombre de pasarela de pagos:**
- Busca: `[NOMBRE DE PASARELA DE PAGOS]`
- Reemplaza con: "Flow", "Mercado Pago", o "Stripe" (cuando integres una)
- **MIENTRAS TANTO:** Pon "Pendiente de integración"

**8. Ubicación del proveedor:**
- Busca: `[UBICACIÓN DEL PROVEEDOR]`
- Reemplaza con ubicación de la pasarela
- **MIENTRAS TANTO:** Pon "N/A"

**9. URL de política de pasarela:**
- Busca: `[URL DE POLÍTICA]`
- Reemplaza con URL de política
- **MIENTRAS TANTO:** Pon "#"

#### 12.3 Eliminar instrucciones
Elimina la sección de INSTRUCCIONES completa.

#### 12.4 Guardar
Ctrl+S o Cmd+S

---

### PASO 13: Verificar en la App

#### 13.1 Iniciar la app
En la terminal (en la carpeta raíz del proyecto), ejecuta:
```bash
npx expo start
```

Espera a que cargue. Verás un QR code.

#### 13.2 Abrir en dispositivo
**iPhone:**
1. Abre la app "Cámara"
2. Apunta al QR code
3. Tap en la notificación que aparece
4. Se abrirá Expo Go

**Android:**
1. Abre app "Expo Go"
2. Tap "Scan QR Code"
3. Escanea el QR

#### 13.3 Navegar a Legal
1. En la app, ve a tab "Perfil"
2. Scroll hacia abajo
3. Tap "Términos y Privacidad"
4. Verifica que tus datos aparecen correctamente
5. Cambia entre tabs "Términos" y "Privacidad"
6. Lee y verifica que todo tiene sentido

**SI ALGO SE VE MAL:**
- Vuelve al archivo .md
- Corrige
- Guarda
- En la terminal (donde corre Expo), presiona "r" para reload
- Verifica de nuevo

---

## DÍA 3: TESTING EN DISPOSITIVOS REALES

**⏱️ Tiempo estimado: 6-8 horas**

### PASO 14: Testing Completo

#### 14.1 Abrir el checklist
Abre el archivo: `CHECKLIST_TESTING.md`

#### 14.2 Seguir cada paso
**IMPORTANTE:** Este checklist tiene 13 secciones y ~200 puntos a verificar.

**NO TRATES DE HACERLO TODO DE MEMORIA.**

**CÓMO HACERLO:**
1. Imprime el checklist O mantenlo abierto en una segunda pantalla
2. Ve marcando cada ✅ a medida que lo completas
3. Si encuentras un bug, anótalo en una hoja aparte:
   ```
   BUG #1:
   - Pantalla: HomeScreen
   - Qué pasó: Al tap en medidor, la app se congela
   - Pasos para reproducir: 1. Crear medidor 2. Tap en medidor 3. Se congela
   - Prioridad: ALTA (bloquea uso)
   ```
4. Continúa con el siguiente item

#### 14.3 Priorizar bugs
Al terminar el checklist, clasifica los bugs:

**PRIORIDAD ALTA (bloquean lanzamiento):**
- Crashes que impiden usar la app
- Funciones principales rotas (no se pueden crear medidores, lecturas)
- Pérdida de datos

**PRIORIDAD MEDIA (pueden lanzarse pero arreglar pronto):**
- Bugs visuales importantes
- Features secundarias rotas
- Performance muy lenta

**PRIORIDAD BAJA (mejoras futuras):**
- Detalles de UI
- Textos mal escritos
- Pequeños ajustes

#### 14.4 Arreglar bugs prioridad ALTA
**SI NO SABES PROGRAMACIÓN:**
- Envía la lista de bugs al desarrollador (yo, Claude, puedo ayudarte)
- Describe cada bug con el mayor detalle posible
- Incluye screenshots si puedes

**SI SABES PROGRAMACIÓN BÁSICA:**
- Pídeme ayuda para arreglar cada bug
- Te diré exactamente qué archivos editar

---

## OPCIONAL: BUILDS PARA TIENDAS

**⏱️ Tiempo estimado: 2-4 horas**
**💰 Costo: $99 USD (Apple) + $25 USD (Google)**

### PASO 15: Configurar EAS Build

#### 15.1 Instalar EAS CLI
```bash
npm install -g eas-cli
```

#### 15.2 Login en EAS
```bash
eas login
```

Usa tu cuenta de Expo (crea una si no tienes).

#### 15.3 Configurar proyecto
```bash
eas build:configure
```

Esto creará `eas.json`.

#### 15.4 Build para iOS
**REQUISITO:** Cuenta Apple Developer ($99/año)

```bash
eas build --platform ios
```

Sigue las instrucciones en pantalla.

#### 15.5 Build para Android
**REQUISITO:** Cuenta Google Play ($25 one-time)

```bash
eas build --platform android
```

#### 15.6 Subir a las tiendas
**GUÍAS OFICIALES:**
- iOS: https://developer.apple.com/app-store/submissions/
- Android: https://support.google.com/googleplay/android-developer/answer/9859152

**NOTA:** Este proceso es complejo y amerita una guía separada.

---

## PREGUNTAS FRECUENTES

### ❓ No sé nada de programación, ¿puedo hacer esto?
**SÍ.** Esta guía está diseñada para ti. Solo sigue cada paso exactamente como dice. Si algo no funciona, anota el error y pide ayuda.

### ❓ ¿Qué hago si un comando da error?
1. Lee el mensaje de error completo
2. Anótalo EXACTO (copia y pega)
3. Busca en Google el error
4. Si no encuentras solución, pide ayuda al desarrollador

### ❓ ¿Tengo que pagar por Firebase?
**NO**, si no pasas los límites gratuitos:
- Firestore: 50,000 lecturas/día GRATIS
- Storage: 5GB GRATIS
- Functions: 2M invocaciones/mes GRATIS

Para una app nueva, esto es más que suficiente.

### ❓ ¿Puedo saltarme algún paso?
**NO puedes saltarte:**
- ✅ Cambiar credenciales (DÍA 1 - Seguridad)
- ✅ Deploy de Functions e Índices (DÍA 1)
- ✅ Personalizar documentos legales (DÍA 2)

**Puedes saltarte:**
- ⏭️ Testing extensivo (pero NO recomendado)
- ⏭️ Builds para tiendas (puedes hacerlo después)

### ❓ ¿Cuánto tiempo total me tomará?
**Mínimo (solo bloqueantes):** 3-4 horas
**Recomendado (con testing):** 10-14 horas
**Distribuid en 3 días:**
- Día 1: 2 horas (seguridad + deploys)
- Día 2: 2 horas (legal)
- Día 3: 6-8 horas (testing)

### ❓ La app me da un error, ¿qué hago?
**PASOS:**
1. Toma screenshot del error
2. Anota qué estabas haciendo cuando ocurrió
3. Intenta reproducir el error (hacer lo mismo de nuevo)
4. Si se repite, es un bug
5. Anótalo y pide ayuda

### ❓ ¿Puedo lanzar sin pasarela de pagos?
**SÍ.** Puedes lanzar en "modo demo" donde:
- Los usuarios pueden probar Premium gratis
- El upgrade/downgrade funciona pero no cobra
- Más adelante integras Flow, Mercado Pago, etc.

**VENTAJAS:**
- Lanzas más rápido
- Validas el mercado
- Obtienes feedback real

### ❓ ¿Cómo sé si está listo para lanzar?
**CHECKLIST MÍNIMO:**
- ✅ Credenciales cambiadas
- ✅ Functions desplegadas
- ✅ Índices desplegados
- ✅ Documentos legales personalizados
- ✅ Testing básico sin crashes
- ✅ Restricciones FREE funcionan
- ✅ Upgrade/Downgrade funciona

**SI TODOS están ✅ → PUEDES LANZAR** 🚀

---

## 📞 SOPORTE

### Si te atascas:
1. Lee esta guía de nuevo (puede que te saltaste algo)
2. Busca el error en Google
3. Revisa los archivos de documentación:
   - `CHECKLIST_PRE_LANZAMIENTO.md`
   - `GUIA_DEPLOY_FIREBASE.md`
4. Contacta al desarrollador con:
   - Screenshot del error
   - Qué paso estabas haciendo
   - Sistema operativo (Windows/Mac)

### Recursos útiles:
- Firebase Docs: https://firebase.google.com/docs
- Expo Docs: https://docs.expo.dev
- React Native Docs: https://reactnative.dev/docs

---

## ✅ CHECKLIST DE COMPLETITUD

Al terminar, marca cada uno:

**DÍA 1 - Seguridad:**
- [ ] Regeneré Service Account Key de Firebase
- [ ] Anoté credenciales de Firebase
- [ ] Anoté credenciales de Cloudinary
- [ ] Creé archivo .env nuevo
- [ ] Verifiqué que .env NO está en Git
- [ ] Instalé Firebase CLI
- [ ] Hice login en Firebase
- [ ] Instalé dependencias de Cloud Functions
- [ ] Configuré Cloudinary en Functions Config
- [ ] Hice deploy de Functions
- [ ] Hice deploy de Índices Firestore
- [ ] Verifiqué que Functions aparecen en Firebase Console
- [ ] Verifiqué que Índices están "Enabled"

**DÍA 2 - Legal:**
- [ ] Personalicé Términos de Servicio
- [ ] Personalicé Política de Privacidad
- [ ] Eliminé secciones de INSTRUCCIONES
- [ ] Verifiqué en la app que se ven bien

**DÍA 3 - Testing:**
- [ ] Seguí CHECKLIST_TESTING.md completo
- [ ] Probé en iPhone real
- [ ] Probé en Android real
- [ ] Anoté todos los bugs encontrados
- [ ] Arreglé bugs de prioridad ALTA
- [ ] Verifiqué que la app funciona sin crashes

**OPCIONAL - Builds:**
- [ ] Instalé EAS CLI
- [ ] Configuré EAS Build
- [ ] Generé build de iOS
- [ ] Generé build de Android

---

## 🎉 ¡FELICITACIONES!

Si completaste todos los pasos, **tu app está lista para lanzar**.

**PRÓXIMOS PASOS:**
1. Subir a App Store (iOS)
2. Subir a Google Play (Android)
3. Monitorear errores y feedback de usuarios
4. Iterar y mejorar

**¡MUCHA SUERTE CON EL LANZAMIENTO!** 🚀

---

**Última actualización:** 15 de diciembre de 2024
**Versión de la guía:** 1.0
**Creada por:** Claude (Anthropic AI)
