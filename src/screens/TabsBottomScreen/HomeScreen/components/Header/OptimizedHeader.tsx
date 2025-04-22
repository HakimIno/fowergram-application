import React, { useCallback } from 'react';
import { View, Pressable, StyleSheet, StyleProp, ViewStyle, FlexAlignType, Text } from 'react-native';
import { Octicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { SunIcon, MoonIcon } from './ThemeIcons';
import FlowerLogo from '../UI/FlowerLogo';
import type { Theme } from 'src/context/ThemeContext';
import FlowergramLogo from 'src/components/FlowergramLogo';

interface HeaderProps {
  insets: {
    top: number;
  };
  onNotificationPress: () => void;
  isDarkMode: boolean;
  onThemePress: (x: number, y: number) => void;
  themeIconStyle: StyleProp<ViewStyle>;
  theme: Theme;
  isRefreshing: boolean;
  onRefresh: () => void;
}

const headerStyles = {
  logoContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as FlexAlignType,
    paddingVertical: 0,
    borderRadius: 100,
  },
  notificationContainer: {
    position: 'relative' as const,
  },
} as const;

// Optimized Header component to reduce re-renders
export const OptimizedHeader = React.memo(({
  insets,
  onNotificationPress,
  isDarkMode,
  onThemePress,
  themeIconStyle,
  theme,
  isRefreshing,
  onRefresh
}: HeaderProps) => {
  const handleThemePress = useCallback((event: any) => {
    const { pageX, pageY } = event.nativeEvent;
    onThemePress(pageX, pageY);
  }, [onThemePress]);

  // Define gradient colors based on theme
  const gradientColors = isDarkMode
    ? ['rgba(0,0,0,1)', 'rgb(23, 1, 33)'] as const
    : ['rgba(255,255,255,1)', 'rgba(255,255,255,1)', 'rgb(255, 255, 255)'] as const;

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerContainer}
    >
      <View style={[styles.subHeaderContainer, { marginTop: insets.top }]}>
        <View style={styles.logoWrapper}>
          {/* Flower logo as refresh button */}
          {/* <Pressable style={styles.flowerLogoContainer} onPress={onRefresh}>
            <FlowerLogo
              isRefreshing={isRefreshing}
              onRefresh={onRefresh}
              color={"#4f46e5"}
              size={32}
            />
          </Pressable> */}
          
          {/* Flowergram text logo */}
          <Pressable style={styles.flowergramContainer} onPress={onRefresh}>
            <FlowergramLogo
              width={138}
              height={40}
              fontSize={24}
              theme={theme}
            />
          </Pressable>
        </View>

        <View style={styles.rightHeaderContainer}>
          <Pressable
            style={styles.iconButton}
            onPress={handleThemePress}
          >
            <Animated.View style={themeIconStyle}>
              {!isDarkMode ? (
                <MoonIcon color={theme.textColor} />
              ) : (
                <SunIcon color={theme.textColor} />
              )}
            </Animated.View>
          </Pressable>
          <Pressable
            style={headerStyles.notificationContainer}
            onPress={onNotificationPress}
          >
            <Octicons
              name="bell"
              size={22}
              color={theme.textColor}
            />
            <View style={styles.notificationBadge} />
          </Pressable>
        </View>
      </View>
    </LinearGradient>
  );
});

const styles = StyleSheet.create({
  headerContainer: {
    zIndex: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  subHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 5,
  },
  logoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flowerLogoContainer: {
    marginRight: 8,
  },
  flowergramContainer: {
    marginLeft: -5, // Slight overlap for visual connection
  },
  iconButton: {
    padding: 5,
  },
  rightHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  notificationBadge: {
    backgroundColor: '#f43f5e',
    padding: 4,
    borderRadius: 20,
    position: 'absolute',
    top: -3,
    right: -2
  },
});

// Animated header wrapper
interface AnimatedHeaderProps extends HeaderProps {
  style: StyleProp<ViewStyle>;
}

export const AnimatedHeader = React.memo((props: AnimatedHeaderProps) => (
  <Animated.View style={props.style}>
    <OptimizedHeader
      insets={props.insets}
      onNotificationPress={props.onNotificationPress}
      isDarkMode={props.isDarkMode}
      onThemePress={props.onThemePress}
      themeIconStyle={props.themeIconStyle}
      theme={props.theme}
      isRefreshing={props.isRefreshing}
      onRefresh={props.onRefresh}
    />
  </Animated.View>
)); 