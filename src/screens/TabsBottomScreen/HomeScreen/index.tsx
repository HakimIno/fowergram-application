import { StatusBar, Text, View, SafeAreaView, useWindowDimensions, Pressable, Platform, FlexAlignType, StyleSheet, RefreshControl, NativeScrollEvent, NativeSyntheticEvent } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons, MaterialCommunityIcons, Octicons } from '@expo/vector-icons'
import Svg, { Path, Circle, G } from 'react-native-svg'
import { Card } from './components/Card'
import { generateMockGridFeed, generateMockStories } from 'src/data/mockFeedData'
import Stories, { StoryItem } from './components/Story'
import BottomSheet, { BottomSheetMethods } from 'src/components/BottomSheet'
import { StackNavigationProp } from '@react-navigation/stack'
import { BottomBarParamList } from 'src/navigation/types'
import { FlashList } from '@shopify/flash-list'
import Animated, {

    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withTiming,
    runOnUI,
    measure,
    withSpring,
    useAnimatedScrollHandler,

} from 'react-native-reanimated'
import AnimatedText from 'src/components/AnimatedText'
import { useTheme, } from 'src/context/ThemeContext'
import type { Theme } from 'src/context/ThemeContext'
import { Image } from 'expo-image'

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
    iconStyle: any;
    handlePress: () => void;
    isDarkMode: boolean;
    onThemePress: (x: number, y: number) => void;
    themeIconStyle: any;
    theme: Theme;
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

const SunIcon = ({ color }: { color: string }) => (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill={color}>
        <G>
            <Path fill="none" d="M0 0h24v24H0z" />
            <Path d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12zM11 1h2v3h-2V1zm0 19h2v3h-2v-3zM3.515 4.929l1.414-1.414L7.05 5.636 5.636 7.05 3.515 4.93zM16.95 18.364l1.414-1.414 2.121 2.121-1.414 1.414-2.121-2.121zm2.121-14.85l1.414 1.415-2.121 2.121-1.414-1.414 2.121-2.121zM5.636 16.95l1.414 1.414-2.121 2.121-1.414-1.414 2.121-2.121zM23 11v2h-3v-2h3zM4 11v2H1v-2h3z" />
        </G>
    </Svg>
);

const MoonIcon = ({ color }: { color: string }) => (
    <Svg width="24" height="24" viewBox="0 0 24 24">
        <G>
            <Path fill="none" d="M0 0h24v24H0z" />
            <Path d="M9.822 2.238a9 9 0 0 0 11.94 11.94C20.768 18.654 16.775 22 12 22 6.477 22 2 17.523 2 12c0-4.775 3.346-8.768 7.822-9.762zm8.342.053L19 2.5v1l-.836.209a2 2 0 0 0-1.455 1.455L16.5 6h-1l-.209-.836a2 2 0 0 0-1.455-1.455L13 3.5v-1l.836-.209A2 2 0 0 0 15.29.836L15.5 0h1l.209.836a2 2 0 0 0 1.455 1.455zm5 5L24 7.5v1l-.836.209a2 2 0 0 0-1.455 1.455L21.5 11h-1l-.209-.836a2 2 0 0 0-1.455-1.455L18 8.5v-1l.836-.209a2 2 0 0 0 1.455-1.455L20.5 5h1l.209.836a2 2 0 0 0 1.455 1.455z" />
        </G>
    </Svg>
);


// แยก Header Component ออกมาเพื่อลด re-render
const Header = React.memo(({
    insets,
    onNotificationPress,
    iconStyle,
    handlePress,
    isDarkMode,
    onThemePress,
    themeIconStyle,
    theme
}: HeaderProps) => {
    const handleThemePress = (event: any) => {
        const { pageX, pageY } = event.nativeEvent;
        onThemePress(pageX, pageY);
    };

    return (
        <View style={[styles.headerContainer, { backgroundColor: theme.backgroundColor }]}>
            <View style={[styles.subHeaderContainer, { marginTop: insets.top }]}>
                <Pressable style={headerStyles.logoContainer}>
                    <Image
                        source={require('../../../../assets/fs.png')}
                        style={[{ width: 26, height: 26 }]}
                    />

                    <Text style={[styles.logoText, { zIndex: 1, marginBottom: 2, color: theme.textColor }]}>F</Text>
                    <Text style={[styles.logoText, { zIndex: 1, marginBottom: 2, color: '#8cc63f' }]}>rog</Text>
                </Pressable>

                <View style={styles.rightHeaderContainer}>
                    <Pressable
                        style={[styles.iconButton, { marginRight: 15 }]}
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
        </View>
    );
});

