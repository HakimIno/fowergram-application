import { Keyboard, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import React, {
    forwardRef,
    ReactNode,
    useCallback,
    useEffect,
    useImperativeHandle,
    useState,
} from 'react';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import BackDrop from '../../screens/ThemeScreen/components/BackDrop';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface BottomSheetMethods {
    expand: () => void;
    close: () => void;

}

type Props = {
    children: ReactNode
    handleClose: () => void;
}

const BottomSheet = forwardRef<BottomSheetMethods, Props>(({ children, handleClose }, ref) => {
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const [bottomSheetHeight, setBottomSheetHeight] = useState(1000);
    const OPEN = 0;
    const CLOSE = bottomSheetHeight + insets.bottom;
    const translateY = useSharedValue(CLOSE);

    const expand = useCallback(() => {
        translateY.value = withTiming(OPEN);
    }, [translateY]);


    const close = useCallback(() => {
        translateY.value = withTiming(CLOSE);
        handleClose()
        Keyboard.dismiss()
    }, [CLOSE, translateY, handleClose]);

    useImperativeHandle(
        ref,
        () => ({
            expand,
            close,
        }),
        [expand, close],
    );

    const animationStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        };
    });


    const pan = Gesture.Pan()
        .onUpdate(event => {
            const damping = event.translationY < 0 ? 200 : 100;
            const stiffness = event.translationY < 0 ? 800 : 400;
            const targetValue = event.translationY < 0 ? OPEN : event.translationY;
            translateY.value = withSpring(targetValue, { damping, stiffness });
        })
        .onEnd(() => {
            const targetValue = translateY.value > 50 ? CLOSE : OPEN;
            const springConfig = { damping: 100, stiffness: 400 };
            translateY.value = withSpring(targetValue, springConfig);
        });



    return (
        <>
            <BackDrop
                close={close}
                translateY={translateY}
                openHeight={OPEN}
                closeHeight={CLOSE}
            />

            <GestureDetector gesture={pan}>
                <Animated.View
                    style={[
                        styles.container,
                        {
                            width: width,
                            bottom: 0,
                            backgroundColor: 'white'
                        },
                        animationStyle,
                    ]}
                // onLayout={({ nativeEvent }) => {
                //     const { height } = nativeEvent.layout;
                //     if (height) {
                //         setBottomSheetHeight(height);
                //         translateY.value = withTiming(height + insets.bottom);
                //     }
                // }}
                >
                    <Animated.View style={[styles.line]} />

                    {children}
                </Animated.View>
            </GestureDetector>
        </>
    );
});

export default BottomSheet;

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        paddingVertical: 40,
        paddingHorizontal: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        zIndex: 3
    },
    line: {
        position: 'absolute',
        top: 8,
        width: 40,
        height: 4,
        borderRadius: 8,
        backgroundColor: "black"
    },
    textTitle: {
        fontSize: 22,
        fontFamily: 'SukhumvitSet_Bd',
        marginTop: 40,
        marginBottom: 14,
        color: 'black'
    },
    text: {
        fontSize: 16,
        fontFamily: 'SukhumvitSet_Me',
    },
});
