import { StatusBar, Text, View, SafeAreaView, Pressable, Platform, FlexAlignType, StyleSheet, RefreshControl, NativeScrollEvent, NativeSyntheticEvent } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Octicons } from '@expo/vector-icons'
import Svg, { Path, G } from 'react-native-svg'
import { Card } from './components/Card'
import { generateMockGridFeed, generateMockStories } from 'src/data/mockFeedData'
import { StoryItem } from './components/Story'
import { StackNavigationProp } from '@react-navigation/stack'
import { BottomBarParamList } from 'src/navigation/types'
import { FlashList } from '@shopify/flash-list'
import Animated, {
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withTiming,
    withSpring,
} from 'react-native-reanimated'
import AnimatedText from 'src/components/AnimatedText'
import { useTheme } from 'src/context/ThemeContext'
import type { Theme } from 'src/context/ThemeContext'
import { Image } from 'expo-image'
import FlowerLogo from './components/UI/FlowerLogo'
import Stories from './components/Story'
import { LinearGradient } from 'expo-linear-gradient'
import LikeButtonWithFlower from './components/UI/LikeButtonWithFlower'

interface FeedInfo {
    id: string
    images: string[]
    title: string
    likes: string
    comments: number
    description: string
    isVideo: boolean
    video?: string
}

export type HomeNavigationProp = StackNavigationProp<BottomBarParamList, "bottom_bar_home">;

interface HeaderProps {
    insets: {
        top: number;
    };
    onNotificationPress: () => void;
    isDarkMode: boolean;
    onThemePress: (x: number, y: number) => void;
    themeIconStyle: any;
    theme: Theme;
    isRefreshing: boolean;
    onRefresh: () => void;
}

const headerStyles = {
    logoContainer: {
        flexDirection: 'row' as const,
        alignItems: 'center' as FlexAlignType,
        paddingVertical: 0,
        borderRadius: 100,

    },
    notificationContainer: {
        position: 'relative' as const,
    },
} as const;

const SunIcon = React.memo(({ color }: { color: string }) => (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill={color}>
        <G>
            <Path fill="none" d="M0 0h24v24H0z" />
            <Path d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12zM11 1h2v3h-2V1zm0 19h2v3h-2v-3zM3.515 4.929l1.414-1.414L7.05 5.636 5.636 7.05 3.515 4.93zM16.95 18.364l1.414-1.414 2.121 2.121-1.414 1.414-2.121-2.121zm2.121-14.85l1.414 1.415-2.121 2.121-1.414-1.414 2.121-2.121zM5.636 16.95l1.414 1.414-2.121 2.121-1.414-1.414 2.121-2.121zM23 11v2h-3v-2h3zM4 11v2H1v-2h3z" />
        </G>
    </Svg>
));

const MoonIcon = React.memo(({ color }: { color: string }) => (
    <Svg width="24" height="24" viewBox="0 0 24 24">
        <G>
            <Path fill="none" d="M0 0h24v24H0z" />
            <Path d="M9.822 2.238a9 9 0 0 0 11.94 11.94C20.768 18.654 16.775 22 12 22 6.477 22 2 17.523 2 12c0-4.775 3.346-8.768 7.822-9.762zm8.342.053L19 2.5v1l-.836.209a2 2 0 0 0-1.455 1.455L16.5 6h-1l-.209-.836a2 2 0 0 0-1.455-1.455L13 3.5v-1l.836-.209A2 2 0 0 0 15.29.836L15.5 0h1l.209.836a2 2 0 0 0 1.455 1.455zm5 5L24 7.5v1l-.836.209a2 2 0 0 0-1.455 1.455L21.5 11h-1l-.209-.836a2 2 0 0 0-1.455-1.455L18 8.5v-1l.836-.209a2 2 0 0 0 1.455-1.455L20.5 5h1l.209.836a2 2 0 0 0 1.455 1.455z" />
        </G>
    </Svg>
));

