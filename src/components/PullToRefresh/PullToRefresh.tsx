import React, { useCallback, useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    runOnJS,
    interpolate,
    Extrapolate,
    Easing,
    withRepeat,
} from 'react-native-reanimated';

interface PullToRefreshProps {
    onRefresh: () => void;
    refreshing: boolean;
    containerStyle?: object;
    indicatorStyle?: object;
    customIndicator?: React.ReactNode;
    indicatorContainerStyle?: object;
    pullThreshold?: number;
    maxPullDistance?: number;
    animationDuration?: number;
    children: React.ReactNode;
    enabled?: boolean;
    onPullProgress?: (progress: number) => void;
}

const DEFAULT_PULL_THRESHOLD = 100;
const DEFAULT_MAX_PULL_DISTANCE = 200;
const DEFAULT_ANIMATION_DURATION = 300;

const springConfig = {
    damping: 15,
    mass: 1,
    stiffness: 150,
};

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
    onRefresh,
    refreshing,
    containerStyle,
    indicatorStyle,
    customIndicator,
    indicatorContainerStyle,
    pullThreshold = DEFAULT_PULL_THRESHOLD,
    maxPullDistance = DEFAULT_MAX_PULL_DISTANCE,
    animationDuration = DEFAULT_ANIMATION_DURATION,
    children,
    enabled = true,
    onPullProgress,
}) => {
    const pullDistance = useSharedValue(0);
    const isRefreshing = useSharedValue(false);
    const rotation = useSharedValue(0);

    useEffect(() => {
        if (refreshing) {
            isRefreshing.value = true;
            pullDistance.value = withSpring(pullThreshold, springConfig);
            rotation.value = withRepeat(
                withTiming(360, {
                    duration: 1000,
                    easing: Easing.linear
                }),
                -1,
                false
            );
        } else {
            isRefreshing.value = false;
            pullDistance.value = withTiming(0, { duration: animationDuration });
            rotation.value = withTiming(0, { duration: animationDuration });
        }
    }, [refreshing, pullThreshold, animationDuration]);

    const handlePullProgress = useCallback(
        (progress: number) => {
            onPullProgress?.(progress);
        },
        [onPullProgress]
    );

    const gestureHandler = useAnimatedGestureHandler({
        onStart: (_, ctx: any) => {
            if (!enabled || isRefreshing.value) return;
            ctx.startY = pullDistance.value;
        },
        onActive: (event, ctx: any) => {
            if (!enabled || isRefreshing.value) return;

            const resistance = 0.5;
            const newDistance = Math.max(
                0,
                Math.min(ctx.startY + (event.translationY * resistance), maxPullDistance)
            );

            pullDistance.value = newDistance;
            const progress = Math.min(newDistance / pullThreshold, 1);
            rotation.value = progress * 360;

            if (progress % 0.1 < 0.05) {
                runOnJS(handlePullProgress)(progress);
            }
        },
        onEnd: () => {
            if (!enabled || isRefreshing.value) return;

            if (pullDistance.value >= pullThreshold) {
                pullDistance.value = withSpring(pullThreshold, springConfig);
                isRefreshing.value = true;
                runOnJS(onRefresh)();
            } else {
                pullDistance.value = withTiming(0, { duration: animationDuration });
            }
        },
    });

    const containerStyleAnimated = useAnimatedStyle(() => ({
        transform: [{
            translateY: interpolate(
                pullDistance.value,
                [0, maxPullDistance],
                [0, maxPullDistance],
                Extrapolate.CLAMP
            ),
        }],
    }));

    const indicatorStyleAnimated = useAnimatedStyle(() => {
        const progress = interpolate(
            pullDistance.value,
            [0, pullThreshold],
            [0, 1],
            Extrapolate.CLAMP
        );

        return {
            opacity: progress,
            transform: [
                { translateY: -pullDistance.value },
                { scale: progress },
                { rotate: `${rotation.value}deg` },
            ],
        };
    });

    const RefreshIndicator = useMemo(() => (
        <View style={[styles.indicator, indicatorStyle]}>
            <View style={styles.indicatorInner} />
        </View>
    ), [indicatorStyle]);

    return (
        <View style={[styles.container, containerStyle]}>
            <Animated.View 
                style={[
                    styles.indicatorContainer, 
                    indicatorContainerStyle,
                    indicatorStyleAnimated
                ]}
            >
                {customIndicator || RefreshIndicator}
            </Animated.View>

            <PanGestureHandler
                onGestureEvent={gestureHandler}
                enabled={enabled && !isRefreshing.value}
                activeOffsetY={[0, 20]}
            >
                <Animated.View style={[styles.contentContainer, containerStyleAnimated]}>
                    {children}
                </Animated.View>
            </PanGestureHandler>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
    },
    contentContainer: {
        flex: 1,
    },
    indicatorContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        height: DEFAULT_PULL_THRESHOLD,
        transform: [{ translateY: -DEFAULT_PULL_THRESHOLD }],
        zIndex: 1,
    },
    indicator: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#007AFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    indicatorInner: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'white',
    },
});