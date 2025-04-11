import React from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);

interface AnimatedActionButtonProps {
    iconName: string;
    size: number;
    onPress: () => void;
}

const AnimatedActionButton: React.FC<AnimatedActionButtonProps> = ({
    iconName,
    size,
    onPress,
}) => {
    const scale = useSharedValue(1);

    const handlePress = () => {
        scale.value = withSequence(
            withSpring(0.8, { damping: 15, stiffness: 400 }),
            withSpring(1, { damping: 15, stiffness: 400 })
        );
        onPress();
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <AnimatedPressable
            style={[{ padding: 4 }, animatedStyle]}
            onPress={handlePress}
        >
            <AnimatedIonicons
                name={iconName}
                size={size}
                color="#1A1A1A"
            />
        </AnimatedPressable>
    );
};

export default AnimatedActionButton;