import {
    StyleSheet,
    View,
    Keyboard,
    useWindowDimensions,
    Dimensions,
    TouchableOpacity,
    ActivityIndicator,
    InteractionManager
} from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { RouteProp, useFocusEffect, useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParamList } from 'src/navigation/types'
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated'
import MainLayout from 'src/components/MainLayout'
import BottomSheet, { BottomSheetMethods } from 'src/components/BottomSheet'
import { Ionicons } from '@expo/vector-icons'
import { TabView } from 'react-native-tab-view'
import ProfileDetailsHeaderTabBar from 'src/components/ProfileDetailsHeaderTabBar'
import LottieView from 'lottie-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ProfileAction from './components/ProfileActions'
import { ProfileBio } from './components/ProfileBio'
import { ProfileHeader } from './components/ProfileHeader'
import { generateMockGridFeed } from 'src/data/mockFeedData'
import { memo } from 'react';
import { Image as ExpoImage } from 'expo-image';

// Types
type ProfileDetailsNavigationProp = StackNavigationProp<RootStackParamList, "profile_details_screen">

type FeedInfo = {
    id: string;
    images: string[];
    isVideo: boolean;
}

type Props = {
    navigation: ProfileDetailsNavigationProp;
    route: RouteProp<RootStackParamList, "profile_details_screen">;
}

type TabProps = {
    navigation: ProfileDetailsNavigationProp;
    scrollHandler: any;
    feed: FeedInfo[];
    isLoading: boolean;
    headerHeight: number;
}

// Constants
const { width, height } = Dimensions.get("window")
const SPRING_CONFIG = {
    damping: 15,
    mass: 0.7,
    stiffness: 150
}

const PROFILE_SECTION_HEIGHT = 150  // ส่วนของ Profile Header
const BIO_SECTION_HEIGHT = 70       // ส่วนของ Bio
const ACTION_SECTION_HEIGHT = 50    // ส่วนของ Action buttons
const TAB_BAR_HEIGHT = 48          // ความสูงของ Tab Bar

// คำนวณ HEADER_HEIGHT จากความสูงจริงของแต่ละส่วน + padding
const HEADER_HEIGHT = PROFILE_SECTION_HEIGHT +
    BIO_SECTION_HEIGHT +
    ACTION_SECTION_HEIGHT +
    (16 * 3)

const TABS = [
    { name: "ทั้งหมด", title: "AllScreen", icon: "grid-outline", iconActive: "grid" },
    { name: "กดใจ", title: "HeartScreen", icon: "heart-outline", iconActive: "heart" },
    { name: "บันทึก", title: "BookingScreen", icon: "bookmark-outline", iconActive: "bookmark" }
]

const LoadingView = () => (
    <View style={styles.loadingContainer}>
        <LottieView
            autoPlay
            style={styles.lottie}
            source={require('../../assets/lottiefiles/cameraloading.json')}
        />
    </View>
)

const ProfileDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
    const { image, username } = route.params
    const bottomSheetRef = useRef<BottomSheetMethods>(null)
    const [feed, setFeed] = useState<FeedInfo[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const layout = useWindowDimensions()
    const insets = useSafeAreaInsets()

    const [index, setIndex] = useState(0)
    const [routes] = useState(TABS.map((tab) => ({ key: tab.title, title: tab.title })))

    // Bio state
    const [inputText, setInputText] = useState('')
    const [text, setText] = useState(`🍂🍃 ตกหลุมรักคุณทุกวัน\n🍂🍃 ตกหลุมรักคุณทุกวัน\n`)

    // Animation value
    const scrollY = useSharedValue(0)
    const isDragging = useSharedValue(false);

    // Effects
    useFocusEffect(
        useCallback(() => {
            return () => {
                bottomSheetRef.current?.close()
            }
        }, [])
    )

    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
            scrollY.value = 0;
        });

        return () => {
            unsubscribe();
            scrollY.value = 0;
        };
    }, [navigation, scrollY]);

    useEffect(() => {
        let isMounted = true;

        const loadFeed = async () => {
            try {
                setIsLoading(true);
                const newFeed = generateMockGridFeed(10);

                if (isMounted) {
                    setFeed(newFeed);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Feed loading error:', error);
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadFeed();

        return () => {
            isMounted = false;
        };
    }, []);

    // Handlers
    const handleSave = useCallback(() => {
        setText(inputText)
        Keyboard.dismiss()
        bottomSheetRef.current?.close()
    }, [inputText])

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            'worklet';
            scrollY.value = event.contentOffset.y;
        },
        onBeginDrag: () => {
            'worklet';
            isDragging.value = true;
        },
        onEndDrag: (event) => {
            'worklet';
            isDragging.value = false;

            // Calculate target index
            const targetIndex = Math.round(event.contentOffset.y / height);
            const targetOffset = targetIndex * height;

            // Smooth snap animation
            if (Math.abs(event.contentOffset.y - targetOffset) > 1) {
                scrollY.value = withSpring(targetOffset, {
                    damping: 20,
                    stiffness: 200,
                    mass: 0.5
                });
            }
        }
    });

    // Animated styles
    const headerAnimatedStyle = useAnimatedStyle(() => {
        'worklet';
        const opacity = interpolate(
            scrollY.value,
            [0, HEADER_HEIGHT - TAB_BAR_HEIGHT],
            [1, 0],
            Extrapolation.CLAMP
        );
        
        const translateY = interpolate(
            scrollY.value,
            [0, HEADER_HEIGHT - TAB_BAR_HEIGHT],
            [0, -(HEADER_HEIGHT - TAB_BAR_HEIGHT)],
            Extrapolation.CLAMP
        );

        return {
            opacity,
            transform: [{ translateY }]
        };
    });

    const tabsAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{
            translateY: interpolate(
                scrollY.value,
                [0, HEADER_HEIGHT - TAB_BAR_HEIGHT],
                [0, -(HEADER_HEIGHT - TAB_BAR_HEIGHT)],
                Extrapolation.CLAMP
            )
        }]
    }))

    const renderScene = useCallback(({ route }: any) => {
        switch (route.key) {
            case TABS[0].title:
                return (
                    <Tab1
                        navigation={navigation}
                        scrollHandler={scrollHandler}
                        feed={feed}
                        isLoading={isLoading}
                        headerHeight={HEADER_HEIGHT - HEADER_HEIGHT * 2.5}
                    />
                )
            case TABS[1].title:
                return (
                    <Tab1
                        navigation={navigation}
                        scrollHandler={scrollHandler}
                        feed={feed}
                        isLoading={isLoading}
                        headerHeight={HEADER_HEIGHT - HEADER_HEIGHT * 2.5}
                    />
                )
            case TABS[2].title:
                return <View style={styles.emptyTab} />
            default:
                return null
        }
    }, [navigation, feed, isLoading, scrollHandler]);


    return (
        <MainLayout
            titile={username}
            goBack={() => navigation.goBack()}
            iconRight={{ show: true, onPress: () => bottomSheetRef.current?.expand() }}>
            <View style={styles.container}>
                <Animated.View style={[headerAnimatedStyle]}>
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

                <Animated.View style={[styles.tabContainer, tabsAnimatedStyle]}>
                    <TabView
                        renderTabBar={(props) => <ProfileDetailsHeaderTabBar {...props} tabs={TABS} initialIndex={0} />}
                        navigationState={{ index, routes }}
                        onIndexChange={setIndex}
                        renderScene={renderScene}
                        lazy={false}
                        swipeEnabled={true}
                        initialLayout={{
                            width: layout.width,
                            height: 0
                        }}
                    />
                </Animated.View>
            </View>
        </MainLayout>
    )
}

const PLACEHOLDER_BLURHASH = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

interface GridItemProps {
    item: FeedInfo;
    index: number;
    onPress: (index: number) => void;
    size: number;
}

const GridItem = memo(({ item, index, onPress, size }: GridItemProps) => {
    const [imageState, setImageState] = useState<'loading' | 'error' | 'success'>('loading');

    const imageStyle = useMemo(() => ({
        width: size,
        height: size * 1.4,
    }), [size]);

    const showOverlay = imageState !== 'success';

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onPress(index)}
            style={[styles.gridItem, imageStyle]}
        >
            <ExpoImage
                source={item.images[0]}
                style={[
                    styles.gridImage,
                    imageState === 'error' && styles.imageError
                ]}
                contentFit="cover"
                transition={200}
                placeholder={PLACEHOLDER_BLURHASH}
                onLoadStart={() => setImageState('loading')}
                onLoad={() => setImageState('success')}
                onError={() => setImageState('error')}
                cachePolicy="memory-disk"
            />
            {showOverlay && (
                <View style={styles.loadingOverlay}>
                    {imageState === 'loading' ? (
                        <ActivityIndicator size="small" color="#999" />
                    ) : (
                        <Ionicons name="image-outline" size={24} color="#999" />
                    )}
                </View>
            )}
            {item.isVideo && imageState === 'success' && (
                <View style={styles.videoIconContainer}>
                    <Ionicons name="play-circle" size={24} color="white" />
                </View>
            )}
        </TouchableOpacity>
    );
});


