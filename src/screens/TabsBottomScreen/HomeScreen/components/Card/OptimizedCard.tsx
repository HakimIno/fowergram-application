import React, { useCallback, useEffect, useRef, useState, memo } from 'react';
import { View, Text, Pressable, StyleSheet, GestureResponderEvent, Platform } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
  useSharedValue,
} from 'react-native-reanimated';
import { useTheme } from 'src/context/ThemeContext';
import TweetActionButtons from '../UI/TweetActionButtons';
import { OptimizedCardCarousel } from './OptimizedCardCarousel';
import type { HomeNavigationProp } from '../../types';

interface CardProps {
  navigation: HomeNavigationProp;
  images: string[];
  title: string;
  likes: string;
  caption: string;
  cardIndex: number;
  isVisible: boolean;
}

// Enhanced memo equality check - prevent unnecessary renders
const arePropsEqual = (prevProps: CardProps, nextProps: CardProps) => {
  return (
    prevProps.cardIndex === nextProps.cardIndex &&
    prevProps.title === nextProps.title &&
    prevProps.likes === nextProps.likes &&
    prevProps.isVisible === nextProps.isVisible
  );
};

// Highly optimized Card component that only re-renders when necessary
export const OptimizedCard = memo(({
  navigation,
  images,
  title,
  likes,
  caption,
  cardIndex,
  isVisible
}: CardProps) => {
  const { theme, isDarkMode } = useTheme();
  const cardKey = useRef(`card-${cardIndex}-${title.slice(0, 10)}`).current;
  
  // State for like handling
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(parseInt(likes) || 0);
  
  // Use refs to avoid closure issues with event handlers
  const likeStateRef = useRef({ isLiked: false, count: parseInt(likes) || 0 });
  const lastTapRef = useRef(0);
  const scale = useSharedValue(1);
  
  // Reset state when card properties change
  useEffect(() => {
    setIsLiked(false);
    setLikeCount(parseInt(likes) || 0);
    likeStateRef.current = { isLiked: false, count: parseInt(likes) || 0 };
    
    // Force preload รูปแรกทันที
    if (images && images.length > 0) {
      // Import dynamically to avoid circular dependency
      const { preloadFeedImages } = require('./OptimizedCardImage');
      preloadFeedImages([images], [0]);
    }
  }, [cardIndex, title, likes, images]);
  
  // Handle double-tap like gesture
  const handleDoubleTap = useCallback((event: GestureResponderEvent) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 250;
    
    if (lastTapRef.current && (now - lastTapRef.current) < DOUBLE_PRESS_DELAY) {
      // If already liked, don't unlike on double tap
      if (likeStateRef.current.isLiked) {
        lastTapRef.current = 0;
        return;
      }
      
      // Update refs first to avoid closure issues
      likeStateRef.current.isLiked = true;
      likeStateRef.current.count += 1;
      
      // Then update state
      setIsLiked(true);
      setLikeCount(likeStateRef.current.count);
      
      scale.value = withSequence(
        withSpring(0.8, { damping: 12, stiffness: 300, mass: 0.5 }),
        withSpring(1.2, { damping: 12, stiffness: 300, mass: 0.5 }),
        withSpring(1, { damping: 12, stiffness: 300, mass: 0.5 })
      );
      
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  }, []);
  
  // Handle like button press
  const handleLike = useCallback(() => {
    // Update like status using refs first to avoid closure issues
    const newLikeState = !likeStateRef.current.isLiked;
    likeStateRef.current.isLiked = newLikeState;
    likeStateRef.current.count = newLikeState
      ? likeStateRef.current.count + 1
      : Math.max(0, likeStateRef.current.count - 1);
    
    // Update UI state after
    setIsLiked(newLikeState);
    setLikeCount(likeStateRef.current.count);
    
    scale.value = withSequence(
      withSpring(0.8, { damping: 12, stiffness: 300, mass: 0.5 }),
      withSpring(1.2, { damping: 12, stiffness: 300, mass: 0.5 }),
      withSpring(1, { damping: 12, stiffness: 300, mass: 0.5 })
    );
  }, []);
  
  // Animated style for like button
  const likeIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));
  
  // Parse caption with hashtags
  const ContentComponent = memo(({ caption, theme }: { caption: string, theme: any }) => {
    const parts = caption.split(/(\#[a-zA-Z0-9_]+)/g);
    
    return (
      <View style={styles.contentContainer}>
        <Text style={[styles.caption, { color: theme.textColor }]}>
          {parts.map((part, index) => {
            if (part.startsWith('#')) {
              return (
                <Text key={index} style={styles.hashtag}>
                  {part}{' '}
                </Text>
              );
            }
            return (
              <Text key={index} style={{ color: theme.textColor }}>
                {part}{' '}
              </Text>
            );
          })}
        </Text>
      </View>
    );
  });
  
  // ตัดชื่อผู้ใช้ให้สั้นลงถ้ายาวเกินไป
  const formattedUsername = title.length > 25 ? `${title.substring(0, 22)}...` : title;
  
  return (
    <Animated.View style={styles.root} key={cardKey}>
      <View style={styles.headerContainer}>
        <Pressable
          style={styles.userContainer}
          onPress={() => navigation.navigate("profile_details_screen", { image: images[0], username: title })}
        >
          <View style={[styles.avatarContainer, { backgroundColor: isDarkMode ? theme.cardBackground : '#fff' }]}>
            <ExpoImage
              source={{ uri: images[0] }}
              style={styles.avatar}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
            />
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.username, { color: theme.textColor }]} numberOfLines={1} ellipsizeMode="tail">
              {formattedUsername}
            </Text>
            <Text style={styles.timestamp}>2h ago</Text>
          </View>
        </Pressable>
      </View>
      
      <ContentComponent caption={caption + "#kimsnow"} theme={theme} />
      
      <OptimizedCardCarousel
        images={images}
        cardId={cardKey}
        onDoubleTap={handleDoubleTap}
      />
      
      <TweetActionButtons
        Comments={100}
        retweets={100}
        likes={likeCount}
        isLiked={isLiked}
        onLikePress={handleLike}
        likeIconStyle={likeIconStyle}
        uniqueId={cardKey}
      />
    </Animated.View>
  );
}, arePropsEqual);

const styles = StyleSheet.create({
  root: {
    borderRadius: 8,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  headerContainer: {
    paddingHorizontal: 4,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '90%',
  },
  avatarContainer: {
    borderRadius: 20,
    padding: 2,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 100,
  },
  userInfo: {
    flexDirection: 'column',
    flex: 1, // เพิ่ม flex เพื่อให้ข้อความอยู่ภายในพื้นที่
    marginRight: 8, // เพิ่มระยะห่างด้านขวา
  },
  username: {
    fontFamily: "Chirp_Medium",
    flexShrink: 1, 
  },
  timestamp: {
    fontSize: 12,
    color: '#9ca3af',
    fontFamily: "Chirp_Regular",
  },
  contentContainer: {
    paddingHorizontal: 8,
    paddingBottom: 4,
  },
  caption: {
    lineHeight: 20,
    marginBottom: 8,
    fontFamily: "Chirp_Regular",
  },
  hashtag: {
    color: '#4f46e5',
    fontSize: 13,
    fontFamily: "Chirp_Regular",
  },
}); 