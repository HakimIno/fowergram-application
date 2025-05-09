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
import { EventEmitter } from 'src/utils/EventEmitter'

// Constants
const PAGE_SIZE = 20
const PRELOAD_THRESHOLD = 0.8
const HEADER_HEIGHT = 60
const MIN_SCROLL_TO_HIDE = 50
const INITIAL_PRELOAD_ITEMS = [0, 1, 2]
const PAGINATION_PRELOAD_ITEMS = [0, 1]
const SCROLL_TOP_THRESHOLD = 5
const SCROLL_NOT_TOP_THRESHOLD = 10
const SCROLL_CAPTURE_VELOCITY = 0.5
const UX_DELAY = 300
const UI_UPDATE_DELAY = 100
const BACKGROUND_UPDATE_DELAY = 200

// Type definitions
interface ViewableItemsChangedInfo {
    viewableItems: Array<ViewToken>;
    changed: Array<ViewToken>;
}

interface HomeScreenProps {
    navigation: HomeNavigationProp;
    route?: any;
}

// Custom hooks
const useScrollAnimation = (insets: any) => {
    const scrollY = useSharedValue(0)
    const lastScrollY = useSharedValue(0)
    const headerTranslateY = useSharedValue(0)
    const isScrollingUp = useSharedValue(false)

    const derivedHeaderTranslateY = useDerivedValue(() => {
        'worklet';
        const HIDE_HEADER_SCROLL_DISTANCE = HEADER_HEIGHT + insets.top;
        const MIN_SCROLL_TO_HIDE = 50;

        if (scrollY.value <= 10) {
            if (headerTranslateY.value !== 0) {
                headerTranslateY.value = withTiming(0, { duration: 150 });
            }
            return headerTranslateY.value;
        }

        if (!isScrollingUp.value && scrollY.value > MIN_SCROLL_TO_HIDE) {
            if (headerTranslateY.value !== -HIDE_HEADER_SCROLL_DISTANCE) {
                headerTranslateY.value = withTiming(-HIDE_HEADER_SCROLL_DISTANCE, { duration: 200 });
            }
            return headerTranslateY.value;
        }

        if (isScrollingUp.value && headerTranslateY.value !== 0) {
            headerTranslateY.value = withTiming(0, { duration: 200 });
            return headerTranslateY.value;
        }

        return headerTranslateY.value;
    }, [scrollY, isScrollingUp]);

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
    }))

    return {
        scrollY,
        lastScrollY,
        headerTranslateY,
        isScrollingUp,
        headerAnimatedStyle,
    }
}

