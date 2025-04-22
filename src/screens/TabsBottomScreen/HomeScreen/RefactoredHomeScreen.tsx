import { StatusBar, View, SafeAreaView, StyleSheet, InteractionManager, NativeSyntheticEvent, NativeScrollEvent } from 'react-native'
import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { generateMockGridFeed, generateMockStories } from 'src/data/mockFeedData'
import { FlashList, ViewToken } from '@shopify/flash-list'
import Animated, {
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withTiming,
    withSpring,
    runOnJS,
} from 'react-native-reanimated'
import { useTheme } from 'src/context/ThemeContext'
import { AnimatedHeader } from './components/Header/OptimizedHeader'
import { OptimizedFeed } from './components/Feed/OptimizedFeed'
import type { FeedInfo, HomeNavigationProp } from './types'
import type { StoryItem } from './components/Story'
import { preloadFeedImages } from './components/Card/OptimizedCardImage'
import { FeedStorageService, convertFeedItemToFeedInfo } from 'src/util/MMKVStorage'

// Number of items to load per page
const PAGE_SIZE = 20
// Preload threshold - when to start loading the next page (percentage of current page)
const PRELOAD_THRESHOLD = 0.8

// Type definition for viewable items
interface ViewableItemsChangedInfo {
    viewableItems: Array<ViewToken>;
    changed: Array<ViewToken>;
}

/**
 * Performance-optimized HomeScreen component
 * - Uses memoized subcomponents
 * - Optimized data loading with MMKV caching
 * - Memory-efficient rendering with memory cache
 * - Reduced re-renders with intelligent updates
 * - Infinite loading with pagination and preloading
 * - Visual elements optimized for 120Hz displays
 */
