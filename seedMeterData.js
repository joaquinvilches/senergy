const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Inicializar Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Función para generar datos de prueba realistas
function generateReadingsData() {
  const readings = [];
  const now = new Date();

  // Valor inicial del medidor (hace 12 meses)
  let meterValue = 35000;

  // Generar lecturas para los últimos 12 meses
  for (let i = 11; i >= 0; i--) {
    const readingDate = new Date(now.getFullYear(), now.getMonth() - i, 1, 12, 0, 0);

    // Consumo variable entre 200-400 kWh por mes (más realista para una casa)
    // Más alto en invierno (junio, julio, agosto) y verano (diciembre, enero, febrero)
    const month = readingDate.getMonth();
    let baseConsumption = 250;

    // Ajustar por estacionalidad (Chile)
    if (month >= 5 && month <= 7) {
      // Invierno (junio, julio, agosto) - más consumo por calefacción
      baseConsumption = 350;
    } else if (month === 0 || month === 1 || month === 11) {
      // Verano (diciembre, enero, febrero) - más consumo por aire acondicionado
      baseConsumption = 320;
    }

    // Agregar variación aleatoria ±15%
    const variation = (Math.random() * 0.3 - 0.15) * baseConsumption;
    const consumption = Math.round(baseConsumption + variation);

    // Incrementar el valor del medidor
    meterValue += consumption;

    // Costo por kWh en Chile (varía entre $120-150)
    const costPerKwh = Math.round(120 + Math.random() * 30);
    const cost = consumption * costPerKwh;

    readings.push({
      value: meterValue,
      consumption: consumption,
      cost: cost,
      costPerKwh: costPerKwh,
      date: admin.firestore.Timestamp.fromDate(readingDate)
    });
  }

  return readings;
}

async function seedMeterData() {
  try {
    console.log('🔍 Buscando usuario...');

    // Obtener el primer usuario (asumiendo que hay solo uno)
    const usersSnapshot = await db.collection('users').limit(1).get();

    if (usersSnapshot.empty) {
      console.error('❌ No se encontró ningún usuario. Asegúrate de haber iniciado sesión en la app al menos una vez.');
      process.exit(1);
    }

    const userId = usersSnapshot.docs[0].id;
    console.log(`✅ Usuario encontrado: ${userId}`);

    // Buscar el medidor "casa marito"
    console.log('🔍 Buscando medidor "casa marito"...');
    const metersSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('meters')
      .get();

    if (metersSnapshot.empty) {
      console.error('❌ No se encontró ningún medidor. Crea un medidor llamado "casa marito" primero.');
      process.exit(1);
    }

    // Buscar el medidor por nombre
    let meterId = null;
    let meterName = null;

    metersSnapshot.forEach(doc => {
      const data = doc.data();
      const name = data.name || data.meterName || '';

      if (name.toLowerCase().includes('marito') || name.toLowerCase().includes('casa')) {
        meterId = doc.id;
        meterName = name;
      }
    });

    if (!meterId) {
      console.log('⚠️  No se encontró un medidor llamado "casa marito".');
      console.log('📋 Medidores disponibles:');
      metersSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`   - ${data.name || data.meterName || 'Sin nombre'} (ID: ${doc.id})`);
      });

      // Usar el primer medidor disponible
      meterId = metersSnapshot.docs[0].id;
      meterName = metersSnapshot.docs[0].data().name || metersSnapshot.docs[0].data().meterName || 'Sin nombre';
      console.log(`\n✅ Usando el medidor: "${meterName}" (ID: ${meterId})`);
    } else {
      console.log(`✅ Medidor encontrado: "${meterName}" (ID: ${meterId})`);
    }

    // Verificar cuántas lecturas ya existen
    const existingReadingsSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('meters')
      .doc(meterId)
      .collection('readings')
      .get();

    console.log(`📊 Lecturas existentes: ${existingReadingsSnapshot.size}`);

    if (existingReadingsSnapshot.size > 0) {
      console.log('⚠️  El medidor ya tiene lecturas. ¿Deseas eliminarlas y crear nuevas?');
      console.log('💡 Presiona Ctrl+C para cancelar, o espera 5 segundos para continuar...');

      await new Promise(resolve => setTimeout(resolve, 5000));

      console.log('🗑️  Eliminando lecturas existentes...');
      const batch = db.batch();
      existingReadingsSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log('✅ Lecturas eliminadas');
    }

    // Generar y insertar datos de prueba
    console.log('📝 Generando datos de prueba para los últimos 12 meses...');
    const readings = generateReadingsData();

    console.log('💾 Insertando lecturas en Firestore...');
    const batch = db.batch();

    readings.forEach((reading, index) => {
      const readingRef = db
        .collection('users')
        .doc(userId)
        .collection('meters')
        .doc(meterId)
        .collection('readings')
        .doc();

      batch.set(readingRef, reading);

      const date = reading.date.toDate();
      console.log(
        `   ${index + 1}. ${date.toLocaleDateString('es-CL')} - ` +
        `${reading.value} kWh (consumo: ${reading.consumption} kWh, ` +
        `costo: $${reading.cost.toLocaleString('es-CL')})`
      );
    });

    await batch.commit();

    // Actualizar el lastReading del medidor con la última lectura
    const lastReading = readings[readings.length - 1];
    await db
      .collection('users')
      .doc(userId)
      .collection('meters')
      .doc(meterId)
      .update({
        lastReading: lastReading.value,
        updatedAt: admin.firestore.Timestamp.now()
      });

    console.log('\n✅ ¡Datos cargados exitosamente!');
    console.log(`📊 Total de lecturas insertadas: ${readings.length}`);
    console.log(`📈 Valor inicial del medidor: ${readings[0].value} kWh`);
    console.log(`📈 Valor actual del medidor: ${lastReading.value} kWh`);
    console.log(`⚡ Consumo total del período: ${lastReading.value - readings[0].value} kWh`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al insertar datos:', error);
    process.exit(1);
  }
}

// Ejecutar el script
seedMeterData();
