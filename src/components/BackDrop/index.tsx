import { StyleSheet, TouchableWithoutFeedback, Dimensions } from 'react-native';
import React from 'react';
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
};

const BackDrop = ({
    topAnimation,
    openHeight,
    closeHeight,
    backDropColor,
    close,
}: Props) => {
    const { width, height } = Dimensions.get('window');

    const backDropAnimation = useAnimatedStyle(() => {
        const opacity = interpolate(
            topAnimation.value,
            [closeHeight, openHeight],
            [0, 0.5],
            { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
        );
        
        const display = opacity === 0 ? 'none' : 'flex';
        return {
            opacity,
            display,
        };
    });


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
        zIndex: 999989,
        elevation: 999989,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
});