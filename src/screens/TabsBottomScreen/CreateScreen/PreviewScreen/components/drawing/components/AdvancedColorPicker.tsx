import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions, Pressable } from 'react-native';
import Animated, {
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    runOnJS,
    useAnimatedReaction,
} from 'react-native-reanimated';
import { PanGestureHandler, TapGestureHandler } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import {
    Canvas,
    Circle,
    Paint,
    Path,
    SweepGradient,
    vec,
    Rect,
    useCanvasRef,
    Skia,
    Group,
    RadialGradient,
    LinearGradient as SkiaLinearGradient,
} from '@shopify/react-native-skia';

// Constants
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLOR_PICKER_SIZE = Math.min(SCREEN_WIDTH - 80, 300);
const SELECTOR_SIZE = 32;
const SLIDER_WIDTH = COLOR_PICKER_SIZE - 40;
const SLIDER_HEIGHT = 40;
const MAX_RECENT_COLORS = 10;
const SATURATION_SQUARE_SIZE = COLOR_PICKER_SIZE - 80;

// Common colors for presets
const COMMON_COLORS = [
    '#ff0000', // Red
    '#ff9900', // Orange
    '#ffff00', // Yellow
    '#00ff00', // Green
    '#00ffff', // Cyan
    '#0000ff', // Blue
    '#9900ff', // Purple
    '#ff00ff', // Magenta
    '#ffffff', // White
    '#000000', // Black
];

// Color conversion utilities
const hsv2rgb = (h: number, s: number, v: number): { r: number, g: number, b: number } => {
    'worklet';
    let r = 0, g = 0, b = 0;

    if (s === 0) {
        r = g = b = v;
        return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
    }

    h = h % 1 * 6;
    const i = Math.floor(h);
    const f = h - i;
    const p = v * (1 - s);
    const q = v * (1 - s * f);
    const t = v * (1 - s * (1 - f));

    switch (i) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        default: r = v; g = p; b = q; break;
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
    };
};

const rgb2hex = (r: number, g: number, b: number): string => {
    'worklet';
    return `#${[r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('')}`;
};

const hex2rgb = (hex: string): { r: number, g: number, b: number } => {
    'worklet';
    hex = hex.replace('#', '');

    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return { r, g, b };
};

const rgb2hsv = (r: number, g: number, b: number): { h: number, s: number, v: number } => {
    'worklet';
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;
    const s = max === 0 ? 0 : delta / max;
    const v = max;

    if (delta !== 0) {
        if (max === r) {
            h = ((g - b) / delta) % 6;
        } else if (max === g) {
            h = (b - r) / delta + 2;
        } else {
            h = (r - g) / delta + 4;
        }

        h = h / 6;
        if (h < 0) h += 1;
    }

    return { h, s, v };
};

// Memoized color wheel component
const HueWheel = React.memo(() => {
    return (
        <Canvas style={styles.hueWheel}>
            {/* Background wheel */}
            <Circle cx={COLOR_PICKER_SIZE / 2} cy={COLOR_PICKER_SIZE / 2} r={COLOR_PICKER_SIZE / 2 - 15}>
                <Paint style="stroke" strokeWidth={30}>
                    <SweepGradient
                        c={vec(COLOR_PICKER_SIZE / 2, COLOR_PICKER_SIZE / 2)}
                        colors={[
                            '#FF0000', '#FFFF00', '#00FF00',
                            '#00FFFF', '#0000FF', '#FF00FF', '#FF0000'
                        ]}
                    />
                </Paint>
            </Circle>

            {/* Inner circle for contrast */}
            <Circle
                cx={COLOR_PICKER_SIZE / 2}
                cy={COLOR_PICKER_SIZE / 2}
                r={COLOR_PICKER_SIZE / 2 - 30}
                color="#333"
            />
        </Canvas>
    );
});

// Memoized saturation-value square component
const SatValSquare = React.memo(({ hueColor }: { hueColor: string }) => {
    return (
        <Canvas style={styles.satValSquare}>
            {/* Base color rectangle */}
            <Rect x={0} y={0} width={SATURATION_SQUARE_SIZE} height={SATURATION_SQUARE_SIZE} color={hueColor} />

            {/* White gradient overlay for saturation */}
            <Rect x={0} y={0} width={SATURATION_SQUARE_SIZE} height={SATURATION_SQUARE_SIZE}>
                <Paint style="fill">
                    <RadialGradient
                        c={vec(0, 0)}
                        r={SATURATION_SQUARE_SIZE * 1.5}
                        colors={['#FFFFFF', 'rgba(255,255,255,0)']}
                    />
                </Paint>
            </Rect>

            {/* Black gradient overlay for value/brightness */}
            <Rect x={0} y={0} width={SATURATION_SQUARE_SIZE} height={SATURATION_SQUARE_SIZE}>
                <Paint style="fill">
                    <SkiaLinearGradient
                        start={vec(0, 0)}
                        end={vec(0, SATURATION_SQUARE_SIZE)}
                        colors={['rgba(0,0,0,0)', '#000000']}
                    />
                </Paint>
            </Rect>
        </Canvas>
    );
});

