# 🚀 GUÍA DE DEPLOY - FIREBASE FUNCTIONS Y FIRESTORE

## Prerrequisitos

✅ Tener Firebase CLI instalado
✅ Estar logueado en Firebase
✅ Tener un proyecto Firebase activo

---

## 📋 CHECKLIST RÁPIDO

- [ ] 1. Configurar Firebase Functions (5 min)
- [ ] 2. Configurar variables de entorno Cloudinary (2 min)
- [ ] 3. Deploy Functions (3 min)
- [ ] 4. Deploy Índices Firestore (1 min)
- [ ] 5. Verificar deployment (2 min)

**Tiempo total: ~13 minutos**

---

## 1️⃣ CONFIGURAR FIREBASE FUNCTIONS

### Paso 1.1: Verificar Firebase CLI

```bash
# Verificar que Firebase CLI está instalado
firebase --version

# Si no está instalado:
npm install -g firebase-tools

# Login a Firebase
firebase login
```

### Paso 1.2: Inicializar Functions (si no existe)

```bash
# Navegar al proyecto
cd C:/Users/JOAQUIN/Desktop/SENERGY-17-10/SENERGY

# Inicializar Firebase (si no está inicializado)
firebase init

# Seleccionar:
# - Functions: Configure Firebase Functions
# - Firestore: Deploy Firestore indexes
# Lenguaje: JavaScript
# ESLint: No (opcional)
# Instalar dependencias: Yes
```

### Paso 1.3: Copiar Cloud Function

```bash
# Crear directorio functions si no existe
mkdir -p functions

# Copiar la función
cp functions/cloudinaryDelete.js functions/index.js
```

**IMPORTANTE:** Si ya tienes un `functions/index.js` existente, agrega el contenido de `cloudinaryDelete.js` al final del archivo.

### Paso 1.4: Instalar dependencias

```bash
cd functions

# Instalar dependencias necesarias
npm install cloudinary firebase-functions firebase-admin

cd ..
```

---

## 2️⃣ CONFIGURAR VARIABLES DE ENTORNO CLOUDINARY

### Paso 2.1: Obtener credenciales de Cloudinary

1. Ir a: https://console.cloudinary.com/
2. Login con tu cuenta
3. En Dashboard, copiar:
   - **Cloud Name** (ej: "demo")
   - **API Key** (ej: "123456789012345")
   - **API Secret** (ej: "abcdefghijklmnopqrstuvwxyz")

### Paso 2.2: Configurar en Firebase

```bash
# Configurar Cloud Name
firebase functions:config:set cloudinary.cloud_name="TU_CLOUD_NAME"

# Configurar API Key
firebase functions:config:set cloudinary.api_key="TU_API_KEY"

# Configurar API Secret
firebase functions:config:set cloudinary.api_secret="TU_API_SECRET"

# Verificar configuración
firebase functions:config:get
```

**Ejemplo:**
```bash
firebase functions:config:set cloudinary.cloud_name="senergy-app"
firebase functions:config:set cloudinary.api_key="123456789012345"
firebase functions:config:set cloudinary.api_secret="abcd1234efgh5678ijkl"
```

---

## 3️⃣ DEPLOY FIREBASE FUNCTIONS

### Paso 3.1: Deploy

```bash
# Deploy SOLO las functions (más rápido)
firebase deploy --only functions

# O deploy específico de las 2 funciones:
firebase deploy --only functions:deleteCloudinaryImage,functions:onReadingDeleted
```

### Paso 3.2: Esperar deployment

Verás output similar a:
```
✔ functions[deleteCloudinaryImage(us-central1)] Successful create operation.
✔ functions[onReadingDeleted(us-central1)] Successful create operation.

✔ Deploy complete!
```

### Paso 3.3: Copiar URLs

Las funciones estarán disponibles en:
```
https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/deleteCloudinaryImage
```

---

## 4️⃣ DEPLOY ÍNDICES FIRESTORE

### Paso 4.1: Verificar archivo de índices

```bash
# Verificar que firestore.indexes.json existe y tiene contenido
cat firestore.indexes.json
```

Debe mostrar los 7 índices configurados.

### Paso 4.2: Deploy índices

```bash
# Deploy SOLO los índices
firebase deploy --only firestore:indexes
```

Output esperado:
```
✔ firestore: deployed indexes in firestore.indexes.json successfully
```

### Paso 4.3: Verificar en Firebase Console

1. Ir a: https://console.firebase.google.com/
2. Seleccionar tu proyecto
3. Ir a **Firestore Database** → **Indexes**
4. Deberías ver 7 índices nuevos en estado "Building" o "Enabled"

**Nota:** Los índices pueden tardar varios minutos en construirse si ya tienes datos.

---

## 5️⃣ VERIFICACIÓN Y TESTING

### Paso 5.1: Verificar Functions en Console

