import React, { useState, useRef, useCallback, useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withDecay,
    cancelAnimation,
    runOnJS,
    useAnimatedReaction,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useTheme } from 'src/context/ThemeContext';
import GridItemComponent, { GridItem } from '../GridItem';
import { SPRING_CONFIG, SCREEN_WIDTH, SCREEN_HEIGHT } from '../../utils/GridUtils';

// Constants for better organization
const CONSTANTS = {
    REFRESH_HEIGHT: 80,
    REFRESH_COOLDOWN: 1000,
    DECELERATION_RATE: 0.993,
    RESISTANCE_FACTOR: 0.2,
    REFRESH_POSITION_FACTOR: 0.3,
    PULL_RESISTANCE_FACTOR: 0.5,
    VELOCITY_THRESHOLD: 50,
    BOUNDARY_TOLERANCE: 5,
} as const;

// Props interface
interface ContentGridProps {
    gridData: GridItem[];
    gridDimensions: { width: number; height: number };
    isLoading: boolean;
    onRefresh: () => void;
    refreshing: boolean;
}

// Note: If you encounter an ENOENT error for 'valueUnpacker', check metro.config.js for incorrect file references
// and clear Metro cache with `npx react-native start --reset-cache`.

const ContentGrid: React.FC<ContentGridProps> = ({
    gridData,
    gridDimensions,
    isLoading,
    onRefresh,
    refreshing,
}) => {
    const { theme } = useTheme();
    const [canRefresh, setCanRefresh] = useState(true);
    const lastRefreshTime = useRef(0);

    // Shared values for animations
    const refreshStartY = useSharedValue(0);
    const isPullingToRefresh = useSharedValue(false);
    const pullDistance = useSharedValue(0);
    const scrollY = useSharedValue(0);
    const contentTranslateX = useSharedValue(0);
    const contentTranslateY = useSharedValue(0);
    const prevTranslateX = useSharedValue(0);
    const prevTranslateY = useSharedValue(0);

    // Memoized boundaries
    const boundaries = useMemo(() => ({
        minX: -gridDimensions.width + SCREEN_WIDTH,
        maxX: 0,
        minY: -gridDimensions.height + SCREEN_HEIGHT,
        maxY: 0,
    }), [gridDimensions.width, gridDimensions.height]);

    // Initial centered position
    const initialX = useMemo(() => -(gridDimensions.width - SCREEN_WIDTH) / 2, [gridDimensions.width]);
    const initialY = useMemo(() => -(gridDimensions.height - SCREEN_HEIGHT) / 2, [gridDimensions.height]);

    // Initialize positions
    contentTranslateX.value = initialX;
    contentTranslateY.value = initialY;
    prevTranslateX.value = initialX;
    prevTranslateY.value = initialY;

    // Stable setCanRefresh
    const handleSetCanRefresh = useCallback((value: boolean) => {
        setCanRefresh(value);
    }, []);

    // Stable function to prevent refresh spam
    const canTriggerRefresh = useCallback(() => {
        const now = Date.now();
        if (now - lastRefreshTime.current > CONSTANTS.REFRESH_COOLDOWN && !refreshing && canRefresh) {
            lastRefreshTime.current = now;
            return true;
        }
        return false;
    }, [refreshing, canRefresh]);

    // Wrapper function for the panGesture onStart
    const handlePanStart = useCallback((event: { absoluteY: number }) => {
        'worklet';
        cancelAnimation(contentTranslateX);
        cancelAnimation(contentTranslateY);
        prevTranslateX.value = contentTranslateX.value;
        prevTranslateY.value = contentTranslateY.value;
        refreshStartY.value = event.absoluteY;
        isPullingToRefresh.value = contentTranslateY.value >= boundaries.maxY - CONSTANTS.BOUNDARY_TOLERANCE;
    }, []);

    // Wrapper function for the panGesture onUpdate
    const handlePanUpdate = useCallback((event: { translationY: number; translationX: number }) => {
        'worklet';
        if (isPullingToRefresh.value && event.translationY > 0) {
            pullDistance.value = Math.min(event.translationY, CONSTANTS.REFRESH_HEIGHT * 1.5);
            contentTranslateY.value = boundaries.maxY + pullDistance.value * CONSTANTS.PULL_RESISTANCE_FACTOR;
            contentTranslateX.value = prevTranslateX.value;
        } else {
            const newX = prevTranslateX.value + event.translationX;
            const newY = prevTranslateY.value + event.translationY;

            // Apply elastic resistance for X
            contentTranslateX.value = newX > boundaries.maxX
                ? boundaries.maxX + (newX - boundaries.maxX) * CONSTANTS.RESISTANCE_FACTOR
                : newX < boundaries.minX
                    ? boundaries.minX + (newX - boundaries.minX) * CONSTANTS.RESISTANCE_FACTOR
                    : newX;

            // Apply elastic resistance for Y
            contentTranslateY.value = newY > boundaries.maxY
                ? boundaries.maxY + (newY - boundaries.maxY) * CONSTANTS.RESISTANCE_FACTOR
                : newY < boundaries.minY
                    ? boundaries.minY + (newY - boundaries.minY) * CONSTANTS.RESISTANCE_FACTOR
                    : newY;
        }
    }, []);

    // JS thread function to check if we can refresh
    const checkAndTriggerRefresh = useCallback(() => {
        if (canTriggerRefresh()) {
            onRefresh();
            handleSetCanRefresh(false);
            return true;
        }
        return false;
    }, [canTriggerRefresh, onRefresh, handleSetCanRefresh]);

    // Wrapper function for the panGesture onEnd
    const handlePanEnd = useCallback((event: { velocityX: number; velocityY: number }) => {
        'worklet';
        if (isPullingToRefresh.value && pullDistance.value > CONSTANTS.REFRESH_HEIGHT) {
            // Instead of checking the return value directly, we'll use separate flows
            runOnJS(checkAndTriggerRefresh)();
            
            // Always animate regardless of refresh state
            contentTranslateY.value = withSpring(
                boundaries.maxY + CONSTANTS.REFRESH_HEIGHT * CONSTANTS.REFRESH_POSITION_FACTOR,
                SPRING_CONFIG,
                () => {
                    'worklet';
                    isPullingToRefresh.value = false;
                    pullDistance.value = 0;
                    runOnJS(handleSetCanRefresh)(true);
                }
            );
        } else if (isPullingToRefresh.value) {
            contentTranslateY.value = withSpring(boundaries.maxY, SPRING_CONFIG, () => {
                'worklet';
                isPullingToRefresh.value = false;
                pullDistance.value = 0;
            });
        } else {
            // Apply decay or spring back for X
            if (Math.abs(event.velocityX) > CONSTANTS.VELOCITY_THRESHOLD) {
                contentTranslateX.value = withDecay({
                    velocity: event.velocityX,
                    clamp: [boundaries.minX, boundaries.maxX],
                    deceleration: CONSTANTS.DECELERATION_RATE,
                });
            } else {
                contentTranslateX.value = withSpring(
                    Math.max(boundaries.minX, Math.min(boundaries.maxX, contentTranslateX.value)),
                    SPRING_CONFIG
                );
            }

            // Apply decay or spring back for Y
            if (Math.abs(event.velocityY) > CONSTANTS.VELOCITY_THRESHOLD && !refreshing) {
                contentTranslateY.value = withDecay({
                    velocity: event.velocityY,
                    clamp: [boundaries.minY, boundaries.maxY],
                    deceleration: CONSTANTS.DECELERATION_RATE,
                });
            } else if (!refreshing) {
                contentTranslateY.value = withSpring(
                    Math.max(boundaries.minY, Math.min(boundaries.maxY, contentTranslateY.value)),
                    SPRING_CONFIG
                );
            }
        }
    }, [boundaries, refreshing, checkAndTriggerRefresh, handleSetCanRefresh]);

    // Pan gesture configuration
    const panGesture = useMemo(() => {
        if (!Gesture.Pan) {
            console.error('Gesture.Pan is not available. Ensure react-native-gesture-handler is installed and linked.');
            return null;
        }

        return Gesture.Pan()
            .onStart(handlePanStart)
            .onUpdate(handlePanUpdate)
            .onEnd(handlePanEnd);
    }, [handlePanStart, handlePanUpdate, handlePanEnd]);

    // Update scrollY for header animation
    useAnimatedReaction(
        () => contentTranslateY.value,
        (current) => {
            scrollY.value = -current;
        },
        []
    );

    // Animated styles
    const contentAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: contentTranslateX.value },
            { translateY: contentTranslateY.value },
        ],
    }), []);

    const refreshIndicatorStyle = useAnimatedStyle(() => ({
        opacity: isPullingToRefresh.value ? Math.min(pullDistance.value / CONSTANTS.REFRESH_HEIGHT, 1) : 0,
        transform: [{ translateY: -CONSTANTS.REFRESH_HEIGHT + (pullDistance.value * CONSTANTS.PULL_RESISTANCE_FACTOR) }],
    }), []);

    // Memoized components
    const LoadingContent = useMemo(() => {
        if (!isLoading) return null;
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.loadingText, { color: theme.textColor }]}>Loading content...</Text>
            </View>
        );
    }, [isLoading, theme]);

    const GridItems = useMemo(() => {
        if (isLoading) return null;
        return gridData.map((item) => <GridItemComponent key={item.id} item={item} />);
    }, [gridData, isLoading]);

    const RefreshingOverlay = useMemo(() => {
        if (!refreshing) return null;
        return (
            <View style={styles.refreshingOverlay}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.refreshingText, { color: theme.textColor }]}>Refreshing...</Text>
            </View>
        );
    }, [refreshing, theme]);

    // Render
    if (!panGesture) {
        return (
            <View style={styles.container}>
                <Text style={[styles.errorText, { color: theme.textColor }]}>
                    Error: Gesture handler not initialized
                </Text>
            </View>
        );
    }

    return (
        <GestureDetector gesture={panGesture}>
            <View style={styles.container}>
                {/* Pull-to-refresh indicator */}
                <Animated.View style={[styles.refreshIndicator, refreshIndicatorStyle]}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.refreshText, { color: theme.textColor }]}>Release to refresh</Text>
                </Animated.View>

                {/* Main content */}
                <Animated.View
                    style={[
                        styles.contentWrapper,
                        { width: gridDimensions.width, height: gridDimensions.height },
                        contentAnimatedStyle,
                    ]}
                >
                    {LoadingContent}
                    {!isLoading && (
                        <View
                            style={[styles.contentContainer, {
                                width: gridDimensions.width,
                                height: gridDimensions.height,
                            }]}
                        >
                            {GridItems}
                        </View>
                    )}
                </Animated.View>

                {/* Refreshing overlay */}
                {RefreshingOverlay}
            </View>
        </GestureDetector>
    );
};

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
    },
    contentWrapper: {
        position: 'absolute',
    },
    contentContainer: {
        position: 'relative',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        fontWeight: '500',
    },
    refreshIndicator: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: CONSTANTS.REFRESH_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    refreshText: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: '500',
    },
    refreshingOverlay: {
        position: 'absolute',
        top: 20,
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 20,
    },
    refreshingText: {
        marginLeft: 10,
        fontSize: 15,
        fontWeight: '500',
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
});

export default React.memo(ContentGrid);