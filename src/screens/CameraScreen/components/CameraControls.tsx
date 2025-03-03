import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
    useSharedValue,
    interpolateColor,
    Easing,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
    onCapture: () => void;
    onFlipCamera: () => void;
    onToggleFlash: () => void;
    onToggleGrid: () => void;
    onToggleFocusLock: () => void;
    flash: 'on' | 'off';
    showGrid: boolean;
    isFocusLocked: boolean;
    bottomInset: number;
}

const SPRING_CONFIG = {
    damping: 15,
    mass: 1,
    stiffness: 150,
};

export const CameraControls = ({
    onCapture,
    onFlipCamera,
    onToggleFlash,
    onToggleGrid,
    onToggleFocusLock,
    flash,
    showGrid,
    isFocusLocked,
    bottomInset
}: Props) => {
    // Animated values
    const captureScale = useSharedValue(1);
    const controlScale = useSharedValue(1);
    const focusLockRotation = useSharedValue(0);
    const flashOpacity = useSharedValue(flash === 'on' ? 1 : 0);

    // Animation styles
    const captureButtonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: captureScale.value }],
    }));

    const controlButtonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: controlScale.value }],
    }));

    const focusLockStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: controlScale.value },
            { rotate: `${focusLockRotation.value}deg` }
        ],
        backgroundColor: interpolateColor(
            controlScale.value,
            [1, 1.2],
            ['rgba(0, 0, 0, 0.3)', isFocusLocked ? 'rgba(255, 215, 0, 0.3)' : 'rgba(0, 0, 0, 0.3)']
        ),
    }));

    const handleCapturePress = () => {
        captureScale.value = withSequence(
            withSpring(0.9, SPRING_CONFIG),
            withSpring(1, SPRING_CONFIG)
        );
        onCapture();
    };

    const handleControlPress = (handler: () => void) => {
        controlScale.value = withSequence(
            withSpring(0.8, SPRING_CONFIG),
            withSpring(1, SPRING_CONFIG)
        );
        handler();
    };

    const handleFocusLockPress = () => {
        controlScale.value = withSequence(
            withSpring(1.2, SPRING_CONFIG),
            withSpring(1, SPRING_CONFIG)
        );
        focusLockRotation.value = withSequence(
            withTiming(isFocusLocked ? -180 : 0, {
                duration: 300,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            })
        );
        onToggleFocusLock();
    };

    return (
        <View style={[styles.container, { paddingBottom: bottomInset + 20 }]}>
            {/* Top Controls */}
            {/* <View style={styles.topControls}>
                <AnimatedPressable
                    style={[styles.controlButton, controlButtonStyle]}
                    onPress={() => handleControlPress(onToggleFlash)}
                >
                    <Ionicons
                        name={flash === 'on' ? 'flash' : 'flash-off'}
                        size={24}
                        color="white"
                    />
                </AnimatedPressable>

                <AnimatedPressable
                    style={[styles.controlButton, controlButtonStyle]}
                    onPress={() => handleControlPress(onToggleGrid)}
                >
                    <Ionicons
                        name={showGrid ? 'grid' : 'grid-outline'}
                        size={24}
                        color="white"
                    />
                </AnimatedPressable>
            </View> */}

            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
                <AnimatedPressable
                    style={[styles.controlButton, focusLockStyle]}
                    onPress={handleFocusLockPress}
                >
                    <Ionicons
                        name={isFocusLocked ? "lock-closed" : "lock-open"}
                        size={24}
                        color="white"
                    />
                </AnimatedPressable>

                <AnimatedPressable
                    style={[styles.captureButton, captureButtonStyle]}
                    onPress={handleCapturePress}
                >
                    <View style={styles.captureButtonInner}>
                        <View style={styles.captureButtonCore} />
                    </View>
                </AnimatedPressable>

                <AnimatedPressable
                    style={[styles.controlButton, controlButtonStyle]}
                    onPress={() => handleControlPress(onFlipCamera)}
                >
                    <Ionicons
                        name="camera-reverse-outline"
                        size={24}
                        color="white"
                    />
                </AnimatedPressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 0
    },
    topControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    bottomControls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 30,
        paddingVertical: 20,
    },
    controlButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    captureButton: {
        width: 84,
        height: 84,
        borderRadius: 42,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 2,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    captureButtonInner: {
        flex: 1,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: 'white',
        padding: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButtonCore: {
        width: '100%',
        height: '100%',
        borderRadius: 35,
        backgroundColor: 'white',
        opacity: 0.9,
    },
});