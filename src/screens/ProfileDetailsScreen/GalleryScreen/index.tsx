import { Dimensions, NativeScrollEvent, NativeSyntheticEvent, Pressable, StyleSheet, Text, View, ViewabilityConfig, ViewabilityConfigCallbackPair } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParamList } from 'src/navigation/types'
import { RouteProp } from '@react-navigation/native'
import BottomSheet, { BottomSheetMethods } from 'src/components/BottomSheet'
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    interpolate,
    useDerivedValue,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { StatusBar } from 'expo-status-bar'
import BottomSheetSectionList from 'src/components/BottomSheetSectionList'
import { Image as ExpoImage } from 'expo-image'
import { FlashList, ListRenderItemInfo, ViewToken } from '@shopify/flash-list'
import ZoomableImage from '../components/ZoomableImage'
import VideoPlayer from 'src/components/VideoPlayer'

const IMAGE_PLACEHOLDER_BLURHASH = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj['
const VIDEO_PLACEHOLDER_BLURHASH = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' // ตัวอย่าง blurhash สำหรับ video
const DEFAULT_BLURHASH = "LEHV6nWB2yk8pyo0adR*.7kCMdnj"; // blurhash แบบเรียบง่าย


type GalleryNavigationProp = StackNavigationProp<RootStackParamList, "gallery_screen">
const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);
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

type Props = {
    navigation: GalleryNavigationProp
    route: RouteProp<RootStackParamList, "gallery_screen">
}

interface ImageLoadingState {
    [key: string]: boolean;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("screen")
const SPRING_CONFIG = {
    damping: 15,
    stiffness: 100,
    mass: 1
}


const GalleryScreen: React.FC<Props> = ({ navigation, route }) => {
    const { feed, index: initialIndex } = route.params
    const bottomSheetRef = useRef<BottomSheetMethods>(null)
    const listRef = useRef<FlashList<FeedInfo>>(null);
    // Animated values
    const currentIndex = useSharedValue(initialIndex)
    const scrollX = useSharedValue(0)
    const bottomSheetVisible = useSharedValue(0)


    const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set([initialIndex]));

    useEffect(() => {
        const preloadImages = async () => {
            // Preload เฉพาะรูปที่อยู่ใกล้ index ปัจจุบัน
            const range = 2; // จำนวนรูปที่จะ preload ก่อนและหลัง
            const start = Math.max(0, initialIndex - range);
            const end = Math.min(feed.length, initialIndex + range + 1);

            const imagesToPreload = feed.slice(start, end);
            await Promise.all(imagesToPreload.map((item: FeedInfo) => ExpoImage.prefetch(item.images[0])));

            // Preload รูปที่เหลือในพื้นหลัง
            const remainingImages = [
                ...feed.slice(0, start),
                ...feed.slice(end)
            ];
            setTimeout(() => {
                Promise.all(remainingImages.map(item => ExpoImage.prefetch(item.image)));
            }, 1000);
        };

        preloadImages();
    }, [feed, initialIndex]);

    const [isZoomed, setIsZoomed] = useState(false);

    const handleZoomStateChange = useCallback((zoomed: boolean) => {
        setIsZoomed(zoomed);
    }, []);


