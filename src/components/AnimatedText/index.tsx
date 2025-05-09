import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { Easing, useSharedValue, withTiming, useAnimatedStyle, withRepeat, withSequence } from 'react-native-reanimated';

const AnimatedText = ({ text, color }: { text: string, color: string }) => {
    const animatedValues = text.split('').map(() => useSharedValue(0));

    useEffect(() => {
        animatedValues.forEach((anim, index) => {
            setTimeout(() => {
                anim.value = withRepeat(
                    withSequence(
                        withTiming(1, { duration: 500, easing: Easing.linear }),
                        withTiming(0, { duration: 500, easing: Easing.linear })
                    ),
                    -1, // infinite repeat
                    false // do not reverse
                );
            }, index * 100);
        });
    }, [animatedValues]);

    return (
        <View style={{ flexDirection: 'row' }}>
            {text.split('').map((char, index) => {
                const animatedStyle = useAnimatedStyle(() => {
                    return {
                        opacity: animatedValues[index].value,
                    };
                });

                return (
                    <Animated.Text key={index.toString()} style={[animatedStyle, { fontFamily: 'Chirp_Bold', fontSize: 14, margin: 0, color: color }]}>
                        {char}
                    </Animated.Text>
                );
            })}
        </View>
    );
};


export default AnimatedText