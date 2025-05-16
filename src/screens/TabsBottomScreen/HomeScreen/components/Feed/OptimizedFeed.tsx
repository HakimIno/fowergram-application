import React, { useCallback } from 'react';
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
  listRef: React.RefObject<FlashList<FeedInfo> | null>;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onViewableItemsChanged?: (info: any) => void;
  viewabilityConfig?: any;
  onItemVisible?: (index: number, item: FeedInfo) => void;
}

// Simple loading component with pure render
const EmptyComponent = ({ textColor }: { textColor: string }) => (
  <View style={styles.loadingContainer}>
    <AnimatedText text="Loading..." color={textColor} />
  </View>
);

// Simple footer component with pure render
const FooterComponent = ({ isLoadingMore, textColor }: { isLoadingMore: boolean, textColor: string }) =>
  isLoadingMore ? (
    <View style={styles.loadingMoreContainer}>
      <Text style={{ color: textColor }}>Loading more...</Text>
    </View>
  ) : null;

// Memoized components to prevent re-renders
const MemoizedEmptyComponent = React.memo(EmptyComponent);
const MemoizedFooterComponent = React.memo(FooterComponent);

// Define main component function
const FeedComponent = ({
  feed,
  stories,
  isRefreshing,
  isLoadingMore,
  hasMoreData,
  insets,
  navigation,
  onRefresh,
  onLoadMore,
  listRef,
  onScroll,
  onViewableItemsChanged,
  viewabilityConfig,
  onItemVisible,
}: OptimizedFeedProps) => {
  const { theme, isDarkMode } = useTheme();

  // Optimized renderItem function with minimal props
  const renderItem = React.useCallback(({ item, index }: { item: FeedInfo, index: number }) => (
    <FeedItem
      item={item}
      index={index}
      navigation={navigation}
      onVisible={(item) => onItemVisible?.(index, item)}
    />
  ), [navigation, onItemVisible]);

  // Stable key extractor
  const keyExtractor = React.useCallback((item: FeedInfo) => item.id, []);
  
  // Memoize ListHeaderComponent to prevent recreation on each render
  const headerComponent = React.useCallback(() => {
    return <MemoizedStoriesHeader stories={stories} isDarkMode={isDarkMode} />;
  }, [stories, isDarkMode]);

  // Memoize FlashList props to prevent re-renders
  const flashListProps = React.useMemo(() => ({
    data: feed,
    keyExtractor,
    renderItem,
    estimatedItemSize: 385, // Fixed size for better memory usage
    showsVerticalScrollIndicator: false,
    ListEmptyComponent: <MemoizedEmptyComponent textColor={theme.textColor} />,
    ListHeaderComponent: stories.length > 0 ? headerComponent : null,
    contentContainerStyle: {
      ...styles.listContentContainer,
      paddingTop: (Platform.OS === 'ios' ? insets.top : 60) + 10
    },
    onScroll,
    onEndReached: hasMoreData ? onLoadMore : undefined,
    onEndReachedThreshold: 0.2,
    ListFooterComponent: <MemoizedFooterComponent isLoadingMore={isLoadingMore} textColor={theme.textColor} />,
    removeClippedSubviews: true,
    onViewableItemsChanged,
    viewabilityConfig
  }), [
    feed,
    keyExtractor,
    renderItem,
    insets.top,
    onScroll,
    onLoadMore,
    hasMoreData,
    isLoadingMore,
    theme.textColor,
    stories,
    isDarkMode,
    onViewableItemsChanged,
    viewabilityConfig,
    headerComponent
  ]);

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
          />
        }
      />
    </View>
  );
};

// Export using React.memo pattern
export const OptimizedFeed = React.memo(FeedComponent);

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
    width: '100%',
  },
  listContentContainer: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loadingMoreContainer: {
    padding: 8,
    alignItems: 'center',
  },
}); 