import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

interface Props {
    focusAnimation: any;
    focusPointAnimation: any;
    isFocusLocked: boolean;
    screenWidth: number;
    screenHeight: number;
}

export const FocusIndicator = ({ 
    focusAnimation, 
    focusPointAnimation, 
    isFocusLocked,
    screenWidth,
    screenHeight
}: Props) => {
    const focusIndicatorStyle = useAnimatedStyle(() => {
        const scale = focusAnimation.value;
        return {
            transform: [
                { translateX: focusPointAnimation.value.x * screenWidth - 40 },
                { translateY: focusPointAnimation.value.y * screenHeight - 40 },
                { scale },
                { rotate: `${focusAnimation.value * 90}deg` }
            ],
            opacity: focusAnimation.value,
            borderColor: isFocusLocked ? 'yellow' : 'white'
        };
    });

    return (
        <Animated.View style={[styles.focusIndicator, focusIndicatorStyle]}>
            <Animated.View style={[
                styles.focusIndicatorInner,
                isFocusLocked && styles.focusIndicatorLocked
            ]} />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    focusIndicator: {
        position: 'absolute',
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10
    },
    focusIndicatorInner: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 1.5,
        borderColor: 'white',
        borderStyle: 'dashed'
    },
    focusIndicatorLocked: {
        borderColor: '#FFD700',
        borderStyle: 'solid',
        backgroundColor: 'rgba(255, 215, 0, 0.1)'
    }
}); 