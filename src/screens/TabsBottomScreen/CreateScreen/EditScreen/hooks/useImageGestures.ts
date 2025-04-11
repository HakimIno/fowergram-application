import { useState, useCallback } from 'react';
import { Dimensions } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { CONSTANTS } from '../constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ImageGesturesProps {
  onControlsToggle: (visible: boolean) => void;
  setupControlsAutoHide: () => void;
  clearControlsAutoHide: () => void;
}

interface ImageGesturesResult {
  isFullscreenMode: boolean;
  setIsFullscreenMode: React.Dispatch<React.SetStateAction<boolean>>;
  scale: any; // SharedValue<number>
  translateX: any; // SharedValue<number>
  translateY: any; // SharedValue<number>
  savedScale: any; // SharedValue<number>
  savedTranslateX: any; // SharedValue<number>
  savedTranslateY: any; // SharedValue<number>
  animatedImageStyle: any; // AnimatedStyle
  gestures: any; // Combined Gesture
}

/**
 * Hook to manage image manipulation gestures (pinch, pan, tap)
 */
export const useImageGestures = ({
  onControlsToggle,
  setupControlsAutoHide,
  clearControlsAutoHide,
}: ImageGesturesProps): ImageGesturesResult => {
  // Fullscreen mode state
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);
  
  // Animation values for image manipulation
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  
  // Saved values for gesture continuity
  const savedScale = useSharedValue(1);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  
  // Track last tap time for double tap detection
  const lastTapTimeRef = useSharedValue(0);
  
  // Pinch gesture for zooming
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
      runOnJS(onControlsToggle)(false);
      
      // Haptic feedback
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    })
    .onUpdate((e) => {
      const MIN_SCALE = CONSTANTS.GESTURE.MIN_SCALE;
      const MAX_SCALE = CONSTANTS.GESTURE.MAX_SCALE;
      
      // Apply a smoother scaling with some resistance at the extremes
      if (savedScale.value * e.scale < MIN_SCALE) {
        // Apply resistance below minimum scale
        const delta = MIN_SCALE - (savedScale.value * e.scale);
        const resistanceFactor = 0.3; // Lower means more resistance
        scale.value = MIN_SCALE - (delta * resistanceFactor);
      } else if (savedScale.value * e.scale > MAX_SCALE) {
        // Apply resistance above maximum scale
        const delta = (savedScale.value * e.scale) - MAX_SCALE;
        const resistanceFactor = 0.3; // Lower means more resistance
        scale.value = MAX_SCALE + (delta * resistanceFactor);
      } else {
        // Normal scaling within limits
        scale.value = savedScale.value * e.scale;
      }
    })
    .onEnd(() => {
      const MIN_SCALE = CONSTANTS.GESTURE.MIN_SCALE;
      const MAX_SCALE = CONSTANTS.GESTURE.MAX_SCALE;
      
      // Apply boundaries with spring animations
      if (scale.value < MIN_SCALE) {
        scale.value = withSpring(MIN_SCALE, { damping: 15, stiffness: 150 });
      } else if (scale.value > MAX_SCALE) {
        scale.value = withSpring(MAX_SCALE, { damping: 15, stiffness: 150 });
      }
      
      runOnJS(onControlsToggle)(true);
      
      // Start auto-hide timer again if in fullscreen
      if (isFullscreenMode) {
        runOnJS(setupControlsAutoHide)();
      }
    });
  
  // Pan gesture for moving the image
  const panGesture = Gesture.Pan()
    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
      runOnJS(onControlsToggle)(false);
    })
    .onUpdate((e) => {
      // Adjust panning based on current scale
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      // Calculate max translation based on current scale and screen dimensions
      // For a more natural feeling, the translation limit should increase with zoom level
      const scaleFactor = Math.max(1, scale.value - 0.5);
      const maxTranslateX = (scaleFactor * SCREEN_WIDTH * 0.5) + (CONSTANTS.GESTURE.MAX_TRANSLATE_MULTIPLIER * SCREEN_WIDTH);
      const maxTranslateY = (scaleFactor * SCREEN_HEIGHT * 0.5) + (CONSTANTS.GESTURE.MAX_TRANSLATE_MULTIPLIER * SCREEN_HEIGHT);
      
      // Apply boundaries with spring animations
      if (Math.abs(translateX.value) > maxTranslateX) {
        translateX.value = withSpring(
          translateX.value > 0 ? maxTranslateX : -maxTranslateX,
          { damping: 15, stiffness: 150 }
        );
      }
      
      if (Math.abs(translateY.value) > maxTranslateY) {
        translateY.value = withSpring(
          translateY.value > 0 ? maxTranslateY : -maxTranslateY,
          { damping: 15, stiffness: 150 }
        );
      }
      
      runOnJS(onControlsToggle)(true);
      
      // Start auto-hide timer again if in fullscreen
      if (isFullscreenMode) {
        runOnJS(setupControlsAutoHide)();
      }
    });
  
  // Combine gestures
  const combinedGestures = Gesture.Simultaneous(pinchGesture, panGesture);
  
  // Double tap gesture for resetting zoom/position or toggling controls
  const doubleTapGesture = Gesture.Tap()
    .maxDuration(250)
    .numberOfTaps(2)
    .onStart(() => {
      runOnJS(clearControlsAutoHide)();
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
    })
    .onEnd(() => {
      // Reset zoom and position when double-tapped
      if (scale.value !== 1 || translateX.value !== 0 || translateY.value !== 0) {
        scale.value = withSpring(1, { damping: 15, stiffness: 150 });
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      } else {
        // If already at default, zoom in to 2x
        scale.value = withSpring(2, { damping: 15, stiffness: 150 });
      }
      
      runOnJS(onControlsToggle)(true);
      if (isFullscreenMode) {
        runOnJS(setupControlsAutoHide)();
      }
    });
  
  // Single tap gesture for toggling controls
  const singleTapGesture = Gesture.Tap()
    .maxDuration(250)
    .onStart(() => {
      runOnJS(clearControlsAutoHide)();
    })
    .onEnd(() => {
      if (isFullscreenMode) {
        runOnJS(onControlsToggle)(true);
        
        // Haptic feedback
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        
        // Start auto-hide timer again
        runOnJS(setupControlsAutoHide)();
      }
    });
  
  // Combine all gestures with proper exclusivity
  const tapGestures = Gesture.Exclusive(doubleTapGesture, singleTapGesture);
  const gestures = Gesture.Exclusive(combinedGestures, tapGestures);
  
  // Animated styles for the image container
  const animatedImageStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  return {
    isFullscreenMode,
    setIsFullscreenMode,
    scale,
    translateX,
    translateY,
    savedScale,
    savedTranslateX,
    savedTranslateY,
    animatedImageStyle,
    gestures,
  };
}; 