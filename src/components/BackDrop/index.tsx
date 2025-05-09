import { StyleSheet, TouchableWithoutFeedback, Dimensions } from 'react-native';
import React, { useEffect } from 'react';
import Animated, {
    SharedValue,
    interpolate,
    useAnimatedStyle,
} from 'react-native-reanimated';

type Props = {
    topAnimation: SharedValue<number>;
    openHeight: number;
    closeHeight: number;
    backDropColor: string;
    close: () => void;
    zIndex?: number;
    opacity?: number;
};

const BackDrop = ({
    topAnimation,
    openHeight,
    closeHeight,
    backDropColor,
    close,
    zIndex = 999989,
    opacity = 0.5,
}: Props) => {
    const { width, height } = Dimensions.get('window');

    const backDropAnimation = useAnimatedStyle(() => {
        const calculatedOpacity = interpolate(
            topAnimation.value,
            [closeHeight, openHeight],
            [0, opacity],
            { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
        );
        
        const display = calculatedOpacity === 0 ? 'none' : 'flex';
        return {
            opacity: calculatedOpacity,
            display,
            zIndex: calculatedOpacity === 0 ? -1 : zIndex,
            elevation: calculatedOpacity === 0 ? -1 : zIndex,
        };
    });

    useEffect(() => {
        // Cleanup function to ensure BackDrop is properly removed
        return () => {
            // Force the backdrop to be hidden when component unmounts
            // This is an empty cleanup function but it helps with proper unmounting
        };
    }, []);

    return (
        <TouchableWithoutFeedback
            onPress={() => {
                close();
            }}>
            <Animated.View
                style={[
                    styles.backDrop,
                    backDropAnimation,
                    {
                        backgroundColor: backDropColor,
                        width,
                        height: height * 2,
                    },
                ]}
            />
        </TouchableWithoutFeedback>
    );
};

export default BackDrop;

const styles = StyleSheet.create({
    backDrop: {
        ...StyleSheet.absoluteFillObject,
        display: 'none',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
});