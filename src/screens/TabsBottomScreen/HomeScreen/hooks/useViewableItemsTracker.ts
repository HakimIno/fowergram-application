import { useState, useRef, useCallback, useMemo } from 'react';
import { InteractionManager, Platform } from 'react-native';
import { ViewToken } from '@shopify/flash-list';
import { FeedStorageService } from 'src/util/MMKVStorage';
import type { FeedInfo } from '../types';
import React from 'react';

// Constants
const PRELOAD_THRESHOLD = 0.8;
const SAVE_DEBOUNCE_TIME = 500; // Debounce saving visible items
const IS_ANDROID = Platform.OS === 'android';

/**
 * Hook to track visible items in the feed for optimizing preloading and caching
 */
export const useViewableItemsTracker = (feed: FeedInfo[], handleLoadMore: () => void) => {
  const [visibleIndices, setVisibleIndices] = useState<number[]>([]);
  const nextPagePreloaded = useRef<boolean>(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevVisibleIndicesRef = useRef<number[]>([]);
  const isProcessingRef = useRef<boolean>(false);

  // Save currently visible items to storage for faster reloads
  const saveVisibleItems = useCallback((indices: number[]) => {
    if (!feed?.length || !indices?.length || isProcessingRef.current) return;

    // Check if indices array has actually changed to avoid unnecessary saves
    if (JSON.stringify(indices) === JSON.stringify(prevVisibleIndicesRef.current)) {
      return;
    }
    
    // Update reference of previously seen indices
    prevVisibleIndicesRef.current = [...indices];

    // Clear previous timeout if any
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce updates to reduce main thread blocking
    saveTimeoutRef.current = setTimeout(() => {
      isProcessingRef.current = true;
      
      // Map and filter in a separate chunk to reduce blocking
      requestAnimationFrame(() => {
        const visibleItems = indices
          .map(index => feed[index])
          .filter(Boolean);
          
        if (visibleItems.length > 0) {
          FeedStorageService.saveVisibleItems(visibleItems);
        }
        
        isProcessingRef.current = false;
      });
    }, SAVE_DEBOUNCE_TIME);
  }, [feed]);

  // Optimized viewability config
  const viewabilityConfig = useMemo(() => ({
    itemVisiblePercentThreshold: IS_ANDROID ? 30 : 20, // Higher threshold for Android
    minimumViewTime: IS_ANDROID ? 200 : 300, // Shorter time for Android
  }), []);

  // Handle viewable items change event from FlashList
  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
    if (!viewableItems?.length) return;

    // Extract all visible indices
    const indices = viewableItems
      .map((item: ViewToken) => item.index)
      .filter((index): index is number => index !== null && index !== undefined);

    // Update visible indices state
    setVisibleIndices(indices);

    // Defer heavy operations to after animations complete
    InteractionManager.runAfterInteractions(() => {
      // Save visible items
      saveVisibleItems(indices);

      // Check if we need to preload more items
      const highestIndex = Math.max(...indices);
      const preloadThreshold = feed.length * PRELOAD_THRESHOLD;

      if (highestIndex > preloadThreshold && !nextPagePreloaded.current) {
        nextPagePreloaded.current = true;
        
        // Delay loading more for better performance during scrolling
        setTimeout(() => {
          handleLoadMore();
        }, IS_ANDROID ? 500 : 300);
      }
    });
  }, [feed.length, saveVisibleItems, handleLoadMore]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    visibleIndices,
    onViewableItemsChanged,
    viewabilityConfig,
    saveVisibleItems
  };
}; 