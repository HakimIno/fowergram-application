import { StyleSheet, View, Platform, Dimensions, Pressable, Text } from 'react-native'
import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Camera, CameraPermissionStatus, useCameraDevice, CameraPosition, CameraRuntimeError } from 'react-native-vision-camera'
import { BlurView } from 'expo-blur'
import Animated, {
    FadeIn,
    FadeOut,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    runOnJS,
    interpolate,
    Extrapolate
} from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

interface VideoCallViewProps {
    user: {
        id: string
        name: string
        avatar: string
        isOnline: boolean
    }
    theme: any
    isDarkMode: boolean
    isCameraOn?: boolean
}

const SPRING_CONFIG = {
    damping: 15,
    stiffness: 100,
    mass: 1
}

const LOCAL_VIDEO_WIDTH = 100
const LOCAL_VIDEO_HEIGHT = 150
const SNAP_POINTS = {
    x: [20, SCREEN_WIDTH - LOCAL_VIDEO_WIDTH - 20],
    y: [40, SCREEN_HEIGHT - LOCAL_VIDEO_HEIGHT - 120]
}

const VideoCallView = ({ user, theme, isDarkMode, isCameraOn = true }: VideoCallViewProps) => {
    const [hasPermission, setHasPermission] = useState<CameraPermissionStatus>('not-determined')
    const [cameraError, setCameraError] = useState<string | null>(null)
    const [cameraPosition, setCameraPosition] = useState<CameraPosition>('front')
    const device = useCameraDevice(cameraPosition)
    const [isLocalVideoMinimized, setIsLocalVideoMinimized] = useState(false)
    const [isZoomed, setIsZoomed] = useState(false)
    const insets = useSafeAreaInsets()

    const mainCameraRef = useRef<Camera>(null)
    const previewCameraRef = useRef<Camera>(null)

    const localVideoScale = useSharedValue(1)
    const localVideoPosition = useSharedValue({
        x: SCREEN_WIDTH - LOCAL_VIDEO_WIDTH - 20,
        y: 40 + insets.top
    })
    const localVideoContext = useSharedValue({ x: 0, y: 0 })
    const mainVideoZoom = useSharedValue(1)

    useEffect(() => {
        const requestPermissions = async () => {
            try {
                const cameraPermission = await Camera.requestCameraPermission()
                const micPermission = await Camera.requestMicrophonePermission()
                
                if (cameraPermission === 'denied' || micPermission === 'denied') {
                    setCameraError('Camera or microphone permission denied')
                    return
                }
                
                setHasPermission(cameraPermission)
            } catch (error) {
                console.error('Error requesting permissions:', error)
                setCameraError('Failed to request camera permissions')
            }
        }
        requestPermissions()
    }, [])

    const onCameraError = useCallback((error: CameraRuntimeError) => {
        console.error('Camera error:', error)
        setCameraError(error.message)
    }, [])

    const onCameraInitialized = useCallback(() => {
        console.log('Camera initialized')
        setCameraError(null)
    }, [])

    const handleFlipCamera = useCallback(() => {
        setCameraPosition(p => p === 'front' ? 'back' : 'front')
    }, [])

    const handleDoubleTap = useCallback(() => {
        setIsZoomed(prev => !prev)
        mainVideoZoom.value = withSpring(mainVideoZoom.value === 1 ? 2 : 1, SPRING_CONFIG)
    }, [])

    const snapToClosestPoint = useCallback((x: number, y: number) => {
        'worklet';
        const closestX = SNAP_POINTS.x.reduce((prev, curr) =>
            Math.abs(curr - x) < Math.abs(prev - x) ? curr : prev
        )
        const closestY = SNAP_POINTS.y.reduce((prev, curr) =>
            Math.abs(curr - y) < Math.abs(prev - y) ? curr : prev
        )
        return { x: closestX, y: closestY }
    }, [])

    const panGesture = Gesture.Pan()
        .onStart(() => {
            localVideoContext.value = {
                x: localVideoPosition.value.x,
                y: localVideoPosition.value.y
            }
            localVideoScale.value = withSpring(0.95, SPRING_CONFIG)
        })
        .onUpdate((event) => {
            localVideoPosition.value = {
                x: localVideoContext.value.x + event.translationX,
                y: localVideoContext.value.y + event.translationY
            }
        })
        .onEnd((event) => {
            const { x, y } = snapToClosestPoint(
                localVideoContext.value.x + event.translationX,
                localVideoContext.value.y + event.translationY
            )
            localVideoPosition.value = {
                x: withSpring(x, SPRING_CONFIG),
                y: withSpring(y, SPRING_CONFIG)
            }
            localVideoScale.value = withSpring(1, SPRING_CONFIG)

            // Update minimized state based on position
            runOnJS(setIsLocalVideoMinimized)(y > SCREEN_HEIGHT / 2)
        })

    const tapGesture = Gesture.Tap()
        .onStart(() => {
            if (isLocalVideoMinimized) {
                localVideoPosition.value = {
                    x: SNAP_POINTS.x[1],
                    y: SNAP_POINTS.y[0]
                }
                runOnJS(setIsLocalVideoMinimized)(false)
            } else {
                localVideoPosition.value = {
                    x: SNAP_POINTS.x[1],
                    y: SNAP_POINTS.y[1]
                }
                runOnJS(setIsLocalVideoMinimized)(true)
            }
        })

    const composed = Gesture.Simultaneous(panGesture, tapGesture)

    const localVideoStyle = useAnimatedStyle(() => {
        const scale = interpolate(
            localVideoPosition.value.y,
            [SNAP_POINTS.y[0], SNAP_POINTS.y[1]],
            [1, 0.7],
            Extrapolate.CLAMP
        )

        return {
            transform: [
                { scale: localVideoScale.value * scale },
                { translateX: localVideoPosition.value.x },
                { translateY: localVideoPosition.value.y }
            ],
            opacity: interpolate(
                localVideoPosition.value.y,
                [SNAP_POINTS.y[0], SNAP_POINTS.y[1]],
                [1, 0.8],
                Extrapolate.CLAMP
            )
        }
    })

    const mainVideoStyle = useAnimatedStyle(() => ({
        transform: [{ scale: mainVideoZoom.value }]
    }))

    if (!device || hasPermission !== 'granted') {
        return (
            <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
                <BlurView
                    intensity={90}
                    tint={isDarkMode ? 'dark' : 'light'}
                    style={StyleSheet.absoluteFill}
                />
                <Image
                    source={{ uri: user.avatar }}
                    style={styles.fullScreenImage}
                    contentFit="cover"
                    transition={200}
                />
                {cameraError && (
                    <View style={styles.errorContainer}>
                        <Text style={[styles.errorText, { color: theme.textColor }]}>
                            {cameraError}
                        </Text>
                    </View>
                )}
            </View>
        )
    }

    return (
        <View style={styles.container}>
            {device && isCameraOn ? (
                <GestureDetector gesture={Gesture.Tap().numberOfTaps(2).onStart(handleDoubleTap)}>
                    <Animated.View style={[styles.mainVideoContainer, mainVideoStyle]}>
                        <Camera
                            ref={mainCameraRef}
                            style={StyleSheet.absoluteFill}
                            device={device}
                            isActive={true}
                            enableZoomGesture
                            zoom={1}
                            video={true}
                            audio={true}
                            onError={onCameraError}
                            onInitialized={onCameraInitialized}
                        />
                    </Animated.View>
                </GestureDetector>
            ) : (
                <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
                    <BlurView
                        intensity={90}
                        tint={isDarkMode ? 'dark' : 'light'}
                        style={StyleSheet.absoluteFill}
                    />
                    <Image
                        source={{ uri: user.avatar }}
                        style={styles.fullScreenImage}
                        contentFit="cover"
                        transition={200}
                    />
                </View>
            )}

            {/* Local Video Preview */}
            <GestureDetector gesture={composed}>
                <Animated.View
                    style={[
                        styles.localVideoContainer,
                        { backgroundColor: theme.cardBackground },
                        localVideoStyle
                    ]}
                >
                    {device && isCameraOn ? (
                        <Pressable onPress={handleFlipCamera} style={styles.localVideo}>
                            <Camera
                                ref={previewCameraRef}
                                style={StyleSheet.absoluteFill}
                                device={device}
                                isActive={true}
                                video={true}
                                audio={false}
                                zoom={1}
                                onError={onCameraError}
                            />
                        </Pressable>
                    ) : (
                        <View style={[styles.localVideo, { backgroundColor: theme.cardBackground }]}>
                            <Ionicons name="videocam-off" size={24} color={theme.textColor} />
                        </View>
                    )}
                </Animated.View>
            </GestureDetector>

            {/* Remote User's Video (Placeholder for now) */}
            <Image
                source={{ uri: user.avatar }}
                style={[
                    styles.remoteVideo,
                    { opacity: isCameraOn ? 0 : 0.5 }
                ]}
                contentFit="cover"
                transition={200}
            />

            {cameraError && (
                <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, { color: theme.textColor }]}>
                        {cameraError}
                    </Text>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    fullScreenImage: {
        width: '100%',
        height: '100%',
    },
    mainVideoContainer: {
        flex: 1,
        overflow: 'hidden',
    },
    localVideoContainer: {
        position: 'absolute',
        width: LOCAL_VIDEO_WIDTH,
        height: LOCAL_VIDEO_HEIGHT,
        borderRadius: 12,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    localVideo: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    remoteVideo: {
        ...StyleSheet.absoluteFillObject,
    },
    errorContainer: {
        position: 'absolute',
        top: '50%',
        left: 20,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    errorText: {
        fontSize: 14,
        textAlign: 'center',
        fontFamily: 'Chirp_Medium',
    },
})

export default VideoCallView 