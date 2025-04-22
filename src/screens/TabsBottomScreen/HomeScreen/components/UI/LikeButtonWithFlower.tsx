import React, { useState, useCallback, useMemo, useEffect, forwardRef, useImperativeHandle, memo } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Canvas, Circle, Skia, Group, Paint, BlurMask, Line, vec, Path, SweepGradient, Blur } from '@shopify/react-native-skia';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    withSequence,
    Easing,
    interpolate,
    cancelAnimation
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const DEFAULT_BTN_SIZE = 18;
const DEFAULT_INACTIVE_COLOR = '#1a1a1a';
const DEFAULT_ACTIVE_COLOR = '#f91980';
const DEFAULT_BURST_COLORS = ['#f91980', '#f91980', '#f91980', '#f91980', '#f91980'];
const DOT_COUNT = 12;
const SPARK_COUNT = 12;
const PETAL_COUNT = 6;

// Component หลัก
interface LikeButtonWithFlowerProps {
    size?: number;
    active?: boolean;
    onPress?: () => void;
    activeColor?: string;
    inactiveColor?: string;
    burstColors?: string[];
}

export interface LikeButtonWithFlowerRef {
    triggerAnimation: () => void;
}

const LikeButtonWithFlower = forwardRef<LikeButtonWithFlowerRef, LikeButtonWithFlowerProps>(({
    size = DEFAULT_BTN_SIZE,
    active: externalActive,
    onPress: externalOnPress,
    activeColor = DEFAULT_ACTIVE_COLOR,
    inactiveColor = DEFAULT_INACTIVE_COLOR,
    burstColors = DEFAULT_BURST_COLORS
}, ref) => {
    const [active, setActive] = useState(externalActive || false);
    const isAnimating = useSharedValue(false);
    const scale = useSharedValue(1);
    const explodeScale = useSharedValue(0);
    const dotsScale = useSharedValue(0);
    const sparksOpacity = useSharedValue(0);
    const rotationZ = useSharedValue(0);
    const petalRotation = useSharedValue(0);
    
    // Calculate actual button size
    const BTN_SIZE = size;

    const triggerAnimation = useCallback(() => {
        cancelAnimation(scale);
        cancelAnimation(explodeScale);
        cancelAnimation(dotsScale);
        cancelAnimation(sparksOpacity);
        cancelAnimation(petalRotation);

        isAnimating.value = true;
        
        // Trigger haptic feedback with the flower animation
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Sequence หลักของปุ่ม: หดตัว -> ขยายตัว -> ปกติ
        scale.value = withSequence(
            withTiming(0.8, { duration: 120, easing: Easing.out(Easing.quad) }),
            withSpring(1.25, { damping: 8, stiffness: 200 }),
            withTiming(1, { duration: 200 })
        );

        // Explode effect
        explodeScale.value = withSequence(
            withTiming(0, { duration: 10 }),
            withTiming(1.5, { duration: 450, easing: Easing.out(Easing.cubic) }),
            withTiming(0, { duration: 200 }, () => {
                isAnimating.value = false;
            })
        );

        // Dots effect
        dotsScale.value = withSequence(
            withTiming(0, { duration: 10 }),
            withTiming(1.2, { duration: 600, easing: Easing.out(Easing.quad) }),
            withTiming(0, { duration: 200 })
        );

        // Sparks effect
        sparksOpacity.value = withSequence(
            withTiming(1, { duration: 50 }),
            withTiming(0, { duration: 900, easing: Easing.out(Easing.cubic) })
        );

        // หมุนกลีบดอกไม้
        petalRotation.value = withSequence(
            withTiming(0.1, { duration: 150 }),
            withTiming(-0.05, { duration: 150 }),
            withTiming(0, { duration: 150 })
        );

        // หมุนเล็กน้อย
        rotationZ.value = withSequence(
            withTiming(0.12, { duration: 150 }),
            withTiming(-0.08, { duration: 150 }),
            withTiming(0, { duration: 150 })
        );
    }, []);

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
        triggerAnimation
    }));

    const handlePress = useCallback(() => {
        // Track previous state before change
        const wasActive = active;
        
        // Always call the external onPress handler if provided
        if (externalOnPress) {
            externalOnPress();
        } else {
            setActive(prev => !prev);
        }
        
        // Only trigger animation if going from inactive to active (liking)
        if (!wasActive) {
            triggerAnimation();
        }
    }, [externalOnPress, triggerAnimation, active]);

    // Update active state when externalActive changes
    useEffect(() => {
        // Check if changing from inactive to active (liking)
        const isLiking = !active && externalActive;
        
        // Update the active state
        setActive(externalActive || false);
        
        // Only trigger animation when liking (not unliking)
        if (isLiking) {
            triggerAnimation();
        }
    }, [externalActive, triggerAnimation, active]);

    // Animated styles
    const buttonStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: scale.value },
            { rotateZ: `${rotationZ.value}rad` }
        ]
    }));

    const explodeStyle = useAnimatedStyle(() => ({
        opacity: interpolate(explodeScale.value, [0, 0.5, 1], [0, 0.8, 0]),
        transform: [{ scale: explodeScale.value }]
    }));

    const dotsStyle = useAnimatedStyle(() => ({
        opacity: interpolate(dotsScale.value, [0, 0.3, 1], [0, 1, 0]),
        transform: [{ scale: dotsScale.value }]
    }));

    const sparksStyle = useAnimatedStyle(() => ({
        opacity: sparksOpacity.value
    }));

    // ชุดจุดแบบ Memo เพื่อไม่ต้องสร้างใหม่ทุกครั้ง
    const dotsPositions = useMemo(() => {
        return Array(DOT_COUNT).fill(0).map((_, i) => {
            const angle = (i * 2 * Math.PI) / DOT_COUNT;
            const randomOffset = Math.random() * 0.3; // ทำให้จุดกระจายออกแบบไม่สม่ำเสมอ
            const distance = BTN_SIZE * (1.3 + randomOffset);
            return {
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
                size: 2 + Math.random() * 3, // เพิ่มความหลากหลายของขนาด
                color: burstColors[Math.floor(Math.random() * burstColors.length)],
                angle: angle, // เพิ่ม angle สำหรับใช้คำนวณการเคลื่อนที่
                speed: 0.8 + Math.random() * 0.6 // เพิ่ม speed สำหรับควบคุมความเร็ว
            };
        });
    }, [BTN_SIZE, burstColors]);

    // ชุดเส้นประกายแบบ Memo
    const sparksData = useMemo(() => {
        return Array(SPARK_COUNT).fill(0).map((_, i) => {
            const angle = (i * 2 * Math.PI) / SPARK_COUNT;
            const innerRadius = BTN_SIZE * 0.6;
            const outerRadius = BTN_SIZE * (1.2 + Math.random() * 0.4); // เพิ่มความยาวที่แตกต่างกัน
            return {
                x1: Math.cos(angle) * innerRadius,
                y1: Math.sin(angle) * innerRadius,
                x2: Math.cos(angle) * outerRadius,
                y2: Math.sin(angle) * outerRadius,
                color: burstColors[Math.floor(Math.random() * burstColors.length)]
            };
        });
    }, [BTN_SIZE, burstColors]);

    // Container styles based on size
    const containerSize = BTN_SIZE * 2;
    const explodeCircleSize = BTN_SIZE * 3;
    
    // Dynamic styles
    const dynamicStyles = {
        container: {
            width: containerSize,
            height: containerSize,
        },
        buttonContainer: {
            width: containerSize,
            height: containerSize,
        },
        button: {
            width: containerSize,
            height: containerSize,
        },
        canvas: {
            width: containerSize,
            height: containerSize,
        },
        explodeCircle: {
            width: explodeCircleSize,
            height: explodeCircleSize,
            borderRadius: explodeCircleSize / 2,
        },
        dotsContainer: {
            width: containerSize,
            height: containerSize,
        },
    };

    const explodeFillStyle = {
        backgroundColor: active 
            ? `rgba(${parseInt(activeColor.slice(1, 3), 16)}, ${parseInt(activeColor.slice(3, 5), 16)}, ${parseInt(activeColor.slice(5, 7), 16)}, 0.2)`
            : 'rgba(0, 0, 0, 0.1)'
    };

    return (
        <View style={[styles.container, dynamicStyles.container]}>
            {/* 1. วงกลมระเบิด */}
            <Animated.View style={[styles.explodeCircle, dynamicStyles.explodeCircle, explodeStyle]}>
                <View style={[styles.explodeFill, explodeFillStyle]} />
            </Animated.View>

            {/* 2. จุดเล็กๆ ที่กระจายออก */}
            <Animated.View style={[styles.dotsContainer, dynamicStyles.dotsContainer, dotsStyle]} pointerEvents="none">
                {dotsPositions.map((dot, index) => (
                    <View
                        key={`dot-${index}`}
                        style={[
                            styles.dot,
                            {
                                width: dot.size,
                                height: dot.size,
                                backgroundColor: dot.color,
                                left: BTN_SIZE + dot.x, // ปรับให้เริ่มจากตรงกลาง (BTN_SIZE)
                                top: BTN_SIZE + dot.y, // ปรับให้เริ่มจากตรงกลาง (BTN_SIZE)
                                borderRadius: dot.size / 2
                            }
                        ]}
                    />
                ))}
            </Animated.View>

            {/* 3. เส้นประกาย */}
            {/* <Animated.View style={[styles.sparksContainer, dynamicStyles.canvas, sparksStyle]} pointerEvents="none">
                <Canvas style={[styles.canvas, dynamicStyles.canvas]}>
                    {sparksData.map((spark, index) => (
                        <Line
                            key={`spark-${index}`}
                            p1={vec(BTN_SIZE + spark.x1, BTN_SIZE + spark.y1)}
                            p2={vec(BTN_SIZE + spark.x2, BTN_SIZE + spark.y2)}
                            color={spark.color}
                            style="stroke"
                        >
                        </Line>
                    ))}
                </Canvas>
            </Animated.View> */}

            {/* 4. ปุ่มดอกไม้ */}
            <Animated.View style={[styles.buttonContainer, dynamicStyles.buttonContainer, buttonStyle]}>
                <TouchableOpacity
                    onPress={handlePress}
                    activeOpacity={1}
                    style={[styles.button, dynamicStyles.button]}
                    hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
                >
                    <Canvas style={[styles.canvas, dynamicStyles.canvas]}>
                        <Group>
                            {/* วงกลมพื้นหลังสำหรับ outline mode - เพิ่มสีพื้นหลังอ่อนๆ */}

                            {/* วาดกลีบดอกไม้ */}
                            <Group transform={[{ rotate: petalRotation.value }]} origin={{ x: BTN_SIZE, y: BTN_SIZE }}>
                                {Array.from({ length: PETAL_COUNT }).map((_, index) => {
                                    const angle = (index * Math.PI * 2) / PETAL_COUNT;
                                    return (
                                        <PetalShape
                                            key={index}
                                            centerX={BTN_SIZE}
                                            centerY={BTN_SIZE}
                                            angle={angle}
                                            size={BTN_SIZE * 0.95}
                                            color={active ? activeColor : inactiveColor}
                                            colorLight={active ? activeColor : inactiveColor}
                                            isActive={active}
                                        />
                                    );
                                })}
                            </Group>


                            {active && (
                                // เกสรดอกไม้เมื่อกดแล้ว
                                <Group>
                                    {Array.from({ length: 12 }).map((_, index) => {
                                        const angle = (index * Math.PI * 2) / 12;
                                        const distance = BTN_SIZE * 0.15;
                                        // Lighten the main color for stamen
                                        const stamenColor = '#fecdd3'; // Could be derived from activeColor
                                        return (
                                            <Circle
                                                key={`stamen-${index}`}
                                                cx={BTN_SIZE + Math.cos(angle) * distance}
                                                cy={BTN_SIZE + Math.sin(angle) * distance}
                                                r={BTN_SIZE * 0.04}
                                                color={stamenColor}
                                            />
                                        );
                                    })}

                                    {/* วงกลมเกสรตรงกลาง */}
                                    <Circle
                                        cx={BTN_SIZE}
                                        cy={BTN_SIZE}
                                        r={BTN_SIZE * 0.13}
                                        color="#fb7185" // Could be derived from activeColor
                                    />
                                </Group>
                            )}


                        </Group>
                    </Canvas>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
});

