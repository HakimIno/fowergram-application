import React, { useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withSpring,
    withTiming,
    interpolate,
    Extrapolate,
    runOnJS,
} from 'react-native-reanimated';

const NUM_PARTICLES = 12;

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    particleContainer: {
        position: 'absolute',
        width: 200,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    particle: {
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 7.5,
        backgroundColor: '#f43f5e',
    },
    mainHeart: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    smallHeart: {
        position: 'absolute',
        width: 10,
        height: 10,
        backgroundColor: '#f43f5e',
        borderRadius: 10,
    }
});

interface LikeAnimationProps {
    onAnimationComplete: () => void;
}

const LikeAnimation: React.FC<LikeAnimationProps> = ({ onAnimationComplete }) => {
    const mainScale = useSharedValue(0);
    const mainRotate = useSharedValue(0);
    const particlesScale = useSharedValue(0);
    const particlesOpacity = useSharedValue(1);

    const createParticles = () => {
        return Array(NUM_PARTICLES).fill(0).map((_, index) => {
            const angle = (index * 2 * Math.PI) / NUM_PARTICLES;
            const translateX = useSharedValue(0);
            const translateY = useSharedValue(0);
            const scale = useSharedValue(1);
            const opacity = useSharedValue(1);

            return { angle, translateX, translateY, scale, opacity };
        });
    };

    const particles = createParticles();

    const startAnimation = useCallback(() => {
        // Main heart animation
        mainScale.value = withSequence(
            withSpring(1.2, { damping: 15, stiffness: 200 }),
            withSpring(1, { damping: 15, stiffness: 200 }),
            withDelay(
                400,
                withTiming(0, { duration: 300 }, () => {
                    runOnJS(onAnimationComplete)();
                })
            )
        );

        mainRotate.value = withSequence(
            withSpring(-0.2, { damping: 15 }),
            withSpring(0.2, { damping: 15 }),
            withSpring(0, { damping: 15 })
        );

        // Particles animation
        particlesScale.value = withSequence(
            withTiming(1, { duration: 200 }),
            withTiming(0, { duration: 300 })
        );
        particlesOpacity.value = withSequence(
            withTiming(1, { duration: 200 }),
            withTiming(0, { duration: 300 })
        );

        // Animate each particle
        particles.forEach((particle, index) => {
            const distance = 100;
            const angle = particle.angle;

            particle.translateX.value = withSequence(
                withSpring(Math.cos(angle) * distance, {
                    damping: 12,
                    stiffness: 100
                }),
                withSpring(0, { damping: 12 })
            );

            particle.translateY.value = withSequence(
                withSpring(Math.sin(angle) * distance, {
                    damping: 12,
                    stiffness: 100
                }),
                withSpring(0, { damping: 12 })
            );

            particle.scale.value = withSequence(
                withTiming(1, { duration: 200 }),
                withDelay(200, withTiming(0, { duration: 200 }))
            );

            particle.opacity.value = withSequence(
                withTiming(1, { duration: 200 }),
                withDelay(200, withTiming(0, { duration: 200 }))
            );
        });
    }, []);

    useEffect(() => {
        startAnimation();
    }, []);

    const mainHeartStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: mainScale.value },
                { rotate: `${mainRotate.value}rad` }
            ],
            opacity: interpolate(
                mainScale.value,
                [0, 0.1, 1, 1.2],
                [0, 1, 1, 0],
                Extrapolate.CLAMP
            ),
        };
    });

    return (
        <View style={styles.container}>
            {/* Particles */}
            <View style={styles.particleContainer}>
                {particles.map((particle, index) => (
                    <Animated.View
                        key={index}
                        style={[
                            styles.particle,
                            useAnimatedStyle(() => ({
                                transform: [
                                    { translateX: particle.translateX.value },
                                    { translateY: particle.translateY.value },
                                    { scale: particle.scale.value }
                                ],
                                opacity: particle.opacity.value,
                            }))
                        ]}
                    />
                ))}
            </View>

            {/* Main Heart */}
            <Animated.View style={[styles.mainHeart, mainHeartStyle]}>
                <Ionicons name="heart" size={90} color="#f43f5e" />
            </Animated.View>
        </View>
    );
};

export default LikeAnimation;