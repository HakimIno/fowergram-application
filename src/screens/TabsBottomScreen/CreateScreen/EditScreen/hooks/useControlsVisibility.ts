import { useState, useRef, useEffect, useCallback } from 'react';
import { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';

interface ControlsVisibilityResult {
  showControls: boolean;
  setShowControls: React.Dispatch<React.SetStateAction<boolean>>;
  controlsOpacity: any; // SharedValue<number>
  controlsAnimatedStyle: any; // AnimatedStyle
  setupControlsAutoHide: () => void;
  clearControlsAutoHide: () => void;
}

/**
 * Hook to manage the visibility of UI controls with auto-hide functionality
 * @param autoHideDelay - Time in ms after which controls should auto-hide
 */
export const useControlsVisibility = (autoHideDelay: number = 3000): ControlsVisibilityResult => {
  // Controls visibility state
  const [showControls, setShowControls] = useState(true);
  
  // Animated opacity value for controls
  const controlsOpacity = useSharedValue(1);
  
  // Timeout ref for auto-hiding controls
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update opacity animation when visibility changes
  useEffect(() => {
    controlsOpacity.value = withTiming(showControls ? 1 : 0, { duration: 200 });
  }, [showControls, controlsOpacity]);

  // Setup auto-hide functionality
  const setupControlsAutoHide = useCallback(() => {
    clearControlsAutoHide();
    
    // Start new auto-hide timer
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, autoHideDelay);
  }, [autoHideDelay]);

  // Clear auto-hide timer
  const clearControlsAutoHide = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearControlsAutoHide();
  }, [clearControlsAutoHide]);

  // Animated style for controls opacity
  const controlsAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: controlsOpacity.value,
    };
  });

  return {
    showControls,
    setShowControls,
    controlsOpacity,
    controlsAnimatedStyle,
    setupControlsAutoHide,
    clearControlsAutoHide,
  };
}; 