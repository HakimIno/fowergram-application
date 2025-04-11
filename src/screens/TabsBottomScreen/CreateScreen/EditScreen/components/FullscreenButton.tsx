import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { CONSTANTS } from '../constants';

interface FullscreenButtonProps {
  controlsAnimatedStyle: any; // AnimatedStyle
  isFullscreenMode: boolean;
  onToggleFullscreen: () => void;
}

/**
 * Button component to toggle fullscreen mode
 */
export const FullscreenButton: React.FC<FullscreenButtonProps> = ({
  controlsAnimatedStyle,
  isFullscreenMode,
  onToggleFullscreen,
}) => {
  return (
    <Animated.View
      entering={FadeIn.duration(CONSTANTS.ANIMATION.FADE_IN)}
      exiting={FadeOut.duration(CONSTANTS.ANIMATION.FADE_OUT)}
      style={[styles.fullscreenButtonContainer, controlsAnimatedStyle]}
    >
      <TouchableOpacity 
        style={styles.fullscreenButton}
        onPress={onToggleFullscreen}
        activeOpacity={0.7}
      >
        <BlurView intensity={20} tint="dark" style={styles.fullscreenButtonBlur}>
          <Ionicons 
            name={isFullscreenMode ? "contract" : "expand"} 
            size={22} 
            color={CONSTANTS.COLORS.ICON_COLOR} 
          />
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fullscreenButtonContainer: {
    position: 'absolute', 
    top: 100,
    right: 15, 
    zIndex: 100,
  },
  fullscreenButton: {
    borderRadius: CONSTANTS.UI.BUTTON_BORDER_RADIUS,
    overflow: 'hidden',
  },
  fullscreenButtonBlur: {
    width: CONSTANTS.UI.BUTTON_SIZE,
    height: CONSTANTS.UI.BUTTON_SIZE,
    borderRadius: CONSTANTS.UI.BUTTON_BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CONSTANTS.COLORS.BUTTON_BORDER,
  },
}); 