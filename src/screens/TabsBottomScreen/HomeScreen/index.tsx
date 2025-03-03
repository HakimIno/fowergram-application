import { StatusBar, Text, View, SafeAreaView, useWindowDimensions, Pressable, Platform, FlexAlignType, StyleSheet, RefreshControl, } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons, MaterialCommunityIcons, Octicons } from '@expo/vector-icons'
import Svg, { Path, Circle, G } from 'react-native-svg'
import Card from './components/Card'
import { generateMockGridFeed } from 'src/data/mockFeedData'
import BottomSheet, { BottomSheetMethods } from 'src/components/BottomSheet'
import { useFocusEffect } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { BottomBarParamList } from 'src/navigation/types'
import { FlashList } from '@shopify/flash-list'
import Animated, {
    useAnimatedRef,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withTiming,
    runOnUI,
    measure,
    withSpring,
    interpolateColor,
    withSequence,
    Easing,
    withRepeat,
    withDelay
} from 'react-native-reanimated'
import AnimatedText from 'src/components/AnimatedText'
import { useTheme, lightTheme, darkTheme } from 'src/context/ThemeContext'
import type { Theme } from 'src/context/ThemeContext'
import { Image } from 'expo-image'
import LottieView from 'lottie-react-native'

interface FeedInfo {
    id: string
    images: string[]
    title: string
    likes: number
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
    // <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    //     <Circle cx="12" cy="12" r="4" fill={color} />
    //     <Circle cx="12" cy="12" r="3" fill={color} opacity="0.3" />

    //     <Path d="M12 5V3" stroke={color} strokeWidth="2" strokeLinecap="round" />
    //     <Path d="M12 21V19" stroke={color} strokeWidth="2" strokeLinecap="round" />
    //     <Path d="M19 12H21" stroke={color} strokeWidth="2" strokeLinecap="round" />
    //     <Path d="M3 12H5" stroke={color} strokeWidth="2" strokeLinecap="round" />

    //     <Path d="M17.657 6.343L18.95 5.05" stroke={color} strokeWidth="2" strokeLinecap="round" />
    //     <Path d="M5.05 18.95L6.343 17.657" stroke={color} strokeWidth="2" strokeLinecap="round" />
    //     <Path d="M18.95 18.95L17.657 17.657" stroke={color} strokeWidth="2" strokeLinecap="round" />
    //     <Path d="M5.05 5.05L6.343 6.343" stroke={color} strokeWidth="2" strokeLinecap="round" />

    //     <Circle
    //         cx="12"
    //         cy="12"
    //         r="6"
    //         stroke={color}
    //         strokeWidth="1.5"
    //         strokeDasharray="1 2"
    //     />
    // </Svg>
    <Svg width="22" height="22" viewBox="0 0 24 24" fill={color}>
        <G>
            <Path fill="none" d="M0 0h24v24H0z" />
            <Path d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12zM11 1h2v3h-2V1zm0 19h2v3h-2v-3zM3.515 4.929l1.414-1.414L7.05 5.636 5.636 7.05 3.515 4.93zM16.95 18.364l1.414-1.414 2.121 2.121-1.414 1.414-2.121-2.121zm2.121-14.85l1.414 1.415-2.121 2.121-1.414-1.414 2.121-2.121zM5.636 16.95l1.414 1.414-2.121 2.121-1.414-1.414 2.121-2.121zM23 11v2h-3v-2h3zM4 11v2H1v-2h3z" />
        </G>
    </Svg>
);