// แยก Header Component ออกมาเพื่อลด re-render
const Header = React.memo(({
    insets,
    onNotificationPress,
    isDarkMode,
    onThemePress,
    themeIconStyle,
    theme,
    isRefreshing,
    onRefresh
}: HeaderProps) => {
    const handleThemePress = useCallback((event: any) => {
        const { pageX, pageY } = event.nativeEvent;
        onThemePress(pageX, pageY);
    }, [onThemePress]);

    // Define gradient colors based on theme
    const gradientColors = isDarkMode
        ? ['rgba(0,0,0,1)', 'rgb(23, 1, 33)'] as const
        : ['rgba(255,255,255,1)', 'rgba(255,255,255,1)', 'rgb(255, 255, 255)'] as const;

    return (
        <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.headerContainer]}
        >
            <View style={[styles.subHeaderContainer, { marginTop: insets.top }]}>
                <Pressable
                    style={[styles.iconButton,]}
                    onPress={handleThemePress}
                >
                    <Animated.View style={themeIconStyle}>
                        {!isDarkMode ? (
                            <MoonIcon color={theme.textColor} />
                        ) : (
                            <SunIcon color={theme.textColor} />
                        )}
                    </Animated.View>
                </Pressable>

                <Pressable style={[headerStyles.logoContainer, { marginRight: 20 }]} onPress={onRefresh}>
                    <FlowerLogo
                        isRefreshing={isRefreshing}
                        onRefresh={onRefresh}
                        color={"#4f46e5"}
                        size={38}
                    />
                </Pressable>

                <View style={styles.rightHeaderContainer}>
                    

                    <Pressable
                        style={headerStyles.notificationContainer}
                        onPress={onNotificationPress}
                    >
                        <Octicons
                            name="bell"
                            size={22}
                            color={theme.textColor}
                        />
                        <View style={styles.notificationBadge} />
                    </Pressable>
                </View>
            </View>
        </LinearGradient>
    );
});

// แยก FeedItem ออกมาเป็น memoized component with virtualization
const FeedItem = React.memo(({
    item,
    index,
    navigation
}: {
    item: FeedInfo;
    index: number;
    navigation: HomeNavigationProp
}) => {
    // Use stable key reference to avoid re-renders causing image loading issues
    const stableKey = useRef(`feed-item-${item.id}`).current;

    return (
        <View key={stableKey} style={{ marginBottom: 8 }}>
            <Card
                navigation={navigation}
                images={item.images}
                caption={item.description}
                title={item.title}
                likes={item.likes}
                cardIndex={index}
                isVisible={true}
            />
        </View>
    );
}, (prevProps, nextProps) => {
    // ป้องกันการ re-render ที่ไม่จำเป็น
    return prevProps.item.id === nextProps.item.id &&
        prevProps.index === nextProps.index;
});

interface AnimatedHeaderProps extends HeaderProps {
    style: any;
}

const AnimatedHeader = React.memo((props: AnimatedHeaderProps) => (
    <Animated.View style={props.style}>
        <Header
            insets={props.insets}
            onNotificationPress={props.onNotificationPress}
            isDarkMode={props.isDarkMode}
            onThemePress={props.onThemePress}
            themeIconStyle={props.themeIconStyle}
            theme={props.theme}
            isRefreshing={props.isRefreshing}
            onRefresh={props.onRefresh}
        />
    </Animated.View>
));

// ใช้ Stories component แบบ memoized ลดการ render ซ้ำ
const MemoizedStoriesHeader = memo(({ stories, isDarkMode }: { stories: StoryItem[], isDarkMode: boolean }) => {
    if (stories.length === 0) return null;
    return <Stories stories={stories} isDarkMode={isDarkMode} />;
});

