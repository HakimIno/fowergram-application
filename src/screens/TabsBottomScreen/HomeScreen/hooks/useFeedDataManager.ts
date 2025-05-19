import { useState, useCallback, useEffect, useRef } from 'react';
import { InteractionManager } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { generateMockGridFeed, generateMockStories } from 'src/data/mockFeedData';
import { FeedStorageService, convertFeedItemToFeedInfo } from 'src/util/MMKVStorage';
import { preloadFeedImages } from '../components/Card/OptimizedCardImage';
import type { FeedInfo } from '../types';

// Story item interface
interface StoryItem {
    id: string;
    username: string;
    image: string;
    hasStory: boolean;
    isSeen?: boolean;
}

// Constants
const PAGE_SIZE = 20;
const INITIAL_PRELOAD_ITEMS = [0, 1, 2];
const PAGINATION_PRELOAD_ITEMS = [0, 1];
const UX_DELAY = 300;
const UI_UPDATE_DELAY = 100;
const BACKGROUND_UPDATE_DELAY = 200;

interface FeedDataManagerProps {
    scrollY: any;
    lastScrollY: any;
    headerTranslateY: any;
    listRef: React.RefObject<FlashList<FeedInfo> | null>;
    route?: any;
}

/**
 * Hook to manage feed data loading, refreshing, and pagination
 */
