import React, { useEffect, useMemo, useCallback } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Dimensions, Platform } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withSpring,
    useSharedValue,
    withSequence,
    withTiming,
    runOnJS,
    useAnimatedReaction,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const SLIDER_HEIGHT = 200;
const SLIDER_WIDTH = 40;
const KNOB_SIZE = 24;
const TICK_COUNT = 10;
const TRACK_PADDING = KNOB_SIZE / 2;
const TRACK_HEIGHT = SLIDER_HEIGHT - TRACK_PADDING * 2; // Adjusted track height

const SPRING_CONFIG = {
    damping: 15,
    stiffness: 150,
    mass: 0.8,
};

interface Props {
    showZoomSlider: boolean;
    zoomLevel: number;
    minZoom: number;
    maxZoom: number;
    zoomStep: number;
    onZoomChange: (value: number) => void;
}

const Tick = React.memo(({ isActive }: { isActive: boolean }) => (
    <View style={[styles.tick, isActive && styles.activeTick]} />
));

const TicksContainer = React.memo(({ zoomLevel, minZoom, maxZoom }: {
    zoomLevel: number;
    minZoom: number;
    maxZoom: number;
}) => {
    const ticks = useMemo(() => {
        return Array.from({ length: TICK_COUNT }, (_, i) => {
            const isActive = (i / (TICK_COUNT - 1)) >= (1 - (zoomLevel - minZoom) / (maxZoom - minZoom));
            return <Tick key={i} isActive={isActive} />;
        });
    }, [zoomLevel, minZoom, maxZoom]);

    return <View style={styles.tickContainer}>{ticks}</View>;
});

// Function to trigger haptic feedback
const triggerHaptic = () => {
    if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
};

export const ZoomControl = React.memo(({
    showZoomSlider,
    zoomLevel,
    minZoom,
    maxZoom,
    zoomStep,
    onZoomChange
}: Props) => {
    const opacity = useSharedValue(0);
    const translateX = useSharedValue(50);
    const sliderPosition = useSharedValue(0);
    const lastTickIndex = useSharedValue(-1);

    useEffect(() => {
        if (showZoomSlider) {
            opacity.value = withSpring(1);
            translateX.value = withSpring(0);
        } else {
            opacity.value = withTiming(0);
            translateX.value = withTiming(50);
        }
    }, [showZoomSlider]);

    useEffect(() => {
        const progress = (zoomLevel - minZoom) / (maxZoom - minZoom);
        sliderPosition.value = withSpring(TRACK_HEIGHT * (1 - progress), SPRING_CONFIG);
    }, [zoomLevel]);

    const containerStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateX: translateX.value }]
    }));

    const knobStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: sliderPosition.value }]
    }));

    // Function to calculate zoom from position
    const calculateZoomFromPosition = (position: number) => {
        'worklet';
        const progress = 1 - (position / TRACK_HEIGHT);
        const newZoom = minZoom + progress * (maxZoom - minZoom);
        return Math.max(minZoom, Math.min(maxZoom, newZoom));
    };

    // Function to check if tick should trigger haptic
    const checkAndTriggerHaptic = (position: number) => {
        'worklet';
        const tickSpacing = TRACK_HEIGHT / (TICK_COUNT - 1);
        const currentTickIndex = Math.round(position / tickSpacing);

        if (currentTickIndex !== lastTickIndex.value) {
            lastTickIndex.value = currentTickIndex;
            runOnJS(triggerHaptic)();
        }
    };

    const updateZoom = useCallback((position: number) => {
        'worklet';
        const newZoom = calculateZoomFromPosition(position);
        runOnJS(onZoomChange)(newZoom);
    }, [onZoomChange, minZoom, maxZoom]);

    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            const newPosition = Math.max(0, Math.min(e.y, TRACK_HEIGHT));
            sliderPosition.value = newPosition;
            checkAndTriggerHaptic(newPosition);
            updateZoom(newPosition);
        });

    const tapGesture = Gesture.Tap()
        .onStart((e) => {
            const newPosition = Math.max(0, Math.min(e.y, TRACK_HEIGHT));
            sliderPosition.value = withSpring(newPosition, SPRING_CONFIG);
            checkAndTriggerHaptic(newPosition);
            updateZoom(newPosition);
        });

    const composed = Gesture.Simultaneous(panGesture, tapGesture);

    const handleZoomStep = useCallback((increase: boolean) => {
        const newZoom = Math.min(Math.max(zoomLevel + (increase ? zoomStep : -zoomStep), minZoom), maxZoom);
        triggerHaptic();
        onZoomChange(newZoom);
    }, [zoomLevel, zoomStep, minZoom, maxZoom, onZoomChange]);

    return (
        <Animated.View style={[styles.zoomControl, containerStyle]}>
            <View style={styles.zoomSliderContainer}>
                <TouchableOpacity
                    style={styles.zoomButton}
                    onPress={() => handleZoomStep(true)}
                >
                    <Ionicons name="add" size={18} color="white" />
                </TouchableOpacity>

                <View style={styles.sliderTrackContainer}>
                    <GestureDetector gesture={composed}>
                        <View style={styles.gestureArea}>
                            <View style={styles.sliderTrack}>
                                <TicksContainer
                                    zoomLevel={zoomLevel}
                                    minZoom={minZoom}
                                    maxZoom={maxZoom}
                                />
                            </View>
                            <Animated.View style={[styles.sliderKnob, knobStyle]}>
                                <Text style={styles.zoomText}>{zoomLevel.toFixed(1)}x</Text>
                            </Animated.View>
                        </View>
                    </GestureDetector>
                </View>

                <TouchableOpacity
                    style={styles.zoomButton}
                    onPress={() => handleZoomStep(false)}
                >
                    <Ionicons name="remove" size={18} color="white" />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
});