const RefactoredHomeScreen = ({ navigation, route }: { navigation: HomeNavigationProp; route?: any }) => {
    const insets = useSafeAreaInsets();
    const { isDarkMode, toggleTheme, theme, animatedValue } = useTheme();
    
    // State management
    const [feed, setFeed] = useState<FeedInfo[]>([]);
    const [stories, setStories] = useState<StoryItem[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMoreData, setHasMoreData] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [visibleIndices, setVisibleIndices] = useState<number[]>([]);
    const [isInitialRenderComplete, setIsInitialRenderComplete] = useState(false);
    const [forceRefresh, setForceRefresh] = useState(false);

    // Animated values and refs
    const listRef = useRef<FlashList<FeedInfo>>(null);
    const scrollY = useSharedValue(0);
    const lastScrollY = useSharedValue(0);
    const headerTranslateY = useSharedValue(0);
    const isScrollingUp = useSharedValue(false);
    const lastRefreshTimestamp = useRef<number>(0);
    const nextPagePreloaded = useRef<boolean>(false);
    
    // Initialize storage system
    useEffect(() => {
        FeedStorageService.initialize();
    }, []);
    
    // Initial quick renderer for immediate display
    const renderInitialItems = useCallback(async () => {
        // Try to get visible items from cache for immediate display
        const visibleItems = FeedStorageService.getVisibleItems();
        
        if (visibleItems && visibleItems.length > 0) {
            // Show the cached visible items immediately while loading full data
            setFeed(visibleItems);
        }
    }, []);

    // Track currently visible items and save them for next launch
    const saveVisibleItems = useCallback((indices: number[]) => {
        if (!feed || feed.length === 0 || !indices || indices.length === 0) return;
        
        const visibleItems = indices.map(index => feed[index]).filter(Boolean);
        if (visibleItems.length > 0) {
            FeedStorageService.saveVisibleItems(visibleItems);
        }
    }, [feed]);

    // Memoize visible indices to prevent unnecessary updates
    const onViewableItemsChanged = useCallback(({ viewableItems }: ViewableItemsChangedInfo) => {
        if (!viewableItems || viewableItems.length === 0) return;
        
        const indices = viewableItems.map((item: ViewToken) => item.index).filter((index: number | null | undefined) => index !== null && index !== undefined) as number[];
        setVisibleIndices(indices);
        
        // Save visible items but defer to prevent frame drops
        InteractionManager.runAfterInteractions(() => {
            saveVisibleItems(indices);
        });
        
        // Preload next page when nearing end of current data
        const highestIndex = Math.max(...indices);
        const preloadThreshold = feed.length * PRELOAD_THRESHOLD;
        
        if (highestIndex > preloadThreshold && !isLoadingMore && hasMoreData && !nextPagePreloaded.current) {
            nextPagePreloaded.current = true;
            // Defer loading to prevent frame drops
            InteractionManager.runAfterInteractions(() => {
                handleLoadMore();
            });
        }
    }, [feed.length, isLoadingMore, hasMoreData, saveVisibleItems]);
    
    const viewabilityConfig = useMemo(() => ({
        itemVisiblePercentThreshold: 20,
        minimumViewTime: 300,
    }), []);

    // Data loading functions
    const handleRefresh = useCallback(async () => {
        if (isRefreshing) return;

        setIsRefreshing(true);
        // Reset scroll position
        scrollY.value = 0;
        lastScrollY.value = 0;
        headerTranslateY.value = 0;
        setCurrentPage(1);
        nextPagePreloaded.current = false;

        try {
            // เมื่อ manual refresh ให้ล้างข้อมูลเก่าเพื่อโหลดข้อมูลใหม่เสมอ
            // ลบข้อความด้านล่างและแทนที่ด้วยโค้ดใหม่
            // Check for cached data if not a forced refresh
            // const cachedData = FeedStorageService.getFeedData();
            // const cachedStories = FeedStorageService.getStoriesData();
            // const isDataExpired = FeedStorageService.isFeedDataExpired();

            // // Use cached data if available and not expired
            // if (cachedData && cachedStories && !isDataExpired) {
            //     setFeed(cachedData);
            //     setStories(cachedStories);
            //     FeedStorageService.saveCurrentPage(1);
                
            //     // UX delay for loading indicator - shorter with cached data
            //     await new Promise(resolve => setTimeout(resolve, 200));
            //     setIsRefreshing(false);
            //     return;
            // }
            
            // ถ้าเป็น force refresh ให้เคลียร์แคชทั้งหมด
            if (forceRefresh) {
                console.log('Force refreshing feed data...');
                FeedStorageService.clearAll();
                setForceRefresh(false);
            } else {
                // มาร์คข้อมูลเป็นหมดอายุ เพื่อให้โหลดใหม่ครั้งต่อไป
                FeedStorageService.markDataAsExpired();
            }

            // โหลดข้อมูลใหม่จาก API ทุกครั้ง
            const mockData = generateMockGridFeed(PAGE_SIZE / 5);
            const mockStoryData = generateMockStories(8);

            // Convert mockData to FeedInfo type
            const convertedFeedData = mockData.map(item => convertFeedItemToFeedInfo(item));

            // Preload images before setting feed data
            // This will load images in parallel while showing loading indicator
            const imageUrls = convertedFeedData.map(item => item.images);
            // ระบุรูปที่เห็นได้ในหน้าจอแรก (0-2 items) เป็น high priority
            const initialVisibleItems = [0, 1, 2]; 
            await preloadFeedImages(imageUrls, initialVisibleItems);
            
            // Use batch update to reduce re-renders
            setFeed(convertedFeedData);
            setStories(mockStoryData);
            
            // Cache the data in MMKV storage
            FeedStorageService.saveFeedData(convertedFeedData);
            FeedStorageService.saveStoriesData(mockStoryData);
            FeedStorageService.saveCurrentPage(1);

            // Reset hasMoreData flag
            setHasMoreData(true);

            // UX delay for loading indicator - ลดลงเพื่อให้แสดงผลเร็วขึ้น
            await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
            console.error('Error refreshing feed:', error);
        } finally {
            setIsRefreshing(false);
        }
    }, [isRefreshing, forceRefresh]);

    // เพิ่มฟังก์ชันสำหรับบังคับรีเฟรช
    const triggerForceRefresh = useCallback(() => {
        setForceRefresh(true);
        handleRefresh();
    }, [handleRefresh]);

    const handleLoadMore = useCallback(async () => {
        if (isLoadingMore || !hasMoreData) return;

        setIsLoadingMore(true);
        const nextPage = currentPage + 1;

        try {
            // Try to get cached data for next page
            const cachedData = FeedStorageService.getFeedData();
            
            // Calculate how many more items we need
            const totalItemsNeeded = nextPage * PAGE_SIZE;
            
            // If we already have enough cached items, just update the page
            if (cachedData && cachedData.length >= totalItemsNeeded) {
                const newPageData = cachedData.slice(0, totalItemsNeeded);
                setFeed(newPageData);
                setCurrentPage(nextPage);
                FeedStorageService.saveCurrentPage(nextPage);
                setIsLoadingMore(false);
                return;
            }

            // Fetch new data from the mock API
            const newData = generateMockGridFeed(PAGE_SIZE / 5);
            
            if (newData.length === 0) {
                setHasMoreData(false);
                setIsLoadingMore(false);
                return;
            }

            // Convert newData to FeedInfo type
            const convertedNewData = newData.map(item => convertFeedItemToFeedInfo(item));

            // Prepare for image preloading - prioritize first couple items
            const imageUrls = convertedNewData.map(item => item.images);
            const priorityIndices = [0, 1];
            
            // Preload in parallel with state updates for better performance
            const preloadPromise = preloadFeedImages(imageUrls, priorityIndices);
            
            // Use functional update to avoid race conditions and ensure we're working with latest state
            setFeed(prevFeed => {
                const updatedFeed = [...prevFeed, ...convertedNewData];
                
                // Update cache with all data (off the critical path)
                setTimeout(() => {
                    FeedStorageService.saveFeedData(updatedFeed);
                }, 0);
                
                return updatedFeed;
            });
            
            setCurrentPage(nextPage);
            FeedStorageService.saveCurrentPage(nextPage);
            
            // Wait for preload to complete
            await preloadPromise;
        } catch (error) {
            console.error('Error loading more data:', error);
        } finally {
            setIsLoadingMore(false);
            nextPagePreloaded.current = false;
        }
    }, [isLoadingMore, hasMoreData, currentPage]);

    // Header animation calculation
    const derivedHeaderTranslateY = useDerivedValue(() => {
        const HEADER_HEIGHT = 60;
        const HIDE_HEADER_SCROLL_DISTANCE = HEADER_HEIGHT + insets.top;
        const MIN_SCROLL_TO_HIDE = 50;

        if (scrollY.value <= 10) {
            return withTiming(0, { duration: 150 });
        }

        if (!isScrollingUp.value && scrollY.value > MIN_SCROLL_TO_HIDE) {
            return withTiming(-HIDE_HEADER_SCROLL_DISTANCE, { duration: 200 });
        }

        if (isScrollingUp.value) {
            return withTiming(0, { duration: 200 });
        }

        return headerTranslateY.value;
    });

    const headerAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: derivedHeaderTranslateY.value },
            { perspective: 1000 },
        ],
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
    }));

    // Theme icon animation
    const themeIconStyle = useAnimatedStyle(() => ({
        transform: [
            {
                rotate: withSpring(`${animatedValue.value * 360}deg`, {
                    damping: 15,
                    stiffness: 60,
                    mass: 0.8
                })
            },
            {
                scale: withSpring(1 + (animatedValue.value * 0.2), {
                    damping: 12,
                    stiffness: 100
                })
            }
        ],
        opacity: withSpring(1, {
            damping: 20,
            stiffness: 90
        })
    }));

    // 1. First render quickly with visible items cache 
    useEffect(() => {
        renderInitialItems();
    }, [renderInitialItems]);

    // 2. Then load full data from cache or API
    useEffect(() => {
        const loadInitialData = async () => {
            // Try to load data from cache first
            const cachedData = FeedStorageService.getFeedData();
            const cachedStories = FeedStorageService.getStoriesData();
            const isDataExpired = FeedStorageService.isFeedDataExpired();
            const savedPage = FeedStorageService.getCurrentPage() || 1;

            if (cachedData && cachedStories && !isDataExpired) {
                setFeed(cachedData);
                setStories(cachedStories);
                setCurrentPage(savedPage);
                setIsInitialRenderComplete(true);
            } else {
                // If no cached data or expired, refresh from API
                await handleRefresh();
                setIsInitialRenderComplete(true);
            }
        };

        // Defer full data loading to ensure UI is responsive
        if (!isInitialRenderComplete) {
            InteractionManager.runAfterInteractions(() => {
                loadInitialData();
            });
        }
    }, [handleRefresh, isInitialRenderComplete]);

    // Handle tab press refresh
    useEffect(() => {
        if (route?.params?.refresh) {
            const currentRefresh = route.params.refresh as number;

            if (currentRefresh > lastRefreshTimestamp.current) {
                lastRefreshTimestamp.current = currentRefresh;

                // Reset scroll position
                scrollY.value = 0;
                lastScrollY.value = 0;
                headerTranslateY.value = 0;

                // Scroll to top and refresh
                if (listRef.current) {
                    listRef.current.scrollToOffset({ offset: 0, animated: true });
                }

                // Delay refresh to allow scrolling animation to complete
                setTimeout(() => {
                    // เมื่อกดแท็บซ้ำ ให้บังคับเคลียร์แคชเพื่อโหลดข้อมูลใหม่
                    FeedStorageService.clearAll();
                    // บังคับให้รีเฟรชข้อมูลใหม่
                    setForceRefresh(true);
                    handleRefresh();
                }, 100);
            }
        }
    }, [route?.params?.refresh, handleRefresh]);

    // Track device motion for optimistic scrolling
    const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        'worklet';
        const currentY = event.nativeEvent.contentOffset.y;
        
        // Determine scroll direction
        isScrollingUp.value = currentY < lastScrollY.value;
        
        // Track velocity for smoother animations
        const scrollVelocity = Math.abs(currentY - lastScrollY.value);
        
        // Update shared values
        scrollY.value = currentY;
        lastScrollY.value = currentY;
        
        // Capture visible items when scrolling stops
        if (scrollVelocity < 0.5) {
            runOnJS(saveVisibleItems)(visibleIndices);
        }
    }, [visibleIndices, saveVisibleItems]);

    const handleThemePress = useCallback((x: number, y: number) => {
        toggleTheme(x, y);
    }, [toggleTheme]);

    // Memoize feed props for better performance
    const feedProps = useMemo(() => ({
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
        onRefresh: handleRefresh,
        onLoadMore: handleLoadMore,
        listRef,
        onScroll: handleScroll,
        onViewableItemsChanged,
        viewabilityConfig,
    }), [
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
        handleRefresh,
        handleLoadMore,
        handleScroll,
        onViewableItemsChanged,
        viewabilityConfig,
    ]);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
            <StatusBar 
                barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
                backgroundColor={theme.backgroundColor} 
            />

            <AnimatedHeader
                style={headerAnimatedStyle}
                insets={insets}
                onNotificationPress={() => {}}
                isDarkMode={isDarkMode}
                onThemePress={handleThemePress}
                themeIconStyle={themeIconStyle}
                theme={theme}
                isRefreshing={isRefreshing}
                onRefresh={triggerForceRefresh}
            />

            <View style={styles.mainContent}>
                <OptimizedFeed
                    {...feedProps}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    mainContent: {
        flex: 1,
        zIndex: 0,
    },
});

export default React.memo(RefactoredHomeScreen); 