interface AdvancedColorPickerProps {
    initialColor?: string;
    onColorChange: (color: string) => void;
    onClose: () => void;
}

const AdvancedColorPicker: React.FC<AdvancedColorPickerProps> = ({
    initialColor = '#FF0000',
    onColorChange,
    onClose
}) => {
    // Parse initial color or use default red
    const parseInitialColor = useCallback(() => {
        try {
            return initialColor && initialColor.length >= 4 ? initialColor : '#FF0000';
        } catch (e) {
            return '#FF0000';
        }
    }, [initialColor]);

    // Get initial HSV values from the initialColor
    const getInitialHSV = useCallback(() => {
        try {
            const color = parseInitialColor();
            const { r, g, b } = hex2rgb(color);
            return rgb2hsv(r, g, b);
        } catch (e) {
            return { h: 0, s: 1, v: 1 };
        }
    }, [parseInitialColor]);

    const { h: initialH, s: initialS, v: initialV } = useMemo(() => getInitialHSV(), [getInitialHSV]);

    // State for recent colors
    const [recentColors, setRecentColors] = useState<string[]>(() => {
        // Initialize with initial color and common presets
        const initialSet = new Set([parseInitialColor(), ...COMMON_COLORS.slice(0, MAX_RECENT_COLORS - 1)]);
        return Array.from(initialSet).slice(0, MAX_RECENT_COLORS);
    });

    // State for current color in regular React state
    const [currentColor, setCurrentColor] = useState(parseInitialColor());
    const [activeTab, setActiveTab] = useState<'hue' | 'satval'>('hue');

    // Animation values
    const hue = useSharedValue(initialH);
    const saturation = useSharedValue(initialS);
    const value = useSharedValue(initialV);
    const scaleAnim = useSharedValue(0.8);

    // Memoized hue color (doesn't access shared values during render)
    const hueColor = useMemo(() => {
        const { r, g, b } = hsv2rgb(initialH, 1, 1);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }, [initialH]);

    // Animation for appearing
    useEffect(() => {
        scaleAnim.value = withSpring(1, { damping: 15, stiffness: 150 });
    }, []);

    // Update color when HSV changes
    useAnimatedReaction(
        () => {
            return { h: hue.value, s: saturation.value, v: value.value };
        },
        (result) => {
            const { r, g, b } = hsv2rgb(result.h, result.s, result.v);
            const hexColor = rgb2hex(r, g, b);
            runOnJS(setCurrentColor)(hexColor);
        },
        [hue, saturation, value]
    );

    // Call onColorChange when currentColor changes
    useEffect(() => {
        if (currentColor) {
            onColorChange(currentColor);
        }
    }, [currentColor, onColorChange]);

    // Add color to recent colors
    const addToRecentColors = useCallback((color: string) => {
        setRecentColors(prev => {
            // Don't add if it's already the most recent
            if (prev[0] === color) return prev;

            // Remove if it exists elsewhere in the array
            const filtered = prev.filter(c => c !== color);
            // Add to the beginning and limit to MAX_RECENT_COLORS
            return [color, ...filtered].slice(0, MAX_RECENT_COLORS);
        });
    }, []);

    // Handle applying the color change
    const handleApplyColor = useCallback(() => {
        addToRecentColors(currentColor);
        onColorChange(currentColor);
        handleClose();
    }, [currentColor, addToRecentColors, onColorChange]);

    // Handle hue wheel gesture
    const hueWheelGestureHandler = useAnimatedGestureHandler({
        onStart: (_, ctx: any) => { },
        onActive: (event, ctx) => {
            const cx = COLOR_PICKER_SIZE / 2;
            const cy = COLOR_PICKER_SIZE / 2;

            const dx = event.x - cx;
            const dy = event.y - cy;

            // Calculate angle (hue)
            let angle = Math.atan2(dy, dx);
            if (angle < 0) angle += 2 * Math.PI;

            // Convert to 0-1 range
            hue.value = angle / (2 * Math.PI);
        },
        onEnd: () => { },
    });

    // Handle saturation-value square gesture
    const satValGestureHandler = useAnimatedGestureHandler({
        onStart: (_, ctx: any) => { },
        onActive: (event, ctx) => {
            // Normalize coordinates to 0-1 range
            saturation.value = Math.min(Math.max(event.x / SATURATION_SQUARE_SIZE, 0), 1);
            // Invert the y-axis for value (top is 1, bottom is 0)
            value.value = Math.min(Math.max(1 - event.y / SATURATION_SQUARE_SIZE, 0), 1);
        },
        onEnd: () => { },
    });

    // Animated styles
    const containerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scaleAnim.value }],
        opacity: scaleAnim.value
    }));

    const colorIndicatorStyle = useAnimatedStyle(() => ({
        backgroundColor: currentColor
    }));

    const hueIndicatorStyle = useAnimatedStyle(() => {
        const angle = hue.value * 2 * Math.PI;
        const radius = COLOR_PICKER_SIZE / 2 - 15;

        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        const { r, g, b } = hsv2rgb(hue.value, 1, 1);
        const pureHueColor = rgb2hex(r, g, b);

        return {
            transform: [
                { translateX: x },
                { translateY: y },
            ],
            backgroundColor: pureHueColor,
        };
    });

   
    // Handle close with animation
    const handleClose = useCallback(() => {
        scaleAnim.value = withTiming(0, { duration: 150 }, () => {
            runOnJS(onClose)();
        });
    }, [onClose, scaleAnim]);

    // Render a recent color item


    return (
        <View style={styles.overlay}>
            <Animated.View style={[styles.container, containerStyle]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                        <MaterialCommunityIcons name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Animated.View style={[styles.currentColorIndicator, colorIndicatorStyle]} />
                    <Text style={styles.colorText}>{currentColor.toUpperCase()}</Text>
                    <TouchableOpacity style={styles.applyButton} onPress={handleApplyColor}>
                        <MaterialCommunityIcons name="check" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Tab buttons */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'hue' && styles.activeTabButton]}
                        onPress={() => setActiveTab('hue')}
                    >
                        <MaterialCommunityIcons
                            name="palette"
                            size={20}
                            color={activeTab === 'hue' ? '#fff' : '#999'}
                        />
                        <Text style={[styles.tabText, activeTab === 'hue' && styles.activeTabText]}>Hue</Text>
                    </TouchableOpacity>

                </View>

                {/* Color selector UI */}
                <View style={styles.colorSelectorContainer}>
                    <PanGestureHandler onGestureEvent={hueWheelGestureHandler}>
                        <Animated.View style={styles.colorPickerContainer}>
                            <HueWheel />
                            <Animated.View style={[styles.hueIndicator, hueIndicatorStyle]} />
                        </Animated.View>
                    </PanGestureHandler>
                </View>

            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    container: {
        backgroundColor: '#222',
        borderRadius: 24,
        padding: 20,
        width: SCREEN_WIDTH - 40,
        maxHeight: SCREEN_WIDTH + 200,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
    },
    closeButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    applyButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#4CAF50', // Green apply button
    },
    currentColorIndicator: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: '#ffffff',
        marginRight: 10,
    },
    colorText: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    tabContainer: {
        flexDirection: 'row',
        width: '100%',
        marginBottom: 20,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#333',
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 6,
    },
    activeTabButton: {
        backgroundColor: '#444',
    },
    tabText: {
        color: '#999',
        fontSize: 14,
    },
    activeTabText: {
        color: '#fff',
        fontWeight: '500',
    },
    colorSelectorContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    colorPickerContainer: {
        width: COLOR_PICKER_SIZE,
        height: COLOR_PICKER_SIZE,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    hueWheel: {
        width: COLOR_PICKER_SIZE,
        height: COLOR_PICKER_SIZE,
    },
    satValSquare: {
        width: SATURATION_SQUARE_SIZE,
        height: SATURATION_SQUARE_SIZE,
        borderRadius: 12,
        overflow: 'hidden',
    },
    hueIndicator: {
        position: 'absolute',
        width: SELECTOR_SIZE,
        height: SELECTOR_SIZE,
        borderRadius: SELECTOR_SIZE / 2,
        borderWidth: 3,
        borderColor: '#fff',
        top: COLOR_PICKER_SIZE / 2 - SELECTOR_SIZE / 2,
        left: COLOR_PICKER_SIZE / 2 - SELECTOR_SIZE / 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 5,
    },
    satValIndicator: {
        position: 'absolute',
        width: SELECTOR_SIZE,
        height: SELECTOR_SIZE,
        borderRadius: SELECTOR_SIZE / 2,
        borderWidth: 3,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 5,
    },
    recentColorsContainer: {
        width: '100%',
        marginTop: 15,
    },
    recentColorsLabel: {
        color: '#fff',
        marginBottom: 10,
        fontSize: 14,
    },
    recentColorsList: {
        paddingVertical: 8,
        backgroundColor: 'transparent',
    },
    recentColorItem: {
        width: 42,
        height: 42,
        borderRadius: 21,
        borderWidth: 2,
        borderColor: '#444',
        marginHorizontal: 6,
    },
});

export default AdvancedColorPicker; 