// Image Preloader Component
const ImagePreloader = memo(({ imageUrls }: { imageUrls: string[] }) => {
    useEffect(() => {
        let isMounted = true;

        const preloadImages = async () => {
            const CHUNK_SIZE = 5; // ลดขนาด chunk ลง
            const DELAY_BETWEEN_CHUNKS = 100; // เพิ่ม delay ระหว่าง chunks

            for (let i = 0; i < imageUrls.length && isMounted; i += CHUNK_SIZE) {
                const chunk = imageUrls.slice(i, i + CHUNK_SIZE);
                await Promise.all(
                    chunk.map(url => ExpoImage.prefetch(url))
                );
                await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_CHUNKS));
            }
        };

        InteractionManager.runAfterInteractions(() => {
            preloadImages();
        });

        return () => {
            isMounted = false;
        };
    }, [imageUrls]);

    return null;
});

const Tab1: React.FC<TabProps> = ({
    navigation,
    scrollHandler,
    feed,
    isLoading,
    headerHeight
}) => {
    // Memoized calculations
    const itemSize = useMemo(() => width / 3 - 1, []);
    const minContentHeight = useMemo(() => height + HEADER_HEIGHT, []);
    const itemHeight = useMemo(() => itemSize * 1.4, [itemSize]);

    // Callbacks
    const handlePress = useCallback((index: number) => {
        navigation.navigate("gallery_screen", {
            index,
            feed
        });
    }, [navigation, feed]);

    const getItemLayout = useCallback((data: any, index: number) => ({
        length: itemHeight,
        offset: itemHeight * Math.floor(index / 3),
        index,
    }), [itemHeight]);

    const renderItem = useCallback(({ item, index }: {
        item: FeedInfo;
        index: number;
    }) => (
        <GridItem
            item={item}
            index={index}
            onPress={handlePress}
            size={itemSize}
        />
    ), [itemSize, handlePress]);

    const keyExtractor = useCallback((item: FeedInfo) => item.id, []);

    const contentContainerStyle = useMemo(() => ({
        paddingTop: headerHeight,
        paddingBottom: height * 0.2,
        minHeight: minContentHeight
    }), [headerHeight, minContentHeight]);

    const imageUrls = useMemo(() => feed.map(item => item.images), [feed]);

    if (isLoading) {
        return <LoadingView />;
    }

    return (
        <View style={styles.container}>
            <ImagePreloader imageUrls={imageUrls[0]} />
            <View style={styles.listContainer}>
                <Animated.FlatList
                    removeClippedSubviews={true}
                    onEndReachedThreshold={0.5}
                    data={feed}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    numColumns={3}
                    onScroll={scrollHandler}
                    scrollEventThrottle={16}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={contentContainerStyle}
                    columnWrapperStyle={styles.columnWrapper}
                    getItemLayout={getItemLayout}
                />
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    tabContainer: {
        height: '100%',
        backgroundColor: 'white', // แก้จาก 'red' เป็น 'white'
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
    gridItem: {
        padding: 0.5,
        backgroundColor: '#f5f5f5',
        position: 'relative',
        overflow: 'hidden',
    },
    gridImage: {
        width: '100%',
        height: '100%',
        borderRadius: 4,
    },
    imageLoading: {
        opacity: 1,
    },
    imageError: {
        opacity: 0.5,
        backgroundColor: '#f5f5f5',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        flex: 1,
        backgroundColor: 'white',
    },
    contentContainer: {
        backgroundColor: 'white',
        paddingBottom: height * 0.1,
    },
    loadingContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    columnWrapper: {
        justifyContent: 'flex-start', // จัดให้ items ชิดซ้าย
        gap: 0,                       // ไม่มีช่องว่างระหว่าง items
    },
    lottie: {
        width: 80,
        height: 80,
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
    videoIconContainer: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 12,
        padding: 2,
    },
})

export default ProfileDetailsScreen