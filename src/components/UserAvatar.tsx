import React, { useRef } from 'react';
import { View, Image, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { SvgIcon } from './SvgIcon';
import { UserDetails } from 'src/interface';
import { getProfilePictureUrl, getUserInitials } from 'src/utils/user/profilePicture';
import { useTheme } from 'src/context/ThemeContext';
import { FontAwesome, Ionicons } from '@expo/vector-icons';

interface UserAvatarProps {
  user?: UserDetails;
  size?: number;
  focused?: boolean;
  style?: any;
  onDoubleTap?: () => void;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 32,
  focused = false,
  style,
  onDoubleTap
}) => {
  const { isDarkMode, theme } = useTheme();
  const lastTapTimeRef = useRef<number>(0);
  const doubleTapDelay = 300; // milliseconds

  const profilePicUrl = user && typeof user === 'object' ? getProfilePictureUrl(user) : undefined;
  const initials = getUserInitials(user);

  const activeColor = isDarkMode ? '#FFFFFF' : '#000000';
  const inactiveColor = isDarkMode ? '#FFFFFF' : '#000000';

  const handleTap = () => {
    const now = Date.now();
    const delay = now - lastTapTimeRef.current;
    
    if (delay < doubleTapDelay && onDoubleTap) {
      onDoubleTap();
    }
    
    lastTapTimeRef.current = now;
  };

  const renderAvatar = () => {
    if (profilePicUrl) {
      return (
        <View
          style={[
            styles.profileIcon,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderColor: focused ? activeColor : inactiveColor,
              borderWidth: 1
            },
            style
          ]}
        >
          <Image
            source={{ uri: profilePicUrl }}
            style={{ width: size - 2, height: size - 2, borderRadius: (size - 2) / 2 }}
            resizeMode="cover"
          />
        </View>
      );
    }

    return (
      <View
        style={[
          styles.profileIcon,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: focused ? 1.5 : 1,
            borderColor: focused ? isDarkMode ? "#fff" : "#000" : isDarkMode ? "#374151" : "#d1d5db"
          },
          style
        ]}
      >
        <View
          style={[
            styles.profileInitial,
            {
              width: size - 2,
              height: size - 2,
              borderRadius: (size - 2) / 2,
              backgroundColor: focused ? isDarkMode ? "rgba(225, 225, 225, 0.1)" : " rgba(28, 27, 27, 0.1)" : 'transparent'
            }
          ]}
        >
          <Ionicons
            name="person"
            size={size - 8}
            color={'#6b7280'}
            style={{
              marginTop: 7
            }}
          />
        </View>
      </View>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={handleTap}>
      {renderAvatar()}
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  profileIcon: {
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  profileInitial: {
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default UserAvatar; 