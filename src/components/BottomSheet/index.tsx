import { Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
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
    runOnJS,
    Easing,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import BackDrop from '../BackDrop';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from 'src/context/ThemeContext';

export interface BottomSheetMethods {
    expand: () => void;
    close: () => void;
}

type Props = {
    children: ReactNode
    handleClose: () => void;
    title: string;
    keyboardAvoidingViewEnabled?: boolean;
}

const BottomSheet = forwardRef<BottomSheetMethods, Props>(({ children, handleClose, title, keyboardAvoidingViewEnabled = true }, ref) => {
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();
    const [bottomSheetHeight, setBottomSheetHeight] = useState(1000);
    const OPEN = 0;
    const CLOSE = bottomSheetHeight + insets.bottom;
    const translateY = useSharedValue(CLOSE);
    const [isClosing, setIsClosing] = useState(false);
    const [contentHeight, setContentHeight] = useState(0);
    const dragStartY = useSharedValue(0);

    const { isDarkMode } = useTheme();

    const setClosingState = useCallback((state: boolean) => {
        setIsClosing(state);
    }, []);

    const performClose = useCallback(() => {
        handleClose();
        Keyboard.dismiss();
        setClosingState(false);
    }, [handleClose, setClosingState]);

    const expand = useCallback(() => {
        if (isClosing) return;

        translateY.value = withTiming(OPEN, {
            duration: 250,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
    }, [translateY, isClosing, OPEN]);

    const close = useCallback(() => {
        setClosingState(true);

        translateY.value = withTiming(CLOSE, {
            duration: 200,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }, (finished) => {
            if (finished) {
                runOnJS(performClose)();
            }
        });
    }, [CLOSE, translateY, performClose]);

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

    const handleContentLayout = useCallback((event: { nativeEvent: { layout: { height: number } } }) => {
        const { height } = event.nativeEvent.layout;
        setContentHeight(height);
    }, []);

    // กำหนดให้ pan gesture จับเฉพาะที่ handle
    const headerPan = Gesture.Pan()
        .onBegin(() => {
            dragStartY.value = translateY.value;
        })
        .onUpdate(event => {
            if (isClosing) return;

            // เอาแค่ด้านล่าง ไม่ให้ลากขึ้น
            const newValue = Math.max(0, dragStartY.value + event.translationY);
            translateY.value = newValue;
        })
        .onEnd((event) => {
            if (isClosing) return;

            const velocity = event.velocityY;
            const shouldClose = translateY.value > 100 || velocity > 500;

            if (shouldClose) {
                runOnJS(setClosingState)(true);

                translateY.value = withTiming(CLOSE, {
                    duration: 200,
                    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                }, (finished) => {
                    if (finished) {
                        runOnJS(performClose)();
                    }
                });
            } else {
                translateY.value = withSpring(OPEN, {
                    damping: 20,
                    mass: 0.8,
                    stiffness: 100,
                    overshootClamping: true,
                    restDisplacementThreshold: 0.01,
                    restSpeedThreshold: 0.01,
                });
            }
        });

    return (
        <>
            <BackDrop
                close={close}
                topAnimation={translateY}
                openHeight={OPEN}
                closeHeight={CLOSE}
                backDropColor="black"
            />

            <StatusBar style="auto" />
            <Animated.View
                style={[
                    styles.container,
                    {
                        width: width,
                        backgroundColor: isDarkMode ? '#1a1a1a' : 'white',
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 999990,
                        elevation: 999990,
                    },
                    animationStyle,
                ]}
            >
                <GestureDetector gesture={headerPan}>
                    <View style={styles.header}>
                        <View style={[styles.line, { backgroundColor: isDarkMode ? '#333' : 'rgba(0,0,0,0.1)' }]} />
                        <Text style={[styles.textTitle, { color: isDarkMode ? '#fff' : '#1a1a1a' }]}>{title}</Text>
                    </View>
                </GestureDetector>



                {keyboardAvoidingViewEnabled ? (
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.content}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : insets.top}
                    >
                        <View onLayout={handleContentLayout}>
                            {children}
                        </View>
                    </KeyboardAvoidingView>

                ) : (
                    <View style={styles.content} onLayout={handleContentLayout}>
                        {children}
                    </View>
                )}
            </Animated.View>
        </>
    );
});

export default BottomSheet;

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        justifyContent: 'flex-start',
        alignItems: 'center',
        alignSelf: 'center',
        overflow: 'hidden',
    },
    header: {
        width: '100%',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: 10,
        paddingTop: 10,
    },
    content: {
        width: '100%',
        flex: 1,
        paddingBottom: 20,
    },
    line: {
        width: 40,
        height: 4,
        borderRadius: 8,
    },
    textTitle: {
        color: '#1a1a1a',
        fontWeight: '600',
    },
    text: {
        fontSize: 16,
        fontFamily: 'SukhumvitSet_Me',
    },

});
