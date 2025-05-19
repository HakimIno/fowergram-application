import React, { useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  cancelAnimation,
  Easing,
  interpolate,
  Extrapolate,
  runOnJS,
  Extrapolation
} from 'react-native-reanimated';

// Constants for animation
const IS_IOS = Platform.OS === 'ios';
const IS_ANDROID = Platform.OS === 'android';
const IS_HIGH_END_DEVICE = IS_IOS || (IS_ANDROID && parseInt(Platform.Version.toString(), 10) >= 26);
const ANIMATION_DURATION = IS_HIGH_END_DEVICE ? 250 : 300;
const ACTIVE_DOT_WIDTH = 8;
const INACTIVE_DOT_WIDTH = 4;
const DOT_HEIGHT = 3;
const DOT_SPACING = 6;
const SPRING_CONFIG = {
  damping: 20,
  mass: 1,
  stiffness: 200,
  overshootClamping: false,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 2
};

interface PaginationProps {
  totalCount: number;
  currentIndex: number;
}

// Modern animated dot component
const AnimatedDot = React.memo(({
  index,
  currentIndex,
  totalCount
}: {
  index: number;
  currentIndex: number;
  totalCount: number;
}) => {
  const isActive = index === currentIndex;
  const distance = Math.abs(index - currentIndex);
  const isVisible = distance <= 3;

  // Create animation styles
  const animatedStyle = useAnimatedStyle(() => {
    // Width animation
    const width = isActive
      ? ACTIVE_DOT_WIDTH
      : interpolate(
        distance,
        [0, 1, 2, 3],
        [ACTIVE_DOT_WIDTH, INACTIVE_DOT_WIDTH, INACTIVE_DOT_WIDTH * 0.9, INACTIVE_DOT_WIDTH * 0.8],
        Extrapolation.CLAMP
      );

    const opacity = interpolate(
      distance,
      [0, 1, 2, 3, 4],
      [1, 0.8, 0.6, 0.4, 0],
      Extrapolation.CLAMP
    );

    const scale = isActive
      ? 1
      : interpolate(
        distance,
        [0, 1, 2, 3],
        [1, 0.85, 0.7, 0.6],
        Extrapolation.CLAMP
      );

    return {
      width: withSpring(width, SPRING_CONFIG),
      opacity: withSpring(opacity, SPRING_CONFIG),
      transform: [{ scale: withSpring(scale, SPRING_CONFIG) }],
      backgroundColor: isActive
        ? 'rgba(255, 255, 255, 1)'
        : `rgba(255, 255, 255, ${0.9 - (distance * 0.2)})`,
    };
  }, [isActive, distance]);

  if (!isVisible && totalCount > 6) return null;

  return (
    <Animated.View style={[styles.dot, animatedStyle]} />
  );
});

export const OptimizedPagination = React.memo(({ totalCount, currentIndex }: PaginationProps) => {
  if (totalCount <= 1) return null;

  // Track animation position
  const activePosition = useSharedValue(currentIndex);
  const isDragging = useSharedValue(false);

  React.useEffect(() => {
    cancelAnimation(activePosition);

    if (Math.abs(activePosition.value - currentIndex) > 1) {
      activePosition.value = withTiming(currentIndex, {
        duration: ANIMATION_DURATION,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    } else {
      activePosition.value = withSpring(
        currentIndex,
        SPRING_CONFIG
      );
    }

    return () => {
      cancelAnimation(activePosition);
    };
  }, [currentIndex]);

  const indicatorStyle = useAnimatedStyle(() => {
    const dotSpacing = DOT_SPACING;
    return {
      transform: [{ translateX: activePosition.value * dotSpacing }]
    };
  });

  // Generate dots
  const dots = useMemo(() => {
    return Array.from({ length: totalCount }).map((_, index) => (
      <AnimatedDot
        key={`dot-${index}`}
        index={index}
        currentIndex={currentIndex}
        totalCount={totalCount}
      />
    ));
  }, [totalCount, currentIndex]);

  return (
    <View style={styles.paginationContainer}>
      <View style={styles.paginationTrack}>
        {dots}

        {/* Active indicator overlay */}
        <Animated.View
          style={[
            styles.activeIndicator,
            indicatorStyle
          ]}
        />
      </View>
    </View>
  );
}, (prevProps, nextProps) => {
  // Only re-render if current index or total count changes
  return prevProps.currentIndex === nextProps.currentIndex &&
    prevProps.totalCount === nextProps.totalCount;
});

const styles = StyleSheet.create({
  paginationContainer: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    zIndex: 10,

  },
  paginationTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: DOT_HEIGHT + 2,
  },
  dot: {
    height: DOT_HEIGHT,
    width: INACTIVE_DOT_WIDTH,
    borderRadius: DOT_HEIGHT / 2,
    marginHorizontal: (DOT_SPACING - INACTIVE_DOT_WIDTH) / 2,
  },
  activeIndicator: {
    position: 'absolute',
    width: ACTIVE_DOT_WIDTH,
    height: DOT_HEIGHT,
    borderRadius: DOT_HEIGHT / 2,
    backgroundColor: 'rgba(255, 255, 255, 0)',
    zIndex: 1,
    left: (DOT_SPACING - ACTIVE_DOT_WIDTH) / 2,
  }
}); 