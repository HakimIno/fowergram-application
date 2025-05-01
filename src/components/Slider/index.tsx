import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions, Text, Platform } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedGestureHandler,
    withTiming,
    withSpring,
    runOnJS,
    interpolate,
    Extrapolate,
    useDerivedValue,
    withSequence,
    withDelay,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');
const SLIDER_WIDTH = width * 0.8;
const KNOB_SIZE = 24;
const BUBBLE_HEIGHT = 40;
const BUBBLE_WIDTH = 50;

// อินเตอร์เฟซสำหรับการกำหนดค่า config
interface SliderConfig {
    trackColor?: string;
    fillColor?: string;
    knobColor?: string;
    knobShadowColor?: string;
    trackHeight?: number;
    minValue?: number;
    maxValue?: number;
    initialValue?: number;
    bubbleColor?: string;
    bubbleTextColor?: string;
}

// อินเตอร์เฟซสำหรับ props ของ component
interface CustomSliderProps {
    config?: SliderConfig;
    onValueChange?: (value: number) => void;
}

// ค่า default config
const defaultConfig: SliderConfig = {
    trackColor: '#333333',
    fillColor: '#3E67FF',
    knobColor: '#ffffff',
    knobShadowColor: 'rgba(0, 0, 0, 0.3)',
    trackHeight: 6,
    minValue: 0,
    maxValue: 100,
    initialValue: 50,
    bubbleColor: '#ffffff',
    bubbleTextColor: '#3C3AA0',
};

// Spring and timing configs for ultra-smooth animation
const SPRING_CONFIG = {
    damping: 30,
    mass: 0.5,
    stiffness: 120,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 2,
};

const TIMING_CONFIG = {
    duration: 300,
};

