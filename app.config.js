export default {
  expo: {
    name: 'SENERGY',
    slug: 'senergy',
    version: '1.0.0',
    runtimeVersion: {
      policy: 'appVersion',
    },
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    extra: {
      eas: {
        projectId: 'fa5824b5-c11e-4247-94df-de7764a011d3',
      },
      // Firebase Configuration (desde .env / EAS secrets)
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
      firebaseMeasurementId: process.env.FIREBASE_MEASUREMENT_ID,
      // Cloudinary Configuration
      cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
      cloudinaryUploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
      // AdMob IDs
      androidAdmobAppId: 'ca-app-pub-4937459209805273~6427921284',
      iosAdmobAppId: process.env.IOS_ADMOB_APP_ID,
    },
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#F7FAF3',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.energysaver.senergy',
      infoPlist: {
        NSCameraUsageDescription:
          'SENERGY necesita acceso a tu cámara para tomar fotos del medidor eléctrico y llevar un registro visual de tus lecturas.',
        NSPhotoLibraryUsageDescription:
          'SENERGY necesita acceso a tus fotos para guardar las imágenes del medidor.',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#F7FAF3',
      },
      package: 'com.energysaver.senergy',
      permissions: ['CAMERA', 'READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE'],
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      [
        'expo-notifications',
        {
          icon: './assets/icon.png',
          color: '#10B981',
          sounds: [],
        },
      ],
      [
        'react-native-google-mobile-ads',
        {
          androidAppId: 'ca-app-pub-4937459209805273~6427921284', // SENERGY Android
          iosAppId: process.env.IOS_ADMOB_APP_ID, // Crear app iOS en AdMob Console y agregar IOS_ADMOB_APP_ID a EAS Secrets
        },
      ],
    ],
  },
};