    const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        'worklet';
        if (!isZoomed) {
            scrollX.value = event.nativeEvent.contentOffset.x;
            currentIndex.value = Math.round(scrollX.value / SCREEN_WIDTH);
        }
    }, [isZoomed]);

    const handleMomentumScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        'worklet';
        if (!isZoomed) {
            const offsetX = event.nativeEvent.contentOffset.x;
            const newIndex = Math.round(offsetX / SCREEN_WIDTH);
            
            if (currentIndex.value !== newIndex) {
                currentIndex.value = newIndex;
                // Update visible items ทันที
                setVisibleItems(new Set([newIndex]));
            }
        }
    }, [isZoomed]);

    // สร้าง derived values สำหรับ animations
    const animatedStyle = useAnimatedStyle(() => {
        const scale = interpolate(
            scrollX.value % SCREEN_WIDTH,
            [0, SCREEN_WIDTH / 2, SCREEN_WIDTH],
            [1, 0.95, 1]
        );

        return {
            transform: [{ scale }]
        };
    });

    const handleBottomSheetClose = useCallback(() => {
        bottomSheetVisible.value = withSpring(0, SPRING_CONFIG)
    }, [])


    const handleBottomSheetOpen = useCallback(() => {
        bottomSheetRef.current?.expand()
    }, [])

    const currentFeedItem = useDerivedValue(() => {
        return feed[currentIndex.value] || feed[0];
    });


    const renderHeader = useCallback(() => {
        const currentItem = feed[Math.round(currentIndex.value)];

        return (
            <View style={styles.bottomSheetHeader}>
                <View style={styles.profileContainer}>
                    <ExpoImage
                        source={{
                            uri: currentItem.image,
                        }}
                        style={styles.profileImage}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                        placeholder={DEFAULT_BLURHASH}
                        key={currentItem.id}
                    />
                    <View>
                        <Text style={styles.profileName} numberOfLines={1}>
                            {currentItem.title}
                        </Text>
                        <Text style={styles.dateText}>
                            {new Date().toLocaleDateString()}
                        </Text>
                    </View>
                </View>
                <Pressable style={styles.followButton}>
                    <Text style={styles.followButtonText}>ติดตาม</Text>
                </Pressable>
            </View>
        )
    }, [currentIndex, feed])




    const renderItem = useCallback(({ item, index }: ListRenderItemInfo<FeedInfo>) => {
        const isVisible = visibleItems.has(index);

        return (
            <Animated.View
                style={[
                    {
                        width: SCREEN_WIDTH,
                        height: SCREEN_HEIGHT,
                        alignItems: 'center',
                        justifyContent: 'center',
                    },
                    animatedStyle,
                ]}
            >
                {item.isVideo && item.video ? (
                    <VideoPlayer
                        uri={item.video}
                        isVisible={isVisible}
                        style={{
                            width: SCREEN_WIDTH,
                            height: SCREEN_HEIGHT,
                        }}
                        onError={(error) => {
                            console.warn('Video error:', error);
                        }}
                    />
                ) : (
                    <ZoomableImage
                        item={item}
                        index={index}
                        onZoomStateChange={handleZoomStateChange}
                        onOpenBottomSheet={handleBottomSheetOpen}
                        placeholder={IMAGE_PLACEHOLDER_BLURHASH}
                    />
                )}
            </Animated.View>
        )
    }, [visibleItems, animatedStyle]);


    const viewabilityConfig = useRef<ViewabilityConfig>({
        itemVisiblePercentThreshold: 50,
        minimumViewTime: 300, // เพิ่มเวลาขั้นต่ำที่ต้องมองเห็น item
        waitForInteraction: true // รอให้ user มีการ interact ก่อน
    }).current;

    const onViewableItemsChanged = useCallback(({
        viewableItems,
        changed
    }: {
        viewableItems: ViewToken[];
        changed: ViewToken[];
    }) => {
        // Update visible items ทันที
        const newVisibleIndexes = new Set(
            viewableItems
                .filter(token => token.isViewable)
                .map(token => token.index!)
        );
        setVisibleItems(newVisibleIndexes);
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <Pressable
                style={styles.closeButton}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="close" size={26} color="white" />
            </Pressable>

            <FlashList
                data={feed}
                scrollEnabled={!isZoomed}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={handleScroll}
                onMomentumScrollEnd={handleMomentumScrollEnd}
                renderItem={renderItem as any}
                keyExtractor={(item: unknown) => (item as FeedInfo).id.toString()}
                getItemType={(item: unknown) => ((item as FeedInfo).isVideo ? 'video' : 'image')}
                overrideItemLayout={(layout, item) => {
                    layout.size = SCREEN_HEIGHT; // Ensure this matches the actual item height
                    layout.span = Math.floor(SCREEN_WIDTH / 300); // Calculate span based on item width
                }}
                drawDistance={SCREEN_HEIGHT}
                initialScrollIndex={initialIndex}
                disableIntervalMomentum={true}
                snapToInterval={SCREEN_HEIGHT}
                decelerationRate="fast"
                maintainVisibleContentPosition={{
                    minIndexForVisible: 0,
                    autoscrollToTopThreshold: 10
                }}
                removeClippedSubviews={true}
                estimatedItemSize={SCREEN_HEIGHT}
                extraData={visibleItems}
                viewabilityConfigCallbackPairs={[{
                    viewabilityConfig,
                    onViewableItemsChanged: onViewableItemsChanged as (info: { viewableItems: any; changed: any; }) => void
                }]}
                viewabilityConfig={{
                    itemVisiblePercentThreshold: 80,
                    minimumViewTime: 100,
                    waitForInteraction: false
                }}
            />

            <BottomSheetSectionList
                ref={bottomSheetRef}
                data={feed}
                renderItem={() => null}
                ListHeaderComponent={renderHeader}
                snapTo="70%"
                backgroundColor="white"
                backDropColor="#242424"
                handleClose={handleBottomSheetClose}
                scrollEventThrottle={16}
                removeClippedSubviews
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                showsVerticalScrollIndicator={false}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000'
    },
    imageContainer: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center'
    },
    imageWrapper: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT / 1.8,
        borderRadius: 8
    },
    imageError: {
        backgroundColor: '#f3f4f6'
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    errorOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center'
    },
    errorText: {
        marginTop: 8,
        color: '#666',
        fontSize: 14,
        fontFamily: 'SukhumvitSet_Me'
    },
    closeButton: {
        position: 'absolute',
        top: "8%",
        right: 20,
        zIndex: 10,
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    counter: {
        position: 'absolute',
        top: '6.5%',
        right: 20,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 15,
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    counterText: {
        fontSize: 12,
        color: 'white',
        fontFamily: 'SukhumvitSet_Bd'
    },
    bottomSheetHeader: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 0.5,
        borderColor: '#d1d5db'
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 15
    },
    profileImage: {
        width: 45,
        height: 45,
        borderRadius: 23,
        marginRight: 10
    },
    profileName: {
        fontSize: 15,
        fontFamily: 'SukhumvitSet_Bd',
        color: '#242424'
    },
    dateText: {
        fontSize: 12,
        fontFamily: 'SukhumvitSet_Bd',
        color: '#6b7280'
    },
    followButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        backgroundColor: '#000',
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#84cc16'
    },
    followButtonText: {
        fontSize: 14,
        color: 'white',
        fontFamily: 'SukhumvitSet_Bd'
    },
    zoomIndicator: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 8,
        borderRadius: 12,
    },
    zoomText: {
        color: 'white',
        fontSize: 12,
        fontFamily: 'SukhumvitSet_Me'
    }
})

export default GalleryScreen