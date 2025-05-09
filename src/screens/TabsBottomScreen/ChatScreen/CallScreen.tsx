import { View, Text, StyleSheet, Pressable, Dimensions, Platform } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { BlurView } from 'expo-blur'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from 'src/context/ThemeContext'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
    ZoomIn,
    FadeIn,
    FadeOut
} from 'react-native-reanimated'
import { StatusBar } from 'expo-status-bar'
import VideoCallView from './VideoCallView'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

interface CallScreenProps {
    route: {
        params: {
            user: {
                id: string
                name: string
                avatar: string
                isOnline: boolean
            }
            type: 'voice' | 'video'
        }
    }
    navigation: any
}

const SPRING_CONFIG = {
    damping: 15,
    stiffness: 100,
    mass: 1
}

const CallScreen = ({ route, navigation }: CallScreenProps) => {
    const { user, type } = route.params
    const { theme, isDarkMode } = useTheme()
    const insets = useSafeAreaInsets()
    const [isCameraOn, setIsCameraOn] = useState(true)

    // Animations
    const callRingScale = useSharedValue(1)
    const callRingOpacity = useSharedValue(1)
    const avatarScale = useSharedValue(1)
    const micButtonRotate = useSharedValue(0)
    const speakerButtonScale = useSharedValue(1)
    const videoButtonScale = useSharedValue(1)
    const endCallButtonScale = useSharedValue(1)

    useEffect(() => {
        // Start call ring animation
        callRingScale.value = withRepeat(
            withSequence(
                withTiming(1.5, { duration: 1000, easing: Easing.out(Easing.ease) }),
                withTiming(1, { duration: 1000, easing: Easing.in(Easing.ease) })
            ),
            -1,
            true
        )

        callRingOpacity.value = withRepeat(
            withSequence(
                withTiming(0.2, { duration: 1000, easing: Easing.out(Easing.ease) }),
                withTiming(1, { duration: 1000, easing: Easing.in(Easing.ease) })
            ),
            -1,
            true
        )

        // Subtle avatar breathing animation
        avatarScale.value = withRepeat(
            withSequence(
                withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        )
    }, [])

    const handleEndCall = useCallback(() => {
        endCallButtonScale.value = withSequence(
            withSpring(0.8, SPRING_CONFIG),
            withSpring(1, SPRING_CONFIG)
        )
        navigation.goBack()
    }, [navigation])

    const handleToggleMic = useCallback(() => {
        micButtonRotate.value = withSequence(
            withSpring(-15, SPRING_CONFIG),
            withSpring(0, SPRING_CONFIG)
        )
    }, [])

    const handleToggleSpeaker = useCallback(() => {
        speakerButtonScale.value = withSequence(
            withSpring(0.8, SPRING_CONFIG),
            withSpring(1, SPRING_CONFIG)
        )
    }, [])

    const handleToggleVideo = useCallback(() => {
        videoButtonScale.value = withSequence(
            withSpring(0.8, SPRING_CONFIG),
            withSpring(1, SPRING_CONFIG)
        )
        setIsCameraOn(prev => !prev)
    }, [])

    const callRingStyle = useAnimatedStyle(() => ({
        transform: [{ scale: callRingScale.value }],
        opacity: callRingOpacity.value
    }))

    const avatarStyle = useAnimatedStyle(() => ({
        transform: [{ scale: avatarScale.value }]
    }))

    const micButtonStyle = useAnimatedStyle(() => ({
        transform: [
            { rotate: `${micButtonRotate.value}deg` },
            { scale: interpolate(micButtonRotate.value, [-15, 0], [0.8, 1]) }
        ]
    }))

    const speakerButtonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: speakerButtonScale.value }]
    }))

    const videoButtonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: videoButtonScale.value }]
    }))

    const endCallButtonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: endCallButtonScale.value }]
    }))

    return (
        <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
            <StatusBar style={isDarkMode ? 'light' : 'dark'} />

            {type === 'video' ? (
                <VideoCallView
                    user={user}
                    theme={theme}
                    isDarkMode={isDarkMode}
                    isCameraOn={isCameraOn}
                />
            ) : (
                <>
                    {/* Background Blur */}
                    <BlurView
                        intensity={90}
                        tint={isDarkMode ? 'dark' : 'light'}
                        style={StyleSheet.absoluteFill}
                    />

                    {/* Call Ring Animation */}
                    <Animated.View
                        style={[
                            styles.callRing,
                            { borderColor: theme.primary + '40' },
                            callRingStyle
                        ]}
                    />

                    {/* User Info */}
                    <View style={[styles.userInfo, { marginTop: insets.top + 60 }]}>
                        <Animated.View
                            entering={ZoomIn.delay(300).springify()}
                            style={avatarStyle}
                        >
                            <Image
                                source={{ uri: user.avatar }}
                                style={styles.avatar}
                                contentFit="cover"
                                transition={200}
                            />
                        </Animated.View>
                        <Animated.Text
                            entering={FadeIn.delay(400)}
                            style={[styles.userName, { color: theme.textColor }]}
                        >
                            {user.name}
                        </Animated.Text>
                        <Animated.Text
                            entering={FadeIn.delay(500)}
                            style={[styles.callStatus, { color: theme.textColor + '80' }]}
                        >
                            {type === 'voice' ? 'Voice Call' : 'Video Call'}...
                        </Animated.Text>
                    </View>
                </>
            )}

            {/* Call Controls */}
            <Animated.View
                entering={FadeIn.delay(600)}
                style={[styles.controls, { paddingBottom: insets.bottom + 20 }]}
            >
                <View style={styles.controlsRow}>
                    <Animated.View style={micButtonStyle}>
                        <Pressable
                            style={[styles.controlButton, { backgroundColor: theme.cardBackground }]}
                            onPress={handleToggleMic}
                        >
                            <Ionicons name="mic" size={24} color={theme.textColor} />
                        </Pressable>
                    </Animated.View>

                    <Animated.View style={speakerButtonStyle}>
                        <Pressable
                            style={[styles.controlButton, { backgroundColor: theme.cardBackground }]}
                            onPress={handleToggleSpeaker}
                        >
                            <Ionicons name="volume-high" size={24} color={theme.textColor} />
                        </Pressable>
                    </Animated.View>

                    {type === 'video' && (
                        <Animated.View style={videoButtonStyle}>
                            <Pressable
                                style={[styles.controlButton, { backgroundColor: theme.cardBackground }]}
                                onPress={handleToggleVideo}
                            >
                                <Ionicons 
                                    name={isCameraOn ? "videocam" : "videocam-off"} 
                                    size={24} 
                                    color={theme.textColor} 
                                />
                            </Pressable>
                        </Animated.View>
                    )}
                </View>

                <Animated.View style={endCallButtonStyle}>
                    <Pressable
                        style={[styles.endCallButton, { backgroundColor: '#ff3b30' }]}
                        onPress={handleEndCall}
                    >
                        <Ionicons name="call" size={32} color="white" style={{ transform: [{ rotate: '135deg' }] }} />
                    </Pressable>
                </Animated.View>
            </Animated.View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    callRing: {
        position: 'absolute',
        top: SCREEN_HEIGHT * 0.2,
        width: SCREEN_WIDTH * 0.8,
        height: SCREEN_WIDTH * 0.8,
        borderRadius: SCREEN_WIDTH * 0.4,
        borderWidth: 2,
    },
    userInfo: {
        alignItems: 'center',
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    userName: {
        fontSize: 24,
        fontWeight: '600',
        marginTop: 20,
        marginBottom: 8,
        fontFamily: 'Chirp_Bold',
    },
    callStatus: {
        fontSize: 16,
        fontFamily: 'Chirp_Medium',
    },
    controls: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        marginBottom: 30,
    },
    controlButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 3,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    endCallButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
})

export default CallScreen 