const styles = StyleSheet.create({
    zoomControl: {
        position: 'absolute',
        right: 16,
        top: '50%',
        transform: [{ translateY: -SLIDER_HEIGHT / 2 }],
        alignItems: 'center',
        zIndex: 10
    },
    zoomSliderContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        borderRadius: SLIDER_WIDTH,
    },
    zoomButton: {
        width: SLIDER_WIDTH - 16,
        height: SLIDER_WIDTH - 16,
        borderRadius: (SLIDER_WIDTH - 16) / 2,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 2,
    },
    sliderTrackContainer: {
        width: SLIDER_WIDTH,
        height: SLIDER_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: TRACK_PADDING,
    },
    gestureArea: {
        width: SLIDER_WIDTH,
        height: TRACK_HEIGHT,
        alignItems: 'center',
    },
    sliderTrack: {
        width: 2,
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 1,
    },
    tickContainer: {
        position: 'absolute',
        left: -6,
        right: -6,
        top: 0,
        bottom: 0,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    tick: {
        width: 8,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    activeTick: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
    },
    sliderKnob: {
        position: 'absolute',
        paddingHorizontal: 2,
        paddingVertical: 1,
        borderRadius: KNOB_SIZE / 2,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        // Ambient light effect
        shadowColor: "#6366F1",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    // Additional inner shadow effect
    knobInner: {
        position: 'absolute',
        width: KNOB_SIZE - 8,
        height: KNOB_SIZE - 8,
        borderRadius: (KNOB_SIZE - 8) / 2,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    // Active state overlay
    knobActiveOverlay: {
        position: 'absolute',
        width: KNOB_SIZE + 8,
        height: KNOB_SIZE + 8,
        borderRadius: (KNOB_SIZE + 8) / 2,
        borderWidth: 2,
        borderColor: 'rgba(99, 102, 241, 0.2)',
        opacity: 0.5,
    },
    zoomText: {
        color: '#000',
        fontSize: 9,
        fontWeight: 'bold',
    }
});