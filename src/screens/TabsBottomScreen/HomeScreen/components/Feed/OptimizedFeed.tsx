import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Platform, View, Text, RefreshControl, NativeSyntheticEvent, NativeScrollEvent, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import Animated from 'react-native-reanimated';
import { FeedItem } from './FeedItem';
import { useTheme } from 'src/context/ThemeContext';
import AnimatedText from 'src/components/AnimatedText';
import { StoryItem } from '../Story';
import { MemoizedStoriesHeader } from './MemoizedStoriesHeader';
import type { FeedInfo } from '../../types';
import type { HomeNavigationProp } from '../../types';

interface OptimizedFeedProps {
  feed: FeedInfo[];
  stories: StoryItem[];
  isRefreshing: boolean;
  isLoadingMore: boolean;
  hasMoreData: boolean;
  insets: { top: number };
  navigation: HomeNavigationProp;
  scrollY: Animated.SharedValue<number>;
  lastScrollY: Animated.SharedValue<number>;
  headerTranslateY: Animated.SharedValue<number>;
  isScrollingUp: Animated.SharedValue<boolean>;
  onRefresh: () => void;
  onLoadMore: () => void;
  listRef: React.RefObject<FlashList<FeedInfo>>;
}

// Simple loading placeholder
const MemoizedEmptyComponent = React.memo(({ textColor }: { textColor: string }) => (
  <View style={styles.loadingContainer}>
    <AnimatedText text="Loading..." color={textColor} />
  </View>
));

// Minimal footer component
const MemoizedFooterComponent = React.memo(({ isLoadingMore, textColor }: { isLoadingMore: boolean, textColor: string }) => 
  isLoadingMore ? (
    <View style={styles.loadingMoreContainer}>
      <Text style={{ color: textColor }}>Loading more...</Text>
    </View>
  ) : null
);

// Minimal, optimized separator
const MemoizedItemSeparator = React.memo(() => (
  <View style={styles.separator} />
));

export const OptimizedFeed = React.memo(({
  feed,
  stories,
  isRefreshing,
  isLoadingMore,
  hasMoreData,
  insets,
  navigation,
  scrollY,
  lastScrollY,
  headerTranslateY,
  isScrollingUp,
  onRefresh,
  onLoadMore,
  listRef,
}: OptimizedFeedProps) => {
  const { theme, isDarkMode } = useTheme();
  const SCROLL_THRESHOLD = 5;
  const MIN_SCROLL_TO_HIDE = 50;
  const HIDE_HEADER_SCROLL_DISTANCE = 60 + insets.top;
  
  // Optimized scroll handler with reduced calculations
  const scrollHandler = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const delta = currentScrollY - lastScrollY.value;

    if (Math.abs(delta) > SCROLL_THRESHOLD) {
      isScrollingUp.value = delta < 0;

      // Use immediate value updates for better responsiveness
      if (delta > SCROLL_THRESHOLD && currentScrollY > MIN_SCROLL_TO_HIDE) {
        headerTranslateY.value = -HIDE_HEADER_SCROLL_DISTANCE;
      } else if (delta < -SCROLL_THRESHOLD) {
        headerTranslateY.value = 0;
      }
    }

    // Update scroll position values
    scrollY.value = currentScrollY;
    lastScrollY.value = currentScrollY;
  }, [SCROLL_THRESHOLD, MIN_SCROLL_TO_HIDE, HIDE_HEADER_SCROLL_DISTANCE, scrollY, lastScrollY, headerTranslateY, isScrollingUp]);

  // Memoized handlers for maximum performance
  const renderItem = useCallback(({ item, index }: { item: FeedInfo, index: number }) => (
    <FeedItem
      item={item}
      index={index}
      navigation={navigation}
    />
  ), [navigation]);

  const keyExtractor = useCallback((item: FeedInfo) => item.id, []);

  // Optimized FlashList configuration with aggressive virtualization
  const flashListProps = useMemo(() => ({
    data: feed,
    keyExtractor,
    renderItem,
    estimatedItemSize: 385,
    showsVerticalScrollIndicator: false,
    ListEmptyComponent: <MemoizedEmptyComponent textColor={theme.textColor} />,
    ListHeaderComponent: stories.length > 0 ? () => <MemoizedStoriesHeader stories={stories} isDarkMode={isDarkMode} /> : null,
    contentContainerStyle: {
      ...styles.listContentContainer,
      paddingTop: (Platform.OS === 'ios' ? insets.top : 60) + 10
    },
    onScroll: scrollHandler,
    onEndReached: onLoadMore,
    ListFooterComponent: <MemoizedFooterComponent isLoadingMore={isLoadingMore} textColor={theme.textColor} />,
    removeClippedSubviews: true, // Enable for both platforms
    maxToRenderPerBatch: 3, // Render fewer items per batch
    initialNumToRender: 3, // Start with fewer items
    windowSize: 5, // Reduce window size for better performance
    updateCellsBatchingPeriod: 50, // More frequent batching
    onEndReachedThreshold: 0.5,
    estimatedFirstItemOffset: 0,
    drawDistance: 900, // Reduce draw distance
    maintainVisibleContentPosition: { // Keep position when content changes
      minIndexForVisible: 0
    }
  }), [
    feed,
    keyExtractor,
    renderItem,
    insets.top,
    scrollHandler,
    onLoadMore,
    isLoadingMore,
    theme.textColor,
    stories,
    isDarkMode
  ]);

  useEffect(() => {
    // Preload visible items immediately when feed data changes
    if (feed.length > 0) {
      const { preloadFeedImages } = require('../Card/OptimizedCardImage');
      const initialVisibleImages = feed.slice(0, 3).map(item => item.images);
      preloadFeedImages(initialVisibleImages, [0, 1, 2]);
    }
  }, [feed]);

  return (
    <View style={styles.listContainer}>
      <FlashList
        ref={listRef}
        {...flashListProps}
        bounces={Platform.OS === 'ios'}
        overScrollMode={"never" as const}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.textColor}
            progressBackgroundColor={theme.backgroundColor}
            colors={['#4f46e5']}
            progressViewOffset={insets.top + 50}
            enabled={true}
            titleColor="transparent"
          />
        }
      />
    </View>
  );
});

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
    width: '100%',
  },
  listContentContainer: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  separator: {
    height: 12, // Slightly smaller separator for faster scrolling
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
    marginTop: 20,
  },
  loadingMoreContainer: {
    padding: 8,
    alignItems: 'center',
  },
}); 