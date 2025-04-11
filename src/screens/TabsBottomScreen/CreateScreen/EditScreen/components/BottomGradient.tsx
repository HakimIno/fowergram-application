import React from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface BottomGradientProps {
  style: any; // Animated style object
}

/**
 * Gradient overlay at the bottom of the screen for better visibility
 */
export const BottomGradient: React.FC<BottomGradientProps> = ({ style }) => {
  return (
    <Animated.View
      style={[styles.bottomGradientContainer, style]}
      pointerEvents="none"
    >
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
        style={styles.bottomGradient}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bottomGradientContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    pointerEvents: 'none',
  },
  bottomGradient: {
    flex: 1,
  },
}); 