const HomeScreen = ({ navigation, route }: { navigation: HomeNavigationProp; route?: any }) => {
    const insets = useSafeAreaInsets();
    const [feed, setFeed] = useState<FeedInfo[]>([]);
    const [stories, setStories] = useState<StoryItem[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMoreData, setHasMoreData] = useState(true);
    const { isDarkMode, toggleTheme, theme, animatedValue } = useTheme();

    // Animated values
    const listRef = useRef<FlashList<FeedInfo>>(null);
    const scrollY = useSharedValue(0);
    const lastScrollY = useSharedValue(0);
    const headerTranslateY = useSharedValue(0);
    const isScrollingUp = useSharedValue(false);
    const lastRefreshTimestamp = useRef<number>(0);
    const HEADER_HEIGHT = 60;
    const HIDE_HEADER_SCROLL_DISTANCE = HEADER_HEIGHT + insets.top;
    const SCROLL_THRESHOLD = 5;
    const MIN_SCROLL_TO_HIDE = 50;
    const PRERENDER_ITEMS_COUNT = 30; // Number of items to prerender
    const PRERENDER_THRESHOLD = 2; // When to prerender more items (50% of prerendered items left)

    // Calculate header position based on scroll direction using derived value
    const derivedHeaderTranslateY = useDerivedValue(() => {
        if (scrollY.value <= 10) {
            return withTiming(0, {
                duration: 150
            });
        }

        if (!isScrollingUp.value && scrollY.value > MIN_SCROLL_TO_HIDE) {
            return withTiming(-HIDE_HEADER_SCROLL_DISTANCE, {
                duration: 200
            });
        }

        if (isScrollingUp.value) {
            return withTiming(0, {
                duration: 200
            });
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

    // Handle refresh with optimized loading
    const handleRefresh = useCallback(async () => {
        // ใช้ return เพื่อไม่ให้ทำงานซ้ำซ้อนเมื่อกำลัง refresh อยู่
        if (isRefreshing) return;

        setIsRefreshing(true);
        // Reset scroll position to ensure we're at the top
        if (scrollY.value > 0) {
            scrollY.value = 0;
            lastScrollY.value = 0;
            headerTranslateY.value = 0;
        }

        try {
            const mockData = generateMockGridFeed(6);
            const mockStoryData = generateMockStories(8);

            // ใช้ batch update เพื่อลดการ render ซ้ำซ้อน
            setFeed(mockData as unknown as FeedInfo[]);
            setStories(mockStoryData);

            // เพิ่ม delay เล็กน้อยเพื่อให้ UX ดีขึ้น ผู้ใช้เห็นว่ามีการโหลดจริงๆ
            await new Promise(resolve => setTimeout(resolve, 800));
        } catch (error) {
            console.error('Error refreshing feed:', error);
        } finally {
            setIsRefreshing(false);
        }
    }, [isRefreshing]);

    // Load more data with optimized batch size
    const handleLoadMore = useCallback(async () => {
        if (isLoadingMore || !hasMoreData) return;

        setIsLoadingMore(true);
        try {
            const newData = generateMockGridFeed(3);
            if (newData.length === 0) {
                setHasMoreData(false);
                return;
            }

            // Use functional update to avoid race conditions
            setFeed(prev => [...prev, ...newData as unknown as FeedInfo[]]);
        } catch (error) {
            console.error('Error loading more data:', error);
        } finally {
            setIsLoadingMore(false);
        }
    }, [isLoadingMore, hasMoreData]);

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
    }, []);

    // Initial data load
    useEffect(() => {
        handleRefresh();
    }, []);

    // Effect to handle tab press refresh
    useEffect(() => {
        if (route?.params?.refresh) {
            const currentRefresh = route.params.refresh as number;

            // Only refresh if it's a new timestamp (prevents multiple refreshes)
            if (currentRefresh > lastRefreshTimestamp.current) {
                lastRefreshTimestamp.current = currentRefresh;

                // Reset scroll position
                scrollY.value = 0;
                lastScrollY.value = 0;
                headerTranslateY.value = 0;

                // Scroll to top
                if (listRef.current) {
                    listRef.current.scrollToOffset({ offset: 0, animated: true });
                }

                // Refresh the feed data (with slight delay to ensure scroll completes first)
                setTimeout(() => {
                    handleRefresh();
                }, 100);
            }
        }
    }, [route?.params?.refresh]);

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

    const handleThemePress = useCallback((x: number, y: number) => {
        toggleTheme(x, y);
    }, [toggleTheme]);

    // Memoized handlers and components for maximum performance
    const renderItem = useCallback(({ item, index }: { item: FeedInfo, index: number }) => (
        <FeedItem
            item={item}
            index={index}
            navigation={navigation}
        />
    ), [navigation]);

    const keyExtractor = useCallback((item: FeedInfo) => item.id, []);

    // Minimal, optimized separator
    const MemoizedItemSeparator = React.memo(() => (
        <View style={styles.separator} />
    ));

    // Simple loading placeholder
    const MemoizedEmptyComponent = React.memo(() => (
        <View style={styles.loadingContainer}>
            <AnimatedText text="Loading..." color={theme.textColor} />
        </View>
    ));

    // Minimal footer component
    const MemoizedFooterComponent = useMemo(() =>
        isLoadingMore ? (
            <View style={styles.loadingMoreContainer}>
                <Text style={{ color: theme.textColor }}>Loading more...</Text>
            </View>
        ) : null
        , [isLoadingMore, theme.textColor]);

    // Optimized FlashList configuration
    const flashListProps = useMemo(() => ({
        data: feed,
        keyExtractor,
        renderItem,
        estimatedItemSize: 385,
        showsVerticalScrollIndicator: false,
        ListEmptyComponent: MemoizedEmptyComponent,
        ListHeaderComponent: stories.length > 0 ? () => <MemoizedStoriesHeader stories={stories} isDarkMode={isDarkMode} /> : null,
        contentContainerStyle: {
            ...styles.listContentContainer,
            paddingTop: (Platform.OS === 'ios' ? insets.top : 60) + 10
        },
        onScroll: scrollHandler,
        onEndReached: handleLoadMore,
        ListFooterComponent: MemoizedFooterComponent,
        removeClippedSubviews: true, // Enable for both platforms
        maxToRenderPerBatch: 5, // Render fewer items per batch
        initialNumToRender: 5, // Start with fewer items
        windowSize: 5, // Reduce window size for better performance
        updateCellsBatchingPeriod: 50, // More frequent batching
        onEndReachedThreshold: 0.5,
        estimatedFirstItemOffset: 0,
        drawDistance: 900, // Reduce draw distance
        
    }), [
        feed,
        keyExtractor,
        renderItem,
        insets.top,
        scrollHandler,
        handleLoadMore,
        MemoizedFooterComponent,
        theme.textColor,
        stories
    ]);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>

            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.backgroundColor} />

            <AnimatedHeader
                style={[headerAnimatedStyle]}
                insets={insets}
                onNotificationPress={() => { }}
                isDarkMode={isDarkMode}
                onThemePress={handleThemePress}
                themeIconStyle={themeIconStyle}
                theme={theme}
                isRefreshing={isRefreshing}
                onRefresh={handleRefresh}
            />

            <View style={styles.mainContent}>
                <View style={styles.listContainer}>
                    <FlashList
                        ref={listRef}
                        {...flashListProps}
                        bounces={Platform.OS === 'ios'}
                        overScrollMode="never"
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefreshing}
                                onRefresh={handleRefresh}
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
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        zIndex: 2,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    subHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingBottom: 5,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
        borderRadius: 100,
        paddingVertical: 10
    },
    logoText: {
        fontFamily: 'Knewave_400Regular',
        fontSize: 20,
        color: "#1a1a1a"
    },
    notificationBadge: {
        backgroundColor: '#f43f5e',
        padding: 4,
        borderRadius: 20,
        position: 'absolute',
        top: -3,
        right: -2
    },
    notificationContainer: {
        position: 'relative',
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
    rightHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    iconButton: {
        padding: 5,
    },
    likeButtonContainer: {
        marginRight: 5,
    },
    mainContent: {
        flex: 1,
        zIndex: 0,
    },
    listContainer: {
        flex: 1,
        width: '100%',
    },
    listContentContainer: {
        paddingHorizontal: 8,
        paddingBottom: 16,
    },
    headerAnimated: {
    },
    loadingMoreContainer: {
        padding: 8,
        alignItems: 'center',
    },
});

export default React.memo(HomeScreen);