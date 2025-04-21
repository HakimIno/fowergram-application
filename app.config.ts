import { ExpoConfig, ConfigContext } from '@expo/config';

// ใช้ process.env แทนการ import จาก @env
const APP_VARIANT = process.env.APP_VARIANT;
const IS_PROD = APP_VARIANT === 'production';

const getAppName = () => {
    const variant = process.env.APP_VARIANT;
    if (variant === 'development') return '(Dev) frog';
    if (variant === 'production') return 'frog';
    return 'flowergram';
};

const getBundleId = () => {
    const variant = process.env.APP_VARIANT;
    const baseBundleId = 'com.kimsnow33.pocappui';
    if (variant === 'development') return `${baseBundleId}.dev`;
    if (variant === 'preview') return `${baseBundleId}.preview`;
    return baseBundleId;
};

export default ({ config }: ConfigContext): ExpoConfig => ({
    name: getAppName(),
    slug: 'poc-app-ui',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',

    splash: {
        image: './assets/icon.png',
        resizeMode: 'contain',
        backgroundColor: '#000000',
    },

    assetBundlePatterns: ['**/*'],

    ios: {
        supportsTablet: true,
        bundleIdentifier: getBundleId(),
        buildNumber: '1',
        infoPlist: {
            NSCameraUsageDescription: '$(PRODUCT_NAME) needs access to your Camera.',
            NSMicrophoneUsageDescription: '$(PRODUCT_NAME) needs access to your Microphone.',
            NSPhotoLibraryUsageDescription: 'The app needs access to your photos to let you share them.',
        },
    },

    android: {
        adaptiveIcon: {
            foregroundImage: './assets/icon.png',
            backgroundColor: '#000000',
        },
        package: getBundleId(),
        permissions: [
            'android.permission.CAMERA',
            'android.permission.RECORD_AUDIO',
            'android.permission.READ_EXTERNAL_STORAGE',
            'android.permission.WRITE_EXTERNAL_STORAGE',
        ],
    },

    web: {
        favicon: './assets/favicon.png',
    },

    plugins: [
        [
            "expo-font"
        ],
        [
            'expo-camera',
            {
                cameraPermission: 'Allow $(PRODUCT_NAME) to access your camera',
                microphonePermission: 'Allow $(PRODUCT_NAME) to access your microphone',
                recordAudioAndroid: true,
            },
        ],
        [
            'expo-image-picker',
            {
                photosPermission: 'The app needs access to your photos to let you share them.',
                cameraPermission: 'The app needs access to your camera to let you take photos.',
            },
        ],
        [
            'react-native-vision-camera',
            {
                cameraPermissionText: '$(PRODUCT_NAME) needs access to your Camera.',
                enableMicrophonePermission: true,
                microphonePermissionText: '$(PRODUCT_NAME) needs access to your Microphone.',
            },
        ],
        [
            "expo-video",
            {
                "supportsBackgroundPlayback": true,
                "supportsPictureInPicture": true
            }
        ],
        [
            "expo-build-properties",
            {
                "android": {
                    "compileSdkVersion": 34,
                    "targetSdkVersion": 34,
                    "buildToolsVersion": "34.0.0"
                }
            }
        ]
    ],

    extra: {
        eas: {
            projectId: '957e00a8-d66b-4020-b308-d997c81d58c4',
        },
        environment: process.env.APP_VARIANT || 'development',
    },

    updates: IS_PROD ? {
        fallbackToCacheTimeout: 0,
        url: 'https://u.expo.dev/957e00a8-d66b-4020-b308-d997c81d58c4',
    } : undefined,

    owner: 'kimsnow33',
    runtimeVersion: {
        policy: "nativeVersion"
    },

});