import { BlurMask, Canvas, Path, Skia, SweepGradient, vec } from '@shopify/react-native-skia';
import { useEffect, useMemo } from 'react';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import { StyleSheet, View } from 'react-native';

type ActivityIndicatorProps = {
    size?: number;
};

const ActivityIndicator = ({ size = 40 }: ActivityIndicatorProps) => {
    // Constants
    const strokeWidth = 1.5;
    const radius = (size - strokeWidth) / 2;
    const canvasSize = size + 10; // Minimal padding

    // Memoized path
    const circle = useMemo(() => {
        const skPath = Skia.Path.Make();
        skPath.addCircle(canvasSize / 2, canvasSize / 2, radius);
        return skPath;
    }, [canvasSize, radius]);

    // Memoized gradient center
    const center = useMemo(() => vec(canvasSize / 2, canvasSize / 2), [canvasSize]);

    // Animation setup
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withRepeat(
            withTiming(1, {
                duration: 1000,
                easing: Easing.linear,
            }),
            -1,
            false,
        );
        return () => {
            progress.value = 0;
        };
    }, [progress]);

    // Animated rotation
    const rContainerStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${progress.value * 2 * Math.PI}rad` }],
    }));

    // Simple color gradient
    const colors = ['#93c5fd', '#60A5FA', '#1d4ed8'];

    return (
        <View style={styles.container}>
            <Animated.View
                style={[styles.animatedContainer, { width: canvasSize, height: canvasSize }, rContainerStyle]}
            >
                <Canvas style={{ flex: 1 }}>
                    <Path
                        path={circle}
                        style="stroke"
                        strokeWidth={strokeWidth}
                        strokeCap="round"
                        start={0.6} // Static start for simplicity
                        end={1}
                    >
                        <SweepGradient c={center} colors={colors} />
                        <BlurMask blur={10} style="solid" />
                    </Path>
                </Canvas>
            </Animated.View>
        </View>
    );
};
export default ActivityIndicator;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    animatedContainer: {
        overflow: 'hidden',
    },
});