const useFeedData = (
    scrollY: any,
    lastScrollY: any,
    headerTranslateY: any,
    listRef: React.RefObject<FlashList<FeedInfo> | null>,
    route?: any
) => {
    const [feed, setFeed] = useState<FeedInfo[]>([])
    const [stories, setStories] = useState<StoryItem[]>([])
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [hasMoreData, setHasMoreData] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [isInitialRenderComplete, setIsInitialRenderComplete] = useState(false)
    const [forceRefresh, setForceRefresh] = useState(false)
    const nextPagePreloaded = useRef<boolean>(false)
    const lastRefreshTimestamp = useRef<number>(0)

    // Initialize storage system
    useEffect(() => {
        FeedStorageService.initialize()
    }, [])

    // Fast initial render from cache
    const renderInitialItems = useCallback(async () => {
        const visibleItems = FeedStorageService.getVisibleItems()
        if (visibleItems && visibleItems.length > 0) {
            setFeed(visibleItems)
        }
    }, [])

    // Load fresh data either with or without loading indicator
    const loadFreshData = useCallback(async (showLoadingIndicator = true) => {
        try {
            const mockData = generateMockGridFeed(PAGE_SIZE / 5)
            const mockStoryData = generateMockStories(8)
            const convertedFeedData = mockData.map(item => convertFeedItemToFeedInfo(item))

            if (showLoadingIndicator) {
                const imageUrls = convertedFeedData.map(item => item.images)
                await preloadFeedImages(imageUrls, INITIAL_PRELOAD_ITEMS)
            }

            setFeed(convertedFeedData)
            setStories(mockStoryData)

            FeedStorageService.saveFeedData(convertedFeedData)
            FeedStorageService.saveStoriesData(mockStoryData)
            FeedStorageService.saveCurrentPage(1)
            setHasMoreData(true)

            if (showLoadingIndicator) {
                await new Promise(resolve => setTimeout(resolve, UX_DELAY))
            }
        } catch (error) {
            console.error('Error loading fresh data:', error)
        }
    }, [])

    // Handle pull-to-refresh
    const handleRefresh = useCallback(async () => {
        if (isRefreshing) return

        setIsRefreshing(true)
        scrollY.value = 0
        lastScrollY.value = 0
        headerTranslateY.value = 0
        setCurrentPage(1)
        nextPagePreloaded.current = false

        try {
            if (forceRefresh) {
                FeedStorageService.clearAll()
                setForceRefresh(false)
            } else {
                const cachedData = FeedStorageService.getFeedData()
                const cachedStories = FeedStorageService.getStoriesData()

                if (cachedData && cachedStories && cachedData.length > 0 && !FeedStorageService.isFeedDataExpired()) {
                    setFeed(cachedData)
                    setStories(cachedStories)
                    await new Promise(resolve => setTimeout(resolve, UI_UPDATE_DELAY))

                    setTimeout(() => {
                        FeedStorageService.markDataAsExpired()
                        loadFreshData(false)
                    }, BACKGROUND_UPDATE_DELAY)

                    setIsRefreshing(false)
                    return
                } else {
                    FeedStorageService.markDataAsExpired()
                }
            }

            await loadFreshData(true)
        } catch (error) {
            console.error('Error refreshing feed:', error)
        } finally {
            setIsRefreshing(false)
        }
    }, [isRefreshing, forceRefresh, scrollY, lastScrollY, headerTranslateY, loadFreshData])

    // Trigger force refresh (user-initiated)
    const triggerForceRefresh = useCallback(() => {
        setForceRefresh(true)
        handleRefresh()
    }, [handleRefresh])

    // Handle loading more data when scrolling to end
    const handleLoadMore = useCallback(async () => {
        if (isLoadingMore || !hasMoreData) return

        setIsLoadingMore(true)
        const nextPage = currentPage + 1

        try {
            const cachedData = FeedStorageService.getFeedData()
            const totalItemsNeeded = nextPage * PAGE_SIZE

            if (cachedData && cachedData.length >= totalItemsNeeded) {
                const newPageData = cachedData.slice(0, totalItemsNeeded)
                setFeed(newPageData)
                setCurrentPage(nextPage)
                FeedStorageService.saveCurrentPage(nextPage)
                setIsLoadingMore(false)
                return
            }

            const newData = generateMockGridFeed(PAGE_SIZE / 5)

            if (newData.length === 0) {
                setHasMoreData(false)
                return
            }

            const convertedNewData = newData.map(item => convertFeedItemToFeedInfo(item))
            const imageUrls = convertedNewData.map(item => item.images)

            const preloadPromise = preloadFeedImages(imageUrls, PAGINATION_PRELOAD_ITEMS)

            setFeed(prevFeed => {
                const updatedFeed = [...prevFeed, ...convertedNewData]
                setTimeout(() => {
                    FeedStorageService.saveFeedData(updatedFeed)
                }, 0)
                return updatedFeed
            })

            setCurrentPage(nextPage)
            FeedStorageService.saveCurrentPage(nextPage)
            await preloadPromise
        } catch (error) {
            console.error('Error loading more data:', error)
        } finally {
            setIsLoadingMore(false)
            nextPagePreloaded.current = false
        }
    }, [isLoadingMore, hasMoreData, currentPage])

    // Handle route parameter refresh
    useEffect(() => {
        if (route?.params?.refresh) {
            const currentRefresh = route.params.refresh as number
            if (currentRefresh > lastRefreshTimestamp.current) {
                lastRefreshTimestamp.current = currentRefresh
                scrollY.value = 0
                lastScrollY.value = 0
                headerTranslateY.value = 0

                if (listRef.current) {
                    listRef.current.scrollToOffset({ offset: 0, animated: true })
                }

                const cachedData = FeedStorageService.getFeedData()
                const cachedStories = FeedStorageService.getStoriesData()

                if (cachedData && cachedData.length > 0 && cachedStories && cachedStories.length > 0) {
                    setFeed(cachedData)
                    setStories(cachedStories)

                    setTimeout(() => {
                        if (!isRefreshing) {
                            setIsRefreshing(true)
                            handleRefresh().finally(() => {
                                setIsRefreshing(false)
                            })
                        }
                    }, UX_DELAY)
                } else {
                    setForceRefresh(true)
                    handleRefresh()
                }
            }
        }
    }, [route?.params?.refresh, handleRefresh, isRefreshing, scrollY, lastScrollY, headerTranslateY, listRef])

    // Initial load: first from cache, then full data
    useEffect(() => {
        renderInitialItems()
    }, [renderInitialItems])

    useEffect(() => {
        const loadInitialData = async () => {
            const cachedData = FeedStorageService.getFeedData()
            const cachedStories = FeedStorageService.getStoriesData()
            const isDataExpired = FeedStorageService.isFeedDataExpired()
            const savedPage = FeedStorageService.getCurrentPage() || 1

            if (cachedData && cachedStories && !isDataExpired) {
                setFeed(cachedData)
                setStories(cachedStories)
                setCurrentPage(savedPage)
                setIsInitialRenderComplete(true)
            } else {
                await handleRefresh()
                setIsInitialRenderComplete(true)
            }
        }

        if (!isInitialRenderComplete) {
            InteractionManager.runAfterInteractions(() => {
                loadInitialData()
            })
        }
    }, [handleRefresh, isInitialRenderComplete, renderInitialItems])

    return {
        feed,
        stories,
        isRefreshing,
        isLoadingMore,
        hasMoreData,
        currentPage,
        handleRefresh,
        handleLoadMore,
        triggerForceRefresh,
        setFeed,
    }
}