const Slider: React.FC<CustomSliderProps> = ({
    config = defaultConfig,
    onValueChange = () => { },
}) => {
    const {
        trackColor,
        fillColor,
        knobColor,
        knobShadowColor,
        trackHeight,
        minValue,
        maxValue,
        initialValue,
        bubbleColor,
        bubbleTextColor,
    } = useMemo(() => ({ ...defaultConfig, ...config }), [config]);

    // Main position control
    const translateX = useSharedValue(
        ((initialValue! - minValue!) / (maxValue! - minValue!)) * (SLIDER_WIDTH - KNOB_SIZE)
    );
    
    // Derived values
    const progress = useDerivedValue(() => {
        return translateX.value + KNOB_SIZE / 2;
    });
    
    const currentValue = useDerivedValue(() => {
        return Math.round(
            minValue! + (translateX.value / (SLIDER_WIDTH - KNOB_SIZE)) * (maxValue! - minValue!)
        );
    });
    
    // Animation controls
    const bubbleScale = useSharedValue(1);
    const knobScale = useSharedValue(1);
    const trackPulse = useSharedValue(0);
    
    // Handler for interactive gestures
    const gestureHandler = useAnimatedGestureHandler({
        onStart: (_, ctx: { startX: number }) => {
            ctx.startX = translateX.value;
            
            // Subtle animation effects on start
            bubbleScale.value = withSequence(
                withTiming(0.9, { duration: 100 }),
                withTiming(1.1, { duration: 100 }),
                withTiming(1, { duration: 150 })
            );
            
            knobScale.value = withSequence(
                withTiming(1.3, { duration: 100 }),
                withTiming(1.1, { duration: 150 })
            );
            
            trackPulse.value = withSequence(
                withTiming(1, { duration: 200 }),
                withTiming(0, { duration: 700 })
            );
        },
        onActive: (event, ctx: { startX: number }) => {
            'worklet';
            const newValue = Math.min(
                Math.max(ctx.startX + event.translationX, 0),
                SLIDER_WIDTH - KNOB_SIZE
            );
            
            // Use direct assignment for immediate feedback
            translateX.value = newValue;
            
            // Only call JS function for value updates
            runOnJS(onValueChange)(currentValue.value);
        },
        onEnd: () => {
            'worklet';
            // Apply smooth spring animation to settle
            translateX.value = withSpring(translateX.value, SPRING_CONFIG);
            
            // Animate knob back to normal size with slight bounce
            knobScale.value = withSequence(
                withTiming(0.9, { duration: 150 }),
                withTiming(1, { duration: 200 })
            );
            
            // Pulse track once more
            trackPulse.value = withSequence(
                withTiming(0.5, { duration: 150 }),
                withTiming(0, { duration: 300 })
            );
        },
    });

    // Animated styles
    const knobStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { scale: knobScale.value }
        ],
    }));

    const fillStyle = useAnimatedStyle(() => ({
        width: progress.value,
        opacity: interpolate(
            trackPulse.value,
            [0, 1],
            [1, 0.8]
        ),
    }));
    
    const trackPulseStyle = useAnimatedStyle(() => {
        return {
            width: SLIDER_WIDTH,
            height: interpolate(
                trackPulse.value,
                [0, 1],
                [trackHeight!, trackHeight! * 2]
            ),
            opacity: trackPulse.value * 0.5,
            borderRadius: (trackHeight! * 2) / 2,
        };
    });

    const bubbleStyle = useAnimatedStyle(() => {
        // Make bubble follow the knob
        const bubblePosition = interpolate(
            translateX.value,
            [0, SLIDER_WIDTH - KNOB_SIZE],
            [0, SLIDER_WIDTH - BUBBLE_WIDTH],
            Extrapolate.CLAMP
        );
        
        return {
            transform: [
                { translateX: bubblePosition },
                { scale: bubbleScale.value }
            ],
        };
    });

    const trackStyle = useMemo(
        () => ({
            backgroundColor: trackColor,
            height: trackHeight,
            borderRadius: trackHeight! / 2,
        }),
        [trackColor, trackHeight]
    );

    const knobStaticStyle = useMemo(
        () => ({
            backgroundColor: knobColor,
            width: KNOB_SIZE,
            height: KNOB_SIZE,
            borderRadius: KNOB_SIZE / 2,
            shadowColor: knobShadowColor,
            shadowOpacity: 0.5,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
            elevation: 4,
            position: 'absolute' as const,
            top: '50%' as any,
            marginTop: -KNOB_SIZE / 2,
        }),
        [knobColor, knobShadowColor]
    );

    // Value text for display
    const displayValue = useDerivedValue(() => {
        return `${currentValue.value}`;
    });

    return (
        <View style={styles.container}>
            {/* Value Bubble */}
            <Animated.View style={[styles.bubble, { backgroundColor: bubbleColor }, bubbleStyle]}>
                <Animated.Text style={[styles.bubbleText, { color: bubbleTextColor }]}>
                    {displayValue.value}
                </Animated.Text>
                <View style={[styles.bubbleTip, { borderTopColor: bubbleColor }]} />
            </Animated.View>
            
            <View style={styles.sliderContainer}>
                {/* Background Track */}
                <View style={[styles.track, trackStyle]} />
                
                {/* Animated Pulse Effect */}
                <Animated.View 
                    style={[
                        styles.trackPulse, 
                        { backgroundColor: fillColor },
                        trackPulseStyle
                    ]} 
                />
                
                {/* Fill Track */}
                <Animated.View
                    style={[
                        styles.fill, 
                        { backgroundColor: fillColor, height: trackHeight },
                        fillStyle
                    ]}
                />
                
                {/* Interactive Knob */}
                <PanGestureHandler onGestureEvent={gestureHandler}>
                    <Animated.View style={[styles.knob, knobStaticStyle, knobStyle]}>
                        {Platform.OS === 'ios' && (
                            <BlurView 
                                intensity={30} 
                                style={styles.knobBlur} 
                                tint="light"
                            />
                        )}
                    </Animated.View>
                </PanGestureHandler>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: SLIDER_WIDTH,
        height: 80,
        justifyContent: 'center',
        alignSelf: 'center',
        paddingTop: BUBBLE_HEIGHT,
    },
    sliderContainer: {
        height: 40,
        justifyContent: 'center',
        position: 'relative',
    },
    track: {
        overflow: 'hidden',
        width: SLIDER_WIDTH,
    },
    trackPulse: {
        position: 'absolute',
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(62, 103, 255, 0.3)',
    },
    fill: {
        position: 'absolute',
        borderRadius: 3,
    },
    knob: {
        overflow: 'hidden',
    },
    knobBlur: {
        width: '100%',
        height: '100%',
        borderRadius: KNOB_SIZE / 2,
        overflow: 'hidden',
    },
    bubble: {
        position: 'absolute',
        top: 0,
        width: BUBBLE_WIDTH,
        height: BUBBLE_HEIGHT,
        borderRadius: BUBBLE_HEIGHT / 2,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 5,
    },
    bubbleText: {
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
    },
    bubbleTip: {
        position: 'absolute',
        bottom: -10,
        width: 0,
        height: 0,
        borderLeftWidth: 10,
        borderRightWidth: 10,
        borderTopWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
    },
});

export default Slider;