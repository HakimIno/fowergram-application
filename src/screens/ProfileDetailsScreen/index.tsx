import {
    StyleSheet,
    View,
    useWindowDimensions,
    Platform,
} from 'react-native'
import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { RouteProp, useFocusEffect } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParamList } from 'src/navigation/types'
import Animated, {
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    Easing,
    useDerivedValue,
    interpolate,
} from 'react-native-reanimated'
import MainLayout from 'src/components/MainLayout'
import BottomSheet, { BottomSheetMethods } from 'src/components/BottomSheet'
import { TabView, Route } from 'react-native-tab-view'
import ProfileDetailsHeaderTabBar from 'src/components/ProfileDetailsHeaderTabBar'
import ProfileAction from './components/ProfileActions'
import { ProfileBio } from './components/ProfileBio'
import { ProfileHeader } from './components/ProfileHeader'
import { generateMockGridFeed } from 'src/data/mockFeedData'
import TabContent from './components/TabContent'
import { FeedInfo } from './components/GridItem'
import {
    TAB_BAR_HEIGHT,
    TABS,
    PROFILE_SECTION_HEIGHT,
    BIO_SECTION_HEIGHT,
    ACTION_SECTION_HEIGHT
} from './components/constants'


type ProfileDetailsNavigationProp = StackNavigationProp<RootStackParamList, "profile_details_screen">

type Props = {
    navigation: ProfileDetailsNavigationProp;
    route: RouteProp<RootStackParamList, "profile_details_screen">;
}

const TIMING_CONFIG = {
    duration: 100,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
}

const hardwareAccelerationStyle = {
    backfaceVisibility: 'hidden' as const,
    ...(Platform.OS === 'ios' ? {
        transform: [{ perspective: 1000 }],
        shouldRasterizeIOS: true
    } : {
        renderToHardwareTextureAndroid: true,
    })
};

const ProfileDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
    const { image, username } = route.params
    const bottomSheetRef = useRef<BottomSheetMethods>(null)
    const [feed, setFeed] = useState<FeedInfo[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isReady, setIsReady] = useState(false)
    const layout = useWindowDimensions()

    const [index, setIndex] = useState(0)
    const routes = useMemo(() =>
        TABS.map((tab) => ({ key: tab.title, title: tab.title })),
        []);

    // ลดค่า animation values เหลือเท่าที่จำเป็น
    const scrollY = useSharedValue(0)
    const opacity = useSharedValue(1)

    const HEADER_HEIGHT = useMemo(() => {
        return PROFILE_SECTION_HEIGHT +
            BIO_SECTION_HEIGHT +
            ACTION_SECTION_HEIGHT +
            (16 * 3);
    }, [PROFILE_SECTION_HEIGHT, BIO_SECTION_HEIGHT, ACTION_SECTION_HEIGHT]);


    const THRESHOLD = useMemo(() => HEADER_HEIGHT - TAB_BAR_HEIGHT, []);

    useEffect(() => {
        let isMounted = true;

        const loadFeed = async () => {
            try {
                setIsLoading(true);
                // โหลดข้อมูลอย่างง่าย
                const newFeed = generateMockGridFeed(10);
                setFeed(newFeed);
                setIsLoading(false);
                setIsReady(true);
            } catch (error) {
                console.error('Feed loading error:', error);
                if (isMounted) {
                    setIsLoading(false);
                    setIsReady(true);
                }
            }
        };

        loadFeed();

        return () => {
            isMounted = false;
        };
    }, []);

    const setActiveIndex = useCallback((index: number) => {
        "worklet";
        setIndex(index);
    }, []);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            'worklet';
            scrollY.value = event.contentOffset.y
        },
    });

    const progress = useDerivedValue(() => {
        "worklet";
        return interpolate(
            scrollY.value,
            [0, THRESHOLD],
            [0, 1],
            { extrapolateRight: 'clamp' }
        );
    }, [THRESHOLD]);

    const translateY = useDerivedValue(() => {
        "worklet";
        return -progress.value * THRESHOLD;
    }, [progress.value, THRESHOLD]);


    const headerAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: withTiming(translateY.value, TIMING_CONFIG) }],
    }));

    const tabsAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: withTiming(Math.max(translateY.value, -THRESHOLD), TIMING_CONFIG) }],
    }));

    const opacityAnimatedStyle = useAnimatedStyle(() => ({
        opacity: withTiming(opacity.value, TIMING_CONFIG),
    }));


    const memoizedTabContent = useMemo(() => (
        <TabContent
            navigation={navigation}
            scrollHandler={scrollHandler}
            feed={feed}
            isLoading={isLoading}
            headerHeight={HEADER_HEIGHT - HEADER_HEIGHT * 2.5}
        />
    ), [navigation, scrollHandler, feed, isLoading]);

    const renderScene = useCallback(({ route }: { route: Route }) => {
        switch (route.key) {
            case TABS[0].title:
            case TABS[1].title:
                return memoizedTabContent;
            case TABS[2].title:
                return <View style={styles.emptyTab} />;
            default:
                return null;
        }
    }, [memoizedTabContent]);

    // Memoized TabView to prevent recreation on render
    const tabViewProps = useMemo(() => ({
        renderTabBar: (props: any) => (
            <ProfileDetailsHeaderTabBar
                {...props}
                tabs={TABS}
                initialIndex={0}
            />
        ),
        navigationState: { index, routes },
        onIndexChange: setActiveIndex,
        renderScene,
        lazy: true,
        lazyPreloadDistance: 1,
        swipeEnabled: isReady,
        initialLayout: {
            width: layout.width,
            height: 0
        }
    }), [index, routes, setActiveIndex, renderScene, isReady, layout.width]);

    const renderTabView = useMemo(() => (
        <TabView {...tabViewProps} />
    ), [tabViewProps]);

    return (
        <MainLayout
            titile={username}
            goBack={() => navigation.goBack()}
            iconRight={{ show: true, onPress: () => bottomSheetRef.current?.expand() }}>
            <Animated.View style={[styles.container, opacityAnimatedStyle]}>
                <Animated.View
                    style={[styles.headerContainer, headerAnimatedStyle]}
                    collapsable={false}
                >
                    <View style={styles.profileSection}>
                        <ProfileHeader
                            image={image}
                            username={username}
                            navigation={navigation}
                        />
                    </View>
                    <View style={styles.bioSection}>
                        <ProfileBio username={username} />
                    </View>
                    <View style={styles.actionSection}>
                        <ProfileAction />
                    </View>
                </Animated.View>

                <Animated.View
                    style={[styles.tabContainer, tabsAnimatedStyle]}
                    collapsable={false}
                >
                    {renderTabView}
                </Animated.View>
            </Animated.View>

        </MainLayout>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    headerContainer: {
        backgroundColor: 'white',
        zIndex: 2,
        borderBottomWidth: 0,
        ...hardwareAccelerationStyle,
    },
    tabContainer: {
        height: '100%',
        zIndex: 10,
        ...hardwareAccelerationStyle,
    },
    tabContent: {
        flex: 1,
    },
    profileSection: {
        height: PROFILE_SECTION_HEIGHT,
        justifyContent: 'center',
    },
    bioSection: {
        height: BIO_SECTION_HEIGHT,
    },
    actionSection: {
        height: ACTION_SECTION_HEIGHT,
    },
    emptyTab: {
        flex: 1,
        backgroundColor: 'white',
    },
    bottomSheetTitle: {
        marginBottom: 15,
        fontSize: 20,
        fontFamily: 'Chirp_Bold',
    },
    bottomSheetContent: {
        width: "100%",
    },
    input: {
        marginBottom: 20,
        padding: 10,
        height: 100,
        textAlignVertical: 'top',
        backgroundColor: "rgba(229, 231, 235, 0.5)",
        borderRadius: 15,
    },
    btnContainer: {
        borderWidth: 1.5,
        borderColor: "#84cc16",
        backgroundColor: '#1a1a1a',
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 100,
    },
    btnText: {
        fontSize: 17,
        fontFamily: 'Chirp_Bold',
        color: "white",
    },
})

export default ProfileDetailsScreen