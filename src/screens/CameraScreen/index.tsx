import { StyleSheet, View, Text, Dimensions } from 'react-native';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { Camera, useCameraDevice, useCameraFormat } from 'react-native-vision-camera';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import Animated, {
    useSharedValue,
    withSpring,
    withSequence,
    withDelay,
    withTiming,
    runOnJS,
    Easing
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootStackParamList } from 'src/navigation/types';

import { FocusIndicator } from './components/FocusIndicator';
import { ZoomControl } from './components/ZoomControl';
import { CameraControls } from './components/CameraControls';

type Props = NativeStackScreenProps<RootStackParamList, 'camera_screen'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ZOOM_LEVELS = [1, 2, 5, 10];
const FOCUS_ANIMATION_DURATION = 1000;
const DOUBLE_TAP_DELAY = 300;
const ZOOM_CONTROL_TIMEOUT = 3000; // 3 seconds

const MIN_ZOOM = 1;
const MAX_ZOOM = 10;
const ZOOM_STEP = 0.5;

const CameraScreen = ({ navigation }: Props) => {
    const insets = useSafeAreaInsets();
    const cameraRef = React.useRef<Camera>(null);
    const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>('back');
    const [flash, setFlash] = useState<'off' | 'on'>('off');
    const [showGrid, setShowGrid] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isFocusLocked, setIsFocusLocked] = useState(false);
    const [focusPoint, setFocusPoint] = useState({ x: 0.5, y: 0.5 });
    const [lastTapTimestamp, setLastTapTimestamp] = useState(0);
    const [currentZoomIndex, setCurrentZoomIndex] = useState(0);
    const [showZoomSlider, setShowZoomSlider] = useState(false);
    const zoomControlTimeoutRef = React.useRef<NodeJS.Timeout>();

    // Animated values
    const focusAnimation = useSharedValue(0);
    const zoomAnimation = useSharedValue(1);
    const focusPointAnimation = useSharedValue({ x: 0.5, y: 0.5 });
    const zoomLevelAnimation = useSharedValue(1);

    useEffect(() => {
        (async () => {
            const cameraPermission = await Camera.requestCameraPermission();
            const microphonePermission = await Camera.requestMicrophonePermission();
            setHasPermission(
                cameraPermission === 'granted' &&
                microphonePermission === 'granted'
            );
        })();
    }, []);

    const device = useCameraDevice(cameraPosition);

    const onCapture = useCallback(async () => {
        try {
            if (cameraRef.current) {
                const photo = await cameraRef.current.takePhoto({
                    flash
                });
                navigation.navigate('preview_screen', {
                    selectedMedia: {
                        uri: `file://${photo.path}`,
                        type: 'image'
                    }
                });
            }
        } catch (error) {
            console.error('Failed to capture:', error);
        }
    }, [navigation, flash]);

    const showZoomControlWithTimeout = useCallback(() => {
        setShowZoomSlider(true);
        
        // Clear existing timeout
        if (zoomControlTimeoutRef.current) {
            clearTimeout(zoomControlTimeoutRef.current);
        }
        
        // Set new timeout
        zoomControlTimeoutRef.current = setTimeout(() => {
            setShowZoomSlider(false);
        }, ZOOM_CONTROL_TIMEOUT);
    }, []);

    const handleZoomChange = useCallback((value: number) => {
        setZoomLevel(value);
        showZoomControlWithTimeout();
        zoomLevelAnimation.value = withSpring(value, {
            mass: 0.5,
            damping: 12,
            stiffness: 100
        });
    }, []);

    const animateFocusIndicator = useCallback((x: number, y: number) => {
        'worklet';
        focusPointAnimation.value = { x, y };
        focusAnimation.value = withSequence(
            withSpring(1, { mass: 0.5, damping: 8 }),
            withDelay(
                FOCUS_ANIMATION_DURATION,
                withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) })
            )
        );
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    }, []);

    const handleDoubleTapZoom = useCallback(() => {
        'worklet';
        const nextIndex = (currentZoomIndex + 1) % ZOOM_LEVELS.length;
        const nextZoom = ZOOM_LEVELS[nextIndex];

        zoomLevelAnimation.value = withSpring(nextZoom, {
            mass: 0.5,
            damping: 12,
            stiffness: 100
        });

        runOnJS(setZoomLevel)(nextZoom);
        runOnJS(setCurrentZoomIndex)(nextIndex);
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
    }, [currentZoomIndex]);

    const tapGesture = Gesture.Tap()
        .onStart((event) => {
            'worklet';
            const now = Date.now();
            const isDoubleTap = now - lastTapTimestamp < DOUBLE_TAP_DELAY;
            
            if (isDoubleTap) {
                handleDoubleTapZoom();
                runOnJS(showZoomControlWithTimeout)();
            } else if (!isFocusLocked) {
                const x = event.x / SCREEN_WIDTH;
                const y = event.y / SCREEN_HEIGHT;
                animateFocusIndicator(x, y);
                runOnJS(setFocusPoint)({ x, y });
            }
            
            runOnJS(setLastTapTimestamp)(now);
        });

    const pinchGesture = Gesture.Pinch()
        .onStart(() => {
            'worklet';
            zoomAnimation.value = zoomLevel;
            runOnJS(showZoomControlWithTimeout)();
        })
        .onUpdate((event) => {
            'worklet';
            const newZoom = Math.min(
                Math.max(
                    event.scale * zoomAnimation.value,
                    MIN_ZOOM
                ),
                MAX_ZOOM
            );
            zoomLevelAnimation.value = withSpring(newZoom, {
                mass: 0.5,
                damping: 12,
                stiffness: 100
            });
            runOnJS(setZoomLevel)(newZoom);
        });

    const format = useCameraFormat(device, [
        { photoHdr: true },
        { videoHdr: true },
    ])

    if (!hasPermission || !device) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={styles.errorText}>
                    {!hasPermission ? 'No permission to access camera' : 'Camera not available'}
                </Text>
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={styles.container}>
            <StatusBar style="light" />

            <GestureDetector gesture={Gesture.Simultaneous(tapGesture, pinchGesture)}>
                <View style={StyleSheet.absoluteFill}>
                    <Camera
                        ref={cameraRef}
                        style={StyleSheet.absoluteFill}
                        device={device}
                        isActive={true}
                        photo={true}
                        zoom={zoomLevel}
                        enableZoomGesture={false}
                        format={format}
                    />
                </View>
            </GestureDetector>

            <FocusIndicator
                focusAnimation={focusAnimation}
                focusPointAnimation={focusPointAnimation}
                isFocusLocked={isFocusLocked}
                screenWidth={SCREEN_WIDTH}
                screenHeight={SCREEN_HEIGHT}
            />

            <ZoomControl
                showZoomSlider={showZoomSlider}
                zoomLevel={zoomLevel}
                minZoom={MIN_ZOOM}
                maxZoom={MAX_ZOOM}
                zoomStep={ZOOM_STEP}
                onZoomChange={handleZoomChange}
            />

            <CameraControls
                onCapture={onCapture}
                onFlipCamera={() => setCameraPosition(p => p === 'front' ? 'back' : 'front')}
                onToggleFlash={() => setFlash(f => f === 'off' ? 'on' : 'off')}
                onToggleGrid={() => setShowGrid(!showGrid)}
                onToggleFocusLock={() => setIsFocusLocked(!isFocusLocked)}
                flash={flash}
                showGrid={showGrid}
                isFocusLocked={isFocusLocked}
                bottomInset={insets.bottom}
            />

            {showGrid && (
                <View style={styles.gridOverlay}>
                    <View style={styles.gridRow}>
                        <View style={styles.gridLine} />
                        <View style={styles.gridLine} />
                    </View>
                    <View style={styles.gridColumn}>
                        <View style={styles.gridLine} />
                        <View style={styles.gridLine} />
                    </View>
                </View>
            )}
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    errorText: {
        color: 'white',
        fontSize: 16,
    },
    gridOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1,
    },
    gridRow: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    gridColumn: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'column',
        justifyContent: 'space-around',
    },
    gridLine: {
        flex: 1,
        borderWidth: 0.5,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    }
});

export default CameraScreen;