// แยก FeedItem ออกมาเป็น memoized component
const FeedItem = React.memo(({
    item,
    index,
    navigation
}: {
    item: FeedInfo;
    index: number;
    navigation: HomeNavigationProp
}) => {
    return (
        <Card
            navigation={navigation}
            images={item.images}
            caption={item.description}
            title={item.title}
            likes={item.likes}
            onZoomStateChange={() => { }}
            cardIndex={index}
        />
    );
});

interface AnimatedHeaderProps extends HeaderProps {
    style: any;
}

const AnimatedHeader = React.memo((props: AnimatedHeaderProps) => (
    <Animated.View style={props.style}>
        <Header
            insets={props.insets}
            onNotificationPress={props.onNotificationPress}
            iconStyle={props.iconStyle}
            handlePress={props.handlePress}
            isDarkMode={props.isDarkMode}
            onThemePress={props.onThemePress}
            themeIconStyle={props.themeIconStyle}
            theme={props.theme}
        />
    </Animated.View>
));

const HomeScreen = ({ navigation, route }: { navigation: HomeNavigationProp; route: any }) => {
    const insets = useSafeAreaInsets();
    const bottomSheetRef = useRef<BottomSheetMethods>(null);
    const [feed, setFeed] = useState<FeedInfo[]>([]);
    const [stories, setStories] = useState<StoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMoreData, setHasMoreData] = useState(true);
    const { isDarkMode, toggleTheme, theme, animatedValue } = useTheme();

    // Animated values
    const listRef = useRef<FlashList<FeedInfo>>(null);
    const heightValue = useSharedValue(0);
    const open = useSharedValue(false);
    const progress = useDerivedValue(() =>
        open.value ? withTiming(1) : withTiming(0)
    );
    const themeRotation = useSharedValue(0);

    // Improved header animation values
    const scrollY = useSharedValue(0);
    const lastScrollY = useSharedValue(0);
    const velocityY = useSharedValue(0);
    const headerTranslateY = useSharedValue(0);
    const isScrollingUp = useSharedValue(false);
    const HEADER_HEIGHT = 60;
    const HIDE_HEADER_SCROLL_DISTANCE = HEADER_HEIGHT + insets.top;
    const SCROLL_THRESHOLD = 5; // ลดลงเพื่อให้ตอบสนองเร็วขึ้น
    const MIN_SCROLL_TO_HIDE = 50; // ต้องเลื่อนลงอย่างน้อยเท่านี้ถึงจะซ่อน header

    // Calculate header position based on scroll direction using derived value
    const derivedHeaderTranslateY = useDerivedValue(() => {
        // เช็คว่ายังอยู่ด้านบนสุดหรือไม่
        if (scrollY.value <= 10) {
            // ถ้าอยู่ด้านบนสุด ให้แสดง header เสมอ
            return withSpring(0, {
                damping: 15,
                mass: 0.2,
                stiffness: 150
            });
        }

        // เลื่อนลงและเลยระยะที่กำหนด
        if (!isScrollingUp.value && scrollY.value > MIN_SCROLL_TO_HIDE) {
            return withSpring(-HIDE_HEADER_SCROLL_DISTANCE, {
                damping: 30,
                mass: 0.2,
                stiffness: 350,
                overshootClamping: true,
            });
        }

        // เลื่อนขึ้น
        if (isScrollingUp.value) {
            return withSpring(0, {
                damping: 20,
                mass: 0.2,
                stiffness: 200,
            });
        }

        // ใช้ตำแหน่งปัจจุบัน
        return headerTranslateY.value;
    });

    // Enhanced header animation style with improved timing and hardware acceleration
    const headerAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateY: derivedHeaderTranslateY.value },
                { perspective: 1000 }, // Add perspective for hardware acceleration
            ],
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            backfaceVisibility: 'hidden', // Hardware acceleration
            ...(Platform.OS === 'android' ? { elevation: 1 } : {}), // Hardware acceleration on Android
        };
    });

    // Add refresh animation values
    const refreshRotation = useSharedValue(0);
    const refreshScale = useSharedValue(1);


    // Handle refresh
    const handleRefresh = useCallback(async () => {
        if (isRefreshing) return; // Prevent multiple refreshes

        setIsRefreshing(true);
        try {
            const mockData = generateMockGridFeed(10);
            const mockStoryData = generateMockStories(15);
            setFeed(mockData as unknown as FeedInfo[]);
            setStories(mockStoryData);
            await new Promise(resolve => setTimeout(resolve, 1500));
        } catch (error) {
            console.error('Error refreshing feed:', error);
        } finally {
            setIsRefreshing(false);
        }
    }, [isRefreshing]);

    // Add function to load more data
    const handleLoadMore = useCallback(async () => {
        if (isLoadingMore || !hasMoreData) return;

        setIsLoadingMore(true);
        try {
            // Load only 5 more rows of data
            const newData = generateMockGridFeed(5);
            // Check if we've reached the end of data
            if (newData.length === 0) {
                setHasMoreData(false);
                return;
            }
            setFeed(prev => [...prev, ...newData as unknown as FeedInfo[]]);
        } catch (error) {
            console.error('Error loading more data:', error);
        } finally {
            setIsLoadingMore(false);
        }
    }, [isLoadingMore, hasMoreData]);

    // Use more optimized animated scroll handler for smoother performance
    const scrollHandler = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const currentScrollY = event.nativeEvent.contentOffset.y;

        // คำนวณทิศทางการเลื่อน (เลื่อนลง delta > 0, เลื่อนขึ้น delta < 0)
        const delta = currentScrollY - lastScrollY.value;

        // เก็บค่า velocity เฉพาะเมื่อเลื่อนระยะที่มากพอ เพื่อลดการตอบสนองต่อการเลื่อนเล็กๆ น้อยๆ
        if (Math.abs(delta) > SCROLL_THRESHOLD) {
            velocityY.value = delta;

            // กำหนดทิศทางการเลื่อน
            isScrollingUp.value = delta < 0;

            // อัพเดทค่า header ทันทีตามทิศทาง (แบบ immediate) ทำให้การตอบสนองเร็วขึ้น
            if (delta > SCROLL_THRESHOLD && currentScrollY > MIN_SCROLL_TO_HIDE) {
                // เลื่อนลง และอยู่ต่ำกว่าระยะที่กำหนด
                headerTranslateY.value = -HIDE_HEADER_SCROLL_DISTANCE;
            } else if (delta < -SCROLL_THRESHOLD) {
                // เลื่อนขึ้น
                headerTranslateY.value = 0;
            }
        }

        // บันทึกค่าตำแหน่งปัจจุบัน
        scrollY.value = currentScrollY;
        lastScrollY.value = currentScrollY;
    }, []);

    const handleBeginDrag = useCallback(() => {
        // Reset velocity when starting to drag
        velocityY.value = 0;
    }, []);

    const handleEndDrag = useCallback(() => {
        // ไม่ต้องกำหนดตำแหน่งอีกครั้งตอนปล่อยนิ้ว เพราะ derivedHeaderTranslateY จะจัดการให้
    }, []);

    useEffect(() => {
        handleRefresh();
    }, []);

    const heightAnimationStyle = useAnimatedStyle(() => ({
        height: heightValue.value,
    }));

    const iconStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${progress.value * -180}deg` }],
    }));

    const themeIconStyle = useAnimatedStyle(() => {
        return {
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
        };
    });

    const handlePress = useCallback(() => {
        runOnUI(() => {
            'worklet';
            if (heightValue.value === 0) {
                const measured = measure(listRef as any);
                if (measured) {
                    heightValue.value = withTiming(measured.height);
                }
            } else {
                heightValue.value = withTiming(0);
            }
            open.value = !open.value;
        })();
    }, []);

    const handleThemePress = useCallback((x: number, y: number) => {
        toggleTheme(x, y);
    }, [toggleTheme]);

    // Memoized handlers and components
    const renderItem = useCallback(({ item, index }: any) => (
        <FeedItem
            item={item}
            index={index}
            navigation={navigation}
        />
    ), [navigation]);

    const keyExtractor = useCallback((item: FeedInfo, index: number) => `${item.id}-${index}`, []);

    // Create memoized components
    const MemoizedItemSeparator = React.memo(() => (
        <View style={styles.separator} />
    ));

    const MemoizedEmptyComponent = React.memo(() => (
        <View style={styles.loadingContainer}>
            <AnimatedText text="Loading..." color="#000000" />
        </View>
    ));

    const MemoizedFooterComponent = useMemo(() =>
        isLoadingMore ? (
            <View style={styles.loadingMoreContainer}>
                <Text style={{ color: theme.textColor }}>Loading more...</Text>
            </View>
        ) : null
        , [isLoadingMore, theme.textColor]);

 
    const StoryHeaderComponent = useMemo(() => {
        return () => <Stories stories={stories} />;
    }, [stories]);

    const flashListProps = useMemo(() => ({
        data: feed,
        keyExtractor,
        renderItem,
        estimatedItemSize: 400,
        showsVerticalScrollIndicator: false,
        ItemSeparatorComponent: MemoizedItemSeparator,
        ListEmptyComponent: MemoizedEmptyComponent,
        contentContainerStyle: {
            ...styles.listContentContainer,
            paddingTop: insets.top + (Platform.OS === 'ios' ? 0 : 60)
        },
        onScroll: scrollHandler,
        onScrollBeginDrag: handleBeginDrag,
        onScrollEndDrag: handleEndDrag,
        scrollEventThrottle: 8,  // More frequent updates for smoother animation
        onEndReached: handleLoadMore,
        onEndReachedThreshold: 0.5,
        ListFooterComponent: MemoizedFooterComponent,
        removeClippedSubviews: true,
        // Add more optimizations
        initialNumToRender: 6,
        maxToRenderPerBatch: 5,
        windowSize: 6,
        updateCellsBatchingPeriod: 50,
        ListHeaderComponent: StoryHeaderComponent,
    }), [
        feed,
        stories,
        keyExtractor,
        renderItem,
        insets.top,
        styles.listContentContainer,
        scrollHandler,
        handleBeginDrag,
        handleEndDrag,
        handleLoadMore,
        MemoizedFooterComponent,
        StoryHeaderComponent
    ]);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.backgroundColor} />

            <AnimatedHeader
                style={[styles.headerAnimated, headerAnimatedStyle]}
                insets={insets}
                onNotificationPress={() => bottomSheetRef.current?.expand()}
                iconStyle={iconStyle}
                handlePress={handlePress}
                isDarkMode={isDarkMode}
                onThemePress={handleThemePress}
                themeIconStyle={themeIconStyle}
                theme={theme}
            />

            <View style={styles.mainContent}>
                <View style={styles.listContainer}>
                    <FlashList
                        ref={listRef}
                        {...flashListProps}
                        bounces={false}
                        overScrollMode="never"
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefreshing}
                                onRefresh={handleRefresh}
                                tintColor="rgba(0,0,0,0)"
                                progressBackgroundColor={theme.backgroundColor}
                                colors={['#8cc63f']}
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
        fontFamily: 'Funnel_700Bold',
        fontSize: 24,
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
    contentContainerX: {
        overflow: 'hidden',
    },
    content: {
        padding: 10,
    },
    feedContainer: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    separator: {
        height: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 100,
    },
    rightHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        padding: 5,
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
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        elevation: 1,
    },
    lottieContainer: {
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 999,
    },
    lottieStyle: {
        width: 80,
        height: 80,
    },
    loadingMoreContainer: {
        padding: 10,
        alignItems: 'center',
    },
});

export default React.memo(HomeScreen);