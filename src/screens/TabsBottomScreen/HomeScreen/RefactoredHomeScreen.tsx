import { StatusBar, View, SafeAreaView, StyleSheet, InteractionManager, NativeSyntheticEvent, NativeScrollEvent, Platform } from 'react-native'
import React, { useCallback, useRef, useMemo } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { FlashList, ViewToken } from '@shopify/flash-list'
import Animated, {
    PerformanceMonitor,
    useAnimatedStyle,
    runOnJS,
} from 'react-native-reanimated'
import { useTheme } from 'src/context/ThemeContext'
import { AnimatedHeader } from './components/Header/OptimizedHeader'
import { OptimizedFeed } from './components/Feed/OptimizedFeed'
import type { FeedInfo, HomeNavigationProp } from './types'
import { useViewableItemsTracker } from './hooks/useViewableItemsTracker'
import { useFeedDataManager } from './hooks/useFeedDataManager'
import { useHeaderAnimation } from './hooks/useHeaderAnimation'

// Constants
const SCROLL_TOP_THRESHOLD = 5
const SCROLL_NOT_TOP_THRESHOLD = 10
const SCROLL_CAPTURE_VELOCITY = 0.5
const SCROLL_EVENT_THROTTLE = 16 // for 60fps on lower-end devices
// On higher-end devices, React Native can exceed 60fps
const IS_HIGH_END_DEVICE = Platform.OS === 'ios' || (Platform.OS === 'android' && parseInt(Platform.Version.toString(), 10) >= 26); // Android 8.0+

interface HomeScreenProps {
    navigation: HomeNavigationProp;
    route?: any;
}

const HomeScreen = ({ navigation, route }: HomeScreenProps) => {
    const insets = useSafeAreaInsets();
    const { isDarkMode, toggleTheme, theme, animatedValue } = useTheme();
    const listRef = useRef<FlashList<FeedInfo> | null>(null);

    const {
        scrollY,
        lastScrollY,
        headerTranslateY,
        isScrollingUp,
        headerAnimatedStyle
    } = useHeaderAnimation(insets);

    const {
        feed,
        stories,
        isRefreshing,
        isLoadingMore,
        hasMoreData,
        handleRefresh,
        handleLoadMore,
        triggerForceRefresh
    } = useFeedDataManager({
        scrollY,
        lastScrollY,
        headerTranslateY,
        listRef,
        route
    });

    const {
        visibleIndices,
        onViewableItemsChanged,
        viewabilityConfig,
        saveVisibleItems
    } = useViewableItemsTracker(feed, handleLoadMore);

    // Handle theme toggle
    const handleThemePress = useCallback((x: number, y: number) => {
        toggleTheme(x, y)
    }, [toggleTheme]);

    // Theme icon animation style
    const themeIconStyle = useAnimatedStyle(() => ({
        transform: [
            { rotate: `${animatedValue.value * 360}deg` },
            { scale: 1 + (animatedValue.value * 0.2) }
        ],
        opacity: 1
    }));

    // Function to batch state updates for better performance
    const updateNavigationState = useCallback((isAtTop: boolean) => {
        const params = navigation?.getState().routes.find(
            r => r.name === 'bottom_bar_home'
        )?.params || {};

        const isCurrentlyAtTop = (params as any)?.isScrolledToTop || false;
        if (isCurrentlyAtTop !== isAtTop) {
            navigation?.setParams({
                ...params,
                isScrolledToTop: isAtTop
            } as any);
        }
    }, [navigation]);

    // Function to batch save operations for better performance
    const batchSaveVisibleItems = useCallback((indices: number[]) => {
        saveVisibleItems(indices);
    }, [saveVisibleItems]);

    const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        'worklet';
        const currentY = event.nativeEvent.contentOffset.y;
        isScrollingUp.value = currentY < lastScrollY.value;
        scrollY.value = currentY;
        lastScrollY.value = currentY;

        // Update navigation state less frequently
        if (currentY <= SCROLL_TOP_THRESHOLD && navigation && route) {
            runOnJS(updateNavigationState)(true);
        } else if (currentY > SCROLL_NOT_TOP_THRESHOLD && navigation && route) {
            runOnJS(updateNavigationState)(false);
        }

        // Save visible items
        const scrollVelocity = Math.abs(currentY - lastScrollY.value);
        if (scrollVelocity < SCROLL_CAPTURE_VELOCITY) {
            runOnJS(batchSaveVisibleItems)(visibleIndices);
        }
    }, [visibleIndices, batchSaveVisibleItems, updateNavigationState, route, isScrollingUp, scrollY, lastScrollY]);

    // Memoize feedProps to prevent unnecessary re-renders
    const feedProps = useMemo(() => ({
        feed,
        stories,
        isRefreshing,
        isLoadingMore,
        hasMoreData,
        insets,
        navigation,
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
        handleRefresh,
        handleLoadMore,
        handleScroll,
        onViewableItemsChanged,
        viewabilityConfig
    ]);

    // Memoize header props to prevent unnecessary re-renders
    const headerProps = useMemo(() => ({
        style: headerAnimatedStyle,
        insets: insets,
        onNotificationPress: () => { },
        isDarkMode,
        onThemePress: handleThemePress,
        themeIconStyle,
        theme,
        isRefreshing,
        onRefresh: triggerForceRefresh
    }), [
        headerAnimatedStyle,
        insets,
        isDarkMode,
        handleThemePress,
        themeIconStyle,
        theme,
        isRefreshing,
        triggerForceRefresh
    ]);

    // Memoize styles to prevent unnecessary style recalculations
    const containerStyle = useMemo(() => [
        styles.container, 
        { backgroundColor: theme.backgroundColor }
    ], [theme.backgroundColor]);

    return (
        <SafeAreaView style={containerStyle}>
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={theme.backgroundColor}
            />

            <AnimatedHeader {...headerProps} />

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

export default React.memo(HomeScreen) 