export const useFeedDataManager = ({
    scrollY,
    lastScrollY,
    headerTranslateY,
    listRef,
    route,
}: FeedDataManagerProps) => {
    const [feed, setFeed] = useState<FeedInfo[]>([]);
    const [stories, setStories] = useState<StoryItem[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMoreData, setHasMoreData] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [isInitialRenderComplete, setIsInitialRenderComplete] = useState(false);
    const [forceRefresh, setForceRefresh] = useState(false);

    const nextPagePreloaded = useRef<boolean>(false);
    const lastRefreshTimestamp = useRef<number>(0);

    useEffect(() => {
        FeedStorageService.initialize();
    }, []);

    const renderInitialItems = useCallback(async () => {
        const visibleItems = FeedStorageService.getVisibleItems();
        if (visibleItems && visibleItems.length > 0) {
            setFeed(visibleItems);
        }
    }, []);

    const loadFreshData = useCallback(async (showLoadingIndicator = true) => {
        try {
            const mockData = generateMockGridFeed(PAGE_SIZE / 5);
            const mockStoryData = generateMockStories(8);
            const convertedFeedData = mockData.map(item => convertFeedItemToFeedInfo(item));

            if (showLoadingIndicator) {
                const imageUrls = convertedFeedData.map(item => item.images);
                await preloadFeedImages(imageUrls, INITIAL_PRELOAD_ITEMS);
            }

            setFeed(convertedFeedData);
            setStories(mockStoryData as unknown as StoryItem[]);

            FeedStorageService.saveFeedData(convertedFeedData);
            FeedStorageService.saveStoriesData(mockStoryData);
            FeedStorageService.saveCurrentPage(1);
            setHasMoreData(true);

            if (showLoadingIndicator) {
                await new Promise(resolve => setTimeout(resolve, UX_DELAY));
            }
        } catch (error) {
            console.error('Error loading fresh data:', error);
        }
    }, []);

    const handleRefresh = useCallback(async () => {
        if (isRefreshing) return;

        setIsRefreshing(true);
        scrollY.value = 0;
        lastScrollY.value = 0;
        headerTranslateY.value = 0;
        setCurrentPage(1);
        nextPagePreloaded.current = false;

        try {
            if (forceRefresh) {
                FeedStorageService.clearAll();
                setForceRefresh(false);
            } else {
                const cachedData = FeedStorageService.getFeedData();
                const cachedStories = FeedStorageService.getStoriesData();

                if (cachedData && cachedStories && cachedData.length > 0 && cachedStories.length > 0 && !FeedStorageService.isFeedDataExpired()) {
                    setFeed(cachedData);
                    setStories(cachedStories as unknown as StoryItem[]);
                    await new Promise(resolve => setTimeout(resolve, UI_UPDATE_DELAY));

                    setTimeout(() => {
                        FeedStorageService.markDataAsExpired();
                        loadFreshData(false);
                    }, BACKGROUND_UPDATE_DELAY);

                    setIsRefreshing(false);
                    return;
                } else {
                    FeedStorageService.markDataAsExpired();
                }
            }

            await loadFreshData(true);
        } catch (error) {
            console.error('Error refreshing feed:', error);
        } finally {
            setIsRefreshing(false);
        }
    }, [isRefreshing, forceRefresh, scrollY, lastScrollY, headerTranslateY, loadFreshData]);

    const triggerForceRefresh = useCallback(() => {
        setForceRefresh(true);
        handleRefresh();
    }, [handleRefresh]);

    const handleLoadMore = useCallback(async () => {
        if (isLoadingMore || !hasMoreData) return;

        setIsLoadingMore(true);
        const nextPage = currentPage + 1;

        try {
            const cachedData = FeedStorageService.getFeedData();
            const totalItemsNeeded = nextPage * PAGE_SIZE;

            if (cachedData && cachedData.length >= totalItemsNeeded) {
                const newPageData = cachedData.slice(0, totalItemsNeeded);
                setFeed(newPageData);
                setCurrentPage(nextPage);
                FeedStorageService.saveCurrentPage(nextPage);
                setIsLoadingMore(false);
                return;
            }

            const newData = generateMockGridFeed(PAGE_SIZE / 5);

            if (newData.length === 0) {
                setHasMoreData(false);
                return;
            }

            const convertedNewData = newData.map(item => convertFeedItemToFeedInfo(item));
            const imageUrls = convertedNewData.map(item => item.images);

            const preloadPromise = preloadFeedImages(imageUrls, PAGINATION_PRELOAD_ITEMS);

            setFeed(prevFeed => {
                const updatedFeed = [...prevFeed, ...convertedNewData];
                setTimeout(() => {
                    FeedStorageService.saveFeedData(updatedFeed);
                }, 0);
                return updatedFeed;
            });

            setCurrentPage(nextPage);
            FeedStorageService.saveCurrentPage(nextPage);

            await preloadPromise;
        } catch (error) {
            console.error('Error loading more data:', error);
        } finally {
            setIsLoadingMore(false);
            nextPagePreloaded.current = false;
        }
    }, [isLoadingMore, hasMoreData, currentPage]);

    useEffect(() => {
        if (route?.params?.refresh) {
            const currentRefresh = route.params.refresh as number;
            if (currentRefresh > lastRefreshTimestamp.current) {
                lastRefreshTimestamp.current = currentRefresh;

                scrollY.value = 0;
                lastScrollY.value = 0;
                headerTranslateY.value = 0;

                if (listRef.current) {
                    listRef.current.scrollToOffset({ offset: 0, animated: true });
                }

                const cachedData = FeedStorageService.getFeedData();
                const cachedStories = FeedStorageService.getStoriesData();

                if (cachedData && cachedStories && cachedData.length > 0 && cachedStories.length > 0) {
                    setFeed(cachedData);
                    setStories(cachedStories as unknown as StoryItem[]);

                    setTimeout(() => {
                        if (!isRefreshing) {
                            setIsRefreshing(true);
                            handleRefresh().finally(() => {
                                setIsRefreshing(false);
                            });
                        }
                    }, UX_DELAY);
                } else {
                    setForceRefresh(true);
                    handleRefresh();
                }
            }
        }
    }, [route?.params?.refresh, handleRefresh, isRefreshing, scrollY, lastScrollY, headerTranslateY, listRef]);

    useEffect(() => {
        renderInitialItems();
    }, [renderInitialItems]);

    useEffect(() => {
        const loadInitialData = async () => {
            const cachedData = FeedStorageService.getFeedData();
            const cachedStories = FeedStorageService.getStoriesData();
            const isDataExpired = FeedStorageService.isFeedDataExpired();
            const savedPage = FeedStorageService.getCurrentPage() || 1;

            if (cachedData && cachedStories && !isDataExpired) {
                setFeed(cachedData);
                setStories(cachedStories as unknown as StoryItem[]);
                setCurrentPage(savedPage);
                setIsInitialRenderComplete(true);
            } else {
                await handleRefresh();
                setIsInitialRenderComplete(true);
            }
        };

        if (!isInitialRenderComplete) {
            InteractionManager.runAfterInteractions(() => {
                loadInitialData();
            });
        }
    }, [handleRefresh, isInitialRenderComplete, renderInitialItems]);

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
    };
}; 