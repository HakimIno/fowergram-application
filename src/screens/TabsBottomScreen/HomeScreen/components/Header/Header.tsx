import React from 'react';
import { Text, View, Pressable, StyleSheet, FlexAlignType } from 'react-native';
import { Octicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import Svg, { Path, G } from 'react-native-svg';
import Animated from 'react-native-reanimated';
import { Theme } from 'src/context/ThemeContext';

// SunIcon Component
export const SunIcon = ({ color }: { color: string }) => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill={color}>
    <G>
      <Path fill="none" d="M0 0h24v24H0z" />
      <Path d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12zM11 1h2v3h-2V1zm0 19h2v3h-2v-3zM3.515 4.929l1.414-1.414L7.05 5.636 5.636 7.05 3.515 4.93zM16.95 18.364l1.414-1.414 2.121 2.121-1.414 1.414-2.121-2.121zm2.121-14.85l1.414 1.415-2.121 2.121-1.414-1.414 2.121-2.121zM5.636 16.95l1.414 1.414-2.121 2.121-1.414-1.414 2.121-2.121zM23 11v2h-3v-2h3zM4 11v2H1v-2h3z" />
    </G>
  </Svg>
);

// MoonIcon Component
export const MoonIcon = ({ color }: { color: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <G>
      <Path fill="none" d="M0 0h24v24H0z" />
      <Path d="M9.822 2.238a9 9 0 0 0 11.94 11.94C20.768 18.654 16.775 22 12 22 6.477 22 2 17.523 2 12c0-4.775 3.346-8.768 7.822-9.762zm8.342.053L19 2.5v1l-.836.209a2 2 0 0 0-1.455 1.455L16.5 6h-1l-.209-.836a2 2 0 0 0-1.455-1.455L13 3.5v-1l.836-.209A2 2 0 0 0 15.29.836L15.5 0h1l.209.836a2 2 0 0 0 1.455 1.455zm5 5L24 7.5v1l-.836.209a2 2 0 0 0-1.455 1.455L21.5 11h-1l-.209-.836a2 2 0 0 0-1.455-1.455L18 8.5v-1l.836-.209a2 2 0 0 0 1.455-1.455L20.5 5h1l.209.836a2 2 0 0 0 1.455 1.455z" />
    </G>
  </Svg>
);

export interface HeaderProps {
  insets: {
    top: number;
  };
  onNotificationPress: () => void;
  iconStyle: any;
  handlePress: () => void;
  isDarkMode: boolean;
  onThemePress: (x: number, y: number) => void;
  themeIconStyle: any;
  theme: Theme;
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

// Header Component
const Header = React.memo(({
  insets,
  onNotificationPress,
  iconStyle,
  handlePress,
  isDarkMode,
  onThemePress,
  themeIconStyle,
  theme
}: HeaderProps) => {
  const handleThemePress = (event: any) => {
    const { pageX, pageY } = event.nativeEvent;
    onThemePress(pageX, pageY);
  };

  return (
    <View style={[styles.headerContainer, { backgroundColor: theme.backgroundColor }]}>
      <View style={[styles.subHeaderContainer, { marginTop: insets.top }]}>
        <Pressable style={headerStyles.logoContainer}>
          <Text style={[styles.logoText, { color: theme.textColor, zIndex: 1, marginBottom: 2, }]}>fl</Text>
          <Image
            source={require('../../../../assets/app_logo.png')}
            style={[{ width: 25, height: 25, borderRadius: 45 }]}
          />
          <Text style={[styles.logoText, { color: theme.textColor, zIndex: 1, marginBottom: 2 }]}>wergram</Text>
        </Pressable>

        <View style={styles.rightHeaderContainer}>
          <Pressable
            style={[styles.iconButton, { marginRight: 15 }]}
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
    </View>
  );
});

// Export animated version as well
export interface AnimatedHeaderProps extends HeaderProps {
  style: any;
}

export const AnimatedHeader = React.memo((props: AnimatedHeaderProps) => (
  <Animated.View style={props.style}>
    <Header
      insets={props.insets}
      onNotificationPress={props.onNotificationPress}
      iconStyle={props.iconStyle}
      handlePress={props.handlePress}
      isDarkMode={props.isDarkMode}
      onThemePress={props.onThemePress}
      themeIconStyle={props.themeIconStyle}
      theme={props.theme}
    />
  </Animated.View>
));

const styles = StyleSheet.create({
  headerContainer: {
    paddingVertical: 10,
    elevation: 2,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  subHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  logoText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  rightHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 5,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
});

export default Header; 