import React from 'react';
import { Platform, View, Text, RefreshControl, StyleSheet, NativeModules } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { FeedItem } from './FeedItem';
import { useTheme } from 'src/context/ThemeContext';
import AnimatedText from 'src/components/AnimatedText';
import { MemoizedStoriesHeader } from './MemoizedStoriesHeader';
import type { FeedInfo } from '../../types';
import type { HomeNavigationProp } from '../../types';

const SCROLL_EVENT_THROTTLE = Platform.OS === 'ios' ? 8 : 16; // 120fps on iOS, 60fps on Android
const ESTIMATED_ITEM_SIZE = 350;

const IS_ANDROID = Platform.OS === 'android';
const IS_IOS = Platform.OS === 'ios';
const IS_HIGH_END_DEVICE = 
  IS_IOS || 
  (IS_ANDROID && parseInt(Platform.Version.toString(), 10) >= 26); // Android 8.0+

// Simple props structure
type OptimizedFeedProps = {
  feed: FeedInfo[];
  stories: any[];
  isRefreshing: boolean;
  isLoadingMore: boolean;
  hasMoreData: boolean;
  insets: { top: number };
  navigation: HomeNavigationProp;
  onRefresh: () => void;
  onLoadMore: () => void;
  listRef: any;
  onScroll: any;
  onViewableItemsChanged?: any;
  viewabilityConfig?: any;
  onItemVisible?: (index: number, item: FeedInfo) => void;
};

// Loading placeholder
const EmptyComponent = React.memo(({ textColor }: { textColor: string }) => (
  <View style={styles.loadingContainer}>
    <AnimatedText text="Loading..." color={textColor} />
  </View>
));

// Loading footer
const FooterComponent = React.memo(({ isLoadingMore, textColor }: { isLoadingMore: boolean, textColor: string }) => 
  isLoadingMore ? (
    <View style={styles.loadingMoreContainer}>
      <Text style={{ color: textColor }}>Loading more...</Text>
    </View>
  ) : null
);

// Main component - super simplified
const OptimizedFeed = React.memo((props: OptimizedFeedProps) => {
  const { theme, isDarkMode } = useTheme();
  const {
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
  } = props;

  // Render function
  const renderItem = React.useCallback(({ item, index }: any) => (
    <FeedItem
      item={item}
      index={index}
      navigation={navigation}
      onVisible={item => onItemVisible?.(index, item)}
    />
  ), [navigation, onItemVisible]);

  // Key extractor
  const keyExtractor = React.useCallback((item: FeedInfo) => item.id, []);

  // Simplified header
  const getHeader = React.useCallback(() => {
    if (stories.length === 0) return null;
    return <MemoizedStoriesHeader stories={stories} isDarkMode={isDarkMode} />;
  }, [stories, isDarkMode]);

  // Memoize content container style to avoid recreating on each render
  const contentContainerStyle = React.useMemo(() => ({
    paddingHorizontal: 8,
    paddingBottom: 16,
    paddingTop: (Platform.OS === 'ios' ? insets.top : 60) + 10
  }), [insets.top]);

  return (
    <View style={styles.container}>
      <FlashList
        ref={listRef}
        data={feed}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        estimatedItemSize={ESTIMATED_ITEM_SIZE}
        onScroll={onScroll}
        scrollEventThrottle={SCROLL_EVENT_THROTTLE}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyComponent textColor={theme.textColor} />}
        ListHeaderComponent={getHeader()}
        contentContainerStyle={contentContainerStyle}
        onEndReached={hasMoreData ? onLoadMore : undefined}
        onEndReachedThreshold={0.5}
        ListFooterComponent={<FooterComponent isLoadingMore={isLoadingMore} textColor={theme.textColor} />}
        removeClippedSubviews={true}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={Platform.OS === 'ios'}
        overScrollMode="never"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.textColor}
            progressBackgroundColor={theme.backgroundColor}
            colors={['#4f46e5']}
            progressViewOffset={insets.top + 50}
          />
        }
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
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

export { OptimizedFeed }; 