// Component วาดกลีบดอกไม้
interface PetalShapeProps {
    centerX: number;
    centerY: number;
    angle: number;
    size: number;
    color: string;
    colorLight: string;
    isActive: boolean;
}

const PetalShape = ({ centerX, centerY, angle, size, color, colorLight, isActive }: PetalShapeProps) => {
    // สร้าง path สำหรับกลีบดอกไม้แบบสวยงาม
    const path = Skia.Path.Make();
    const petalLength = size * 0.65;
    const petalWidth = size * 0.4;

    // จุดปลายกลีบดอกไม้
    const tipX = centerX + petalLength * Math.cos(angle);
    const tipY = centerY + petalLength * Math.sin(angle);

    // จุดควบคุมข้างๆ - ทำให้กลีบป้อมขึ้นและโค้งมนมากขึ้น
    const ctrl1Angle = angle + Math.PI * 0.2;
    const ctrl2Angle = angle - Math.PI * 0.2;

    // เพิ่มระยะขยายด้านข้างให้กลีบป้อมกว่าเดิม
    const ctrl1X = centerX + petalWidth * 1.1 * Math.cos(ctrl1Angle);
    const ctrl1Y = centerY + petalWidth * 1.1 * Math.sin(ctrl1Angle);

    const ctrl2X = centerX + petalWidth * 1.1 * Math.cos(ctrl2Angle);
    const ctrl2Y = centerY + petalWidth * 1.1 * Math.sin(ctrl2Angle);

    // จุดควบคุมสำหรับปลายกลีบ - ปรับแต่งให้ปลายกลีบมนและโค้งสวยงามขึ้น
    const tipCtrl1X = centerX + (petalLength * 0.85) * Math.cos(angle + 0.1);
    const tipCtrl1Y = centerY + (petalLength * 0.85) * Math.sin(angle + 0.1);

    const tipCtrl2X = centerX + (petalLength * 0.85) * Math.cos(angle - 0.1);
    const tipCtrl2Y = centerY + (petalLength * 0.85) * Math.sin(angle - 0.1);

    // วาด path
    path.moveTo(centerX, centerY);
    path.cubicTo(ctrl1X, ctrl1Y, tipCtrl1X, tipCtrl1Y, tipX, tipY);
    path.cubicTo(tipCtrl2X, tipCtrl2Y, ctrl2X, ctrl2Y, centerX, centerY);

    return (
        <Group>
            {/* กลีบดอกไม้หลัก */}
            <Group transform={[{ scale: 0.95 }]} origin={{ x: centerX, y: centerY }}>
                {isActive ? (
                    // เมื่อ active เป็นสีเต็ม
                    <Path
                        path={path}
                        color={color}
                        style="fill"
                    />
                ) : (
                    // เมื่อไม่ active เป็น outline
                    <Path
                        path={path}
                        color={color}
                        style="stroke"
                        strokeWidth={1.5}
                        strokeJoin="round"
                        strokeCap="round"
                    />
                )}
            </Group>
        </Group>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    buttonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    canvas: {
        backgroundColor: 'transparent',
    },
    explodeCircle: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    explodeFill: {
        width: '100%',
        height: '100%',
        borderRadius: 999,
    },
    dotsContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5,
    },
    dot: {
        position: 'absolute',
        width: 2,
        height: 2,
        backgroundColor: '#FF4D9E',
        borderRadius: 2,
    },
    sparksContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5,
        borderRadius: 100
    },
});

// Memoize the component to prevent unnecessary re-renders
export default memo(LikeButtonWithFlower, (prevProps, nextProps) => {
    // Only re-render if these props change
    return (
        prevProps.size === nextProps.size &&
        prevProps.active === nextProps.active &&
        prevProps.activeColor === nextProps.activeColor &&
        prevProps.inactiveColor === nextProps.inactiveColor
    );
});