const useVisibleItems = (feed: FeedInfo[], handleLoadMore: () => void) => {
    const [visibleIndices, setVisibleIndices] = useState<number[]>([])
    const nextPagePreloaded = useRef<boolean>(false)

    const saveVisibleItems = useCallback((indices: number[]) => {
        if (!feed?.length || !indices?.length) return

        const visibleItems = indices.map(index => feed[index]).filter(Boolean)
        if (visibleItems.length > 0) {
            FeedStorageService.saveVisibleItems(visibleItems)
        }
    }, [feed])

    const onViewableItemsChanged = useCallback(({ viewableItems }: ViewableItemsChangedInfo) => {
        if (!viewableItems?.length) return

        const indices = viewableItems
            .map((item: ViewToken) => item.index)
            .filter((index): index is number => index !== null && index !== undefined)

        setVisibleIndices(indices)

        InteractionManager.runAfterInteractions(() => {
            saveVisibleItems(indices)
        })

        const highestIndex = Math.max(...indices)
        const preloadThreshold = feed.length * PRELOAD_THRESHOLD

        if (highestIndex > preloadThreshold && !nextPagePreloaded.current) {
            nextPagePreloaded.current = true
            InteractionManager.runAfterInteractions(() => {
                handleLoadMore()
            })
        }
    }, [feed.length, saveVisibleItems, handleLoadMore])

    const viewabilityConfig = useMemo(() => ({
        itemVisiblePercentThreshold: 20,
        minimumViewTime: 300,
    }), [])

    return {
        visibleIndices,
        onViewableItemsChanged,
        viewabilityConfig,
        saveVisibleItems
    }
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
const RefactoredHomeScreen = ({ navigation, route }: HomeScreenProps) => {
    const insets = useSafeAreaInsets()
    const { isDarkMode, toggleTheme, theme, animatedValue } = useTheme()
    const listRef = useRef<FlashList<FeedInfo> | null>(null)

    // Custom hooks for different concerns
    const {
        scrollY,
        lastScrollY,
        headerTranslateY,
        isScrollingUp,
        headerAnimatedStyle
    } = useScrollAnimation(insets)

    const {
        feed,
        stories,
        isRefreshing,
        isLoadingMore,
        hasMoreData,
        handleRefresh,
        handleLoadMore,
        triggerForceRefresh
    } = useFeedData(scrollY, lastScrollY, headerTranslateY, listRef, route)

    const {
        visibleIndices,
        onViewableItemsChanged,
        viewabilityConfig,
        saveVisibleItems
    } = useVisibleItems(feed, handleLoadMore)

    // Listen for scroll to top events
    useEffect(() => {
        const scrollToTop = () => {
            if (listRef.current) {
                listRef.current.scrollToOffset({ offset: 0, animated: true })
            }
        }

        const unsubscribe = EventEmitter.on('scrollHomeToTop', scrollToTop)
        return () => { unsubscribe() }
    }, [])

    // Optimized scroll handler
    const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const currentY = event.nativeEvent.contentOffset.y
        
        // Update shared values in a way that's compatible with both JS and Worklet environments
        isScrollingUp.value = currentY < lastScrollY.value
        const scrollVelocity = Math.abs(currentY - lastScrollY.value)
        
        scrollY.value = currentY
        lastScrollY.value = currentY
        
        // Update scroll position status for tab bar behavior - runs on JS thread
        if (currentY <= SCROLL_TOP_THRESHOLD && navigation && route) {
            InteractionManager.runAfterInteractions(() => {
                const params = navigation.getState().routes.find(
                    r => r.name === 'bottom_bar_home'
                )?.params || {}
                
                const isCurrentlyAtTop = (params as any)?.isScrolledToTop || false
                if (!isCurrentlyAtTop) {
                    navigation.setParams({
                        ...params,
                        isScrolledToTop: true
                    } as any)
                }
            });
        } else if (currentY > SCROLL_NOT_TOP_THRESHOLD && navigation && route) {
            InteractionManager.runAfterInteractions(() => {
                const params = navigation.getState().routes.find(
                    r => r.name === 'bottom_bar_home'
                )?.params || {}
                
                const isCurrentlyAtTop = (params as any)?.isScrolledToTop || false
                if (isCurrentlyAtTop) {
                    navigation.setParams({
                        ...params,
                        isScrolledToTop: false
                    } as any)
                }
            });
        }
        
        // Handle header animation based on scroll position
        const SCROLL_THRESHOLD = 10
        const MIN_SCROLL_TO_HIDE = 50
        const HIDE_HEADER_SCROLL_DISTANCE = 60 + insets.top
        
        const delta = currentY - lastScrollY.value
        
        if (Math.abs(delta) > SCROLL_THRESHOLD) {
            if (delta > SCROLL_THRESHOLD && currentY > MIN_SCROLL_TO_HIDE) {
                headerTranslateY.value = -HIDE_HEADER_SCROLL_DISTANCE
            } else if (delta < -SCROLL_THRESHOLD) {
                headerTranslateY.value = 0
            }
        }
        
        // Save visible items when scrolling stops - runs on JS thread
        if (scrollVelocity < SCROLL_CAPTURE_VELOCITY) {
            InteractionManager.runAfterInteractions(() => {
                saveVisibleItems(visibleIndices)
            });
        }
    }, [visibleIndices, saveVisibleItems, navigation, route, isScrollingUp, scrollY, lastScrollY, headerTranslateY, insets.top])

    // Theme toggling with animation
    const handleThemePress = useCallback((x: number, y: number) => {
        toggleTheme(x, y)
    }, [toggleTheme])

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
    }))

    // Memoize feed props to prevent unnecessary re-renders
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
    ])

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={theme.backgroundColor}
            />

            <AnimatedHeader
                style={headerAnimatedStyle}
                insets={insets}
                onNotificationPress={() => { }}
                isDarkMode={isDarkMode}
                onThemePress={handleThemePress}
                themeIconStyle={themeIconStyle}
                theme={theme}
                isRefreshing={isRefreshing}
                onRefresh={triggerForceRefresh}
            />

            <View style={styles.mainContent}>
                <OptimizedFeed {...feedProps} />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    mainContent: {
        flex: 1,
        zIndex: 0,
    },
})

export default React.memo(RefactoredHomeScreen) 