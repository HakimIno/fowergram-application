import React from 'react';
import { View, Text, Pressable, StyleSheet, GestureResponderEvent, Platform } from 'react-native';
import { Image as ExpoImage } from 'expo-image';

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

// Create content component separately
const ContentComponent = ({ caption, theme }: { caption: string, theme: any }) => {
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
};

// Memoize the content component
const MemoizedContentComponent = React.memo(ContentComponent);

// Define the main component function
const Card = ({
  navigation,
  images,
  title,
  likes,
  caption,
  cardIndex,
  isVisible
}: CardProps) => {
  const { theme, isDarkMode } = useTheme();
  const cardKey = React.useRef(`card-${cardIndex}-${title.slice(0, 10)}`).current;

  const [isLiked, setIsLiked] = React.useState(false);
  const [likeCount, setLikeCount] = React.useState(parseInt(likes) || 0);

  const likeStateRef = React.useRef({ isLiked: false, count: parseInt(likes) || 0 });
  const lastTapRef = React.useRef(0);

  const handleDoubleTap = React.useCallback((event: GestureResponderEvent) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;

    if (lastTapRef.current && (now - lastTapRef.current) < DOUBLE_PRESS_DELAY) {
      if (likeStateRef.current.isLiked) {
        lastTapRef.current = 0;
        return;
      }

      likeStateRef.current.isLiked = true;
      likeStateRef.current.count += 1;

      setIsLiked(true);
      setLikeCount(likeStateRef.current.count);

      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  }, []);

  const handleLike = React.useCallback(() => {
    const newLikeState = !likeStateRef.current.isLiked;
    likeStateRef.current.isLiked = newLikeState;
    likeStateRef.current.count = newLikeState
      ? likeStateRef.current.count + 1
      : Math.max(0, likeStateRef.current.count - 1);

    setIsLiked(newLikeState);
    setLikeCount(likeStateRef.current.count);
  }, []);

  const formattedUsername = title.length > 25 ? `${title.substring(0, 22)}...` : title;

  return (
    <View style={styles.root} key={cardKey}>
      <View style={styles.headerContainer}>
        <Pressable
          style={styles.userContainer}
          onPress={() => navigation.navigate("profile_details_screen", { image: images[0], username: title })}
        >
          <View style={[styles.avatarContainer, { backgroundColor: isDarkMode ? theme.cardBackground : '#fff' }]}>
            <ExpoImage
              source={{ uri: images[0] }}
              style={styles.avatar}
              contentFit="contain"
              cachePolicy="memory"
              priority={isVisible ? 'high' : 'low'}
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

      <MemoizedContentComponent caption={caption + "#kimsnow"} theme={theme} />

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
        uniqueId={cardKey}
      />
    </View>
  );
};

// Export using proper memo pattern
export const OptimizedCard = React.memo(Card);

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
    flex: 1,
    marginRight: 8,
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