```bash
# Ver logs de las functions
firebase functions:log

# Ver funciones desplegadas
firebase functions:list
```

O ir a Firebase Console:
- https://console.firebase.google.com/
- Tu proyecto → **Functions**
- Deberías ver:
  - `deleteCloudinaryImage`
  - `onReadingDeleted`

### Paso 5.2: Probar eliminación de foto

1. Abrir la app SENERGY
2. Ir a un medidor con lecturas con fotos
3. Eliminar una lectura con foto
4. Verificar logs:

```bash
firebase functions:log --only deleteCloudinaryImage
```

Deberías ver:
```
Function execution took 1234 ms, finished with status: 'ok'
```

### Paso 5.3: Verificar índices

En Firebase Console → Firestore → Indexes:
- Todos deben estar en estado **"Enabled"** (verde)
- Si alguno está "Building", esperar a que termine

---

## 🔧 TROUBLESHOOTING

### Error: "Missing configuration"

**Problema:** Functions no encuentra las variables de entorno

**Solución:**
```bash
# Verificar config actual
firebase functions:config:get

# Si está vacío, volver a configurar
firebase functions:config:set cloudinary.cloud_name="TU_CLOUD_NAME"
firebase functions:config:set cloudinary.api_key="TU_API_KEY"
firebase functions:config:set cloudinary.api_secret="TU_API_SECRET"

# Re-deploy
firebase deploy --only functions
```

### Error: "Permission denied"

**Problema:** No tienes permisos en el proyecto

**Solución:**
```bash
# Verificar proyecto actual
firebase projects:list

# Usar el proyecto correcto
firebase use YOUR_PROJECT_ID

# Re-intentar deploy
firebase deploy --only functions
```

### Error: "Index already exists"

**Problema:** Índice ya existe en Firestore

**Solución:**
- Esto es normal y no es un error
- Firebase solo actualiza los índices necesarios
- Continuar normalmente

### Functions tarda mucho en responder

**Problema:** Cold start de Cloud Functions

**Solución:**
- Es normal la primera vez (puede tardar 5-10 segundos)
- Las siguientes llamadas serán más rápidas
- En producción, considera mantener functions "calientes"

---

## 📊 COSTOS ESTIMADOS

### Firebase Functions
- **Free tier:** 2M invocations/mes
- **Después:** $0.40 USD por millón
- **Estimado SENERGY:** <$1 USD/mes (muy pocas deletes)

### Firestore Indexes
- **Sin costo adicional**
- Los índices solo optimizan queries existentes

### Cloud Functions Network
- **Free tier:** 5GB/mes
- **Después:** $0.12 USD/GB
- **Estimado SENERGY:** <$1 USD/mes

**Total estimado: <$2 USD/mes**

---

## ✅ CHECKLIST FINAL

Después del deployment, verificar:

- [ ] Functions visible en Firebase Console
- [ ] Config de Cloudinary visible con `firebase functions:config:get`
- [ ] Logs de functions funcionando con `firebase functions:log`
- [ ] 7 índices en Firestore en estado "Enabled"
- [ ] Eliminación de fotos funciona en la app
- [ ] No hay errores en logs

---

## 🚀 COMANDOS ÚTILES

```bash
# Ver todas las functions
firebase functions:list

# Ver logs en tiempo real
firebase functions:log --only deleteCloudinaryImage

# Ver config
firebase functions:config:get

# Re-deploy rápido (solo si cambiaste código)
firebase deploy --only functions:deleteCloudinaryImage

# Ver uso y costos
firebase projects:list

# Eliminar una function (si es necesario)
firebase functions:delete deleteCloudinaryImage
```

---

## 📝 MANTENIMIENTO

### Actualizar Functions

Si necesitas cambiar el código de las functions:

```bash
# Editar functions/index.js o functions/cloudinaryDelete.js
# Luego:
firebase deploy --only functions
```

### Monitorear Performance

```bash
# Ver logs
firebase functions:log

# Ver errores
firebase functions:log --only deleteCloudinaryImage | grep ERROR

# Ver métricas en console
# https://console.firebase.google.com/ → Functions → Uso
```

### Backup antes de cambios

```bash
# Backup de config
firebase functions:config:get > firebase-config-backup.json

# Backup de índices
cp firestore.indexes.json firestore.indexes.backup.json
```

---

## 🎉 ¡LISTO!

Si completaste todos los pasos, tu deployment está completo:

✅ **Firebase Functions desplegadas** - Elimina fotos de Cloudinary
✅ **Firestore Indexes optimizados** - Queries 10x más rápidas
✅ **Variables configuradas** - Cloudinary conectado
✅ **Todo verificado** - Ready para producción

---

**Siguiente paso:** Probar la app completa y verificar que todo funciona correctamente.

**¿Problemas?** Revisa la sección de Troubleshooting o los logs con `firebase functions:log`.
