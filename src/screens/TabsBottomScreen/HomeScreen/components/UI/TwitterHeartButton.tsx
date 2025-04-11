import React, { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
    interpolateColor,
} from 'react-native-reanimated';

const PARTICLE_COLORS = ['#f43f5e', '#ec4899', '#ff75c3', '#ff8cc3'];

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    actionButton: {
        padding: 8,
    },
    particleContainer: {
        position: 'absolute',
        width: 40,  // ลดขนาดลง
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',

    },
    particle: {
        position: 'absolute',
        width: 3,    // ลดขนาด particle
        height: 3,
        borderRadius: 1.5,
    },
});

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);

interface TwitterHeartButtonProps {
    isLiked: boolean;
    onLikeChange: (liked: boolean) => void;
}

const TwitterHeartButton: React.FC<TwitterHeartButtonProps> = ({
    isLiked,
    onLikeChange,
}) => {
    const scale = useSharedValue(1);
    const colorProgress = useSharedValue(isLiked ? 1 : 0);

    // เพิ่มจำนวน particles และทำให้กระจายตัวมากขึ้น
    const particles = Array(12).fill(0).map(() => ({
        translateX: useSharedValue(0),
        translateY: useSharedValue(0),
        scale: useSharedValue(0),
        opacity: useSharedValue(0),
    }));

    const handlePress = useCallback(() => {
        const newLikedState = !isLiked;
        onLikeChange(newLikedState);

        if (newLikedState) {
            // Like animation
            colorProgress.value = withTiming(1, { duration: 150 }); // เร็วขึ้น
            scale.value = withSequence(
                withSpring(0.8, { damping: 20, stiffness: 400 }),
                withSpring(1.2, { damping: 15, stiffness: 400 }),
                withSpring(1, { damping: 10 })
            );

            // Animate particles
            particles.forEach((particle, index) => {
                const angle = (index * 2 * Math.PI) / 12 + Math.random() * 0.5; // เพิ่มความสุ่ม
                const distance = 15 + Math.random() * 10; // ระยะทางสุ่ม

                particle.scale.value = withSequence(
                    withSpring(1, {
                        damping: 5,
                        stiffness: 300,
                        mass: 0.3,
                    }),
                    withSpring(0, {
                        damping: 10,
                        stiffness: 200,
                    })
                );

                particle.opacity.value = withSequence(
                    withTiming(1, { duration: 50 }),
                    withTiming(0, { duration: 250 })
                );

                // ทำให้การเคลื่อนที่ดูธรรมชาติมากขึ้น
                particle.translateX.value = withSequence(
                    withSpring(Math.cos(angle) * distance, {
                        damping: 10,
                        stiffness: 200,
                        mass: 0.2,
                        velocity: 20
                    })
                );

                particle.translateY.value = withSequence(
                    withSpring(Math.sin(angle) * distance, {
                        damping: 10,
                        stiffness: 200,
                        mass: 0.2,
                        velocity: 20
                    })
                );
            });
        } else {
            // Unlike animation
            colorProgress.value = withTiming(0, { duration: 150 });
            scale.value = withSequence(
                withSpring(0.8, { damping: 15 }),
                withSpring(1, { damping: 10 })
            );
        }
    }, [isLiked, onLikeChange]);

    const heartStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        color: interpolateColor(
            colorProgress.value,
            [0, 1],
            ['#1A1A1A', '#f43f5e']
        ),
    }));

    return (
        <View style={styles.container}>
            <View style={styles.particleContainer}>
                {particles.map((particle, index) => (
                    <Animated.View
                        key={index}
                        style={[
                            styles.particle,
                            { backgroundColor: PARTICLE_COLORS[index % PARTICLE_COLORS.length] },
                            useAnimatedStyle(() => ({
                                transform: [
                                    { translateX: particle.translateX.value },
                                    { translateY: particle.translateY.value },
                                    { scale: particle.scale.value },
                                    { rotate: `${index * 30}deg` }, // เพิ่มการหมุน
                                ],
                                opacity: particle.opacity.value,
                            })),
                        ]}
                    />
                ))}
            </View>

            <AnimatedPressable
                style={styles.actionButton}
                onPress={handlePress}
            >
                <AnimatedIonicons
                    name={isLiked ? "heart" : "heart-outline"}
                    size={30}  // ลดขนาดลงเล็กน้อย
                    style={heartStyle}
                />
            </AnimatedPressable>
        </View>
    );
};

export default TwitterHeartButton;