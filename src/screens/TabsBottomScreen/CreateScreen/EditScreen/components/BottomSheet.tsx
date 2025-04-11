import React, { memo, useEffect, useRef } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BlurView } from 'expo-blur';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// กำหนดความสูงคงที่สำหรับ bottom sheet
const FIXED_SHEET_HEIGHT = SCREEN_HEIGHT * 0.35; // หรือค่าที่เหมาะสมกับแอพของคุณ

interface BottomSheetProps {
  children: React.ReactNode;
  initialHeight?: number;
  onHeightChange?: (height: number) => void;
}

export const DraggableBottomSheet = memo<BottomSheetProps>(({
  children,
  initialHeight = FIXED_SHEET_HEIGHT,
  onHeightChange
}) => {
  const animatedOpacity = useSharedValue(0);
  
  // Reference to track current height for callbacks
  const currentHeightRef = useRef(initialHeight);

  // Setup initial values
  useEffect(() => {
    animatedOpacity.value = withTiming(1, { duration: 250 });
    
    if (onHeightChange) {
      onHeightChange(FIXED_SHEET_HEIGHT);
      currentHeightRef.current = FIXED_SHEET_HEIGHT;
    }
  }, [onHeightChange]);

  // Animated styles with smoother transitions
  const animatedStyle = useAnimatedStyle(() => ({
    height: FIXED_SHEET_HEIGHT, // ใช้ความสูงคงที่แทนการใช้ shared value
    opacity: animatedOpacity.value,
    transform: [
      { translateY: withTiming(0, { duration: 300 }) }
    ]
  }));

  const blurAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 0.3 // ค่าคงที่เพื่อความเรียบง่าย
  }));

  return (
    <>
      <Animated.View
        style={[styles.blurContainer, blurAnimatedStyle]}
        pointerEvents="none"
      >
        <BlurView intensity={20} style={styles.blur} tint="dark" />
      </Animated.View>

      <Animated.View style={[styles.bottomSheet, animatedStyle]}>
        <View style={styles.dragHandleContainer}>
          <View style={styles.dragHandle} />
        </View>

        <GestureHandlerRootView style={styles.contentContainer}>
          <View style={styles.childrenContainer}>
            {children}
          </View>
        </GestureHandlerRootView>
      </Animated.View>
    </>
  );
});

const styles = StyleSheet.create({
  bottomSheet: {
    backgroundColor: '#121212',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dragHandleContainer: {
    paddingVertical: 10,
    alignItems: 'center',
    zIndex: 10,
  },
  dragHandle: {
    height: 4,
    width: 36,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
  },
  childrenContainer: {
    flex: 1,
    width: '100%',
  },
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 90,
  },
  blur: {
    flex: 1,
  },
});