const MoonIcon = ({ color }: { color: string }) => (
    // <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    //     <Path
    //         d="M21.5 14.0784C20.3003 14.7189 18.9301 15.0821 17.4751 15.0821C12.1546 15.0821 7.84277 10.7703 7.84277 5.44975C7.84277 3.99474 8.20599 2.62458 8.84643 1.42485C5.08506 2.42485 2.34277 5.85095 2.34277 9.91711C2.34277 14.9677 6.36277 19.0821 11.3427 19.0821C15.4089 19.0821 18.835 16.3398 19.835 12.5784C20.4693 13.1334 21.0161 13.5784 21.5 14.0784Z"
    //         fill={color}
    //         opacity="0.2"
    //     />
    //     <Path
    //         d="M21.5 14.0784C20.3003 14.7189 18.9301 15.0821 17.4751 15.0821C12.1546 15.0821 7.84277 10.7703 7.84277 5.44975C7.84277 3.99474 8.20599 2.62458 8.84643 1.42485C5.08506 2.42485 2.34277 5.85095 2.34277 9.91711C2.34277 14.9677 6.36277 19.0821 11.3427 19.0821C15.4089 19.0821 18.835 16.3398 19.835 12.5784"
    //         stroke={color}
    //         strokeWidth="2"
    //         strokeLinecap="round"
    //         strokeLinejoin="round"
    //     />

    //     <Circle cx="19.5" cy="4.5" r="1.5" fill={color} />
    //     <Circle cx="15.5" cy="3.5" r="1" fill={color} opacity="0.6" />
    //     <Circle cx="20.5" cy="8.5" r="0.5" fill={color} opacity="0.4" />
    // </Svg>
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
        <View style={[styles.headerContainer, { backgroundColor: theme.backgroundColor, shadowColor: !isDarkMode ? '#000' : '#fff', borderColor: !isDarkMode ? '#000' : '#fff' }]}>
            <View style={[styles.subHeaderContainer, { marginTop: insets.top }]}>
                <Pressable style={headerStyles.logoContainer}>
                    <Text style={[styles.logoText, { color: theme.textColor, zIndex: 1, marginBottom: 2, }]}>fl</Text>
                    {/* <Ionicons name="flower" size={20} color={theme.textColor} /> */}
                    <Image
                        source={require('../../../../assets/app_logo.png')}
                        style={[{ width: 25, height: 25, borderRadius: 45 }]}
                    />
                    <Text style={[styles.logoText, { color: theme.textColor, zIndex: 1, marginBottom: 2 }]}>wergram</Text>
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

// Add FlowerLoader component
const FlowerLoader = ({ color = '#f43f5e', size = 40 }) => {
    const rotation = useSharedValue(0);
    const scale = useSharedValue(1);

    React.useEffect(() => {
        rotation.value = withRepeat(
            withTiming(360, {
                duration: 2000,
                easing: Easing.linear,
            }),
            -1, // infinite
            false
        );

        scale.value = withRepeat(
            withSequence(
                withTiming(1.2, {
                    duration: 1000,
                    easing: Easing.bezier(0.4, 0, 0.2, 1),
                }),
                withTiming(1, {
                    duration: 1000,
                    easing: Easing.bezier(0.4, 0, 0.2, 1),
                })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { rotate: `${rotation.value}deg` },
                { scale: scale.value }
            ],
        };
    });

    return (
        <Animated.View style={[{ width: size, height: size }, animatedStyle]}>
            <Svg width={size} height={size} viewBox="0 0 24 24">
                <G>
                    <Path
                        d="M12 8C8.13401 8 5 4.86599 5 1C5 0.447715 4.55228 0 4 0C3.44772 0 3 0.447715 3 1C3 5.97056 7.02944 10 12 10C16.9706 10 21 5.97056 21 1C21 0.447715 20.5523 0 20 0C19.4477 0 19 0.447715 19 1C19 4.86599 15.866 8 12 8Z"
                        fill={color}
                        transform="rotate(0, 12, 12)"
                    />
                    <Path
                        d="M12 8C8.13401 8 5 4.86599 5 1C5 0.447715 4.55228 0 4 0C3.44772 0 3 0.447715 3 1C3 5.97056 7.02944 10 12 10C16.9706 10 21 5.97056 21 1C21 0.447715 20.5523 0 20 0C19.4477 0 19 0.447715 19 1C19 4.86599 15.866 8 12 8Z"
                        fill={color}
                        transform="rotate(72, 12, 12)"
                    />
                    <Path
                        d="M12 8C8.13401 8 5 4.86599 5 1C5 0.447715 4.55228 0 4 0C3.44772 0 3 0.447715 3 1C3 5.97056 7.02944 10 12 10C16.9706 10 21 5.97056 21 1C21 0.447715 20.5523 0 20 0C19.4477 0 19 0.447715 19 1C19 4.86599 15.866 8 12 8Z"
                        fill={color}
                        transform="rotate(144, 12, 12)"
                    />
                    <Path
                        d="M12 8C8.13401 8 5 4.86599 5 1C5 0.447715 4.55228 0 4 0C3.44772 0 3 0.447715 3 1C3 5.97056 7.02944 10 12 10C16.9706 10 21 5.97056 21 1C21 0.447715 20.5523 0 20 0C19.4477 0 19 0.447715 19 1C19 4.86599 15.866 8 12 8Z"
                        fill={color}
                        transform="rotate(216, 12, 12)"
                    />
                    <Path
                        d="M12 8C8.13401 8 5 4.86599 5 1C5 0.447715 4.55228 0 4 0C3.44772 0 3 0.447715 3 1C3 5.97056 7.02944 10 12 10C16.9706 10 21 5.97056 21 1C21 0.447715 20.5523 0 20 0C19.4477 0 19 0.447715 19 1C19 4.86599 15.866 8 12 8Z"
                        fill={color}
                        transform="rotate(288, 12, 12)"
                    />
                    <Circle cx="12" cy="12" r="3" fill={color} />
                </G>
            </Svg>
        </Animated.View>
    );
};

// Add LottieRefreshControl component
const LottieRefreshControl = React.memo(({ refreshing }: { refreshing: boolean }) => {
    const lottieRef = useRef<LottieView>(null);

    useEffect(() => {
        if (refreshing) {
            lottieRef.current?.play();
        } else {
            lottieRef.current?.reset();
        }
    }, [refreshing]);

    return (
        <View style={styles.lottieContainer}>
            <LottieView
                ref={lottieRef}
                source={require('../../../assets/lottie/pull.json')}
                style={styles.lottieStyle}
                loop={true}
                autoPlay={false}
            />
        </View>
    );
});

const HomeScreen = ({ navigation, route }: { navigation: HomeNavigationProp; route: any }) => {
    const insets = useSafeAreaInsets();
    const bottomSheetRef = useRef<BottomSheetMethods>(null);
    const [feed, setFeed] = useState<FeedInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { isDarkMode, toggleTheme, theme, animatedValue } = useTheme();

    // Animated values
    const listRef = useRef<FlashList<FeedInfo>>(null);
    const heightValue = useSharedValue(0);
    const open = useSharedValue(false);
    const progress = useDerivedValue(() =>
        open.value ? withTiming(1) : withTiming(0)
    );
    const themeRotation = useSharedValue(0);

    // Add header animation values
    const scrollY = useSharedValue(0);
    const lastScrollY = useSharedValue(0);
    const headerTranslateY = useSharedValue(0);
    const HEADER_HEIGHT = 60;
    const HIDE_HEADER_SCROLL_DISTANCE = HEADER_HEIGHT + insets.top;

    // Header animation style
    const headerAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: headerTranslateY.value }],
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
        };
    });

    // Add refresh animation values
    const refreshRotation = useSharedValue(0);
    const refreshScale = useSharedValue(1);

    // Start refresh animation
    const startRefreshAnimation = useCallback(() => {
        refreshRotation.value = withRepeat(
            withTiming(360, {
                duration: 1000,
                easing: Easing.linear,
            }),
            -1,
            false
        );

        refreshScale.value = withRepeat(
            withSequence(
                withTiming(1.2, {
                    duration: 500,
                    easing: Easing.bezier(0.4, 0, 0.2, 1),
                }),
                withTiming(1, {
                    duration: 500,
                    easing: Easing.bezier(0.4, 0, 0.2, 1),
                })
            ),
            -1,
            true
        );
    }, []);

    // Stop refresh animation
    const stopRefreshAnimation = useCallback(() => {
        refreshRotation.value = withTiming(0);
        refreshScale.value = withTiming(1);
    }, []);

    // Custom refresh component
    const CustomRefresh = useCallback(() => {
        const animatedStyle = useAnimatedStyle(() => {
            return {
                transform: [
                    { rotate: `${refreshRotation.value}deg` },
                    { scale: refreshScale.value }
                ],
            };
        });

        return (
            <Animated.View style={[{ padding: 10 }, animatedStyle]}>
                <Svg width={30} height={30} viewBox="0 0 24 24">
                    <G>
                        <Path
                            d="M12 8C8.13401 8 5 4.86599 5 1C5 0.447715 4.55228 0 4 0C3.44772 0 3 0.447715 3 1C3 5.97056 7.02944 10 12 10C16.9706 10 21 5.97056 21 1C21 0.447715 20.5523 0 20 0C19.4477 0 19 0.447715 19 1C19 4.86599 15.866 8 12 8Z"
                            fill={theme.textColor}
                            transform="rotate(0, 12, 12)"
                        />
                        <Path
                            d="M12 8C8.13401 8 5 4.86599 5 1C5 0.447715 4.55228 0 4 0C3.44772 0 3 0.447715 3 1C3 5.97056 7.02944 10 12 10C16.9706 10 21 5.97056 21 1C21 0.447715 20.5523 0 20 0C19.4477 0 19 0.447715 19 1C19 4.86599 15.866 8 12 8Z"
                            fill={theme.textColor}
                            transform="rotate(72, 12, 12)"
                        />
                        <Path
                            d="M12 8C8.13401 8 5 4.86599 5 1C5 0.447715 4.55228 0 4 0C3.44772 0 3 0.447715 3 1C3 5.97056 7.02944 10 12 10C16.9706 10 21 5.97056 21 1C21 0.447715 20.5523 0 20 0C19.4477 0 19 0.447715 19 1C19 4.86599 15.866 8 12 8Z"
                            fill={theme.textColor}
                            transform="rotate(144, 12, 12)"
                        />
                        <Path
                            d="M12 8C8.13401 8 5 4.86599 5 1C5 0.447715 4.55228 0 4 0C3.44772 0 3 0.447715 3 1C3 5.97056 7.02944 10 12 10C16.9706 10 21 5.97056 21 1C21 0.447715 20.5523 0 20 0C19.4477 0 19 0.447715 19 1C19 4.86599 15.866 8 12 8Z"
                            fill={theme.textColor}
                            transform="rotate(216, 12, 12)"
                        />
                        <Path
                            d="M12 8C8.13401 8 5 4.86599 5 1C5 0.447715 4.55228 0 4 0C3.44772 0 3 0.447715 3 1C3 5.97056 7.02944 10 12 10C16.9706 10 21 5.97056 21 1C21 0.447715 20.5523 0 20 0C19.4477 0 19 0.447715 19 1C19 4.86599 15.866 8 12 8Z"
                            fill={theme.textColor}
                            transform="rotate(288, 12, 12)"
                        />
                        <Circle cx="12" cy="12" r="3" fill={theme.textColor} />
                    </G>
                </Svg>
            </Animated.View>
        );
    }, [theme.textColor, refreshRotation.value, refreshScale.value]);

    // Handle refresh
    const handleRefresh = useCallback(async () => {
        if (isRefreshing) return; // Prevent multiple refreshes

        setIsRefreshing(true);
        try {
            const mockData = generateMockGridFeed(20);
            setFeed(mockData as unknown as FeedInfo[]);
            await new Promise(resolve => setTimeout(resolve, 2000)); // เพิ่มเวลาให้เห็น animation ชัดๆ
        } catch (error) {
            console.error('Error refreshing feed:', error);
        } finally {
            setIsRefreshing(false);
        }
    }, [isRefreshing]);

    const handleScroll = useCallback((event: any) => {
        'worklet';
        const currentScrollY = event.nativeEvent.contentOffset.y;

        // ใช้ withSpring เพื่อให้การเคลื่อนไหวนุ่มนวลขึ้น
        if (currentScrollY > lastScrollY.value) {
            // Scrolling down - hide header
            headerTranslateY.value = withSpring(
                Math.max(-HIDE_HEADER_SCROLL_DISTANCE, -currentScrollY),
                {
                    damping: 15,
                    mass: 0.5,
                    stiffness: 150,
                    overshootClamping: true,
                }
            );
        } else {
            // Scrolling up - show header
            headerTranslateY.value = withSpring(0, {
                damping: 15,
                mass: 0.5,
                stiffness: 150,
                overshootClamping: true,
            });
        }

        lastScrollY.value = currentScrollY;
    }, []);

    // Initial load
    useEffect(() => {
        handleRefresh();
    }, []);

    // Memoized styles
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
        <Card
            navigation={navigation}
            images={item.images}
            title={item.title}
            likes={item.likes}
            onZoomStateChange={() => { }}
            cardIndex={index}
            key={`card-${item.id}-${index}`}
        />
    ), [navigation]);

    const keyExtractor = useCallback((item: FeedInfo, index: number) => `${item.id}-${index}`, []);

    const ListEmptyComponent = useCallback(() => (
        <View style={styles.loadingContainer}>
            <AnimatedText text="Loading..." color="#000000" />
        </View>
    ), []);

    const ItemSeparatorComponent = useCallback(() => (
        <View style={styles.separator} />
    ), []);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.backgroundColor} />

            <Animated.View style={[styles.headerAnimated, headerAnimatedStyle]}>
                <Header
                    insets={insets}
                    onNotificationPress={() => bottomSheetRef.current?.expand()}
                    iconStyle={iconStyle}
                    handlePress={handlePress}
                    isDarkMode={isDarkMode}
                    onThemePress={handleThemePress}
                    themeIconStyle={themeIconStyle}
                    theme={theme}
                />
            </Animated.View>

            <View style={styles.mainContent}>
                <Animated.View style={heightAnimationStyle}>
                    <Animated.View ref={listRef} style={styles.contentContainerX}>
                        <View style={styles.content}>
                            <Text style={{ color: theme.textColor }}>kimsnow</Text>
                        </View>
                    </Animated.View>
                </Animated.View>

                <View style={styles.listContainer}>
                    <FlashList
                        ref={listRef}
                        data={feed}
                        keyExtractor={keyExtractor}
                        renderItem={renderItem}
                        estimatedItemSize={350}
                        showsVerticalScrollIndicator={false}
                        ItemSeparatorComponent={ItemSeparatorComponent}
                        ListEmptyComponent={ListEmptyComponent}
                        contentContainerStyle={{
                            ...styles.listContentContainer,
                            paddingTop: insets.top + Platform.OS === 'ios' ? 0 : 60
                        }}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefreshing}
                                onRefresh={handleRefresh}
                                tintColor="rgba(0,0,0,0)"
                                progressBackgroundColor={theme.backgroundColor}
                                colors={['#5271ff']}
                                progressViewOffset={insets.top + 50}
                                enabled={true}
                                titleColor="transparent"
                            />
                        }
                        // ListHeaderComponent={isRefreshing ? <LottieRefreshControl refreshing={isRefreshing} /> : null}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    headerContainer: {
        backgroundColor: 'white',

        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        elevation: 1,
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
        fontFamily: 'SukhumvitSet_Bd',
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
});

export default React.memo(HomeScreen);