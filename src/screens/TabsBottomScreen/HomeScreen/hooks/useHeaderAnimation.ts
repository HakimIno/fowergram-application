import { useAnimatedStyle, useDerivedValue, useSharedValue } from 'react-native-reanimated';

const HEADER_HEIGHT = 60;

/**
 * Hook to manage header animations based on scroll position
 */
export const useHeaderAnimation = (insets: { top: number }) => {
  const scrollY = useSharedValue(0);
  const lastScrollY = useSharedValue(0);
  const headerTranslateY = useSharedValue(0);
  const isScrollingUp = useSharedValue(false);

  // Calculate header position as scroll position changes
  const derivedHeaderTranslateY = useDerivedValue(() => {
    'worklet';
    const HIDE_HEADER_SCROLL_DISTANCE = HEADER_HEIGHT + insets.top;
    const MIN_SCROLL_TO_HIDE = 50;

    if (scrollY.value <= 10) {
      headerTranslateY.value = 0;
      return 0;
    }

    if (!isScrollingUp.value && scrollY.value > MIN_SCROLL_TO_HIDE) {
      headerTranslateY.value = -HIDE_HEADER_SCROLL_DISTANCE;
      return -HIDE_HEADER_SCROLL_DISTANCE;
    }

    if (isScrollingUp.value) {
      headerTranslateY.value = 0;
      return 0;
    }

    return headerTranslateY.value;
  }, [scrollY, isScrollingUp]);

  // Create animated style for header
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: derivedHeaderTranslateY.value },
      { perspective: 1000 },
    ],
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  }));

  return {
    scrollY,
    lastScrollY,
    headerTranslateY,
    isScrollingUp,
    headerAnimatedStyle,
  };
}; 