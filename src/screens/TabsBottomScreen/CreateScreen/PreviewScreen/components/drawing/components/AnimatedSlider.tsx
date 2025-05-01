import React, { useEffect, forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  withSequence,
  withDelay,
  Easing,
  interpolate,
  useDerivedValue,
  runOnJS,
  useAnimatedReaction,
} from 'react-native-reanimated';

interface AnimatedSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbTintColor?: string;
}

export interface AnimatedSliderRef {
  setValueWithoutAnimation: (value: number) => void;
}

const AnimatedSlider = forwardRef<AnimatedSliderRef, AnimatedSliderProps>(({
  value,
  onValueChange,
  minimumValue = 0,
  maximumValue = 100,
  minimumTrackTintColor = '#3E67FF',
  maximumTrackTintColor = '#333333',
  thumbTintColor = '#ffffff',
}, ref) => {
  const sliderWidth = useSharedValue(0);
  const isSliding = useSharedValue(0);
  const sliderValue = useSharedValue(value);
  const pulseAnimation = useSharedValue(0);
  const sliderRef = useRef<any>(null);
  
  // Keep a JS state value synced with the shared value for render
  const [displayValue, setDisplayValue] = useState(value);

  // Safe update function for state that will be called from worklets
  const updateDisplayValue = (val: number) => {
    setDisplayValue(val);
  };

  useImperativeHandle(ref, () => ({
    setValueWithoutAnimation: (newValue: number) => {
      sliderValue.value = newValue;
      updateDisplayValue(newValue);
      if (sliderRef.current) {
        sliderRef.current.setNativeProps({ value: newValue });
      }
    }
  }));

  useEffect(() => {
    sliderValue.value = value;
    updateDisplayValue(value);
  }, [value]);
  
  // Use useAnimatedReaction instead of useDerivedValue for state updates
  useAnimatedReaction(
    () => sliderValue.value,
    (currentValue) => {
      runOnJS(updateDisplayValue)(currentValue);
    }
  );

  const pinPosition = useDerivedValue(() => {
    const percentage = (sliderValue.value - minimumValue) / (maximumValue - minimumValue);
    const thumbOffset = 15;
    return percentage * (sliderWidth.value - 2 * thumbOffset) + thumbOffset;
  });

  const triggerPulse = () => {
    pulseAnimation.value = withSequence(
      withTiming(1, { duration: 150, easing: Easing.inOut(Easing.quad) }),
      withTiming(0, { duration: 150, easing: Easing.inOut(Easing.quad) })
    );
  };

  const pinAnimatedStyle = useAnimatedStyle(() => {
    const baseScale = interpolate(
      isSliding.value,
      [0, 1],
      [0.8, 1],
      { extrapolateRight: 'clamp' }
    );
    
    const pulseScale = 1 + pulseAnimation.value * 0.2;
    
    return {
      left: pinPosition.value,
      opacity: withTiming(isSliding.value, { 
        duration: 200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1)
      }),
      transform: [
        { translateX: -15 },
        { scale: baseScale * pulseScale },
        { 
          translateY: withTiming(
            isSliding.value * -5, 
            { duration: 250, easing: Easing.out(Easing.back()) }
          )
        },
      ],
    };
  });

  // Bubble animation for a more lively effect
  const bubbleAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { 
          scale: 1 + pulseAnimation.value * 0.1
        },
      ],
      backgroundColor: withTiming(
        isSliding.value > 0.5 ? '#3E67FF' : '#555555',
        { duration: 300 }
      ),
    };
  });

  // Arrow animation for a more lively effect
  const arrowAnimatedStyle = useAnimatedStyle(() => {
    return {
      borderTopColor: withTiming(
        isSliding.value > 0.5 ? '#3E67FF' : '#555555',
        { duration: 300 }
      ),
    };
  });

  const handleSlidingStart = () => {
    isSliding.value = withSpring(1, { 
      damping: 15,
      stiffness: 120,
      mass: 0.8 
    });
    triggerPulse();
  };

  const handleSlidingComplete = () => {
    isSliding.value = withDelay(
      500, // Keep visible a bit longer after sliding ends
      withSpring(0, { 
        damping: 20,
        stiffness: 90
      })
    );
  };

  const handleValueChange = (val: number) => {
    // If value changed significantly, trigger pulse
    if (Math.abs(sliderValue.value - val) > 2) {
      triggerPulse();
    }
    
    sliderValue.value = val;
    onValueChange(val);
    
    if (isSliding.value < 0.5) {
      handleSlidingStart();
    }
  };

  return (
    <View 
      style={styles.container}
      onLayout={(event) => {
        sliderWidth.value = event.nativeEvent.layout.width;
      }}
    >
      <Animated.View style={[styles.valuePin, pinAnimatedStyle]}>
        <Animated.View style={[styles.valueBubble, bubbleAnimatedStyle]}>
          <Text style={styles.valueBubbleText}>{displayValue.toFixed(0)}</Text>
        </Animated.View>
        <Animated.View style={[styles.valueArrow, arrowAnimatedStyle]} />
      </Animated.View>

      <Slider
        ref={sliderRef}
        style={styles.slider}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        value={value}
        onValueChange={handleValueChange}
        onSlidingComplete={handleSlidingComplete}
        minimumTrackTintColor={minimumTrackTintColor}
        maximumTrackTintColor={maximumTrackTintColor}
        thumbTintColor={thumbTintColor}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
    position: 'relative',
  },
  slider: {
    width: '100%',
  },
  valuePin: {
    position: 'absolute',
    top: -30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueBubble: {
    backgroundColor: '#3E67FF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 30,
    alignItems: 'center',
    
  },
  valueBubbleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  valueArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#3E67FF',
  },
});

export default AnimatedSlider; 